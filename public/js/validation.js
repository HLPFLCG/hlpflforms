/**
 * Comprehensive Input Validation System
 * Provides validation for all form inputs with helpful error messages
 */

class Validator {
    constructor() {
        this.logger = new Logger('Validator');
    }

    /**
     * Validate email address
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL
     */
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate phone number (flexible format)
     */
    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        const digitsOnly = phone.replace(/\D/g, '');
        return phoneRegex.test(phone) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
    }

    /**
     * Validate password strength
     */
    validatePassword(password) {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors,
            strength: this.getPasswordStrength(password)
        };
    }

    /**
     * Get password strength score (0-4)
     */
    getPasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        
        return Math.min(strength, 4);
    }

    /**
     * Validate required field
     */
    isRequired(value) {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return value !== null && value !== undefined;
    }

    /**
     * Validate minimum length
     */
    minLength(value, min) {
        return value.length >= min;
    }

    /**
     * Validate maximum length
     */
    maxLength(value, max) {
        return value.length <= max;
    }

    /**
     * Validate number range
     */
    inRange(value, min, max) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    /**
     * Validate date
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Validate date is in future
     */
    isFutureDate(dateString) {
        const date = new Date(dateString);
        return date > new Date();
    }

    /**
     * Validate date is in past
     */
    isPastDate(dateString) {
        const date = new Date(dateString);
        return date < new Date();
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
     * Validate and sanitize input
     */
    validateInput(value, rules = {}) {
        const errors = [];
        let sanitizedValue = value;

        // Sanitize if it's a string
        if (typeof value === 'string') {
            sanitizedValue = this.sanitizeHTML(value.trim());
        }

        // Required validation
        if (rules.required && !this.isRequired(sanitizedValue)) {
            errors.push(rules.requiredMessage || 'This field is required');
            return { isValid: false, errors, value: sanitizedValue };
        }

        // Skip other validations if empty and not required
        if (!this.isRequired(sanitizedValue)) {
            return { isValid: true, errors: [], value: sanitizedValue };
        }

        // Email validation
        if (rules.email && !this.isValidEmail(sanitizedValue)) {
            errors.push(rules.emailMessage || 'Please enter a valid email address');
        }

        // URL validation
        if (rules.url && !this.isValidURL(sanitizedValue)) {
            errors.push(rules.urlMessage || 'Please enter a valid URL');
        }

        // Phone validation
        if (rules.phone && !this.isValidPhone(sanitizedValue)) {
            errors.push(rules.phoneMessage || 'Please enter a valid phone number');
        }

        // Min length validation
        if (rules.minLength && !this.minLength(sanitizedValue, rules.minLength)) {
            errors.push(rules.minLengthMessage || `Must be at least ${rules.minLength} characters`);
        }

        // Max length validation
        if (rules.maxLength && !this.maxLength(sanitizedValue, rules.maxLength)) {
            errors.push(rules.maxLengthMessage || `Must be no more than ${rules.maxLength} characters`);
        }

        // Number range validation
        if (rules.min !== undefined || rules.max !== undefined) {
            const min = rules.min !== undefined ? rules.min : -Infinity;
            const max = rules.max !== undefined ? rules.max : Infinity;
            if (!this.inRange(sanitizedValue, min, max)) {
                errors.push(rules.rangeMessage || `Must be between ${min} and ${max}`);
            }
        }

        // Pattern validation
        if (rules.pattern) {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(sanitizedValue)) {
                errors.push(rules.patternMessage || 'Invalid format');
            }
        }

        // Custom validation function
        if (rules.custom && typeof rules.custom === 'function') {
            const customResult = rules.custom(sanitizedValue);
            if (customResult !== true) {
                errors.push(customResult || 'Validation failed');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            value: sanitizedValue
        };
    }

    /**
     * Validate form data
     */
    validateForm(formData, rules) {
        const results = {};
        let isValid = true;

        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const fieldRules = rules[field];
            const result = this.validateInput(value, fieldRules);
            
            results[field] = result;
            if (!result.isValid) {
                isValid = false;
            }
        });

        return {
            isValid,
            results
        };
    }

    /**
     * Show validation errors on form
     */
    showErrors(formElement, errors) {
        // Clear existing errors
        formElement.querySelectorAll('.error-message').forEach(el => el.remove());
        formElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Show new errors
        Object.keys(errors).forEach(field => {
            const result = errors[field];
            if (!result.isValid) {
                const input = formElement.querySelector(`[name="${field}"]`);
                if (input) {
                    input.classList.add('error');
                    
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.style.cssText = `
                        color: #ef4444;
                        font-size: 12px;
                        margin-top: 4px;
                    `;
                    errorDiv.textContent = result.errors[0];
                    
                    input.parentElement.appendChild(errorDiv);
                }
            }
        });
    }

    /**
     * Clear validation errors
     */
    clearErrors(formElement) {
        formElement.querySelectorAll('.error-message').forEach(el => el.remove());
        formElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }
}

// Create global instance
window.validator = new Validator();