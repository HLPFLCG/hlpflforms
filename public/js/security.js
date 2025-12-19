/**
 * Security Utilities
 * Comprehensive security functions for HLPFL Forms
 */

class SecurityManager {
    constructor() {
        this.logger = new Logger('SecurityManager');
        this.csrfToken = null;
        this.init();
    }

    /**
     * Initialize security manager
     */
    init() {
        this.generateCSRFToken();
        this.setupSecurityHeaders();
        this.monitorSecurityEvents();
    }

    /**
     * Generate CSRF token
     */
    generateCSRFToken() {
        // Generate a random CSRF token
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        this.csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        
        // Store in session storage
        sessionStorage.setItem('csrf_token', this.csrfToken);
        
        this.logger.info('CSRF token generated');
        return this.csrfToken;
    }

    /**
     * Get CSRF token
     */
    getCSRFToken() {
        if (!this.csrfToken) {
            this.csrfToken = sessionStorage.getItem('csrf_token');
            if (!this.csrfToken) {
                this.generateCSRFToken();
            }
        }
        return this.csrfToken;
    }

    /**
     * Validate CSRF token
     */
    validateCSRFToken(token) {
        const storedToken = this.getCSRFToken();
        return token === storedToken;
    }

    /**
     * Add CSRF token to request
     */
    addCSRFToken(headers = {}) {
        return {
            ...headers,
            'X-CSRF-Token': this.getCSRFToken()
        };
    }

    /**
     * Setup security headers
     */
    setupSecurityHeaders() {
        // These are handled by the server middleware
        // This is just for documentation
        this.securityHeaders = {
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        };
    }

    /**
     * Sanitize HTML to prevent XSS
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    /**
     * Sanitize URL to prevent XSS
     */
    sanitizeURL(url) {
        try {
            const parsed = new URL(url);
            // Only allow http and https protocols
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                this.logger.warn('Blocked dangerous URL protocol', { url, protocol: parsed.protocol });
                return '';
            }
            return url;
        } catch (e) {
            this.logger.warn('Invalid URL', { url });
            return '';
        }
    }

    /**
     * Validate input against XSS patterns
     */
    validateInput(input, type = 'text') {
        const patterns = {
            xss: /<script|javascript:|onerror=|onload=/i,
            sql: /(\bOR\b|\bAND\b).*=|;.*--|\/\*|\*\//i,
            path: /\.\.|\/etc\/|\/proc\//i
        };

        // Check for XSS patterns
        if (patterns.xss.test(input)) {
            this.logger.warn('XSS pattern detected', { input: input.substring(0, 50) });
            return false;
        }

        // Check for SQL injection patterns
        if (patterns.sql.test(input)) {
            this.logger.warn('SQL injection pattern detected', { input: input.substring(0, 50) });
            return false;
        }

        // Check for path traversal
        if (patterns.path.test(input)) {
            this.logger.warn('Path traversal pattern detected', { input: input.substring(0, 50) });
            return false;
        }

        return true;
    }

    /**
     * Hash password using SHA-256
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Generate secure random token
     */
    generateSecureToken(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Validate password strength
     */
    validatePasswordStrength(password) {
        const requirements = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(requirements).filter(Boolean).length;
        const isValid = score >= 4; // At least 4 out of 5 requirements

        return {
            isValid,
            score,
            requirements,
            strength: this.getPasswordStrength(score)
        };
    }

    /**
     * Get password strength label
     */
    getPasswordStrength(score) {
        if (score <= 2) return 'weak';
        if (score === 3) return 'fair';
        if (score === 4) return 'good';
        return 'strong';
    }

    /**
     * Implement rate limiting (client-side)
     */
    checkRateLimit(action, maxAttempts = 5, windowMs = 60000) {
        const key = `ratelimit_${action}`;
        const now = Date.now();
        
        // Get attempts from localStorage
        let attempts = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Remove old attempts outside the window
        attempts = attempts.filter(timestamp => now - timestamp < windowMs);
        
        // Check if rate limit exceeded
        if (attempts.length >= maxAttempts) {
            const oldestAttempt = Math.min(...attempts);
            const waitTime = windowMs - (now - oldestAttempt);
            
            this.logger.warn('Rate limit exceeded', {
                action,
                attempts: attempts.length,
                maxAttempts,
                waitTime: Math.ceil(waitTime / 1000) + 's'
            });
            
            return {
                allowed: false,
                waitTime: Math.ceil(waitTime / 1000)
            };
        }
        
        // Add current attempt
        attempts.push(now);
        localStorage.setItem(key, JSON.stringify(attempts));
        
        return {
            allowed: true,
            remaining: maxAttempts - attempts.length
        };
    }

    /**
     * Detect and prevent clickjacking
     */
    preventClickjacking() {
        if (window.top !== window.self) {
            this.logger.warn('Clickjacking attempt detected');
            // Break out of iframe
            window.top.location = window.self.location;
        }
    }

    /**
     * Monitor security events
     */
    monitorSecurityEvents() {
        // Monitor for clickjacking
        this.preventClickjacking();

        // Monitor for suspicious activity
        let suspiciousActivityCount = 0;
        const suspiciousActivityThreshold = 5;

        // Monitor console access (potential debugging)
        const originalConsole = { ...console };
        
        // Monitor for rapid form submissions
        document.addEventListener('submit', Utils.throttle((e) => {
            const form = e.target;
            const formId = form.id || 'unknown';
            
            // Check rate limit for form submissions
            const rateLimit = this.checkRateLimit(`form_submit_${formId}`, 3, 10000);
            
            if (!rateLimit.allowed) {
                e.preventDefault();
                toast.error(`Too many submissions. Please wait ${rateLimit.waitTime} seconds.`);
                this.logger.warn('Form submission rate limit exceeded', { formId });
            }
        }, 1000));

        // Monitor for suspicious input patterns
        document.addEventListener('input', Utils.debounce((e) => {
            const input = e.target;
            const value = input.value;
            
            if (value && !this.validateInput(value)) {
                suspiciousActivityCount++;
                
                if (suspiciousActivityCount >= suspiciousActivityThreshold) {
                    this.logger.critical('Multiple suspicious inputs detected', {
                        count: suspiciousActivityCount
                    });
                    
                    // Could implement additional security measures here
                    // e.g., temporary account lock, CAPTCHA, etc.
                }
            }
        }, 500));

        // Monitor for copy/paste of sensitive data
        document.addEventListener('paste', (e) => {
            const target = e.target;
            if (target.type === 'password') {
                this.logger.info('Password pasted', {
                    field: target.name || target.id
                });
            }
        });
    }

    /**
     * Secure localStorage wrapper
     */
    secureStorage = {
        /**
         * Set item with encryption (basic obfuscation)
         */
        setItem: (key, value) => {
            try {
                const encrypted = btoa(JSON.stringify(value));
                localStorage.setItem(key, encrypted);
                return true;
            } catch (e) {
                this.logger.error('Failed to store item securely', e);
                return false;
            }
        },

        /**
         * Get item with decryption
         */
        getItem: (key) => {
            try {
                const encrypted = localStorage.getItem(key);
                if (!encrypted) return null;
                return JSON.parse(atob(encrypted));
            } catch (e) {
                this.logger.error('Failed to retrieve item securely', e);
                return null;
            }
        },

        /**
         * Remove item
         */
        removeItem: (key) => {
            localStorage.removeItem(key);
        },

        /**
         * Clear all items
         */
        clear: () => {
            localStorage.clear();
        }
    };

    /**
     * Validate JWT token structure (client-side validation)
     */
    validateJWTStructure(token) {
        if (!token) return false;
        
        const parts = token.split('.');
        if (parts.length !== 3) {
            this.logger.warn('Invalid JWT structure', { parts: parts.length });
            return false;
        }
        
        try {
            // Decode header and payload (not verifying signature client-side)
            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            
            // Check expiration
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                this.logger.warn('JWT token expired');
                return false;
            }
            
            return true;
        } catch (e) {
            this.logger.warn('Failed to parse JWT', e);
            return false;
        }
    }

    /**
     * Get JWT payload (without verification)
     */
    getJWTPayload(token) {
        if (!this.validateJWTStructure(token)) return null;
        
        try {
            const parts = token.split('.');
            return JSON.parse(atob(parts[1]));
        } catch (e) {
            this.logger.error('Failed to decode JWT payload', e);
            return null;
        }
    }

    /**
     * Check if user session is valid
     */
    isSessionValid() {
        const token = authManager.getToken();
        if (!token) return false;
        
        return this.validateJWTStructure(token);
    }

    /**
     * Implement Content Security Policy reporting
     */
    setupCSPReporting() {
        // Listen for CSP violations
        document.addEventListener('securitypolicyviolation', (e) => {
            this.logger.critical('CSP Violation', {
                blockedURI: e.blockedURI,
                violatedDirective: e.violatedDirective,
                originalPolicy: e.originalPolicy,
                sourceFile: e.sourceFile,
                lineNumber: e.lineNumber
            });
        });
    }

    /**
     * Get security report
     */
    getSecurityReport() {
        return {
            csrfToken: !!this.csrfToken,
            sessionValid: this.isSessionValid(),
            securityHeaders: this.securityHeaders,
            timestamp: new Date().toISOString()
        };
    }
}

// Create global instance
window.securityManager = new SecurityManager();