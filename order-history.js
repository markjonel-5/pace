/* ORDER HISTORY INITIALIZATION */
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!window.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        fetch('Database/fetch-orders.php?nocache=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    let liveOrders = data.orders;
                    let isUpdated = false;

                    if (window.currentUser.orderHistory) {
                        window.currentUser.orderHistory.forEach(localOrder => {
                            let liveOrder = liveOrders.find(o => String(o.id) === String(localOrder.id));

                            if (liveOrder && liveOrder.status !== localOrder.status) {
                                localOrder.status = liveOrder.status;
                                isUpdated = true;

                                let notifTitle = "Order Update";
                                let notifMsg = `Your order ${localOrder.id} status is now: ${liveOrder.status}`;

                                if (liveOrder.status === 'To Receive') {
                                    notifTitle = "Order Shipped!";
                                    notifMsg = `Your order ${localOrder.id} is out for delivery or ready for in-store collection.`;
                                } else if (liveOrder.status === 'Completed') {
                                    notifTitle = "Order Completed";
                                    notifMsg = `Your order ${localOrder.id} has been marked as completed. Thank you for shopping with PACE!`;
                                }

                                window.currentUser.notifications = window.currentUser.notifications || [];
                                let isDuplicate = window.currentUser.notifications.some(n => n.message === notifMsg);

                                if (!isDuplicate) {
                                    window.currentUser.notifications.unshift({
                                        id: 'NOTIF-' + Date.now() + Math.floor(Math.random() * 1000),
                                        title: notifTitle,
                                        message: notifMsg,
                                        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                                        read: false
                                    });
                                }
                            }
                        });
                    }

                    if (isUpdated) {
                        fetch('Database/update-account.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'update_order_history', email: window.currentUser.email, orderHistory: window.currentUser.orderHistory })
                        });
                        if (window.syncNotificationsToDatabase) {
                            window.syncNotificationsToDatabase(window.currentUser.email, window.currentUser.notifications);
                        }
                        if (typeof renderNotification === 'function') renderNotification(window.currentUser);
                    }
                }

                setupGlobalDialogs();
                updateNotificationBadges(window.currentUser.orderHistory || []);
                const listContainer = document.getElementById('order-history-list');
                if (listContainer) {
                    setupOrderTabs();
                    renderOrderHistory('All');
                }
            })
            .catch(err => console.error("Error syncing orders:", err));

        const reviewTextInput = document.getElementById('review-text');
        if (reviewTextInput) {
            reviewTextInput.addEventListener('input', function () {
                this.style.borderColor = "var(--border-color, #e0e0e0)";
                const errorMsg = document.getElementById('review-text-error');
                if (errorMsg) errorMsg.style.display = 'none';
            });
        }
    }, 100);
});

/* GLOBAL UI FUNCTIONS START */
function setupGlobalDialogs() {
    document.querySelectorAll('dialog').forEach(modal => {
        modal.addEventListener('close', () => {
            if (document.querySelectorAll('dialog[open]').length === 0) {
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                document.body.style.paddingRight = '0px';
                const nav = document.querySelector('.navbar-section');
                if (nav) nav.style.right = '0px';
            }
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.close();
        });
    });
}

window.openAccountModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const isScrollable = document.documentElement.scrollHeight > window.innerHeight;
        if (isScrollable && document.body.style.overflow !== 'hidden') {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            const nav = document.querySelector('.navbar-section');
            if (nav) nav.style.right = `${scrollbarWidth}px`;
        }
        modal.showModal();
    }
};

window.closeAccountModal = function (modalId) {
    document.getElementById(modalId)?.close();
};
/* GLOBAL UI FUNCTIONS END */

/* CORE ORDER LOGIC START */
const formatCurrency = (num) => parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

window.openOrderDetails = function (orderId) {
    if (!window.currentUser) return;
    const order = window.currentUser.orderHistory.find(o => o.id === orderId);
    if (!order) return;

    window.globalActiveOrderId = order.id;
    let displayStatus = order.status === 'Processing' ? 'To Ship' : order.status;

    const trackerConfig = {
        'To Receive': { width: '30%', s1: 'completed', s2: 'active', s3: '' },
        'Completed': { width: '70%', s1: 'completed', s2: 'completed', s3: 'completed' },
        'To Ship': { width: '0%', s1: 'active', s2: '', s3: '' }
    };

    let trackerHTML = displayStatus === 'Cancelled'
        ? `<div class="tracker-status-cancelled"><i class="fi fi-rr-cross-circle"></i> Order Cancelled</div>`
        : `<div class="order-tracker-container">
            <div class="tracker-progress-line" style="width: ${trackerConfig[displayStatus].width};"></div>
            <div class="tracker-step ${trackerConfig[displayStatus].s1}"><div class="tracker-icon"><i class="fi fi-rr-box"></i></div><span class="tracker-label">To Ship</span></div>
            <div class="tracker-step ${trackerConfig[displayStatus].s2}"><div class="tracker-icon"><i class="fi fi-rr-truck-side"></i></div><span class="tracker-label">To Receive</span></div>
            <div class="tracker-step ${trackerConfig[displayStatus].s3}"><div class="tracker-icon"><i class="fi fi-rr-box-check"></i></div><span class="tracker-label">Completed</span></div>
           </div>`;

    const itemsHTML = order.items.map((item, index) => {
        let reviewActionHTML = '';
        if (displayStatus === 'Completed') {
            if (item.reviewed) {
                reviewActionHTML = `<span style="display: inline-block; margin-top: 8px; font-size: 13px; color: #1b8f50; font-weight: 600;"><i class="fi fi-rs-check-circle" style="margin-right: 5px; vertical-align: middle;"></i>Reviewed</span>`;
            } else {
                reviewActionHTML = `<button onclick="openWriteReviewModal('${order.id}', ${index}, '${item.name.replace(/'/g, "\\'")}', '${item.image}')" style="margin-top: 8px; padding: 6px 12px; background: white; color: var(--brand-color); border: 1px solid var(--brand-color); border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s;">Write Review</button>`;
            }
        }

        return `
            <div class="drop-item-card">
                <img src="${item.image}" alt="${item.name}" class="drop-item-img">
                <div class="drop-item-info">
                    <h4>${item.name}</h4>
                    <p>Color: ${item.color} | Size: ${item.size} | Qty: ${item.quantity || 1}</p>
                    ${reviewActionHTML}
                </div>
                <div class="drop-item-price">\u20B1 ${formatCurrency(item.price.replace(/,/g, '') * (item.quantity || 1))}</div>
            </div>
        `;
    }).join('');

    document.getElementById('order-modal-content').innerHTML = `
        ${trackerHTML}
        <div class="drop-meta-row"><div class="drop-meta-chunk"><p>Order ID</p><h4>${order.id}</h4></div><div class="drop-meta-chunk" style="text-align: right"><p>Date Placed</p><h4>${order.date}</h4></div></div>
        <div class="drop-items-container">${itemsHTML}</div>
        <div class="drop-dark-receipt">
            <div class="drop-dark-row"><span>Subtotal</span><span>\u20B1 ${formatCurrency(order.subtotal)}</span></div>
            <div class="drop-dark-row"><span>Delivery (${order.deliveryType})</span><span>${order.deliveryFee === 0 ? 'FREE' : '\u20B1 ' + formatCurrency(order.deliveryFee)}</span></div>
            <div class="drop-dark-row"><span>Payment</span><span>${order.payment}</span></div>
            <div class="drop-dark-total"><span>TOTAL</span><span style="color: var(--brand-color);">\u20B1 ${formatCurrency(order.total)}</span></div>
        </div>
    `;

    const cancelBtn = document.getElementById('cancel-order-btn');
    const receiveBtn = document.getElementById('receive-order-btn');

    if (cancelBtn) { cancelBtn.style.display = displayStatus === 'To Ship' ? 'inline-flex' : 'none'; cancelBtn.onclick = () => openAccountModal('cancel-confirm-modal'); }
    if (receiveBtn) { receiveBtn.style.display = displayStatus === 'To Receive' ? 'inline-flex' : 'none'; receiveBtn.onclick = () => openAccountModal('receive-confirm-modal'); }

    openAccountModal('order-details-modal');
};

window.updateOrderStatus = function (newStatus, title, messageTemplate) {
    if (!window.globalActiveOrderId || !window.currentUser) return;

    let orderId = window.globalActiveOrderId;

    fetch('Database/update-order-status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
    }).catch(err => console.error("Database Update Error:", err));

    let targetOrder = window.currentUser.orderHistory.find(o => o.id === orderId);
    if (targetOrder) targetOrder.status = newStatus;

    let exactMessage = messageTemplate.replace('{id}', orderId);
    window.currentUser.notifications = window.currentUser.notifications || [];
    let isDuplicate = window.currentUser.notifications.some(n => n.message === exactMessage);

    if (!isDuplicate) {
        window.currentUser.notifications.unshift({
            id: 'NOTIF-' + Date.now(),
            title: title,
            message: exactMessage,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            read: false
        });
    }

    if (window.syncNotificationsToDatabase) {
        window.syncNotificationsToDatabase(window.currentUser.email, window.currentUser.notifications);
    }

    closeAccountModal(newStatus === 'Completed' ? 'receive-confirm-modal' : 'cancel-confirm-modal');
    closeAccountModal('order-details-modal');
    window.globalActiveOrderId = null;

    if (typeof renderOrderHistory === 'function') {
        const activeTab = document.querySelector('.order-tab.active');
        renderOrderHistory(activeTab ? activeTab.getAttribute('data-status') : 'All');
    }
    if (typeof renderNotification === 'function') renderNotification(window.currentUser);
};

window.executeReceiveOrder = () => updateOrderStatus('Completed', 'Order Completed', 'Your order {id} has been marked as completed. Thank you for shopping with PACE!');
window.executeCancelOrder = () => updateOrderStatus('Cancelled', 'Order Cancelled', 'Your order {id} has been successfully cancelled.');
/* CORE ORDER LOGIC END */

/* ORDER HISTORY PAGE SPECIFIC */
function setupOrderTabs() {
    const tabs = document.querySelectorAll('.order-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.closest('.order-tab').classList.add('active');
            renderOrderHistory(e.target.closest('.order-tab').getAttribute('data-status'));
        });
    });
}

function updateNotificationBadges(orders) {
    let counts = orders.reduce((acc, o) => {
        let s = o.status === 'Processing' ? 'To Ship' : o.status;
        if (s === 'To Ship') acc.ship++;
        if (s === 'To Receive') acc.receive++;
        return acc;
    }, { ship: 0, receive: 0 });

    const toggleBadge = (id, count) => {
        const badge = document.getElementById(id);
        if (badge) { badge.textContent = count; badge.style.display = count ? 'inline-block' : 'none'; }
    };
    toggleBadge('badge-toship', counts.ship);
    toggleBadge('badge-toreceive', counts.receive);
}

function renderOrderHistory(filterStatus) {
    if (!window.currentUser) return;

    const allOrders = (window.currentUser.orderHistory || []).slice().reverse();
    updateNotificationBadges(allOrders);

    const filteredOrders = filterStatus === 'All' ? allOrders : allOrders.filter(o => (o.status === 'Processing' ? 'To Ship' : o.status) === filterStatus);

    const listContainer = document.getElementById('order-history-list');
    const emptyState = document.getElementById('empty-history');

    if (emptyState) emptyState.style.display = filteredOrders.length ? 'none' : 'block';

    if (listContainer && filteredOrders.length) {
        listContainer.style.display = 'flex';
        listContainer.innerHTML = filteredOrders.map(order => {
            const displayStatus = order.status === 'Processing' ? 'To Ship' : order.status;
            const statusStyle = {
                'To Ship': { bg: '#FFF3EB', txt: 'var(--brand-color)' },
                'To Receive': { bg: '#E3F2FD', txt: '#1565C0' },
                'Completed': { bg: '#E8F5E9', txt: '#1b8f50' },
                'Cancelled': { bg: '#FFEBEE', txt: '#C62828' }
            }[displayStatus] || { bg: '#f5f5f5', txt: '#333' };

            const firstItem = order.items[0];
            const extraBadge = order.items.length > 1 ? `<div class="more-items-badge">+${order.items.length - 1}</div>` : '';

            return `
                <div class="order-ticket-card" onclick="openOrderDetails('${order.id}')">
                    <div class="ticket-header">
                        <div class="ticket-shop-title"><p>PACE Store</p></div>
                        <div class="ticket-status-badge" style="background: ${statusStyle.bg}; color: ${statusStyle.txt};">${displayStatus}</div>
                    </div>
                    <div class="ticket-body">
                        <div class="ticket-img-wrapper"><img src="${firstItem.image}" alt="${firstItem.name}">${extraBadge}</div>
                        <div style="flex: 1;"><h4 class="ticket-item-title">${firstItem.name}</h4><p class="ticket-item-meta">Color: ${firstItem.color} | Size: ${firstItem.size}</p><p class="ticket-qty-meta">Qty: ${firstItem.quantity || 1}</p></div>
                    </div>
                    <div class="ticket-footer">
                        <div class="ticket-footer-total">Order Total: <strong>\u20B1 ${parseFloat(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                        <div class="ticket-footer-action">View Details <i class="fi fi-rr-angle-small-right"></i></div>
                    </div>
                </div>`;
        }).join('');
    } else if (listContainer) {
        listContainer.style.display = 'none';
    }
}
/* ORDER HISTORY PAGE SPECIFIC END */

/* WRITE REVIEW MODAL LOGIC */
let currentReviewOrderId = '';
let currentReviewItemIndex = -1;
let currentReviewProduct = '';
let currentReviewRating = 0;
let reviewPhotosBase64 = [];
let reviewVideoBase64 = null;

window.openWriteReviewModal = function (orderId, itemIndex, productName, productImg) {
    currentReviewOrderId = orderId;
    currentReviewItemIndex = itemIndex;
    currentReviewProduct = productName;
    currentReviewRating = 0;
    reviewPhotosBase64 = [];
    reviewVideoBase64 = null;

    document.getElementById('review-product-name').innerText = productName;
    document.getElementById('review-product-img').src = productImg;

    document.getElementById('review-rating-text').innerText = "Select a rating";
    document.getElementById('review-rating-text').style.color = "var(--gray-text)";
    document.getElementById('review-text').value = '';
    document.getElementById('review-text').style.borderColor = "var(--border-color, #e0e0e0)";
    document.getElementById('review-text-error').style.display = 'none';

    document.getElementById('upload-photos').value = '';
    document.getElementById('upload-video').value = '';
    document.getElementById('media-preview-container').innerHTML = '';
    document.getElementById('media-error-msg').style.display = 'none';

    document.querySelectorAll('#review-star-container i').forEach(s => {
        s.className = 'fi fi-rr-star';
        s.style.color = 'var(--brand-color)';
    });

    setupReviewStars();
    openAccountModal('write-review-modal');
};

function setupReviewStars() {
    const stars = document.querySelectorAll('#review-star-container i');
    const texts = ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"];
    const ratingText = document.getElementById('review-rating-text');

    stars.forEach(star => {
        star.onclick = function () {
            currentReviewRating = parseInt(this.getAttribute('data-value'));
            ratingText.innerText = texts[currentReviewRating];
            ratingText.style.color = "var(--brand-color)";

            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= currentReviewRating) {
                    s.className = 'fi fi-sr-star active';
                    s.style.color = '#f39c12';
                } else {
                    s.className = 'fi fi-rr-star';
                    s.style.color = '#ccc';
                }
            });
        };
    });
}

// MEDIA UPLOAD LOGIC
document.getElementById('upload-photos')?.addEventListener('change', function (e) {
    const files = Array.from(e.target.files);
    const errorMsg = document.getElementById('media-error-msg');

    if (reviewPhotosBase64.length + files.length > 3) {
        errorMsg.innerText = "Maximum of 3 photos allowed.";
        errorMsg.style.display = 'block';
        return;
    }

    files.forEach(file => {
        if (file.size > 1 * 1024 * 1024) {
            errorMsg.innerText = "Photo is too large (Max 1MB).";
            errorMsg.style.display = 'block';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            reviewPhotosBase64.push(event.target.result);
            renderMediaPreviews();
            errorMsg.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });
});

document.getElementById('upload-video')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    const errorMsg = document.getElementById('media-error-msg');
    if (!file) return;

    if (reviewVideoBase64 !== null) {
        errorMsg.innerText = "Maximum of 1 video allowed.";
        errorMsg.style.display = 'block';
        this.value = '';
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        errorMsg.innerText = "Video is too large (Max 2MB).";
        errorMsg.style.display = 'block';
        this.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        reviewVideoBase64 = event.target.result;
        renderMediaPreviews();
        errorMsg.style.display = 'none';
    };
    reader.readAsDataURL(file);
});

function renderMediaPreviews() {
    const container = document.getElementById('media-preview-container');
    let html = '';

    reviewPhotosBase64.forEach((src, index) => {
        html += `
            <div style="position: relative; margin-top: 8px; margin-right: 8px;">
                <button class="media-delete-btn" onclick="removePhoto(${index})" title="Remove Photo">&times;</button>
                <div class="media-preview-box" onclick="openMediaPreview('${src}', 'image')">
                    <img src="${src}" class="media-preview-content">
                </div>
            </div>
        `;
    });

    if (reviewVideoBase64) {
        html += `
            <div style="position: relative; margin-top: 8px; margin-right: 8px;">
                <button class="media-delete-btn" onclick="removeVideo()" title="Remove Video">&times;</button>
                <div class="media-preview-box" onclick="openMediaPreview('${reviewVideoBase64}', 'video')">
                    <video src="${reviewVideoBase64}" class="media-preview-content" muted></video>
                    <div class="media-play-overlay">
                        <i class="fi fi-sr-play"></i>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

window.removePhoto = function (index) {
    reviewPhotosBase64.splice(index, 1);
    document.getElementById('upload-photos').value = '';
    renderMediaPreviews();
};

window.removeVideo = function () {
    reviewVideoBase64 = null;
    document.getElementById('upload-video').value = '';
    renderMediaPreviews();
};

window.openMediaPreview = function (src, type) {
    const modal = document.getElementById('media-fullscreen-modal');
    const container = document.getElementById('fullscreen-media-container');
    const nav = document.querySelector('.navbar-section');

    if (!modal || !container) return;

    if (type === 'image') {
        container.innerHTML = `<img src="${src}" class="fullscreen-content" onclick="event.stopPropagation()">`;
    } else {
        container.innerHTML = `<video src="${src}" class="fullscreen-content" controls autoplay onclick="event.stopPropagation()"></video>`;
    }

    if (document.body.style.overflow !== 'hidden') {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.right = `${scrollbarWidth}px`;
    }

    modal.showModal();

    modal.onclick = function () { closeMediaPreview(); };
    modal.oncancel = function (e) { e.preventDefault(); closeMediaPreview(); };
};

window.closeMediaPreview = function () {
    const modal = document.getElementById('media-fullscreen-modal');
    const container = document.getElementById('fullscreen-media-container');
    const nav = document.querySelector('.navbar-section');

    if (modal && container) {
        container.innerHTML = '';
        modal.close();

        if (document.querySelectorAll('dialog[open]').length === 0) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '0px';
            if (nav) nav.style.right = '0px';
        }
    }
};

window.submitProductReview = function () {
    if (!window.currentUser) return;

    const textInput = document.getElementById('review-text');
    const text = textInput.value.trim();
    let hasError = false;

    if (currentReviewRating === 0) {
        document.getElementById('review-rating-text').innerText = "Please select a rating";
        document.getElementById('review-rating-text').style.color = "#d9534f";
        document.querySelectorAll('#review-star-container i').forEach(star => star.style.color = "#d9534f");
        hasError = true;
    }
    if (text === '') {
        textInput.style.borderColor = "#d9534f";
        document.getElementById('review-text-error').style.display = 'block';
        hasError = true;
    }
    if (hasError) return;

    const newFeedback = {
        id: "FB-" + Date.now(),
        userEmail: window.currentUser.email,
        userName: `${window.currentUser.first_name || window.currentUser.firstName} ${window.currentUser.last_name || window.currentUser.lastName || ''}`.trim(),
        productName: currentReviewProduct,
        rating: currentReviewRating,
        comment: text,
        photos: reviewPhotosBase64,
        video: reviewVideoBase64,
        date: new Date().toLocaleDateString()
    };

    let targetOrder = window.currentUser.orderHistory.find(o => o.id === currentReviewOrderId);
    if (targetOrder && targetOrder.items[currentReviewItemIndex]) {
        targetOrder.items[currentReviewItemIndex].reviewed = true;
    }

    fetch('Database/update-account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_order_history', email: window.currentUser.email, orderHistory: window.currentUser.orderHistory })
    });

    fetch('Database/submit-review.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeedback)
    }).then(() => {
        closeAccountModal('write-review-modal');
        openOrderDetails(currentReviewOrderId);
    });
};