let temporaryGuestPayments = [];

function getSelectedItems(user) {
    const buyNowItem = JSON.parse(sessionStorage.getItem('pace_buy_now_item'));
    if (buyNowItem) return [buyNowItem];

    const cart = user ? user.cart || [] : (window.guestCart || []);
    return cart.filter(item => item.selected !== false);
}

function calculateSubtotal(items) {
    return items.reduce((total, item) => {
        let qty = item.quantity || 1;
        let cleanPrice = parseFloat(item.price.replace(/,/g, ''));
        return total + (cleanPrice * qty);
    }, 0);
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadCheckoutData(window.currentUser);
        setupDeliveryToggle();
        setupInputFormatting();
        setupModalCleanup();
        setupAddressForm();
    }, 100);
});

function loadCheckoutData(user) {

    const currentFName = document.getElementById('checkout-fname') ? document.getElementById('checkout-fname').value : '';
    const currentLName = document.getElementById('checkout-lname') ? document.getElementById('checkout-lname').value : '';
    const currentEmail = document.getElementById('checkout-email') ? document.getElementById('checkout-email').value : '';
    const currentPhone = document.getElementById('guest-phone') ? document.getElementById('guest-phone').value : '';
    const currentRegion = document.getElementById('guest-region') ? document.getElementById('guest-region').value : '';
    const currentCity = document.getElementById('guest-city') ? document.getElementById('guest-city').value : '';
    const currentBrgy = document.getElementById('guest-brgy') ? document.getElementById('guest-brgy').value : '';
    const currentPostal = document.getElementById('guest-postal') ? document.getElementById('guest-postal').value : '';
    const currentStreet = document.getElementById('guest-street') ? document.getElementById('guest-street').value : '';

    const selectedItems = getSelectedItems(user);

    if (selectedItems.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    const totalItems = selectedItems.reduce((total, item) => total + (item.quantity || 1), 0);
    const countHeader = document.getElementById('cart-item-count');
    if (countHeader) countHeader.innerText = `(${totalItems})`;

    // Render Contact Area
    const contactContainer = document.getElementById('checkout-contact-content');
    if (user) {
        let fName = user.first_name || user.firstName || 'Customer';
        let lName = user.last_name || user.lastName || '';

        contactContainer.innerHTML = `
            <div class="account-input-group">
                <label>Email Address (For Order Confirmation)</label>
                <input type="email" id="checkout-email" class="account-input-field" value="${user.email}" readonly style="background-color: #f5f5f5; color: var(--gray-text); cursor: not-allowed; border-color: #eaeaea;">
            </div>
            <input type="hidden" id="checkout-fname" value="${fName}">
            <input type="hidden" id="checkout-lname" value="${lName}">
        `;
    } else {
        contactContainer.innerHTML = `
            <div id="checkout-contact-error" class="account-error-text error-hidden" style="margin-bottom: 15px; color: #d9534f; font-size: 13px; font-weight: 500; background: #fff1f0; padding: 10px; border-radius: 6px;"></div>
            <div class="account-form-row">
                <div class="account-input-group">
                    <label>First Name <span style="color:#d9534f">*</span></label>
                    <input type="text" id="checkout-fname" class="account-input-field" placeholder="e.g. Juan" required>
                </div>
                <div class="account-input-group">
                    <label>Last Name <span style="color:#d9534f">*</span></label>
                    <input type="text" id="checkout-lname" class="account-input-field" placeholder="e.g. Dela Cruz" required>
                </div>
            </div>
            <div class="account-input-group" style="margin-top: 15px;">
                <label>Email Address <span style="color:#d9534f">*</span></label>
                <input type="email" id="checkout-email" class="account-input-field" placeholder="e.g. juan@example.com" required>
                <p style="font-size: 12px; color: var(--gray-text); margin-top: 5px;">We'll send your order confirmation here.</p>
            </div>
        `;
    }

    // Render Review Area
    const reviewContainer = document.getElementById('checkout-sidebar-review');
    let reviewHTML = '';
    selectedItems.forEach(item => {
        let qty = item.quantity || 1;
        let cleanPrice = parseFloat(item.price.replace(/,/g, ''));
        let formattedUnitPrice = cleanPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        reviewHTML += `
            <div class="summary-mini-item">
                <div class="summary-mini-left">
                    <div class="summary-mini-img-box">
                        <img src="${item.image}" alt="${item.name}">
                        <span class="summary-mini-qty">${qty}</span>
                    </div>
                    <div class="summary-mini-text">
                        <h4>${item.name}</h4>
                        <p>${item.color} / ${item.size}</p>
                    </div>
                </div>
                <div class="summary-mini-price">\u20B1 ${formattedUnitPrice}</div>
            </div>
        `;
    });
    reviewContainer.innerHTML = reviewHTML;

    updateOrderSummary();

    // Render Address Area
    const addressContainer = document.getElementById('checkout-address-content');
    let validAddresses = [];
    if (user && user.addresses) {
        validAddresses = user.addresses.filter(a => a && a.fullName && a.fullName !== 'undefined');
    }

    if (!user) {
        addressContainer.innerHTML = `
            <div id="guest-address-form" style="display: flex; flex-direction: column; gap: 15px;">
                <div id="checkout-address-error" class="account-error-text error-hidden" style="color: #d9534f; font-size: 13px; font-weight: 500; background: #fff1f0; padding: 10px; border-radius: 6px;"></div>
                <div class="account-input-group">
                    <label>Phone Number <span style="color:#d9534f">*</span></label>
                    <div class="phone-input-wrapper">
                        <span class="phone-prefix">+63 9</span>
                        <input type="tel" id="guest-phone" class="account-input-field" placeholder="00 000 0000" required>
                    </div>
                </div>
                <div class="account-form-row">
                    <div class="account-input-group">
                        <label>Region / Province <span style="color:#d9534f">*</span></label>
                        <input type="text" id="guest-region" class="account-input-field" placeholder="e.g. Bulacan" required>
                    </div>
                    <div class="account-input-group">
                        <label>City / Municipality <span style="color:#d9534f">*</span></label>
                        <input type="text" id="guest-city" class="account-input-field" placeholder="e.g. Malolos City" required>
                    </div>
                </div>
                <div class="account-form-row">
                    <div class="account-input-group">
                        <label>Barangay <span style="color:#d9534f">*</span></label>
                        <input type="text" id="guest-brgy" class="account-input-field" placeholder="e.g. Atlag" required>
                    </div>
                    <div class="account-input-group">
                        <label>Postal Code <span style="color:#d9534f">*</span></label>
                        <input type="text" id="guest-postal" class="account-input-field" placeholder="e.g. 3000" required>
                    </div>
                </div>
                <div class="account-input-group">
                    <label>Street Name, Building, House No. <span style="color:#d9534f">*</span></label>
                    <input type="text" id="guest-street" class="account-input-field" placeholder="e.g. Unit 123, Estrella Street" required>
                </div>
            </div>
        `;
        const addressHeaderBtn = document.querySelector('#checkout-address-box .add-address-btn');
        if (addressHeaderBtn) addressHeaderBtn.style.display = 'none';

    } else if (validAddresses.length === 0) {
        addressContainer.innerHTML = `<p style="color: #d9534f; font-size: 15px; font-weight: 500; padding: 15px; background: #fff1f0; border-radius: 8px;">Please click "+ Add Shipping Address" above to continue.</p>`;
    } else {
        let addressHTML = '<div class="checkout-selection-list">';
        validAddresses.forEach((addr, index) => {
            const isChecked = index === validAddresses.length - 1 ? 'checked' : '';
            addressHTML += `
                <label class="checkout-option-label">
                    <input type="radio" name="checkout-address" value="${addr.id}" ${isChecked}>
                    <div class="checkout-option-info">
                        <span class="address-label-tag" style="position:static; display:inline-block; margin-bottom:5px;">${addr.label}</span>
                        <h4 style="font-size: 16px; margin-bottom:3px; margin-left: 5px;">${addr.fullName} <span style="font-weight:400; font-size:14px; color:var(--gray-text); margin-left:10px;">${addr.phone}</span></h4>
                        <p style="color: var(--gray-text); font-size:14px; line-height:1.4; margin-left: 5px;">${addr.street}, ${addr.brgy}, ${addr.city}, ${addr.region}, ${addr.postalCode}</p>
                    </div>
                </label>
            `;
        });
        addressHTML += `</div>`;
        addressContainer.innerHTML = addressHTML;
    }

    // Render Payment Area
    const paymentContainer = document.getElementById('checkout-payment-content');

    // Find if user has saved GCash numbers
    let validPayments = [];
    if (user && user.payments) {
        validPayments = user.payments.filter(p => p && p.type === 'GCash');
    }

    let paymentHTML = '<div class="checkout-selection-list">';

    if (validPayments.length > 0) {
        // Render their saved GCash numbers
        validPayments.forEach((pm, index) => {
            const isChecked = index === 0 ? 'checked' : '';
            paymentHTML += `
                <label class="checkout-option-label">
                    <input type="radio" name="checkout-payment" value="${pm.id}" ${isChecked}>
                    <div class="pm-icon-box" style="background: #fff; width:40px; height:40px; display:flex; justify-content:center; align-items:center; border-radius:6px; font-size:18px; color:var(--darkgray-text); border: 1px solid #eaeaea;">
                       <i class="fi fi-rr-smartphone"></i>
                    </div>
                    <div class="checkout-option-info">
                        <p style="font-size:13px; color:var(--gray-text); margin-bottom:2px; font-weight:600;">Saved GCash</p>
                        <h4 style="font-size:15px; color:var(--darkgray-text);">${pm.data.phone}</h4>
                    </div>
                </label>
            `;
        });
    } else {
        // Render a generic GCash option if they haven't saved one
        paymentHTML += `
            <label class="checkout-option-label">
                <input type="radio" name="checkout-payment" value="GCash">
                <div class="pm-icon-box" style="background: #fff; width:40px; height:40px; display:flex; justify-content:center; align-items:center; border-radius:6px; font-size:18px; color:var(--darkgray-text); border: 1px solid #eaeaea;">
                   <i class="fi fi-rr-smartphone"></i>
                </div>
                <div class="checkout-option-info">
                    <p style="font-size:13px; color:var(--gray-text); margin-bottom:2px; font-weight:600;">E-Wallet</p>
                    <h4 style="font-size:15px; color:var(--darkgray-text);">GCash</h4>
                </div>
            </label>
        `;
    }

    // Add COD to the bottom
    paymentHTML += `
        <label class="checkout-option-label">
            <input type="radio" name="checkout-payment" value="COD" ${validPayments.length === 0 ? 'checked' : ''}>
            <div class="pm-icon-box" style="background: #fff; width:40px; height:40px; display:flex; justify-content:center; align-items:center; border-radius:6px; font-size:18px; color:var(--darkgray-text); border: 1px solid #eaeaea;">
               <i class="fi fi-rr-money-bill-wave"></i>
            </div>
            <div class="checkout-option-info">
                <p id="cod-subtitle" style="font-size:13px; color:var(--gray-text); margin-bottom:2px; font-weight:600;">Cash</p>
                <h4 id="cod-title" style="font-size:15px; color:var(--darkgray-text);">Cash on Delivery (COD)</h4>
            </div>
        </label>
    </div>`;
    paymentContainer.innerHTML = paymentHTML;

    // Restore guest inputs 
    if (!user) {
        if (document.getElementById('checkout-fname')) document.getElementById('checkout-fname').value = currentFName;
        if (document.getElementById('checkout-lname')) document.getElementById('checkout-lname').value = currentLName;
        if (document.getElementById('checkout-email')) document.getElementById('checkout-email').value = currentEmail;
        if (document.getElementById('guest-phone')) document.getElementById('guest-phone').value = currentPhone;
        if (document.getElementById('guest-region')) document.getElementById('guest-region').value = currentRegion;
        if (document.getElementById('guest-city')) document.getElementById('guest-city').value = currentCity;
        if (document.getElementById('guest-brgy')) document.getElementById('guest-brgy').value = currentBrgy;
        if (document.getElementById('guest-postal')) document.getElementById('guest-postal').value = currentPostal;
        if (document.getElementById('guest-street')) document.getElementById('guest-street').value = currentStreet;
    }
}

function updateOrderSummary() {
    const selectedItems = getSelectedItems(window.currentUser);
    const subtotal = calculateSubtotal(selectedItems);

    const deliveryRadio = document.querySelector('input[name="checkout-delivery-speed"]:checked');
    const deliveryFee = deliveryRadio ? parseFloat(deliveryRadio.value) : 0;
    const finalTotal = subtotal + deliveryFee;

    const deliveryText = document.getElementById('checkout-delivery');
    if (deliveryFee === 0) {
        deliveryText.innerText = 'FREE';
        deliveryText.style.color = '#1b8f50';
    } else {
        deliveryText.innerText = '\u20B1 ' + deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        deliveryText.style.color = 'var(--darkgray-text)';
    }

    document.getElementById('checkout-subtotal').innerText = '\u20B1 ' + subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('checkout-total').innerText = '\u20B1 ' + finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setupDeliveryToggle() {
    const deliveryOptions = document.querySelectorAll('input[name="checkout-delivery-speed"]');
    const addressBox = document.getElementById('checkout-address-box');

    deliveryOptions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('#checkout-delivery-options .checkout-option-label').forEach(label => {
                label.style.borderColor = '#eaeaea';
                label.style.background = '#fff';
            });

            const activeLabel = e.target.closest('.checkout-option-label');
            if (activeLabel) {
                activeLabel.style.borderColor = 'var(--brand-color)';
                activeLabel.style.background = '#FFF3EB';
            }

            const codTitle = document.getElementById('cod-title');
            const codSubtitle = document.getElementById('cod-subtitle');

            if (e.target.getAttribute('data-name') === 'PickUp') {
                if (addressBox) {
                    addressBox.style.opacity = '0.5';
                    addressBox.style.filter = 'grayscale(100%)';
                    addressBox.style.pointerEvents = 'none';
                    addressBox.style.transition = 'all 0.3s ease';
                    addressBox.classList.remove('box-error');
                }
                if (codTitle) codTitle.innerText = 'Pay in Store';
                if (codSubtitle) codSubtitle.innerText = 'Over-the-counter';
            } else {
                if (addressBox) {
                    addressBox.style.opacity = '1';
                    addressBox.style.filter = 'none';
                    addressBox.style.pointerEvents = 'auto';
                }
                if (codTitle) codTitle.innerText = 'Cash on Delivery (COD)';
                if (codSubtitle) codSubtitle.innerText = 'Cash';
            }
            updateOrderSummary();
        });
    });

    const defaultDelivery = document.querySelector('input[name="checkout-delivery-speed"]:checked');
    if (defaultDelivery) defaultDelivery.dispatchEvent(new Event('change'));
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

    document.addEventListener('input', function (e) {
        if (e.target && (e.target.id === 'addr-phone' || e.target.id === 'guest-phone')) {
            let numbersOnly = e.target.value.replace(/\D/g, '');
            numbersOnly = numbersOnly.substring(0, 9);

            let formatted = '';
            if (numbersOnly.length > 0) formatted = numbersOnly.substring(0, 2);
            if (numbersOnly.length > 2) formatted += ' ' + numbersOnly.substring(2, 5);
            if (numbersOnly.length > 5) formatted += ' ' + numbersOnly.substring(5, 9);
            e.target.value = formatted;
        }
    });
}

window.openAccountModal = function (modalId) {
    const modal = document.getElementById(modalId);
    const nav = document.querySelector('.navbar-section');
    if (modal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.right = `${scrollbarWidth}px`;
        modal.showModal();
    }
};

window.closeAccountModal = function (modalId) {
    const modal = document.getElementById(modalId);
    const nav = document.querySelector('.navbar-section');
    if (modal) {
        modal.close();
        document.body.style.overflow = '';
        document.body.style.paddingRight = '0px';
        if (nav) nav.style.right = '0px';
    }
};

function setupModalCleanup() {
    const allModals = document.querySelectorAll('dialog');
    allModals.forEach(modal => {
        modal.addEventListener('close', () => {
            const nav = document.querySelector('.navbar-section');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '0px';
            if (nav) nav.style.right = '0px';
        });
    });

    const addressModal = document.getElementById('address-modal');
    if (addressModal) {
        addressModal.addEventListener('close', () => {
            const addressForm = document.getElementById('form-new-address');
            if (addressForm) addressForm.reset();
            const phoneWrapper = document.querySelector('.phone-input-wrapper');
            const phoneError = document.getElementById('addr-phone-error');
            if (phoneWrapper) phoneWrapper.classList.remove('input-error');
            if (phoneError) phoneError.classList.add('error-hidden');

            loadCheckoutData(window.currentUser);
            const defaultDelivery = document.querySelector('input[name="checkout-delivery-speed"]:checked');
            if (defaultDelivery) defaultDelivery.dispatchEvent(new Event('change'));
        });
    }
}

function setupAddressForm() {
    const addressForm = document.getElementById('form-new-address');
    if (addressForm) {
        addressForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const phoneInput = document.getElementById('addr-phone');
            const phoneWrapper = phoneInput ? phoneInput.closest('.phone-input-wrapper') : null;
            const phoneError = document.getElementById('addr-phone-error');

            if (phoneError) phoneError.classList.add('error-hidden');
            if (phoneWrapper) phoneWrapper.classList.remove('input-error');

            const rawPhone = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';

            if (rawPhone.length !== 9) {
                if (phoneError) {
                    phoneError.innerText = "Please enter a complete 10-digit mobile number.";
                    phoneError.classList.remove('error-hidden');
                }
                if (phoneWrapper) phoneWrapper.classList.add('input-error');
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

            if (window.currentUser) {
                if (!window.currentUser.addresses) window.currentUser.addresses = [];
                window.currentUser.addresses.push(newAddress);
                if (window.syncAddressesToDatabase) window.syncAddressesToDatabase(window.currentUser.email, window.currentUser.addresses);

                addressForm.reset();
                window.closeAccountModal('address-modal');

                loadCheckoutData(window.currentUser);
                const defaultDelivery = document.querySelector('input[name="checkout-delivery-speed"]:checked');
                if (defaultDelivery) defaultDelivery.dispatchEvent(new Event('change'));
            }
        });
    }
}

function placeOrder() {
    let currentUser = window.currentUser;
    let hasError = false;

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.innerText = "PROCESSING...";
    checkoutBtn.style.pointerEvents = "none";

    const contactError = document.getElementById('checkout-contact-error');
    const contactContent = document.getElementById('checkout-contact-content');
    const contactBox = contactContent ? contactContent.parentElement : null;
    if (contactError) contactError.classList.add('error-hidden');
    if (contactBox) contactBox.classList.remove('box-error');

    const addrError = document.getElementById('checkout-address-error');
    const addressBox = document.getElementById('checkout-address-box');
    if (addrError) addrError.classList.add('error-hidden');
    if (addressBox) addressBox.classList.remove('box-error');

    let guestFName = '', guestLName = '', guestEmail = '';

    if (!currentUser) {
        guestFName = document.getElementById('checkout-fname').value.trim();
        guestLName = document.getElementById('checkout-lname').value.trim();
        guestEmail = document.getElementById('checkout-email').value.trim();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!guestFName || !guestLName || !guestEmail || !emailPattern.test(guestEmail)) {
            if (contactError) {
                contactError.innerText = 'Please provide your complete and correct contact information.';
                contactError.classList.remove('error-hidden');
            }
            if (contactBox) contactBox.classList.add('box-error');
            hasError = true;
        }
    }

    const deliveryRadio = document.querySelector('input[name="checkout-delivery-speed"]:checked');
    const isPickUp = deliveryRadio && deliveryRadio.getAttribute('data-name') === 'PickUp';

    let selectedAddressId = null;
    let fullShippingAddress = null;

    if (!isPickUp) {
        if (!currentUser) {
            const gPhoneInput = document.getElementById('guest-phone');
            const gPhoneStr = gPhoneInput ? gPhoneInput.value.trim() : '';
            const gPhoneRaw = gPhoneStr.replace(/\D/g, '');

            const gRegion = document.getElementById('guest-region') ? document.getElementById('guest-region').value.trim() : '';
            const gCity = document.getElementById('guest-city') ? document.getElementById('guest-city').value.trim() : '';
            const gBrgy = document.getElementById('guest-brgy') ? document.getElementById('guest-brgy').value.trim() : '';
            const gPostal = document.getElementById('guest-postal') ? document.getElementById('guest-postal').value.trim() : '';
            const gStreet = document.getElementById('guest-street') ? document.getElementById('guest-street').value.trim() : '';

            const phoneWrapper = gPhoneInput ? gPhoneInput.closest('.phone-input-wrapper') : null;
            if (phoneWrapper) phoneWrapper.classList.remove('input-error');

            if (!gPhoneStr || gPhoneRaw.length !== 9 || !gRegion || !gCity || !gBrgy || !gPostal || !gStreet) {
                if (addrError) {
                    if (gPhoneStr && gPhoneRaw.length !== 9) {
                        addrError.innerText = 'Please enter a complete 10-digit mobile number.';
                    } else {
                        addrError.innerText = 'Please provide your complete and correct shipping address.';
                    }
                    addrError.classList.remove('error-hidden');
                }
                if (addressBox) addressBox.classList.add('box-error');

                hasError = true;
            } else {
                fullShippingAddress = {
                    fullName: `${guestFName} ${guestLName}`.trim(),
                    phone: '+63 9' + gPhoneRaw,
                    region: gRegion,
                    city: gCity,
                    brgy: gBrgy,
                    postalCode: gPostal,
                    street: gStreet,
                    label: 'Guest Address'
                };
            }
        } else {
            const selectedAddressInput = document.querySelector('input[name="checkout-address"]:checked');
            if (!selectedAddressInput) {
                if (addressBox) addressBox.classList.add('box-error');
                hasError = true;
            } else {
                selectedAddressId = selectedAddressInput.value;
                fullShippingAddress = (currentUser.addresses || []).find(a => a.id.toString() === selectedAddressId);
            }
        }
    }

    if (hasError) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        checkoutBtn.innerText = "PLACE ORDER";
        checkoutBtn.style.pointerEvents = "auto";
        return;
    }

    const purchasedItems = getSelectedItems(currentUser);
    let globalProductsValidation = JSON.parse(localStorage.getItem('pace_products')) || [];
    let outOfStockErrors = [];

    purchasedItems.forEach(item => {
        let liveProduct = globalProductsValidation.find(p => String(p.id) === String(item.productId));

        let specificSizeStock = 0;
        if (liveProduct && typeof liveProduct.stock === 'object') {
            specificSizeStock = liveProduct.stock[item.size] || 0;
        }

        if (!liveProduct || specificSizeStock === 0) {
            outOfStockErrors.push(item.name + " (" + item.size + ")");
        }
    });

    if (outOfStockErrors.length > 0) {
        alert("Sorry, some items in your cart just went out of stock: " + outOfStockErrors.join(', '));
        window.location.href = 'cart.html';
        return;
    }

    const subtotal = calculateSubtotal(purchasedItems);
    const deliveryFee = deliveryRadio ? parseFloat(deliveryRadio.value) : 0;
    const finalTotal = subtotal + deliveryFee;

    const paymentRadio = document.querySelector('input[name="checkout-payment"]:checked');
    let paymentMethod = 'COD';

    if (paymentRadio) {
        if (paymentRadio.value === 'COD') {
            paymentMethod = 'COD';
        } else {
            paymentMethod = 'GCash';
        }
    }

    let deliveryTypeName = 'Standard Delivery';
    if (isPickUp) {
        deliveryTypeName = 'In-Store Pick Up';
    } else if (deliveryFee > 0) {
        deliveryTypeName = 'Express Delivery';
    }

    const orderId = 'PACE-' + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let finalCustomerEmail = currentUser ? currentUser.email : guestEmail;
    let fName = currentUser ? (currentUser.first_name || currentUser.firstName || 'Customer') : guestFName;
    let lName = currentUser ? (currentUser.last_name || currentUser.lastName || '') : guestLName;
    let finalCustomerName = `${fName} ${lName}`.trim();

    const adminOrderInfo = {
        id: orderId,
        customerEmail: finalCustomerEmail,
        customerName: finalCustomerName + (currentUser ? '' : ' (Guest)'),
        date: orderDate,
        status: 'To Ship',
        totalAmount: finalTotal,
        items: purchasedItems,
        paymentMethod: paymentMethod,
        deliveryType: deliveryTypeName,
        shippingAddress: fullShippingAddress || {}
    };

    if (paymentMethod === 'GCash') {

        if (finalTotal < 20) {
            alert("PayMongo requires a minimum amount of ₱20.00 for GCash transactions.");
            checkoutBtn.innerText = "PLACE ORDER";
            checkoutBtn.style.pointerEvents = "auto";
            return;
        }

        localStorage.setItem('pace_pending_gcash_order', JSON.stringify(adminOrderInfo));

        checkoutBtn.innerText = "REDIRECTING TO GCASH...";

        let gcashPhone = adminOrderInfo.shippingAddress ? adminOrderInfo.shippingAddress.phone : '';
        const paymentRadioObj = document.querySelector('input[name="checkout-payment"]:checked');
        if (paymentRadioObj && paymentRadioObj.value !== 'COD' && paymentRadioObj.value !== 'GCash') {
            let combinedPayments = currentUser ? (currentUser.payments || []) : temporaryGuestPayments;
            const selectedPm = combinedPayments.find(p => p.id.toString() === paymentRadioObj.value);
            if (selectedPm && selectedPm.type === 'GCash') {
                gcashPhone = selectedPm.data.phone;
            }
        }

        fetch('Database/paymongo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: finalTotal,
                name: adminOrderInfo.customerName,
                email: adminOrderInfo.customerEmail,
                phone: gcashPhone,
                description: orderId,
                items: adminOrderInfo.items,
                deliveryFee: deliveryFee,
                deliveryType: deliveryTypeName,
                origin: window.location.origin + '/pace',
                successUrl: window.location.origin + '/pace/process-gcash.html',
                failedUrl: window.location.origin + '/pace/checkout.html'
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.checkout_url) {
                    window.location.href = data.checkout_url;
                } else {
                    console.error("PayMongo Error Data:", data);
                    let errorMsg = "Payment Gateway Error. Please try again.";
                    if (data.details && data.details.errors && data.details.errors.length > 0) {
                        errorMsg = "PayMongo Error: " + data.details.errors[0].detail;
                    }
                    alert(errorMsg);

                    checkoutBtn.innerText = "PLACE ORDER";
                    checkoutBtn.style.pointerEvents = "auto";
                }
            })
            .catch(err => {
                console.error(err);
                alert("Could not connect to payment gateway.");
                checkoutBtn.innerText = "PLACE ORDER";
                checkoutBtn.style.pointerEvents = "auto";
            });

        return;
    }

    fetch('Database/place-order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminOrderInfo)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {

                const buyNowItem = JSON.parse(sessionStorage.getItem('pace_buy_now_item'));
                const newOrderHistoryData = {
                    id: orderId,
                    date: orderDate,
                    items: purchasedItems,
                    subtotal: subtotal,
                    deliveryFee: deliveryFee,
                    total: finalTotal,
                    status: 'To Ship',
                    deliveryType: deliveryTypeName,
                    addressId: selectedAddressId,
                    payment: paymentMethod
                };

                if (currentUser) {
                    if (!currentUser.orderHistory) currentUser.orderHistory = [];
                    if (!currentUser.notifications) currentUser.notifications = [];

                    currentUser.orderHistory.push(newOrderHistoryData);
                    currentUser.notifications.unshift({
                        id: 'NOTIF-' + Date.now(),
                        title: 'Order Confirmed!',
                        message: `Your order ${orderId} has been successfully placed and is now processing.`,
                        date: orderDate,
                        read: false
                    });

                    if (!buyNowItem) {
                        currentUser.cart = currentUser.cart.filter(item => item.selected === false);
                    }

                    if (window.syncCartToDatabase) window.syncCartToDatabase(currentUser.email, currentUser.cart);
                    if (window.syncNotificationsToDatabase) window.syncNotificationsToDatabase(currentUser.email, currentUser.notifications);
                    fetch('Database/update-account.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'update_order_history', email: currentUser.email, orderHistory: currentUser.orderHistory })
                    });

                } else {
                    if (!buyNowItem) {
                        window.guestCart = (window.guestCart || []).filter(item => item.selected === false);
                        fetch('Database/update-guest-session.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'update_cart', cart: window.guestCart })
                        });
                    }
                }

                if (buyNowItem) sessionStorage.removeItem('pace_buy_now_item');

                const isGuestStr = currentUser ? 'false' : 'true';
                window.location.href = `success-order.html?orderId=${orderId}&guest=${isGuestStr}`;

            } else {
                alert("Database Error: " + data.message);
                checkoutBtn.innerText = "PLACE ORDER";
                checkoutBtn.style.pointerEvents = "auto";
            }
        })
        .catch(err => {
            console.error(err);
            alert("Server Error. Please try again.");
            checkoutBtn.innerText = "PLACE ORDER";
            checkoutBtn.style.pointerEvents = "auto";
        });
}