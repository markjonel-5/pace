let currentSelectedEmail = null;
window.adminChatUsers = [];

window.addEventListener('DOMContentLoaded', () => {
    // 1. SECURITY CHECK & DATA LOAD
    fetch('Database/fetch-session.php')
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

            fetchChatUsers();
        });

    const searchInput = document.getElementById('contact-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderContacts(searchInput.value));
    }
});

function fetchChatUsers() {
    fetch('Database/fetch-users.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.adminChatUsers = data.users;
                renderContacts(document.getElementById('contact-search-input')?.value || '');
                if (currentSelectedEmail) {
                    openChat(currentSelectedEmail); 
                }
            }
        });
}

function renderContacts(searchQuery = '') {
    const contactsContainer = document.getElementById('contacts-list-container');
    let chatUsers = window.adminChatUsers.filter(u => u.chatHistory && u.chatHistory.length > 0 && u.role !== 'admin');

    if (searchQuery.trim() !== '') {
        const lowerQuery = searchQuery.toLowerCase();
        chatUsers = chatUsers.filter(u => {
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

    let u = window.adminChatUsers.find(user => user.email === email);
    if (!u) return;

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
        // Sync auto-read to database
        fetch('Database/admin-reply-chat.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: u.email, chatHistory: u.chatHistory })
        }).then(() => fetchChatUsers());
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
        const wrapperClass = msg.sender === 'user' ? 'customer' : 'admin';
        return `
            <div class="msg-wrapper ${wrapperClass}">
                <div class="msg-bubble">${msg.text}</div>
                <div class="msg-time">${msg.time}</div>
            </div>
        `;
    }).join('');

    chatArea.scrollTop = chatArea.scrollHeight;
}

window.sendAdminMessage = function () {
    if (!currentSelectedEmail) return;

    const input = document.getElementById('admin-chat-input');
    const text = input.value.trim();
    if (text === '') return;

    let userIndex = window.adminChatUsers.findIndex(u => u.email === currentSelectedEmail);

    if (userIndex > -1) {
        if (!window.adminChatUsers[userIndex].chatHistory) window.adminChatUsers[userIndex].chatHistory = [];

        const now = new Date();
        const timeString = now.toLocaleDateString() + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        window.adminChatUsers[userIndex].chatHistory.push({
            sender: 'admin',
            text: text,
            time: timeString,
            timestamp: Date.now(),
            read: true
        });

        // SEND DIRECTLY TO LIVE MYSQL DATABASE!
        fetch('Database/admin-reply-chat.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentSelectedEmail, chatHistory: window.adminChatUsers[userIndex].chatHistory })
        }).then(() => {
            input.value = '';
            fetchChatUsers(); // Refresh to lock it in
        });
    }
};

window.handleAdminChatEnter = function (event) {
    if (event.key === 'Enter') sendAdminMessage();
};