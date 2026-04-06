/* PAYMENT METHODS FUNCTION START */
window.addEventListener('DOMContentLoaded', () => {
    
    if (document.getElementById('payment-list-container')) {
        loadPaymentData();
    }

    const paymentForm = document.getElementById('form-new-payment');
    if (paymentForm) {
        setupDynamicFormToggle();
        setupInputFormatting();
        paymentForm.addEventListener('submit', handleSavePayment);
    }

    const pmModal = document.getElementById('payment-modal');
    if (pmModal) {
        pmModal.addEventListener('close', () => {
            if (paymentForm) paymentForm.reset();
            
            const cardRadio = document.querySelector('input[name="pm-type"][value="Card"]');
            if (cardRadio) {
                cardRadio.checked = true;
                cardRadio.dispatchEvent(new Event('change')); 
            }

            const gcashWrapper = document.querySelector('.phone-input-wrapper');
            const gcashError = document.getElementById('pm-gcash-error');
            if (gcashWrapper) gcashWrapper.classList.remove('input-error');
            if (gcashError) gcashError.classList.add('error-hidden');

            ['pm-card-number', 'pm-card-exp', 'pm-card-cvv'].forEach(id => {
                const input = document.getElementById(id);
                const error = document.getElementById(id + '-error');
                if (input) input.classList.remove('input-error');
                if (error) error.classList.add('error-hidden');
            });
        });
    }
});

// function to switch modal between card, gcash, and paypal
function setupDynamicFormToggle() {
    const radioBtns = document.querySelectorAll('input[name="pm-type"]');
    const fieldsCard = document.getElementById('fields-card');
    const fieldsGcash = document.getElementById('fields-gcash');
    const fieldsPaypal = document.getElementById('fields-paypal');

    radioBtns.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const selectedType = e.target.value;

            fieldsCard.classList.add('hidden-fields');
            fieldsGcash.classList.add('hidden-fields');
            fieldsPaypal.classList.add('hidden-fields');

            document.querySelectorAll('.pm-dynamic-fields .account-input-field').forEach(input => {
                input.required = false;
            });

            if (selectedType === 'Card') {
                fieldsCard.classList.remove('hidden-fields');
                document.getElementById('pm-card-name').required = true;
                document.getElementById('pm-card-number').required = true;
                document.getElementById('pm-card-exp').required = true;
                document.getElementById('pm-card-cvv').required = true;
            } else if (selectedType === 'GCash') {
                fieldsGcash.classList.remove('hidden-fields');
                document.getElementById('pm-gcash-name').required = true;
                document.getElementById('pm-gcash-phone').required = true;
            } else if (selectedType === 'PayPal') {
                fieldsPaypal.classList.remove('hidden-fields');
                document.getElementById('pm-paypal-email').required = true;
            }
        });
    });

    document.querySelector('input[name="pm-type"][value="Card"]').click();
}

function setupInputFormatting() {
    const cardInput = document.getElementById('pm-card-number');
    if (cardInput) {
        cardInput.addEventListener('input', function (e) {
            let val = this.value.replace(/\D/g, '');
            let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
            this.value = formatted;
        });
    }

    const expInput = document.getElementById('pm-card-exp');
    if (expInput) {
        expInput.addEventListener('input', function (e) {
            let val = this.value.replace(/\D/g, '');
            if (val.length >= 3) {
                this.value = val.substring(0, 2) + '/' + val.substring(2, 4);
            } else {
                this.value = val;
            }
        });
    }

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

// function to load user data and display payment methods
function loadPaymentData() {
    const currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    if (typeof updateSidebarProfile === 'function') {
        updateSidebarProfile(currentUser);
    }

    const pmContainer = document.getElementById('payment-list-container');
    const emptyState = document.getElementById('empty-payment-state');

    if (!pmContainer || !emptyState) return;

    const payments = currentUser.payments || [];

    if (payments.length === 0) {
        pmContainer.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        pmContainer.style.display = 'grid';
        pmContainer.innerHTML = '';

        payments.forEach(pm => {
            let iconClass = '';
            let iconCode = '';
            let displayDetails = '';

            if (pm.type === 'Card') {
                iconClass = 'card-icon';
                iconCode = '<i class="fi fi-rr-credit-card"></i>';
                const last4 = pm.data.number.slice(-4);
                displayDetails = `•••• •••• •••• ${last4}`;
            } else if (pm.type === 'GCash') {
                iconClass = 'gcash-icon';
                iconCode = '<i class="fi fi-rr-smartphone"></i>';
                displayDetails = pm.data.phone; 
            } else if (pm.type === 'PayPal') {
                iconClass = 'paypal-icon';
                iconCode = '<i class="fi fi-brands-paypal"></i>';
                displayDetails = pm.data.email;
            }

            const card = document.createElement('div');
            card.className = 'pm-card';
            card.innerHTML = `
                <div>
                    <div class="pm-card-top">
                        <div class="pm-icon-box ${iconClass}">${iconCode}</div>
                        <div>
                            <p>${pm.type}</p>
                            <h4>${pm.data.name}</h4>
                        </div>
                    </div>
                    <div class="pm-details">${displayDetails}</div>
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

// function to handle form submission
function handleSavePayment(e) {
    e.preventDefault();

    const selectedType = document.querySelector('input[name="pm-type"]:checked').value;
    let paymentData = {};

    if (selectedType === 'Card') {
        const cardNumInput = document.getElementById('pm-card-number');
        const cardExpInput = document.getElementById('pm-card-exp');
        const cardCvvInput = document.getElementById('pm-card-cvv');
        
        const cardNumError = document.getElementById('pm-card-number-error');
        const cardExpError = document.getElementById('pm-card-exp-error');
        const cardCvvError = document.getElementById('pm-card-cvv-error');

        cardNumInput.classList.remove('input-error');
        cardExpInput.classList.remove('input-error');
        cardCvvInput.classList.remove('input-error');
        cardNumError.classList.add('error-hidden');
        cardExpError.classList.add('error-hidden');
        cardCvvError.classList.add('error-hidden');

        let hasError = false;

        const cardNumber = cardNumInput.value.replace(/\s/g, '');
        if (cardNumber.length !== 16) {
            cardNumError.innerText = "Please enter a valid 16-digit card number.";
            cardNumError.classList.remove('error-hidden');
            cardNumInput.classList.add('input-error');
            hasError = true;
        }

        const cardExp = cardExpInput.value.trim();
        if (cardExp.length !== 5) {
            cardExpError.innerText = "Enter valid date (MM/YY).";
            cardExpError.classList.remove('error-hidden');
            cardExpInput.classList.add('input-error');
            hasError = true;
        } else {
            const parts = cardExp.split('/');
            const expMonth = parseInt(parts[0], 10);
            const expYear = parseInt(parts[1], 10);

            const today = new Date();
            const currentMonth = today.getMonth() + 1;
            const currentYear = parseInt(today.getFullYear().toString().slice(-2), 10);

            if (expMonth < 1 || expMonth > 12) {
                cardExpError.innerText = "Invalid month (01-12).";
                cardExpError.classList.remove('error-hidden');
                cardExpInput.classList.add('input-error');
                hasError = true;
            } 
            else if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                cardExpError.innerText = "This card has expired.";
                cardExpError.classList.remove('error-hidden');
                cardExpInput.classList.add('input-error');
                hasError = true;
            }
        }

        const cardCvv = cardCvvInput.value.trim();
        if (cardCvv.length < 3) {
            cardCvvError.innerText = "CVV must be 3 or 4 digits.";
            cardCvvError.classList.remove('error-hidden');
            cardCvvInput.classList.add('input-error');
            hasError = true;
        }

        if (hasError) return;

        paymentData = {
            name: document.getElementById('pm-card-name').value.trim(),
            number: cardNumber,
            exp: cardExp,
            cvv: cardCvv
        };

    } else if (selectedType === 'GCash') {
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

        paymentData = {
            name: document.getElementById('pm-gcash-name').value.trim(),
            phone: '+63 9' + gcashInput.value.trim() 
        };

    } else if (selectedType === 'PayPal') {
        paymentData = {
            name: 'PayPal Account',
            email: document.getElementById('pm-paypal-email').value.trim()
        };
    }

    const newPayment = {
        id: Date.now(),
        type: selectedType,
        data: paymentData
    };

    let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    let users = JSON.parse(localStorage.getItem('pace_users')) || [];
    let userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex > -1) {
        if (!currentUser.payments) currentUser.payments = [];
        if (!users[userIndex].payments) users[userIndex].payments = [];

        currentUser.payments.push(newPayment);
        users[userIndex].payments.push(newPayment);

        localStorage.setItem('pace_users', JSON.stringify(users));
        localStorage.setItem('pace_current_user', JSON.stringify(currentUser));

        e.target.reset();
        closeAccountModal('payment-modal');
        loadPaymentData();
    }
}
/* PAYMENT METHODS FUNCTION END */

/* DELETE PAYMENT MODAL START */
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

    let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    let users = JSON.parse(localStorage.getItem('pace_users')) || [];
    let userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex > -1 && currentUser.payments) {
        currentUser.payments = currentUser.payments.filter(pm => pm.id !== paymentIdToDelete);
        users[userIndex].payments = users[userIndex].payments.filter(pm => pm.id !== paymentIdToDelete);

        localStorage.setItem('pace_users', JSON.stringify(users));
        localStorage.setItem('pace_current_user', JSON.stringify(currentUser));

        closeDeletePaymentModal();
        loadPaymentData();
    }
};
/* DELETE PAYMENT MODAL END */