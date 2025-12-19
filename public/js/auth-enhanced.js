/**
 * Enhanced Authentication System
 * With proper error handling, validation, and security
 */

class AuthManager {
    constructor() {
        this.logger = new Logger('AuthManager');
        this.tokenKey = 'hlpfl_token';
        this.userKey = 'hlpfl_user';
        this.rememberMeKey = 'hlpfl_remember';
        this.init();
    }

    /**
     * Initialize authentication
     */
    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout buttons
        document.querySelectorAll('[data-logout]').forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });

        // Remember me checkbox
        const rememberMe = document.getElementById('rememberMe');
        if (rememberMe) {
            rememberMe.checked = localStorage.getItem(this.rememberMeKey) === 'true';
        }
    }

    /**
     * Check if user is authenticated
     */
    checkAuth() {
        const token = this.getToken();
        const currentPath = window.location.pathname;

        // Public pages
        const publicPages = ['/', '/index.html', '/login.html', '/register.html'];
        const isPublicPage = publicPages.some(page => currentPath === page || currentPath.endsWith(page));

        if (token && isPublicPage && !currentPath.includes('register')) {
            // Redirect to dashboard if already logged in
            window.location.href = '/dashboard.html';
        } else if (!token && !isPublicPage) {
            // Redirect to login if not authenticated
            this.logger.warn('User not authenticated, redirecting to login');
            window.location.href = '/login.html';
        }
    }

    /**
     * Get authentication token
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Set authentication token
     */
    setToken(token, rememberMe = false) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.rememberMeKey, rememberMe.toString());
        
        if (!rememberMe) {
            // Set expiry for session-only tokens
            Utils.setLocalStorage(this.tokenKey, token, 60); // 1 hour
        }
    }

    /**
     * Get current user
     */
    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                this.logger.error('Failed to parse user data', error);
                return null;
            }
        }
        return null;
    }

    /**
     * Set current user
     */
    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    /**
     * Handle login
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        try {
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            // Get form data
            const username = form.querySelector('#username')?.value || form.querySelector('#email')?.value;
            const password = form.querySelector('#password')?.value;
            const rememberMe = form.querySelector('#rememberMe')?.checked || false;

            // Validate inputs
            if (!username || !password) {
                toast.error('Please enter both username and password');
                return;
            }

            this.logger.info('Attempting login', { username });

            // Make API request
            const response = await apiClient.post('/auth/login', {
                username,
                password
            });

            if (response.success) {
                this.logger.info('Login successful', { userId: response.user.id });
                
                // Store token and user
                this.setToken(response.token, rememberMe);
                this.setUser(response.user);

                // Show success message
                toast.success('Login successful! Redirecting...');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                throw new Error(response.error || 'Login failed');
            }

        } catch (error) {
            this.logger.error('Login failed', error);
            toast.error(error.message || 'Login failed. Please try again.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }

    /**
     * Handle registration
     */
    async handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        try {
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';

            // Get form data
            const username = form.querySelector('#username')?.value;
            const email = form.querySelector('#email')?.value;
            const password = form.querySelector('#password')?.value;
            const confirmPassword = form.querySelector('#confirmPassword')?.value;

            // Validate inputs
            const validation = validator.validateForm({
                username,
                email,
                password,
                confirmPassword
            }, {
                username: {
                    required: true,
                    minLength: 3,
                    maxLength: 30,
                    pattern: '^[a-zA-Z0-9_]+$',
                    patternMessage: 'Username can only contain letters, numbers, and underscores'
                },
                email: {
                    required: true,
                    email: true
                },
                password: {
                    required: true,
                    minLength: 8,
                    custom: (value) => {
                        const result = validator.validatePassword(value);
                        return result.isValid ? true : result.errors[0];
                    }
                },
                confirmPassword: {
                    required: true,
                    custom: (value) => {
                        return value === password ? true : 'Passwords do not match';
                    }
                }
            });

            if (!validation.isValid) {
                validator.showErrors(form, validation.results);
                const firstError = Object.values(validation.results).find(r => !r.isValid);
                toast.error(firstError.errors[0]);
                return;
            }

            this.logger.info('Attempting registration', { username, email });

            // Make API request
            const response = await apiClient.post('/auth/register', {
                username,
                email,
                password
            });

            if (response.success) {
                this.logger.info('Registration successful', { userId: response.user.id });
                
                // Store token and user
                this.setToken(response.token, false);
                this.setUser(response.user);

                // Show success message
                toast.success('Account created successfully! Redirecting...');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                throw new Error(response.error || 'Registration failed');
            }

        } catch (error) {
            this.logger.error('Registration failed', error);
            toast.error(error.message || 'Registration failed. Please try again.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }

    /**
     * Logout user
     */
    logout() {
        this.logger.info('User logging out');
        
        // Clear storage
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.rememberMeKey);

        // Show message
        toast.info('You have been logged out');

        // Redirect to home
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    }

    /**
     * Verify token with server
     */
    async verifyToken() {
        try {
            const response = await apiClient.get('/auth/verify');
            return response.valid;
        } catch (error) {
            this.logger.error('Token verification failed', error);
            return false;
        }
    }

    /**
     * Refresh token
     */
    async refreshToken() {
        try {
            const response = await apiClient.post('/auth/refresh');
            if (response.token) {
                this.setToken(response.token);
                return true;
            }
            return false;
        } catch (error) {
            this.logger.error('Token refresh failed', error);
            return false;
        }
    }

    /**
     * Check if user has permission
     */
    hasPermission(permission) {
        const user = this.getUser();
        if (!user || !user.permissions) {
            return false;
        }
        return user.permissions.includes(permission);
    }

    /**
     * Check if user has role
     */
    hasRole(role) {
        const user = this.getUser();
        if (!user || !user.role) {
            return false;
        }
        return user.role === role;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for use in other modules
window.authManager = authManager;

// Backward compatibility functions
function logout() {
    authManager.logout();
}

function checkAuth() {
    authManager.checkAuth();
}