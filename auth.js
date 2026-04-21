// Authentication Class
class AuthManager {
    constructor() {
        this.currentUser = this.loadCurrentUser();
        this.initializeEventListeners();
    }

    loadCurrentUser() {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    saveCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    initializeEventListeners() {
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));

        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });

        document.querySelectorAll('.toggle-form').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm(link.dataset.form);
            });
        });

        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSocialAuth(e.target.closest('.social-btn'));
            });
        });

        document.querySelector('.forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        document.getElementById('signupPassword').addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });

        document.getElementById('loginEmail').addEventListener('blur', () => this.validateEmail('loginEmail'));
        document.getElementById('signupEmail').addEventListener('blur', () => this.validateEmail('signupEmail'));
        document.getElementById('signupName').addEventListener('blur', () => this.validateName());
    }

    async handleLogin(e) {
        e.preventDefault();
        this.clearErrors();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        let isValid = true;
        if (!this.validateEmail('loginEmail')) isValid = false;
        if (!password) {
            this.showError('loginPasswordError', 'Password is required');
            isValid = false;
        }

        if (!isValid) return;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                this.showError('loginEmailError', data.error || 'Login failed');
                return;
            }

            const sessionUser = {
                id: data.id,
                name: data.name,
                email: data.email,
                loginTime: new Date().toISOString(),
                rememberMe
            };

            this.saveCurrentUser(sessionUser);
            this.showSuccessMessage(`Welcome back, ${data.name}!`);
            this.resetForms();
        } catch (error) {
            this.showError('loginEmailError', 'Unable to connect to the server.');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        this.clearErrors();

        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const termsAccepted = document.getElementById('termsCheckbox').checked;

        let isValid = true;
        if (!this.validateName()) isValid = false;
        if (!this.validateEmail('signupEmail')) isValid = false;
        if (!this.validatePassword(password)) isValid = false;

        if (password !== confirmPassword) {
            this.showError('signupConfirmPasswordError', 'Passwords do not match');
            isValid = false;
        }

        if (!termsAccepted) {
            this.showError('signupTermsError', 'You must accept the terms and conditions');
            isValid = false;
        }

        if (!isValid) return;

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                this.showError('signupEmailError', data.error || 'Unable to create account');
                return;
            }

            const sessionUser = {
                id: data.id,
                name: data.name,
                email: data.email,
                loginTime: new Date().toISOString(),
                rememberMe: true
            };

            this.saveCurrentUser(sessionUser);
            this.showSuccessMessage(`Account created successfully! Welcome, ${data.name}!`);
            this.resetForms();
        } catch (error) {
            this.showError('signupEmailError', 'Unable to connect to the server.');
        }
    }

    validateEmail(fieldId) {
        const input = document.getElementById(fieldId);
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            this.showError(`${fieldId}Error`, 'Email is required');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.showError(`${fieldId}Error`, 'Please enter a valid email');
            return false;
        }

        this.clearError(`${fieldId}Error`);
        return true;
    }

    validateName() {
        const input = document.getElementById('signupName');
        const name = input.value.trim();

        if (!name) {
            this.showError('signupNameError', 'Full name is required');
            return false;
        }

        if (name.length < 2) {
            this.showError('signupNameError', 'Name must be at least 2 characters');
            return false;
        }

        if (!/^[a-zA-Z\s'-]+$/.test(name)) {
            this.showError('signupNameError', 'Name can only contain letters, spaces, hyphens, and apostrophes');
            return false;
        }

        this.clearError('signupNameError');
        return true;
    }

    validatePassword(password) {
        if (!password) {
            this.showError('signupPasswordError', 'Password is required');
            return false;
        }

        if (password.length < 8) {
            this.showError('signupPasswordError', 'Password must be at least 8 characters');
            return false;
        }

        if (!/[A-Z]/.test(password)) {
            this.showError('signupPasswordError', 'Password must contain at least one uppercase letter');
            return false;
        }

        if (!/[a-z]/.test(password)) {
            this.showError('signupPasswordError', 'Password must contain at least one lowercase letter');
            return false;
        }

        if (!/[0-9]/.test(password)) {
            this.showError('signupPasswordError', 'Password must contain at least one number');
            return false;
        }

        this.clearError('signupPasswordError');
        return true;
    }

    updatePasswordStrength(password) {
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text span');
        let strength = 0;

        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 25;

        strengthFill.style.width = strength + '%';

        if (strength <= 25) {
            strengthFill.style.background = '#ff4757';
            strengthText.textContent = 'Weak';
        } else if (strength <= 50) {
            strengthFill.style.background = '#ffa502';
            strengthText.textContent = 'Fair';
        } else if (strength <= 75) {
            strengthFill.style.background = '#2ed573';
            strengthText.textContent = 'Good';
        } else {
            strengthFill.style.background = '#1e90ff';
            strengthText.textContent = 'Strong';
        }
    }

    togglePasswordVisibility(e) {
        const fieldId = e.currentTarget.dataset.target;
        const input = document.getElementById(fieldId);
        const isPassword = input.type === 'password';

        input.type = isPassword ? 'text' : 'password';
        e.currentTarget.querySelector('span').textContent = isPassword ? '🙈' : '👁️';
    }

    switchForm(formType) {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        if (formType === 'login') {
            document.getElementById('loginForm').classList.add('active');
        } else {
            document.getElementById('signupForm').classList.add('active');
        }

        this.clearErrors();
        this.clearForms();
    }

    handleSocialAuth(btn) {
        const provider = btn.classList.contains('google') ? 'Google' : 'GitHub';
        alert(`${provider} authentication would be implemented here.`);
    }

    handleForgotPassword() {
        const email = document.getElementById('loginEmail').value.trim();
        if (!email) {
            alert('Please enter your email address to reset your password');
            return;
        }

        alert(`If this email exists, a reset link would be sent to ${email}.`);
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
        }
    }

    clearError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '';
        }
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(element => {
            element.textContent = '';
        });
    }

    clearForms() {
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
    }

    resetForms() {
        this.clearForms();
        this.clearErrors();
    }

    showSuccessMessage(message) {
        const successDiv = document.getElementById('successMessage');
        const successText = document.getElementById('successText');

        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        successText.innerHTML = `${message}<br><small style="opacity: 0.7; margin-top: 10px; display: block;">Redirecting to home page...</small>`;
        successDiv.classList.add('show');

        // Marquer que on est en navigation pour éviter le logout au beforeunload
        localStorage.setItem('_navigatingAfterLogin', '1');
        
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const auth = new AuthManager();
    window.authManager = auth;

    // Vérifier si c'est une navigation après login
    const isNavigatingAfterLogin = localStorage.getItem('_navigatingAfterLogin') === '1';
    if (isNavigatingAfterLogin) {
        localStorage.removeItem('_navigatingAfterLogin');
        return; // Ne pas se logout si on vient de se connecter
    }

    window.addEventListener('beforeunload', () => {
        // Ne pas logout si on vient de se connecter (flag défini)
        if (localStorage.getItem('_navigatingAfterLogin') === '1') {
            return;
        }
        if (!auth.currentUser?.rememberMe) {
            auth.logout();
        }
    });
});
