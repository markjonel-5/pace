// CAPTCHA GENERATION AND VALIDATION
let currentCaptcha = "";

function generateCaptcha() {
    const canvas = document.getElementById('captcha-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let captchaText = "";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f2f0ee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 150; i++) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    for (let i = 0; i < 12; i++) {
        ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.5})`;
        ctx.lineWidth = Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    ctx.font = "bold 24px 'Poppins', sans-serif";
    ctx.textBaseline = "middle";

    for (let i = 0; i < 6; i++) {
        const char = chars.charAt(Math.floor(Math.random() * chars.length));
        captchaText += char;
        const xOffset = 20 + (i * 18);
        const yOffset = (canvas.height / 2) + (Math.random() * 10 - 5);
        const angle = (Math.random() - 0.5) * 0.8;

        ctx.save();
        ctx.translate(xOffset, yOffset);
        ctx.rotate(angle);
        ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`;
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }
    currentCaptcha = captchaText;
}

function showError(inputId, message) {
    const inputField = document.getElementById(inputId);
    const errorText = document.getElementById(inputId + '-error');
    if (inputField) inputField.classList.add('input-error');
    if (errorText) {
        errorText.innerText = message;
        errorText.classList.add('show-error');
    }
}

function clearErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const inputs = form.querySelectorAll('.input-field');
    const errors = form.querySelectorAll('.field-error-msg');
    const helpers = form.querySelectorAll('.helper-text');

    inputs.forEach(input => input.classList.remove('input-error'));
    errors.forEach(error => error.classList.remove('show-error'));
    helpers.forEach(helper => helper.classList.remove('text-error'));
}

window.addEventListener('DOMContentLoaded', () => {
    generateCaptcha();

    const refreshBtn = document.getElementById('refresh-captcha');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            generateCaptcha();
            document.getElementById('captcha-input').value = "";
        });
    }

    // SIGNUP FUNCTION
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function (event) {
            event.preventDefault();
            clearErrors('signup-form');

            let isValid = true;
            const fname = document.getElementById('signup-fname').value.trim();
            const lname = document.getElementById('signup-lname').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const username = document.getElementById('signup-username').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;

            // 1. Password Regex Check
            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
            if (!passRegex.test(password)) {
                document.getElementById('signup-password').classList.add('input-error');
                document.getElementById('signup-password-helper').classList.add('text-error');
                isValid = false;
            }

            // 2. Password Match Check
            if (password !== confirm) {
                showError('signup-confirm', 'Passwords do not match.');
                isValid = false;
            }

            // 3. CAPTCHA Check
            const captchaInput = document.getElementById('captcha-input').value.trim();
            if (captchaInput !== currentCaptcha) {
                showError('captcha-input', 'Incorrect CAPTCHA. Please try again.');
                isValid = false;
            }

            if (!isValid) return;

            const submitBtn = signupForm.querySelector('.auth-btn');
            if (submitBtn) {
                submitBtn.innerText = "CREATING ACCOUNT...";
                submitBtn.style.pointerEvents = "none";
            }

            // 4. Create the data object to send to PHP
            const newUser = {
                firstName: fname,
                lastName: lname,
                email: email,
                username: username,
                password: password
            };

            // 5. Send the data to your new PHP file
            fetch('Database/signup.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            })
            .then(response => response.json()) 
            .then(data => {
                if (data.success) {
                    // Redirect to the verify code page!
                    window.location.href = "verify-code.html";
                } else {
                    // FIX: Unfreeze the button if there is an error
                    if (submitBtn) {
                        submitBtn.innerText = "CREATE ACCOUNT";
                        submitBtn.style.pointerEvents = "auto";
                    }
                    
                    // Handle errors sent back from PHP (Email or Username already exists)
                    if (data.message === 'email_exists') {
                        showError('signup-email', 'This email is already registered.');
                    } else if (data.message === 'username_exists') {
                        showError('signup-username', 'This username is already taken.');
                    } else {
                        alert("Error: " + data.message);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while connecting to the server. Check console for details.');
            });
        });
    }

    // LOGIN FUNCTION
    // LOGIN FUNCTION
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            clearErrors('login-form');

            const usernameInput = document.getElementById('login-username').value.trim();
            const passwordInput = document.getElementById('login-password').value;
            const loginBtn = loginForm.querySelector('.auth-btn');

            // Change button to show it's loading
            loginBtn.innerText = "LOGGING IN...";
            loginBtn.style.pointerEvents = "none";

            // Send data to our new login.php file
            fetch('Database/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            })
            .then(response => response.json())
            .then(data => {
                // Reset button
                loginBtn.innerText = "LOGIN";
                loginBtn.style.pointerEvents = "auto";

                if (data.success) {
                    // Save safe user data (no password) to localStorage for the UI to read
                    localStorage.setItem('pace_current_user', JSON.stringify(data.user));

                    // Route them based on their role
                    if (data.user.role === 'admin') {
                        window.location.href = "admin-dashboard.html";
                    } else {
                        window.location.href = "homepage.html";
                    }
                } else {
                    // Handle specific errors returned by PHP
                    if (data.message === 'user_not_found') {
                        showError('login-username', 'Username or Email not found.');
                    } else if (data.message === 'wrong_password') {
                        showError('login-password', 'Incorrect password.');
                    } else if (data.message === 'account_blocked') {
                        const roleText = data.role === 'admin' ? 'Admin' : 'Account';
                        showError('login-username', `${roleText} Blocked. Please contact us for assistance.`);
                    } else {
                        alert("Error: " + data.message);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                loginBtn.innerText = "LOGIN";
                loginBtn.style.pointerEvents = "auto";
                alert("Server error. Please try again.");
            });
        });
    }

    // PASSWORD SEE AND UNSEE TOGGLE
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function () {
            const inputField = document.getElementById(this.getAttribute('data-target'));
            if (inputField.type === 'password') {
                inputField.type = 'text';
                this.classList.replace('fi-rr-eye-crossed', 'fi-rr-eye');
            } else {
                inputField.type = 'password';
                this.classList.replace('fi-rr-eye', 'fi-rr-eye-crossed');
            }
        });
    });
});

// TERMS AND CONDITIONS MODAL FUNCTIONS
window.openTermsModal = function () {
    const modal = document.getElementById('terms-modal');
    const nav = document.querySelector('.navbar-section');
    if (modal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (nav) nav.style.right = `${scrollbarWidth}px`;
        modal.showModal();
    }
};

window.closeTermsModal = function () {
    const modal = document.getElementById('terms-modal');
    if (modal) modal.close();
};

window.acceptTerms = function () {
    const checkbox = document.getElementById('terms-checkbox');
    if (checkbox) checkbox.checked = true;
    closeTermsModal();
};

document.getElementById('terms-modal')?.addEventListener('close', () => {
    const nav = document.querySelector('.navbar-section');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '0px';
    if (nav) nav.style.right = '0px';
});

// ==========================================
    // OTP INPUT LOGIC & TIMER
    // ==========================================
    const otpInputs = document.querySelectorAll('.otp-input');
    let resendTimerInterval;

    function startResendTimer() {
        let timeLeft = 30;
        const timerSpan = document.getElementById('resend-timer');
        const timerText = document.getElementById('timer-text');
        const resendText = document.getElementById('resend-text');
        
        if (!timerSpan) return;

        timerText.style.display = 'block';
        resendText.style.display = 'none';
        timerSpan.innerText = timeLeft;

        clearInterval(resendTimerInterval);
        resendTimerInterval = setInterval(() => {
            timeLeft--;
            timerSpan.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(resendTimerInterval);
                timerText.style.display = 'none';
                resendText.style.display = 'block';
            }
        }, 1000);
    }

    if (document.getElementById('verify-form')) {
        startResendTimer(); // Start timer when page loads
        
        // Auto-focus and backspace logic for the 6 boxes
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length > 1) {
                    e.target.value = e.target.value.slice(0, 1); // Only allow 1 number
                }
                if (e.target.value !== '' && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus(); // Jump forward
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    otpInputs[index - 1].focus(); // Jump backward
                }
            });
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
                pastedData.split('').forEach((char, i) => {
                    if (i < otpInputs.length) otpInputs[i].value = char;
                });
                if (pastedData.length < 6) otpInputs[pastedData.length].focus();
                else otpInputs[5].focus();
            });
        });
    }

    // ==========================================
    // VERIFY CODE FUNCTION (NO ALERTS)
    // ==========================================
    const verifyForm = document.getElementById('verify-form');
    if (verifyForm) {
        verifyForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Combine all 6 inputs into one string
            const codeInput = Array.from(otpInputs).map(input => input.value).join('');
            const errorMsg = document.getElementById('verify-error-msg');
            const verifyBtn = document.getElementById('verify-btn');

            if (codeInput.length < 6) {
                errorMsg.innerText = "Please enter the full 6-digit code.";
                errorMsg.style.display = 'block';
                errorMsg.style.fontSize = '14px';
                errorMsg.style.opacity = '1';
                errorMsg.style.visibility = 'visible';
                errorMsg.classList.add('show-error');
                return;
            }

            // Hide previous errors and change button state
            errorMsg.style.display = 'none';
            errorMsg.style.opacity = '0';
            errorMsg.classList.remove('show-error');
            
            otpInputs.forEach(i => i.classList.remove('input-error'));
            verifyBtn.innerText = "VERIFY";
            verifyBtn.style.pointerEvents = "none";

            fetch('Database/verify.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: codeInput })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.action === 'signup_success') {
                        // Show Success Modal
                        const successModal = document.getElementById('signup-success-modal');
                        if (successModal) successModal.showModal();
                    } else if (data.action === 'goto_reset') {
                        window.location.href = "reset-password.html";
                    }
                } else {
                    // Show Error Text and turn boxes Red
                    verifyBtn.innerText = "TRY AGAIN";
                    verifyBtn.style.pointerEvents = "auto";
                    otpInputs.forEach(i => i.classList.add('input-error'));
                    
                    // FORCE THE ERROR MESSAGE TO BE VISIBLE
                    errorMsg.style.display = 'block';
                    errorMsg.style.fontSize = '14px';
                    errorMsg.style.opacity = '1';
                    errorMsg.style.visibility = 'visible';
                    errorMsg.classList.add('show-error');
                    
                    if (data.message === 'invalid_code') {
                        errorMsg.innerText = "The code you entered is incorrect.";
                    } else if (data.message === 'session_expired') {
                        errorMsg.innerText = "Session expired. Redirecting...";
                        setTimeout(() => window.location.href = "signup.html", 2000);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                verifyBtn.innerText = "TRY AGAIN";
                verifyBtn.style.pointerEvents = "auto";
            });
        });
    }

    // ==========================================
    // RESEND CODE FUNCTION (NO ALERTS)
    // ==========================================
    const resendBtn = document.getElementById('resend-code-btn');
    if (resendBtn) {
        resendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            resendBtn.innerText = "Sending...";
            resendBtn.style.pointerEvents = "none";

            fetch('Database/resend-code.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    startResendTimer(); // Restart the 30s timer!
                    resendBtn.innerText = "Resend Code";
                    resendBtn.style.pointerEvents = "auto";
                } else {
                    document.getElementById('verify-error-msg').innerText = "Session expired. Please sign up again.";
                    document.getElementById('verify-error-msg').style.display = 'block';
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    // ==========================================
    // FORGOT PASSWORD FUNCTION (Send Email)
    // ==========================================
    const forgotForm = document.getElementById('forgot-form'); 
    if (forgotForm && window.location.pathname.includes('forgot-password.html')) {
        
        forgotForm.addEventListener('submit', function (event) {
            event.preventDefault();
            clearErrors('forgot-form'); // Use your global clear function!
            
            const emailInput = document.getElementById('forgot-email');
            const emailValue = emailInput.value.trim();
            const submitBtn = forgotForm.querySelector('.auth-btn');
            
            submitBtn.innerText = "SENDING...";
            submitBtn.style.pointerEvents = "none";

            fetch('Database/forgot-password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailValue })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = "verify-code.html";
                } else {
                    submitBtn.innerText = "SEND CODE";
                    submitBtn.style.pointerEvents = "auto";
                    
                    // Use your global showError function!
                    if (data.message === 'email_not_found') {
                        showError('forgot-email', "We couldn't find an account with that email.");
                    } else {
                        showError('forgot-email', "Error: " + data.message);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                submitBtn.innerText = "SEND CODE";
                submitBtn.style.pointerEvents = "auto";
            });
        });
    }

    // ==========================================
    // RESET PASSWORD FUNCTION (Update Database)
    // ==========================================
    const resetForm = document.getElementById('reset-form'); 
    if (resetForm && window.location.pathname.includes('reset-password.html')) {
        
        resetForm.addEventListener('submit', function (event) {
            event.preventDefault();
            clearErrors('reset-form'); // Use your global clear function!
            
            const newPasswordInput = document.getElementById('reset-new-password');
            const confirmPasswordInput = document.getElementById('reset-confirm-password');
            const submitBtn = resetForm.querySelector('.auth-btn');

            const newPass = newPasswordInput.value;
            const confirmPass = confirmPasswordInput.value;
            let isValid = true;

            // 1. Password Regex Check (Matches Signup)
            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
            if (!passRegex.test(newPass)) {
                newPasswordInput.classList.add('input-error');
                document.getElementById('reset-password-helper').classList.add('text-error');
                isValid = false;
            }

            // 2. Match Check (Matches Signup)
            if (newPass !== confirmPass) {
                showError('reset-confirm-password', 'Passwords do not match.');
                isValid = false;
            }

            if (!isValid) return;

            submitBtn.innerText = "UPDATING...";
            submitBtn.style.pointerEvents = "none";

            fetch('Database/reset-password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPass })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const resetModal = document.getElementById('reset-success-modal');
                    if (resetModal) resetModal.showModal();
                } else {
                    submitBtn.innerText = "RESET PASSWORD";
                    submitBtn.style.pointerEvents = "auto";
                    
                    // Use your global showError function!
                    if (data.message === 'session_expired') {
                        showError('reset-confirm-password', 'Session expired. Please try again.');
                        setTimeout(() => window.location.href = "forgot-password.html", 2000);
                    } else {
                        showError('reset-confirm-password', 'Error: ' + data.message);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                submitBtn.innerText = "RESET PASSWORD";
                submitBtn.style.pointerEvents = "auto";
            });
        });
    }