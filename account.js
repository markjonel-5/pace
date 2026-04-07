/* ACCOUNT PAGE LOGIC START */
window.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.account-content')) {
        setTimeout(loadAccountData, 100);

        const photoUpload = document.getElementById('profile-upload');
        if (photoUpload) {
            photoUpload.addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const base64Image = e.target.result;
                        if (window.currentUser) {
                            window.currentUser.profilePic = base64Image;
                            updateSidebarProfile(window.currentUser);
                            if (typeof renderUserMenu === 'function') renderUserMenu();

                            fetch('Database/update-account.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'update_photo', email: window.currentUser.email, photo: base64Image })
                            });
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        document.getElementById('form-personal')?.addEventListener('submit', function (e) {
            e.preventDefault();
            updateUserRecord('personal');
        });

        document.getElementById('form-account')?.addEventListener('submit', function (e) {
            e.preventDefault();
            updateUserRecord('account');
        });

        document.getElementById('form-password')?.addEventListener('submit', function (e) {
            e.preventDefault();
            updateUserRecord('password');
        });
    }
});

function loadAccountData() {
    if (!window.currentUser) {
        window.location.href = 'login.html';
        return;
    }
    updateSidebarProfile(window.currentUser);

    let fName = window.currentUser.first_name || window.currentUser.firstName || 'Customer';
    let lName = window.currentUser.last_name || window.currentUser.lastName || '';

    const dispName = document.getElementById('disp-name');
    if (dispName) {
        dispName.innerText = `${fName} ${lName}`.trim();
        document.getElementById('disp-phone').innerText = window.currentUser.phone || 'add a phone number';
        document.getElementById('disp-email').innerText = window.currentUser.email;
        document.getElementById('disp-username').innerText = window.currentUser.username;

        document.getElementById('acc-fname').value = fName;
        document.getElementById('acc-lname').value = lName;
        
        let savedPhone = window.currentUser.phone || '';
        if (savedPhone.startsWith('+63 9')) savedPhone = savedPhone.substring(5).trim();
        document.getElementById('acc-phone').value = savedPhone;
        document.getElementById('acc-email').value = window.currentUser.email;
        document.getElementById('acc-username').value = window.currentUser.username;
    }
}

function updateUserRecord(type) {
    if (!window.currentUser) return;
    let currentPassToSend = '';
    let newPassToSend = '';

    if (type === 'personal') {
        const fname = document.getElementById('acc-fname').value.trim();
        const lname = document.getElementById('acc-lname').value.trim();
        const phoneInput = document.getElementById('acc-phone');
        const phoneWrapper = document.querySelector('.phone-input-wrapper');
        const phoneError = document.getElementById('acc-phone-error');

        if (phoneError) phoneError.classList.add('error-hidden');
        if (phoneWrapper) phoneWrapper.classList.remove('input-error');

        let typedPhone = phoneInput.value.trim();
        let digitCount = typedPhone.replace(/\D/g, '').length;

        if (digitCount > 0 && digitCount !== 9) {
            if (phoneError) { phoneError.innerText = "Please enter a complete 10-digit mobile number."; phoneError.classList.remove('error-hidden'); }
            if (phoneWrapper) phoneWrapper.classList.add('input-error');
            return;
        }

        window.currentUser.first_name = fname;
        window.currentUser.last_name = lname;
        window.currentUser.phone = (digitCount === 9) ? '+63 9' + typedPhone : '';
    }

    if (type === 'account') {
        const usernameInput = document.getElementById('acc-username');
        const newUsername = usernameInput.value.trim();
        window.currentUser.username = newUsername;
    }

    if (type === 'password') {
        const currentPassInput = document.getElementById('acc-current-pass');
        const newPassInput = document.getElementById('acc-new-pass');
        const confirmPassInput = document.getElementById('acc-confirm-pass');

        const currentPass = currentPassInput.value;
        const newPass = newPassInput.value;
        const confirmPass = confirmPassInput.value;

        const errCurrent = document.getElementById('err-current-pass');
        const helpNew = document.getElementById('help-new-pass');
        const errConfirm = document.getElementById('err-confirm-pass');

        errCurrent.classList.add('error-hidden');
        helpNew.classList.remove('text-error');
        errConfirm.classList.add('error-hidden');

        currentPassInput.classList.remove('input-error');
        newPassInput.classList.remove('input-error');
        confirmPassInput.classList.remove('input-error');

        let hasError = false;
        currentPassToSend = currentPass;
        newPassToSend = newPass;

        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passRegex.test(newPass)) {
            helpNew.classList.add('text-error');
            newPassInput.classList.add('input-error');
            hasError = true;
        }

        if (newPass !== confirmPass) {
            errConfirm.innerText = "Passwords do not match.";
            errConfirm.classList.remove('error-hidden');
            confirmPassInput.classList.add('input-error');
            hasError = true;
        }

        if (hasError) return;

        currentPassInput.value = '';
        newPassInput.value = '';
        confirmPassInput.value = '';
    }

    loadAccountData();
    if (typeof renderUserMenu === 'function') renderUserMenu();

    if (type === 'personal') closeAccountModal('personal-modal');
    if (type === 'account') closeAccountModal('account-modal');
    if (type === 'password') closeAccountModal('password-modal');

    fetch('Database/update-account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'update_profile',
            email: window.currentUser.email,
            firstName: window.currentUser.first_name || window.currentUser.firstName || '',
            lastName: window.currentUser.last_name || window.currentUser.lastName || '',
            phone: window.currentUser.phone || '',
            username: window.currentUser.username || '',
            currentPassword: currentPassToSend,
            newPassword: newPassToSend
        })
    }).then(res => res.json()).then(data => {
        if (!data.success && data.message === 'wrong_password') {
            alert("Database Error: The current password you entered is incorrect!");
        }
    });
}

const phoneInput = document.getElementById('acc-phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
        let numbersOnly = this.value.replace(/\D/g, '');
        numbersOnly = numbersOnly.substring(0, 9);
        let formatted = '';
        if (numbersOnly.length > 0) formatted = numbersOnly.substring(0, 2);
        if (numbersOnly.length > 2) formatted += ' ' + numbersOnly.substring(2, 5);
        if (numbersOnly.length > 5) formatted += ' ' + numbersOnly.substring(5, 9);
        this.value = formatted;
    });
}

function updateSidebarProfile(user) {
    let fName = String(user.first_name || user.firstName || 'Customer');
    let lName = String(user.last_name || user.lastName || '');
    document.getElementById('sidebar-name').innerText = `${fName} ${lName}`.trim();
    document.getElementById('sidebar-email').innerText = user.email;
    
    const initialsEl = document.getElementById('sidebar-initials');
    const imgEl = document.getElementById('sidebar-img');
    const deleteBtn = document.getElementById('delete-photo-btn');

    // FIX: Check for both camelCase and snake_case database column names!
    let savedPhoto = user.profilePic || user.profile_pic;

    if (savedPhoto) {
        imgEl.src = savedPhoto;
        imgEl.style.display = 'block';
        initialsEl.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'flex';
    } else {
        const firstInitial = fName.length > 0 ? fName.charAt(0) : 'C';
        const lastInitial = lName.length > 0 ? lName.charAt(0) : '';
        initialsEl.innerText = (firstInitial + lastInitial).toUpperCase();
        initialsEl.style.display = 'flex';
        imgEl.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';
    }
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
    if (modal) modal.close();
};

document.querySelectorAll('.account-dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
        const nav = document.querySelector('.navbar-section');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '0px';
        if (nav) nav.style.right = '0px';
        const form = dialog.querySelector('form');
        if (form) {
            if (dialog.id === 'password-modal') form.reset();
            else loadAccountData();
            form.querySelectorAll('.input-error').forEach(input => input.classList.remove('input-error'));
            form.querySelectorAll('.account-error-text').forEach(errorText => errorText.classList.add('error-hidden'));
            form.querySelectorAll('.account-helper-text').forEach(helper => helper.classList.remove('text-error'));
        }
    });
});

window.openDeleteAccountModal = function () {
    const modal = document.getElementById('delete-account-modal');
    const nav = document.querySelector('.navbar-section');
    if (modal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.right = `${scrollbarWidth}px`;
        modal.showModal();
    }
};

window.closeDeleteAccountModal = function () {
    const modal = document.getElementById('delete-account-modal');
    if (modal) modal.close(); 
};

window.executeDeleteAccount = function () {
    if (!window.currentUser) return;
    fetch('Database/update-user-account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', email: window.currentUser.email })
    }).then(() => {
        fetch('Database/logout.php').then(() => {
            window.currentUser = null;
            window.location.href = "homepage.html";
        });
    });
};

window.openDeletePhotoModal = function () {
    const modal = document.getElementById('delete-photo-modal');
    const nav = document.querySelector('.navbar-section');
    if (modal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.right = `${scrollbarWidth}px`;
        modal.showModal();
    }
};

window.closeDeletePhotoModal = function () {
    const modal = document.getElementById('delete-photo-modal');
    const nav = document.querySelector('.navbar-section');
    if (modal) {
        modal.close();
        document.body.style.overflow = '';
        document.body.style.paddingRight = '0px';
        if (nav) nav.style.right = '0px';
    }
};

window.executeDeletePhoto = function() {
    if (!window.currentUser) return;

    delete window.currentUser.profilePic;
    updateSidebarProfile(window.currentUser);
    if (typeof renderUserMenu === 'function') renderUserMenu();
    closeDeletePhotoModal();

    fetch('Database/update-account.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_photo', email: window.currentUser.email })
    });
};