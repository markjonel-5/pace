/* ACCOUNT PAGE LOGIC START */
window.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.account-content')) {

        loadAccountData();

        const photoUpload = document.getElementById('profile-upload');
        if (photoUpload) {
            photoUpload.addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const base64Image = e.target.result;
                        const currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
                        let users = JSON.parse(localStorage.getItem('pace_users')) || [];
                        let userIndex = users.findIndex(u => u.email === currentUser.email);

                        if (userIndex > -1) {
                            users[userIndex].profilePic = base64Image;
                            currentUser.profilePic = base64Image;
                            localStorage.setItem('pace_users', JSON.stringify(users));
                            localStorage.setItem('pace_current_user', JSON.stringify(currentUser));
                            updateSidebarProfile(currentUser);

                            if (typeof renderUserMenu === 'function') renderUserMenu();
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
/* ACCOUNT PAGE LOGIC END */

/* LOAD ACCOUNT DATA FUNCTION START */
function loadAccountData() {
    const currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    updateSidebarProfile(currentUser);

    // FIX: Safely grab the names from the new database format
    let fName = currentUser.first_name || currentUser.firstName || 'Customer';
    let lName = currentUser.last_name || currentUser.lastName || '';

    const dispName = document.getElementById('disp-name');
    if (dispName) {
        dispName.innerText = `${fName} ${lName}`.trim();
        document.getElementById('disp-phone').innerText = currentUser.phone || 'add a phone number';
        document.getElementById('disp-email').innerText = currentUser.email;
        document.getElementById('disp-username').innerText = currentUser.username;

        document.getElementById('acc-fname').value = fName;
        document.getElementById('acc-lname').value = lName;
        
        let savedPhone = currentUser.phone || '';
        if (savedPhone.startsWith('+63 9')) {
            savedPhone = savedPhone.substring(5).trim();
        }
        document.getElementById('acc-phone').value = savedPhone;
        document.getElementById('acc-email').value = currentUser.email;
        document.getElementById('acc-username').value = currentUser.username;
    }
}
/* LOAD ACCOUNT DATA FUNCTION END */

/* UPDATE USER RECORD FUNCTION START */
function updateUserRecord(type) {
    let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    let users = JSON.parse(localStorage.getItem('pace_users')) || [];
    let userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex === -1) return;

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
            if (phoneError) {
                phoneError.innerText = "Please enter a complete 10-digit mobile number.";
                phoneError.classList.remove('error-hidden');
            }
            if (phoneWrapper) phoneWrapper.classList.add('input-error');
            return;
        }

        users[userIndex].firstName = fname;
        users[userIndex].lastName = lname;
        
        users[userIndex].phone = (digitCount === 9) ? '+63 9' + typedPhone : '';

        closeAccountModal('personal-modal');
    }

    if (type === 'account') {
        const usernameInput = document.getElementById('acc-username');
        const newUsername = usernameInput.value.trim();
        const errorMsg = document.getElementById('acc-username-error');

        errorMsg.classList.add('error-hidden');
        usernameInput.classList.remove('input-error');

        if (newUsername !== currentUser.username && users.some(u => u.username === newUsername)) {
            errorMsg.innerText = "This username is already taken.";
            errorMsg.classList.remove('error-hidden');
            usernameInput.classList.add('input-error');
            return;
        }

        users[userIndex].username = newUsername;
        closeAccountModal('account-modal');
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

        if (currentPass !== currentUser.password) {
            errCurrent.innerText = "Incorrect current password.";
            errCurrent.classList.remove('error-hidden');
            currentPassInput.classList.add('input-error');
            hasError = true;
        }

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

        users[userIndex].password = newPass;

        currentPassInput.value = '';
        newPassInput.value = '';
        confirmPassInput.value = '';

        closeAccountModal('password-modal');
    }

    localStorage.setItem('pace_users', JSON.stringify(users));
    localStorage.setItem('pace_current_user', JSON.stringify(users[userIndex]));
    loadAccountData();
    if (typeof renderUserMenu === 'function') renderUserMenu();
}
/* UPDATE USER RECORD FUNCTION END */

/* PHONE NUMBER INPUT MASK START */
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
/* PHONE NUMBER INPUT MASK END */

/* SIDEBAR PROFILE HELPER START */
function updateSidebarProfile(user) {
    // FIX: Safely grab the names from the new database format
    let fName = String(user.first_name || user.firstName || 'Customer');
    let lName = String(user.last_name || user.lastName || '');

    document.getElementById('sidebar-name').innerText = `${fName} ${lName}`.trim();
    document.getElementById('sidebar-email').innerText = user.email;
    
    const initialsEl = document.getElementById('sidebar-initials');
    const imgEl = document.getElementById('sidebar-img');
    const deleteBtn = document.getElementById('delete-photo-btn');

    if (user.profilePic) {
        imgEl.src = user.profilePic;
        imgEl.style.display = 'block';
        initialsEl.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'flex';
    } else {
        // Force them to strings so charAt never crashes
        const firstInitial = fName.length > 0 ? fName.charAt(0) : 'C';
        const lastInitial = lName.length > 0 ? lName.charAt(0) : '';
        
        initialsEl.innerText = (firstInitial + lastInitial).toUpperCase();
        initialsEl.style.display = 'flex';
        imgEl.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';
    }
}
/* SIDEBAR PROFILE HELPER END */

/* MODAL OPEN AND CLOSE CONTROLS START */
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
    if (modal) {
        modal.close();
    }
};

document.querySelectorAll('.account-dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
        const nav = document.querySelector('.navbar-section');

        document.body.style.overflow = '';
        document.body.style.paddingRight = '0px';
        if (nav) nav.style.right = '0px';

        const form = dialog.querySelector('form');
        if (form) {

            if (dialog.id === 'password-modal') {
                form.reset();
            } else {
                loadAccountData();
            }

            form.querySelectorAll('.input-error').forEach(input => {
                input.classList.remove('input-error');
            });

            form.querySelectorAll('.account-error-text').forEach(errorText => {
                errorText.classList.add('error-hidden');
            });

            form.querySelectorAll('.account-helper-text').forEach(helper => {
                helper.classList.remove('text-error');
            });
        }
    });
});
/* MODAL OPEN AND CLOSE CONTROLS END */

/* DELETE ACCOUNT FUNCTION START */
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
    if (modal) {
        modal.close(); 
    }
};

window.executeDeleteAccount = function () {
    const currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    let users = JSON.parse(localStorage.getItem('pace_users')) || [];

    users = users.filter(u => u.email !== currentUser.email);

    localStorage.setItem('pace_users', JSON.stringify(users));
    localStorage.removeItem('pace_current_user');

    window.location.href = "homepage.html";
};
/* DELETE ACCOUNT FUNCTION END */

/* DELETE PROFILE PHOTO MODAL START */
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
    let currentUser = JSON.parse(localStorage.getItem('pace_current_user'));
    if (!currentUser) return;

    delete currentUser.profilePic;

    let users = JSON.parse(localStorage.getItem('pace_users')) || [];
    let userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex > -1) {
        delete users[userIndex].profilePic;
        localStorage.setItem('pace_users', JSON.stringify(users));
    }

    localStorage.setItem('pace_current_user', JSON.stringify(currentUser));
    updateSidebarProfile(currentUser);
    if (typeof renderUserMenu === 'function') renderUserMenu();
    
    const photoUpload = document.getElementById('profile-upload');
    if(photoUpload) photoUpload.value = '';

    closeDeletePhotoModal();
};

/* DELETE PROFILE PHOTO MODAL END */