window.dashboardData = { users: [], products: [], orders: [] };

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

            fetchDashboardData();
        });
        
    setupGlobalSearch();
});

function fetchDashboardData() {
    // 2. FETCH LIVE DATA FROM MYSQL!
    fetch('Database/fetch-dashboard.php?nocache=' + new Date().getTime())
    .then(res => res.json())
    .then(data => {
        if (!data.success) return;

        let users = data.data.users;
        let products = data.data.products;
        
        // --- FIX: REVERSE THE ORDERS SO THE NEWEST TRANSACTIONS ARE AT THE TOP! ---
        let orders = [...data.data.orders].reverse();

        // Save to live memory for the Search Bar
        window.dashboardData = { users, products, orders };

        // 3. COMPUTE STATS & CATEGORIES
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        let totalUsers = 0; let thisMonthUsers = 0; let lastMonthUsers = 0;
        users.forEach(u => {
            if (u.role === 'user') {
                totalUsers++;
                let regDateStr = u.registered_date || u.registeredDate;
                if (regDateStr && regDateStr !== 'Unknown') {
                    let regDate = new Date(regDateStr);
                    if (!isNaN(regDate)) {
                        if (regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear) thisMonthUsers++;
                        else if (regDate.getMonth() === prevMonth && regDate.getFullYear() === prevYear) lastMonthUsers++;
                    }
                }
            }
        });

        let thisMonthProducts = 0; let lastMonthProducts = 0;
        products.forEach(p => {
            if (p.dateAdded) {
                let pDate = new Date(p.dateAdded);
                if (!isNaN(pDate)) {
                    if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) thisMonthProducts++;
                    else if (pDate.getMonth() === prevMonth && pDate.getFullYear() === prevYear) lastMonthProducts++;
                }
            }
        });

        let totalSales = 0; let thisMonthSales = 0; let lastMonthSales = 0;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let monthlySales = new Array(12).fill(0);

        let menSalesQty = 0, womenSalesQty = 0, kidsSalesQty = 0;
        let productSalesMap = {};

        // ONLY COMPUTE REVENUE IF ORDER IS 'COMPLETED'
        orders.forEach(order => {
            if (order.status === 'Completed') {
                let amount = parseFloat(order.totalAmount);
                totalSales += amount;

                const orderDate = new Date(order.date);
                if (!isNaN(orderDate)) {
                    monthlySales[orderDate.getMonth()] += amount;
                    if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                        thisMonthSales += amount;
                    } else if (orderDate.getMonth() === prevMonth && orderDate.getFullYear() === prevYear) {
                        lastMonthSales += amount;
                    }
                }

                if (order.items) {
                    order.items.forEach(item => {
                        let qty = item.quantity || 1;
                        if (item.type === 'MEN') menSalesQty += qty;
                        else if (item.type === 'WOMEN') womenSalesQty += qty;
                        else if (item.type === 'KIDS') kidsSalesQty += qty;

                        let topProduct = `${item.name} <span style="color: var(--brand-color); padding-left: 5px;">${item.type}</span>`;
                        if (!productSalesMap[topProduct]) productSalesMap[topProduct] = 0;
                        productSalesMap[topProduct] += qty;
                    });
                }
            }
        });

        // Populate Main Numbers
        if (document.getElementById('stat-users')) document.getElementById('stat-users').innerText = totalUsers;
        if (document.getElementById('stat-products')) document.getElementById('stat-products').innerText = products.length;
        if (document.getElementById('stat-sales')) document.getElementById('stat-sales').innerText = '₱ ' + totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 });

        function getTrendHTML(current, previous) {
            if (previous === 0 && current === 0) return `<span class="trend-badge trend-neutral"><i class="fi fi-rr-minus-small"></i> 0%</span>`;
            if (previous === 0 && current > 0) return `<span class="trend-badge trend-positive"><i class="fi fi-rr-arrow-trend-up"></i> +100%</span>`;
            const percentChange = ((current - previous) / previous) * 100;
            const rounded = Math.abs(Math.round(percentChange));
            if (percentChange > 0) return `<span class="trend-badge trend-positive"><i class="fi fi-rr-arrow-trend-up"></i> +${rounded}%</span>`;
            else if (percentChange < 0) return `<span class="trend-badge trend-negative"><i class="fi fi-rr-arrow-trend-down"></i> -${rounded}%</span>`;
            else return `<span class="trend-badge trend-neutral"><i class="fi fi-rr-minus-small"></i> 0%</span>`;
        }

        if (document.getElementById('trend-sales')) document.getElementById('trend-sales').innerHTML = getTrendHTML(thisMonthSales, lastMonthSales);
        if (document.getElementById('trend-users')) document.getElementById('trend-users').innerHTML = getTrendHTML(thisMonthUsers, lastMonthUsers);
        if (document.getElementById('trend-products')) document.getElementById('trend-products').innerHTML = getTrendHTML(thisMonthProducts, lastMonthProducts);

        // 4. GENERATE MONTHLY BREAKDOWN
        if (document.getElementById('mb-list')) {
            document.getElementById('mb-list').innerHTML = monthlySales.map((total, index) => `
                <li><span>${fullMonthNames[index]}</span> <strong>₱ ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></li>
            `).join('');
        }

        // 5. GENERATE REVENUE GRAPH
        const msrChart = document.getElementById('msr-chart');
        if (msrChart) {
            const maxSales = Math.max(...monthlySales, 100);
            msrChart.innerHTML = monthlySales.map((total, index) => {
                const heightPct = (total / maxSales) * 100;
                const formattedTotal = '₱ ' + total.toLocaleString('en-US', { minimumFractionDigits: 2 });
                return `
                    <div class="bar-col">
                        <div class="bar" style="height: ${heightPct}%" onmousemove="showTooltip(event, '${formattedTotal}')" onmouseout="hideTooltip()"></div>
                        <span>${monthNames[index]}</span>
                    </div>
                `;
            }).join('');
        }

        // 6. GENERATE DONUT CHART
        const donutChart = document.querySelector('.donut-chart');
        const donutLegend = document.querySelector('.donut-legend');
        const totalCategoryQty = menSalesQty + womenSalesQty + kidsSalesQty;

        if (donutChart && donutLegend) {
            if (totalCategoryQty === 0) {
                donutChart.style.background = '#e0e0e0';
                donutLegend.innerHTML = '<p style="text-align:center; color: var(--gray-text); padding-top: 10px;">No completed sales yet.</p>';
            } else {
                let menPct = (menSalesQty / totalCategoryQty) * 100;
                let womenPct = (womenSalesQty / totalCategoryQty) * 100;
                let kidsPct = (kidsSalesQty / totalCategoryQty) * 100;
                let womenStart = menPct; let kidsStart = menPct + womenPct;

                donutChart.style.background = `conic-gradient(var(--brand-color) 0% ${menPct}%, var(--darkgray-text) ${womenStart}% ${kidsStart}%, #ccc ${kidsStart}% 100%)`;
                donutLegend.innerHTML = `
                    <p><span class="dot men"></span> Men (${Math.round(menPct)}%)</p>
                    <p><span class="dot women"></span> Women (${Math.round(womenPct)}%)</p>
                    <p><span class="dot kids"></span> Kids (${Math.round(kidsPct)}%)</p>
                `;
            }
        }

        // 7. GENERATE TOP PRODUCTS
        const topListContainer = document.querySelector('.top-list');
        let sortedProducts = Object.keys(productSalesMap).map(name => ({ name: name, qty: productSalesMap[name] })).sort((a, b) => b.qty - a.qty);

        if (sortedProducts.length === 0) {
            topListContainer.innerHTML = '<p style="text-align:center; color: var(--gray-text); padding: 30px;">No completed sales yet.</p>';
        } else {
            topListContainer.innerHTML = sortedProducts.slice(0, 5).map((product, index) => `
                <div class="top-item">
                    <span>${index + 1}.</span> <p>${product.name}</p> <strong>${product.qty} Sold</strong>
                </div>
            `).join('');
        }

        // 8. POPULATE RECENT TRANSACTIONS (Always newest first!)
        const tableBody = document.getElementById('recent-orders-body');
        function renderDashboardTable(searchQuery = '') {
            let filteredOrders = orders.slice(0, 50); // Get recent 50
            
            if (searchQuery.trim() !== '') {
                const lowerQuery = searchQuery.toLowerCase();
                filteredOrders = filteredOrders.filter(order => {
                    let displayEmail = order.customerEmail || '';
                    if (!displayEmail) {
                        let foundUser = users.find(u => u.email === order.customerEmail);
                        if (foundUser) displayEmail = foundUser.email;
                    }
                    return (order.customerName || '').toLowerCase().includes(lowerQuery) || displayEmail.toLowerCase().includes(lowerQuery);
                });
            }

            if (filteredOrders.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--gray-text); padding: 30px;">No recent transactions found.</td></tr>`;
                return;
            }

            tableBody.innerHTML = filteredOrders.map(order => {
                let badgeBg = '', badgeColor = '';
                if (order.status === 'Completed') { badgeBg = '#e8f5e9'; badgeColor = '#1b8f50'; }
                else if (order.status === 'To Ship') { badgeBg = '#fef5e7'; badgeColor = '#f39c12'; }
                else { badgeBg = '#e9f5fc'; badgeColor = '#3498db'; }
                
                let badgeStyle = `padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-block; background: ${badgeBg}; color: ${badgeColor};`;
                
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
                </tr>
                `;
            }).join('');
        }

        renderDashboardTable();

        const dashboardSearch = document.getElementById('dashboard-search-input');
        if (dashboardSearch) {
            dashboardSearch.addEventListener('input', (e) => renderDashboardTable(e.target.value));
        }
    })
    .catch(err => console.error('Error fetching dashboard data:', err));
}

function showTooltip(event, value) {
    const tooltip = document.getElementById('chart-tooltip');
    tooltip.innerText = value;
    tooltip.style.opacity = '1';
    tooltip.style.left = event.clientX + 'px';
    tooltip.style.top = event.clientY + 'px';
}

function hideTooltip() {
    document.getElementById('chart-tooltip').style.opacity = '0';
}

// ==========================================
// SYNC ORDER STATUS BETWEEN ADMIN AND USER
// ==========================================
window.updateOrderStatus = function (orderId, newStatus) {
    // FIX: Removed localStorage rewrites! Now it just securely tells MySQL to update the order.
    fetch('Database/update-order-status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus, messageType: 'status_update' })
    }).then(() => {
        // Give the database a millisecond to save, then reload to update the dashboard math
        setTimeout(() => { window.location.reload(); }, 100);
    });
};

// NEW: ADMIN NAVBAR POPUP TOGGLE FUNCTIONS
window.toggleAdminPopup = function () {
    const menu = document.getElementById("admin-popup-menu");
    if (menu) menu.classList.toggle("show");
};

window.addEventListener('click', function (event) {
    if (!event.target.matches('.admin-popup-btn') && !event.target.closest('.admin-popup-btn')) {
        const popup = document.getElementById("admin-popup-menu");
        if (popup && popup.classList.contains('show')) popup.classList.remove('show');
    }
});

// ==========================================
// GLOBAL ADMIN SEARCH LOGIC
// ==========================================
function setupGlobalSearch() {
    const searchInput = document.querySelector('.admin-nav-search input');
    const searchContainer = document.querySelector('.admin-nav-search');

    if (searchInput && searchContainer) {
        
        const dropdown = document.createElement('div');
        dropdown.className = 'global-search-dropdown';
        searchContainer.appendChild(dropdown);

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (!query) {
                dropdown.style.display = 'none';
                return;
            }

            // FIX: Pull directly from Live Memory instead of localStorage!
            const users = window.dashboardData.users || [];
            const products = window.dashboardData.products || [];
            const orders = window.dashboardData.orders || [];

            const matchedProducts = products.filter(p => 
                p.name.toLowerCase().includes(query) || 
                String(p.id).toLowerCase().includes(query)
            ).slice(0, 3);

            const matchedOrders = orders.filter(o => 
                String(o.id).toLowerCase().includes(query) || 
                (o.customerName || '').toLowerCase().includes(query)
            ).slice(0, 3);

            const matchedUsers = users.filter(u => {
                let fName = String(u.first_name || u.firstName || '');
                let lName = String(u.last_name || u.lastName || '');
                return `${fName} ${lName}`.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
            }).slice(0, 3);

            let html = '';

            if (matchedProducts.length > 0) {
                html += `<div class="search-category">Products</div>`;
                matchedProducts.forEach(p => {
                    html += `
                        <a href="admin-products.html?search=${encodeURIComponent(p.id)}" class="search-item">
                            <i class="fi fi-rr-box-alt"></i>
                            <div><strong>${p.name}</strong> <span>ID: ${p.id}</span></div>
                        </a>`;
                });
            }

            if (matchedOrders.length > 0) {
                html += `<div class="search-category">Orders</div>`;
                matchedOrders.forEach(o => {
                    html += `
                        <a href="admin-orders.html?search=${encodeURIComponent(o.id)}" class="search-item">
                            <i class="fi fi-rr-shopping-cart"></i>
                            <div><strong>Order #${o.id}</strong> <span>Customer: ${o.customerName}</span></div>
                        </a>`;
                });
            }

            if (matchedUsers.length > 0) {
                html += `<div class="search-category">Users</div>`;
                matchedUsers.forEach(u => {
                    let fName = String(u.first_name || u.firstName || '');
                    let lName = String(u.last_name || u.lastName || '');
                    html += `
                        <a href="admin-users.html?search=${encodeURIComponent(u.email)}" class="search-item">
                            <i class="fi fi-rr-users"></i>
                            <div><strong>${fName} ${lName}</strong> <span>${u.email}</span></div>
                        </a>`;
                });
            }

            if (html === '') {
                html = `<div class="search-item empty">No results found for "${query}"</div>`;
            }

            dropdown.innerHTML = html;
            dropdown.style.display = 'block';
        });

        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
}