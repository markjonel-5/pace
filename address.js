/* SAVED ADDRESSES FUNCTION START */
window.addEventListener('DOMContentLoaded', () => {
    
    if (document.getElementById('address-list-container')) {
        loadAddressData();
    }

    const addressForm = document.getElementById('form-new-address');
    if (addressForm) {
        addressForm.addEventListener('submit', handleSaveAddress);
    }

    const phoneInput = document.getElementById('addr-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
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

    const addressModal = document.getElementById('address-modal');
    if (addressModal) {
        addressModal.addEventListener('close', () => {
            if (addressForm) {
                addressForm.reset();
            }
            const phoneWrapper = document.querySelector('.phone-input-wrapper');
            const phoneError = document.getElementById('addr-phone-error');
            if (phoneWrapper) phoneWrapper.classList.remove('input-error');
            if (phoneError) phoneError.classList.add('error-hidden');
        });
    }
});

// Function to load user data and display addresses
function loadAddressData() {
    const currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    if (typeof updateSidebarProfile === 'function') {
        updateSidebarProfile(currentUser);
    }

    const addressContainer = document.getElementById('address-list-container');
    const emptyState = document.getElementById('empty-address-state');

    if (!addressContainer || !emptyState) return;

    const addresses = currentUser.addresses || [];

    if (addresses.length === 0) {
        addressContainer.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        addressContainer.style.display = 'grid';
        addressContainer.innerHTML = '';

        addresses.forEach(addr => {
            const card = document.createElement('div');
            card.className = 'address-card';
            card.innerHTML = `
                <span class="address-label-tag">${addr.label}</span>
                <h4>${addr.fullName}</h4>
                <div class="address-details">
                    ${addr.street}<br>
                    ${addr.brgy}, ${addr.city}<br>
                    ${addr.region}, ${addr.postalCode}
                    <span class="address-phone"> ${addr.phone}</span>
                </div>
                <div class="address-actions">
                    <button class="addr-action-btn btn-delete" onclick="openDeleteAddressModal(${addr.id})">
                        <i class="fi fi-rs-trash"></i> Delete
                    </button>
                </div>
            `;
            addressContainer.appendChild(card);
        });
    }
}

// Function to handle form submission
function handleSaveAddress(e) {
    e.preventDefault();

    const phoneInput = document.getElementById('addr-phone');
    const phoneWrapper = phoneInput.closest('.phone-input-wrapper');
    const phoneError = document.getElementById('addr-phone-error');
    
    phoneError.classList.add('error-hidden');
    phoneWrapper.classList.remove('input-error');

    const rawPhone = phoneInput.value.replace(/\D/g, '');
    if (rawPhone.length !== 9) {
        phoneError.innerText = "Please enter a complete 10-digit mobile number.";
        phoneError.classList.remove('error-hidden');
        phoneWrapper.classList.add('input-error');
        return;
    }

    const newAddress = {
        id: Date.now(),
        fullName: document.getElementById('addr-fullname').value.trim(),
        phone: '+63 9' + phoneInput.value.trim(),
        region: document.getElementById('addr-region').value.trim(),
        city: document.getElementById('addr-city').value.trim(),
        brgy: document.getElementById('addr-brgy').value.trim(),
        postalCode: document.getElementById('addr-postal').value.trim(),
        street: document.getElementById('addr-street').value.trim(),
        label: document.querySelector('input[name="addr-label"]:checked').value
    };

    let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    let users = JSON.parse(localStorage.getItem('pace_users')) || [];
    let userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex > -1) {
        if (!currentUser.addresses) currentUser.addresses = [];
        if (!users[userIndex].addresses) users[userIndex].addresses = [];

        currentUser.addresses.push(newAddress);
        users[userIndex].addresses.push(newAddress);

        localStorage.setItem('pace_users', JSON.stringify(users));
        localStorage.setItem('pace_current_user', JSON.stringify(currentUser));

        e.target.reset();
        closeAccountModal('address-modal');
        loadAddressData();
    }
}

window.deleteAddress = function(idToDelete) {
    if(confirm("Are you sure you want to delete this address?")) {
        let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
        let users = JSON.parse(localStorage.getItem('pace_users')) || [];
        let userIndex = users.findIndex(u => u.email === currentUser.email);

        if (userIndex > -1 && currentUser.addresses) {
            currentUser.addresses = currentUser.addresses.filter(addr => addr.id !== idToDelete);
            users[userIndex].addresses = users[userIndex].addresses.filter(addr => addr.id !== idToDelete);

            localStorage.setItem('pace_users', JSON.stringify(users));
            localStorage.setItem('pace_current_user', JSON.stringify(currentUser));

            loadAddressData();
        }
    }
};
/* SAVED ADDRESSES FUNCTION END */

/* DELETE ADDRESS MODAL START */
let addressIdToDelete = null;

window.openDeleteAddressModal = function(id) {
    addressIdToDelete = id;
    const modal = document.getElementById('delete-address-modal');
    const nav = document.querySelector('.navbar-section');

    if (modal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.right = `${scrollbarWidth}px`;
        modal.showModal();
    }
};

window.closeDeleteAddressModal = function() {
    const modal = document.getElementById('delete-address-modal');
    if (modal) {
        modal.close(); 
        addressIdToDelete = null;
    }
};

window.executeDeleteAddress = function() {
    if (!addressIdToDelete) return;

    let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    let users = JSON.parse(localStorage.getItem('pace_users')) || [];
    let userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex > -1 && currentUser.addresses) {
        currentUser.addresses = currentUser.addresses.filter(addr => addr.id !== addressIdToDelete);
        users[userIndex].addresses = users[userIndex].addresses.filter(addr => addr.id !== addressIdToDelete);

        localStorage.setItem('pace_users', JSON.stringify(users));
        localStorage.setItem('pace_current_user', JSON.stringify(currentUser));

        closeDeleteAddressModal();
        loadAddressData();
    }
};
/* DELETE ADDRESS MODAL END */