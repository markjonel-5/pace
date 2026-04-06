window.addEventListener('DOMContentLoaded', () => {

    const urlParams = new URLSearchParams(window.location.search);
    
    const orderId = urlParams.get('orderId');
    const displayElement = document.getElementById('display-order-id');
    
    if (orderId && displayElement) {
        displayElement.innerText = orderId;
    } else if (displayElement) {
        displayElement.innerText = "ORDER NOT FOUND";
    }

    const isGuest = urlParams.get('guest');
    const historyBtn = document.getElementById('history-btn');

    if (isGuest === 'true' && historyBtn) {
        historyBtn.style.display = 'none';
    }
});