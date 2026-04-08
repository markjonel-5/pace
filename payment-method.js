window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('payment-list-container')) {
        setTimeout(loadPaymentData, 100);
    }

    const paymentForm = document.getElementById('form-new-payment');
    if (paymentForm) {
        setupInputFormatting();
        paymentForm.addEventListener('submit', handleSavePayment);
    }

    const pmModal = document.getElementById('payment-modal');
    if (pmModal) {
        pmModal.addEventListener('close', () => {
            if (paymentForm) paymentForm.reset();
            const gcashWrapper = document.querySelector('.phone-input-wrapper');
            const gcashError = document.getElementById('pm-gcash-error');
            if (gcashWrapper) gcashWrapper.classList.remove('input-error');
            if (gcashError) gcashError.classList.add('error-hidden');
        });
    }
});

function setupInputFormatting() {
    const gcashInput = document.getElementById('pm-gcash-phone');
    if (gcashInput) {
        gcashInput.addEventListener('input', function (e) {
            let numbersOnly = this.value.replace(/\D/g, '');
            if (numbersOnly.startsWith('09')) numbersOnly = numbersOnly.substring(2);
            else if (numbersOnly.startsWith('0')) numbersOnly = numbersOnly.substring(1);
            numbersOnly = numbersOnly.substring(0, 9);

            let formatted = '';
            if (numbersOnly.length > 0) formatted = numbersOnly.substring(0, 2);
            if (numbersOnly.length > 2) formatted += ' ' + numbersOnly.substring(2, 5);
            if (numbersOnly.length > 5) formatted += ' ' + numbersOnly.substring(5, 9);
            this.value = formatted;
        });
    }
}

function loadPaymentData() {
    if (!window.currentUser) {
        window.location.href = 'login.html';
        return;
    }
    if (typeof updateSidebarProfile === 'function') updateSidebarProfile(window.currentUser);

    const pmContainer = document.getElementById('payment-list-container');
    const emptyState = document.getElementById('empty-payment-state');
    if (!pmContainer || !emptyState) return;

    const payments = window.currentUser.payments || [];

    if (payments.length === 0) {
        pmContainer.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        pmContainer.style.display = 'grid';
        pmContainer.innerHTML = '';

        payments.forEach(pm => {
            // Only render GCash
            if(pm.type !== 'GCash') return; 

            const card = document.createElement('div');
            card.className = 'pm-card';
            card.innerHTML = `
                <div>
                    <div class="pm-card-top">
                        <div class="pm-icon-box gcash-icon"><i class="fi fi-rr-smartphone"></i></div>
                        <div>
                            <p>${pm.type}</p>
                            <h4>${pm.data.name}</h4>
                        </div>
                    </div>
                    <div class="pm-details">${pm.data.phone}</div>
                </div>
                <div class="pm-actions">
                    <button class="addr-action-btn btn-delete" onclick="openDeletePaymentModal(${pm.id})">
                        <i class="fi fi-rs-trash"></i> Delete
                    </button>
                </div>
            `;
            pmContainer.appendChild(card);
        });
    }
}

function handleSavePayment(e) {
    e.preventDefault();

    const gcashInput = document.getElementById('pm-gcash-phone');
    const rawPhone = gcashInput.value.replace(/\D/g, '');
    const gcashError = document.getElementById('pm-gcash-error');
    const gcashWrapper = document.querySelector('.phone-input-wrapper');

    gcashError.classList.add('error-hidden');
    gcashWrapper.classList.remove('input-error');

    if (rawPhone.length !== 9) {
        gcashError.innerText = "Please enter a complete 10-digit GCash number.";
        gcashError.classList.remove('error-hidden');
        gcashWrapper.classList.add('input-error');
        return;
    }

    const newPayment = {
        id: Date.now(),
        type: 'GCash',
        data: {
            name: document.getElementById('pm-gcash-name').value.trim(),
            phone: '+63 9' + gcashInput.value.trim() 
        }
    };

    if (window.currentUser) {
        if (!window.currentUser.payments) window.currentUser.payments = [];
        window.currentUser.payments.push(newPayment);

        if (window.syncPaymentsToDatabase) {
            window.syncPaymentsToDatabase(window.currentUser.email, window.currentUser.payments);
        }

        e.target.reset();
        closeAccountModal('payment-modal');
        loadPaymentData();
    }
}

/* DELETE PAYMENT MODAL START (Unchanged) */
let paymentIdToDelete = null;

window.openDeletePaymentModal = function(id) {
    paymentIdToDelete = id;
    const modal = document.getElementById('delete-payment-modal');
    const nav = document.querySelector('.navbar-section');
    if (modal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.right = `${scrollbarWidth}px`;
        modal.showModal();
    }
};

window.closeDeletePaymentModal = function() {
    const modal = document.getElementById('delete-payment-modal');
    if (modal) {
        modal.close(); 
        paymentIdToDelete = null;
    }
};

window.executeDeletePayment = function() {
    if (!paymentIdToDelete) return;
    if (window.currentUser && window.currentUser.payments) {
        window.currentUser.payments = window.currentUser.payments.filter(pm => pm.id !== paymentIdToDelete);
        if (window.syncPaymentsToDatabase) {
            window.syncPaymentsToDatabase(window.currentUser.email, window.currentUser.payments);
        }
        closeDeletePaymentModal();
        loadPaymentData();
    }
};