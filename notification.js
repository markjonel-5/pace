/* NOTIFICATION INITIALIZATION */
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('pace_current_user'));

    if (currentUser && document.getElementById('notification-list')) {
        renderNotification(currentUser);
    }
});


/* NOTIFICATION RENDERING LOGIC START */
function renderNotification(user) {
    const notifs = user.notifications || [];
    const listContainer = document.getElementById('notification-list');
    const emptyState = document.getElementById('empty-notification');
    const markReadBtn = document.getElementById('mark-read-btn');

    if (emptyState) emptyState.style.display = notifs.length ? 'none' : 'block';
    if (listContainer) listContainer.style.display = notifs.length ? 'flex' : 'none';
    if (markReadBtn) markReadBtn.disabled = !notifs.some(n => !n.read);

    if (!notifs.length || !listContainer) return;

    const grouped = {};
    const general = [];

    notifs.forEach(n => {
        const orderIdMatch = n.message.match(/PACE-\d+/);
        if (orderIdMatch) (grouped[orderIdMatch[0]] = grouped[orderIdMatch[0]] || []).push(n);
        else general.push(n);
    });

    const getIcon = (title) => {
        const t = title.toLowerCase();
        if (t.includes('cancel')) return { c: 'fi-rr-cross-circle', col: '#F44336' };
        if (t.includes('ship') || t.includes('way')) return { c: 'fi-rr-truck-side', col: '#2196F3' };
        if (t.includes('deliver') || t.includes('complet')) return { c: 'fi-rr-box-check', col: '#4CAF50' };
        return { c: 'fi-rr-box', col: '#FF9800' };
    };

    let html = Object.keys(grouped).map(orderId => {
        const group = grouped[orderId];
        const hasUnread = group.some(n => !n.read);

        const itemsHtml = group.map((n, i) => {
            const { c, col } = getIcon(n.title);
            return `
                <div class="stacked-notif-item ${n.read ? '' : 'unread-text'}" style="border-bottom: ${i === group.length - 1 ? 'none' : '1px solid #eaeaea'};">
                    <div class="notif-icon-wrapper" style="color: ${col}; background-color: ${col}1A; width: 38px; height: 38px; font-size: 16px;"><i class="fi ${c}" style="padding-top: 5px;"></i></div>
                    <div class="stacked-text-wrapper"><p class="notif-message-text">${n.message}</p><span class="notif-sub-date">${n.date}</span></div>
                    ${n.read ? '' : '<span class="unread-dot" style="margin-left: auto;"></span>'}
                </div>`;
        }).join('');

        return `
            <div class="notification-card ${hasUnread ? 'unread' : ''} clickable-notif" onclick="handleGroupClick('${orderId}')">
                <div class="notif-ticket-header"><h4>${hasUnread ? '<span class="unread-dot"></span>' : ''} Order Updates: ${orderId}</h4><span class="notif-date">${group.length} update(s)</span></div>
                <div class="notif-ticket-body" style="flex-direction: column; align-items: stretch; padding: 10px 20px;">${itemsHtml}</div>
            </div>`;
    }).join('');

    html += general.map(n => `
        <div class="notification-card ${n.read ? '' : 'unread'}">
            <div class="notif-ticket-header"><h4>${n.read ? '' : '<span class="unread-dot"></span>'} ${n.title}</h4><span class="notif-date">${n.date}</span></div>
            <div class="notif-ticket-body"><div class="notif-icon-wrapper" style="color: #555; background-color: #f5f5f5;"><i class="fi fi-rr-bell"></i></div><p class="notif-message-text">${n.message}</p></div>
        </div>
    `).join('');

    listContainer.innerHTML = html;
}
/* NOTIFICATION RENDERING LOGIC END */


/* NOTIFICATION INTERACTION LOGIC START */
window.handleGroupClick = function (orderId) {
    let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    let hasChanges = false;

    currentUser.notifications.forEach(n => {
        if (n.message.includes(orderId) && !n.read) { n.read = true; hasChanges = true; }
    });

    if (hasChanges) {
        let users = JSON.parse(localStorage.getItem('pace_users')) || [];
        let userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex > -1) {
            users[userIndex].notifications = currentUser.notifications;
            localStorage.setItem('pace_users', JSON.stringify(users));
        }
        localStorage.setItem('pace_current_user', JSON.stringify(currentUser));
        renderNotification(currentUser);
        if (typeof renderUserMenu === 'function') renderUserMenu();
    }

    if (typeof openOrderDetails === 'function') {
        openOrderDetails(orderId);
    }
};

window.markAllAsRead = function () {
    let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    if (!currentUser || !currentUser.notifications) return;

    currentUser.notifications.forEach(n => n.read = true);

    let users = JSON.parse(localStorage.getItem('pace_users')) || [];
    let userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex > -1) {
        users[userIndex].notifications = currentUser.notifications;
        localStorage.setItem('pace_users', JSON.stringify(users));
    }

    localStorage.setItem('pace_current_user', JSON.stringify(currentUser));
    renderNotification(currentUser);
    if (typeof renderUserMenu === 'function') renderUserMenu();
};
/* NOTIFICATION INTERACTION LOGIC END */