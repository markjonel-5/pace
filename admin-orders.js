window.adminOrdersData = [];

window.addEventListener('DOMContentLoaded', () => {
    // 1. SECURITY CHECK & DATA LOAD
    fetch('Database/fetch-session.php?nocache=' + new Date().getTime())
        .then(res => res.json())
        .then(data => {
            if (!data.success || data.user.role !== 'admin') {
                window.location.href = "login.html";
                return;
            }
            window.currentUser = data.user;
            
            let fName = String(window.currentUser.first_name || window.currentUser.firstName || 'Admin');
            let lName = String(window.currentUser.last_name || window.currentUser.lastName || '');
            const initials = (fName.charAt(0) + (lName ? lName.charAt(0) : '')).toUpperCase();
            
            document.getElementById('sidebar-initials').innerText = initials;
            document.getElementById('admin-name-display').innerText = `${fName} ${lName}`.trim();

            const popupName = document.getElementById('popup-admin-name');
            const popupInitials = document.getElementById('popup-initials');
            if (popupName) popupName.innerText = `${fName} ${lName}`.trim();
            if (popupInitials) popupInitials.innerText = initials;

            fetchOrdersFromDatabase();
        });

    const ordersSearch = document.getElementById('orders-search-input');
    if (ordersSearch) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search') || '';
        if (searchParam) {
            ordersSearch.value = searchParam;
        }
        ordersSearch.addEventListener('input', (e) => {
            renderTable(window.adminOrdersData, currentFilterStatus, e.target.value);
        });
    }
});

function fetchOrdersFromDatabase() {
    fetch('Database/fetch-orders.php?nocache=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.adminOrdersData = data.orders;
                renderOrderStats(data.orders);
                
                const searchVal = document.getElementById('orders-search-input') ? document.getElementById('orders-search-input').value : '';
                renderTable(data.orders, currentFilterStatus, searchVal);
            }
        })
        .catch(error => console.error("Error fetching orders:", error));
}

function renderOrderStats(orders) {
    let toShip = 0, toReceive = 0, completed = 0;

    orders.forEach(o => {
        if (o.status === 'To Ship') toShip++;
        if (o.status === 'To Receive') toReceive++;
        if (o.status === 'Completed') completed++;
    });

    const statAllOrders = document.getElementById('stat-all-orders');
    if (statAllOrders) statAllOrders.innerText = orders.length;

    const statToShip = document.getElementById('stat-to-ship');
    if (statToShip) statToShip.innerText = toShip;

    const statToReceive = document.getElementById('stat-to-receive');
    if (statToReceive) statToReceive.innerText = toReceive;

    const statCompleted = document.getElementById('stat-completed');
    if (statCompleted) statCompleted.innerText = completed;
}

let currentFilterStatus = 'All';

window.filterOrders = function (status, element) {
    document.querySelectorAll('.order-stat-box').forEach(box => box.classList.remove('active'));
    element.classList.add('active');

    currentFilterStatus = status;
    const searchVal = document.getElementById('orders-search-input') ? document.getElementById('orders-search-input').value : '';
    renderTable(window.adminOrdersData, currentFilterStatus, searchVal);
};

function renderTable(orders, filterStatus, searchQuery = '') {
    const tableBody = document.getElementById('orders-table-body');

    // FIX: Simply reverse the array! MySQL sends oldest first, so this puts the absolute newest at the top instantly.
    let filteredOrders = [...orders];

    if (filterStatus !== 'All') {
        filteredOrders = filteredOrders.filter(o => o.status === filterStatus);
    }

    if (searchQuery.trim() !== '') {
        const lowerQuery = searchQuery.toLowerCase();
        filteredOrders = filteredOrders.filter(order => {
            const matchName = order.customerName.toLowerCase().includes(lowerQuery);
            const matchEmail = (order.customerEmail || '').toLowerCase().includes(lowerQuery);
            const matchID = order.id.toLowerCase().includes(lowerQuery);
            return matchName || matchEmail || matchID;
        });
    }

    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: var(--gray-text);">No orders found.</td></tr>`;
        return;
    }

    if (tableBody) {
        tableBody.innerHTML = filteredOrders.map(order => {
            let badgeBg = '';
            let badgeColor = '';

            if (order.status === 'Completed') {
                badgeBg = '#e8f5e9';
                badgeColor = '#1b8f50';
            } else if (order.status === 'To Ship') {
                badgeBg = '#fef5e7';
                badgeColor = '#f39c12';
            } else {
                badgeBg = '#e9f5fc';
                badgeColor = '#3498db';
            }

            let badgeStyle = `padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-block; background: ${badgeBg}; color: ${badgeColor};`;

            let actionButtonHTML = '';
            if (order.status === 'To Ship') {
                let isPickUp = order.deliveryType === 'In-Store Pick Up' || order.paymentMethod === 'Over-the-counter' || !order.shippingAddress;
                if (isPickUp) {
                    actionButtonHTML = `<button class="btn-ship" onclick="openReadyModal('${order.id}')">Order Packed</button>`;
                } else {
                    actionButtonHTML = `<button class="btn-ship" onclick="openShipModal('${order.id}')">Ship Order</button>`;
                }
            }

            return `
            <tr>
                <td style="font-weight: 600;">${order.id}</td>
                <td>
                    ${order.customerName}
                    <div style="font-size: 12px; color: var(--gray-text);">${order.customerEmail || 'No email attached'}</div>
                </td>
                <td style="color: var(--gray-text);">${order.date}</td>
                <td><span style="${badgeStyle}">${order.status}</span></td>
                <td style="font-weight: 700; color: var(--darkgray-text);">₱ ${parseFloat(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="actions-cell">
                    <div class="action-btns">
                        ${actionButtonHTML}
                        <button class="btn-view" onclick="viewOrderDetails('${order.id}')">View Details</button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
    }
}

// ===============================================
// MODAL & SHIP ORDER LOGIC
// ===============================================
let currentOrderIdToShip = null;

window.openShipModal = function (orderId) {
    currentOrderIdToShip = orderId;
    const modal = document.getElementById('ship-order-modal');
    if (modal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        modal.showModal();
    }
};

window.closeShipModal = function () {
    currentOrderIdToShip = null;
    const modal = document.getElementById('ship-order-modal');
    if (modal) {
        modal.close();
        document.body.style.overflow = '';
        document.body.style.paddingRight = '0px';
    }
};

window.executeShipOrder = function () {
    if (!currentOrderIdToShip) return;
    let orderId = currentOrderIdToShip;

    let btn = document.activeElement;
    let originalText = btn.innerText;
    btn.innerText = "Sending...";
    btn.style.pointerEvents = "none";

    fetch('Database/update-order-status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'To Receive', messageType: 'shipped' })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeShipModal();
                showSuccessAlert("Order Shipped!", "An email has been successfully sent to the customer.");
            } else {
                btn.innerText = originalText;
                btn.style.pointerEvents = "auto";
            }
        });
};

// ===============================================
// MODAL & ORDER PACKED (PICK UP) LOGIC
// ===============================================
let currentOrderIdToReady = null;

window.openReadyModal = function (orderId) {
    currentOrderIdToReady = orderId;
    const modal = document.getElementById('ready-order-modal');
    if (modal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        modal.showModal();
    }
};

window.closeReadyModal = function () {
    currentOrderIdToReady = null;
    const modal = document.getElementById('ready-order-modal');
    if (modal) {
        modal.close();
        document.body.style.overflow = '';
        document.body.style.paddingRight = '0px';
    }
};

window.executeReadyOrder = function () {
    if (!currentOrderIdToReady) return;
    let orderId = currentOrderIdToReady;

    let btn = document.activeElement;
    let originalText = btn.innerText;
    btn.innerText = "Sending...";
    btn.style.pointerEvents = "none";

    fetch('Database/update-order-status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'To Receive', messageType: 'packed' })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeReadyModal();
                showSuccessAlert("Order Packed!", "An email has been successfully sent to the customer.");
            } else {
                btn.innerText = originalText;
                btn.style.pointerEvents = "auto";
            }
        });
};

// ===============================================
// VIEW ORDER DETAILS LOGIC
// ===============================================
window.viewOrderDetails = function (orderId) {
    let order = window.adminOrdersData.find(o => o.id === orderId);
    if (!order) return;

    let actualDeliveryType = order.deliveryType;

    const panelBody = document.getElementById('od-body-content');
    let addressHTML = '<p style="color:red;">Address missing</p>';

    let isPickUp = (actualDeliveryType === 'In-Store Pick Up') ||
        (order.paymentMethod === 'Over-the-counter') ||
        (!order.shippingAddress);

    if (isPickUp) {
        addressHTML = '<p style="font-weight: 500; color: var(--darkgray-text);">In-Store Pick Up</p><p>Customer will collect the item at the physical store.</p>';
    } else if (order.shippingAddress && order.shippingAddress.fullName) {
        let addr = order.shippingAddress;
        addressHTML = `
            <h4>${addr.fullName} <span style="font-weight:400; font-size:13px; color:var(--gray-text); margin-left:10px;">${addr.phone}</span></h4>
            <p>${addr.street}, ${addr.brgy}<br>${addr.city}, ${addr.region}, ${addr.postalCode}</p>
        `;
    }

    let itemsHTML = order.items.map(item => `
        <div class="od-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="od-item-info">
                <h4>${item.name}</h4>
                <p>${item.type} | Color: ${item.color} | Size: ${item.size}</p>
                <div style="display:flex; justify-content:space-between; margin-top:5px;">
                    <span style="font-weight:600; font-size: 12px; color:var(--gray-text);">Qty: ${item.quantity || 1}</span>
                    <span style="font-weight:600; font-size: 14px; color:var(--brand-color);">₱ ${item.price}</span>
                </div>
            </div>
        </div>
    `).join('');

    panelBody.innerHTML = `
        <div class="od-section-title">Shipping Information</div>
        <div class="od-address-card">
            ${addressHTML}
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eaeaea;">
                <p style="font-size: 13px; margin-bottom: 3px;"><strong style="color: var(--darkgray-text);">Customer Email:</strong></p>
                <p style="font-size: 14px;">${order.customerEmail || 'No email attached'}</p>
            </div>
        </div>
        
        <div class="od-section-title">Purchased Items</div>
        <div>
            ${itemsHTML}
        </div>

        <div class="od-summary">
            <div class="od-summary-row">
                <span>Payment Method:</span>
                <span style="font-weight:600;">${order.paymentMethod}</span>
            </div>
            <div class="od-summary-row total">
                <span>Total Amount:</span>
                <span>₱ ${parseFloat(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
        </div>
    `;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    document.getElementById('order-details-overlay').classList.add('show');
    document.getElementById('order-details-panel').classList.add('show');
};

window.closeOrderDetailsPanel = function () {
    document.getElementById('order-details-overlay').classList.remove('show');
    document.getElementById('order-details-panel').classList.remove('show');

    setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '0px';
    }, 300);
};

// ===============================================
// SUCCESS MODAL & RELOAD LOGIC
// ===============================================
window.showSuccessAlert = function (title, message) {
    const modal = document.getElementById('success-alert-modal');
    if (modal) {
        document.getElementById('success-alert-title').innerText = title;
        document.getElementById('success-alert-message').innerText = message;

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        modal.showModal();
    }
};

window.reloadAfterSuccess = function () {
    window.location.reload();
};