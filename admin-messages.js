let currentSelectedEmail = null;

window.addEventListener('DOMContentLoaded', () => {
    // 1. SECURITY CHECK
    const currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = "login.html";
        return;
    }

    // FIX: Safely Load Admin Profile Info
    let fName = String(currentUser.first_name || currentUser.firstName || 'Admin');
    let lName = String(currentUser.last_name || currentUser.lastName || '');
    const initials = (fName.charAt(0) + (lName ? lName.charAt(0) : '')).toUpperCase();
    
    document.getElementById('sidebar-initials').innerText = initials;
    document.getElementById('admin-name-display').innerText = `${fName} ${lName}`.trim();

    // Load Contacts
    loadContacts();

    // Search Listener
    const searchInput = document.getElementById('contact-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => loadContacts(searchInput.value));
    }
});

function loadContacts(searchQuery = '') {
    const contactsContainer = document.getElementById('contacts-list-container');
    let users = JSON.parse(localStorage.getItem('pace_users')) || [];

    let chatUsers = users.filter(u => u.chatHistory && u.chatHistory.length > 0 && u.role !== 'admin');

    if (searchQuery.trim() !== '') {
        const lowerQuery = searchQuery.toLowerCase();
        chatUsers = chatUsers.filter(u => {
            // FIX: Safely grab names for searching
            let fName = String(u.first_name || u.firstName || '');
            let lName = String(u.last_name || u.lastName || '');
            return `${fName} ${lName}`.toLowerCase().includes(lowerQuery) || u.email.toLowerCase().includes(lowerQuery);
        });
    }

    chatUsers.sort((a, b) => {
        const lastA = a.chatHistory[a.chatHistory.length - 1];
        const lastB = b.chatHistory[b.chatHistory.length - 1];
        const timeA = lastA.timestamp || Date.parse(lastA.time.replace(' at ', ' ')) || 0;
        const timeB = lastB.timestamp || Date.parse(lastB.time.replace(' at ', ' ')) || 0;
        return timeB - timeA; 
    });

    if (chatUsers.length === 0) {
        contactsContainer.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--gray-text); font-size: 13px;">No conversations found.</p>`;
        return;
    }

    contactsContainer.innerHTML = chatUsers.map(u => {
        // FIX: Safely grab names for rendering
        let fName = String(u.first_name || u.firstName || 'User');
        let lName = String(u.last_name || u.lastName || '');
        const fullName = `${fName} ${lName}`.trim();
        const initials = (fName.charAt(0) + (lName ? lName.charAt(0) : '')).toUpperCase();

        const lastMsg = u.chatHistory[u.chatHistory.length - 1];
        const snippet = lastMsg.text.length > 30 ? lastMsg.text.substring(0, 30) + '...' : lastMsg.text;

        let avatarHTML = u.profilePic
            ? `<img src="${u.profilePic}" class="contact-avatar">`
            : `<div class="contact-avatar">${initials}</div>`;

        const isActive = currentSelectedEmail === u.email ? 'active' : '';
        const isUnread = (lastMsg.sender === 'user' && !lastMsg.read) ? 'unread' : '';

        return `
            <div class="contact-item ${isActive} ${isUnread}" onclick="openChat('${u.email}')">
                ${avatarHTML}
                <div class="contact-info">
                    <h4>${fullName}</h4>
                    <p>${snippet}</p>
                </div>
            </div>
        `;
    }).join('');
}

window.openChat = function (email) {
    currentSelectedEmail = email;

    document.getElementById('chat-blank-state').style.display = 'none';
    document.getElementById('chat-active-state').style.display = 'flex';

    loadContacts(document.getElementById('contact-search-input').value);

    let users = JSON.parse(localStorage.getItem('pace_users')) || [];
    let u = users.find(user => user.email === email);

    if (!u) return;

    // FIX: Safely grab names for chat header
    let fName = String(u.first_name || u.firstName || 'User');
    let lName = String(u.last_name || u.lastName || '');
    const fullName = `${fName} ${lName}`.trim();
    const initials = (fName.charAt(0) + (lName ? lName.charAt(0) : '')).toUpperCase();
    
    let avatarHTML = u.profilePic
        ? `<img src="${u.profilePic}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">`
        : `<div class="contact-avatar" style="width: 50px; height: 50px; font-size: 20px; background-color: #FFF3EB; color: var(--brand-color);">${initials}</div>`;

    document.getElementById('chat-header-info').innerHTML = `
        ${avatarHTML}
        <div>
            <h3>${fullName}</h3>
            <p>${u.email}</p>
        </div>
    `;

    let isUpdated = false;
    u.chatHistory.forEach(msg => {
        if (msg.sender === 'user' && !msg.read) {
            msg.read = true; 
            isUpdated = true;
        }
    });

    if (isUpdated) {
        localStorage.setItem('pace_users', JSON.stringify(users));
        loadContacts(document.getElementById('contact-search-input').value); 
    }

    renderChatMessages(u.chatHistory);
};

function renderChatMessages(chatHistory) {
    const chatArea = document.getElementById('chat-messages-area');

    if (!chatHistory || chatHistory.length === 0) {
        chatArea.innerHTML = `<p style="text-align: center; color: var(--gray-text); margin-top: 20px;">No messages yet.</p>`;
        return;
    }

    chatArea.innerHTML = chatHistory.map(msg => {
        // user = customer (left), admin/bot = support (right)
        const wrapperClass = msg.sender === 'user' ? 'customer' : 'admin';

        return `
            <div class="msg-wrapper ${wrapperClass}">
                <div class="msg-bubble">${msg.text}</div>
                <div class="msg-time">${msg.time}</div>
            </div>
        `;
    }).join('');

    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
}

window.sendAdminMessage = function () {
    if (!currentSelectedEmail) return;

    const input = document.getElementById('admin-chat-input');
    const text = input.value.trim();

    if (text === '') return;

    let users = JSON.parse(localStorage.getItem('pace_users')) || [];
    let userIndex = users.findIndex(u => u.email === currentSelectedEmail);

    if (userIndex > -1) {
        if (!users[userIndex].chatHistory) users[userIndex].chatHistory = [];

        const now = new Date();
        const timeString = now.toLocaleDateString() + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Sender is 'admin' (renders on right side for admin, and right side for bot logic in global.js)
        // May kasamang timestamp at auto-read status
        users[userIndex].chatHistory.push({
            sender: 'admin',
            text: text,
            time: timeString,
            timestamp: Date.now(),
            read: true
        });

        localStorage.setItem('pace_users', JSON.stringify(users));

        input.value = '';
        renderChatMessages(users[userIndex].chatHistory);
        loadContacts(document.getElementById('contact-search-input').value); // update snippet
    }
};

window.handleAdminChatEnter = function (event) {
    if (event.key === 'Enter') sendAdminMessage();
};