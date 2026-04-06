/* CHAT-SUPPORT PAGE FUNCTION START */

function renderPageChat() {
    const transcriptBox = document.getElementById('page-transcript-box');
    if (!transcriptBox) return; 
    
    let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    if (!currentUser || !currentUser.chatHistory) return;

    let html = '';
    // Gumamit tayo ng (msg, index) para ma-check kung nasa dulo na ang message
    currentUser.chatHistory.forEach((msg, index) => {
        const align = msg.sender === 'user' ? 'flex-end' : 'flex-start';
        const bg = msg.sender === 'user' ? 'var(--brand-color)' : '#eaeaea';
        const color = msg.sender === 'user' ? '#fff' : 'var(--darkgray-text)';
        const border = msg.sender === 'user' ? 'border-bottom-right-radius: 2px;' : 'border-bottom-left-radius: 2px;';

        // TINANGGAL NA ANG "YOU" AT "PACE SUPPORT" (Oras na lang ang natira)
        html += `
            <div class="page-msg-wrapper" style="display:flex; flex-direction:column; align-items: ${align};">
                <span class="page-msg-meta" style="font-size:11px; color:#aaa; margin-bottom:4px;">${msg.time}</span>
                <div class="page-msg-bubble" style="background-color: ${bg}; color: ${color}; ${border} padding:10px 15px; max-width:75%; font-size:14px; line-height:1.4;">
                    ${msg.text}
                </div>
            </div>
        `;

        // IDINAGDAG: "SEEN" INDICATOR PARA SA CUSTOMER PAGE
        if (index === currentUser.chatHistory.length - 1 && msg.sender === 'user' && msg.read) {
            html += `
                <div style="font-size: 11px; color: var(--gray-text); text-align: right; width: 100%; padding-right: 5px; margin-top: -10px; margin-bottom: 10px;">
                    Seen
                </div>
            `;
        }
    });
    
    transcriptBox.innerHTML = html;
    transcriptBox.scrollTop = transcriptBox.scrollHeight; 
}

function sendPageMessage() {
    const input = document.getElementById('page-chat-input');
    const text = input.value.trim();
    if (text === '') return;

    if (typeof saveChatToDatabase === 'function') saveChatToDatabase('user', text);
    
    input.value = '';
    renderPageChat();
    if (typeof loadChatHistory === 'function') loadChatHistory();
}

function handlePageChatEnter(event) {
    if (event.key === 'Enter') sendPageMessage();
}

window.addEventListener('DOMContentLoaded', () => {
    renderPageChat();
});

function openDeleteChatModal() {
    const modal = document.getElementById('delete-chat-modal');
    const nav = document.querySelector('.navbar-section');
    if (modal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.right = `${scrollbarWidth}px`;
        modal.showModal();
    }
}

function closeDeleteChatModal() {
    const modal = document.getElementById('delete-chat-modal');
    const nav = document.querySelector('.navbar-section');
    if (modal) {
        modal.close();
        document.body.style.overflow = '';
        document.body.style.paddingRight = '0px';
        if (nav) nav.style.right = '0px';
    }
}

function executeClearChat() {
    let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    if (!currentUser) return;

    currentUser.chatHistory = [];
    localStorage.setItem('pace_current_user', JSON.stringify(currentUser));

    let users = JSON.parse(localStorage.getItem('pace_users')) || [];
    let userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex > -1) {
        users[userIndex].chatHistory = [];
        localStorage.setItem('pace_users', JSON.stringify(users));
    }

    if (typeof saveChatToDatabase === 'function') {
        saveChatToDatabase('bot', 'Hi there! Need help finding your perfect pair of shoes? 👟');
    }

    renderPageChat();

    try {
        if (typeof loadChatHistory === 'function') loadChatHistory();
    } catch (error) {
    }

    closeDeleteChatModal();
}
/* CHAT-SUPPORT PAGE FUNCTION END */