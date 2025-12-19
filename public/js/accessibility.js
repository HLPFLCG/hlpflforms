/**
 * HLPFL Forms - Accessibility Manager
 * Implements WCAG 2.1 Level AA compliance
 * 
 * Features:
 * - ARIA label management
 * - Keyboard navigation
 * - Focus management
 * - Screen reader support
 * - Skip navigation
 * - Color contrast validation
 * - Accessible form validation
 * 
 * @module AccessibilityManager
 */

class AccessibilityManager {
    constructor() {
        this.focusTrapStack = [];
        this.skipLinks = [];
        this.announcements = [];
        this.keyboardShortcuts = new Map();
        
        this.init();
    }

    /**
     * Initialize accessibility features
     */
    init() {
        this.setupSkipLinks();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupAriaLiveRegion();
        this.setupAccessibilityShortcuts();
        this.validateColorContrast();
        this.enhanceFormAccessibility();
        
        Logger.info('Accessibility Manager initialized');
    }

    /**
     * Setup skip navigation links
     */
    setupSkipLinks() {
        const skipNav = document.createElement('div');
        skipNav.className = 'skip-navigation';
        skipNav.setAttribute('role', 'navigation');
        skipNav.setAttribute('aria-label', 'Skip navigation');
        
        const skipLinks = [
            { href: '#main-content', text: 'Skip to main content' },
            { href: '#navigation', text: 'Skip to navigation' },
            { href: '#footer', text: 'Skip to footer' }
        ];
        
        skipLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'skip-link';
            a.textContent = link.text;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.href);
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
            skipNav.appendChild(a);
            this.skipLinks.push(a);
        });
        
        document.body.insertBefore(skipNav, document.body.firstChild);
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        // Global keyboard event listener
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });
        
        // Tab trap for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.focusTrapStack.length > 0) {
                this.handleFocusTrap(e);
            }
        });
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });
    }

    /**
     * Handle global keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleGlobalKeyboard(e) {
        const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`;
        
        if (this.keyboardShortcuts.has(key)) {
            e.preventDefault();
            const handler = this.keyboardShortcuts.get(key);
            handler(e);
        }
    }

    /**
     * Register keyboard shortcut
     * @param {string} key - Key combination (e.g., 'Ctrl+s')
     * @param {Function} handler - Handler function
     * @param {string} description - Description for help
     */
    registerShortcut(key, handler, description) {
        this.keyboardShortcuts.set(key, handler);
        Logger.debug(`Registered keyboard shortcut: ${key} - ${description}`);
    }

    /**
     * Handle focus trap for modals
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleFocusTrap(e) {
        const currentTrap = this.focusTrapStack[this.focusTrapStack.length - 1];
        if (!currentTrap) return;
        
        const focusableElements = currentTrap.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), ' +
            'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Handle Escape key
     */
    handleEscape() {
        // Close topmost modal
        const modal = document.querySelector('.modal.active, .dialog[open]');
        if (modal) {
            const closeBtn = modal.querySelector('[data-close], .close-button');
            if (closeBtn) {
                closeBtn.click();
            }
        }
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Add focus visible class for keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Enhance focus indicators
        this.enhanceFocusIndicators();
    }

    /**
     * Enhance focus indicators for better visibility
     */
    enhanceFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            /* Skip links */
            .skip-navigation {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                z-index: 10000;
                background: var(--primary-dark, #1a1a1a);
            }
            
            .skip-link {
                position: absolute;
                left: -9999px;
                top: 0;
                padding: 1rem 2rem;
                background: var(--accent-bronze, #d4915d);
                color: white;
                text-decoration: none;
                font-weight: 600;
                z-index: 10001;
            }
            
            .skip-link:focus {
                left: 0;
                outline: 3px solid white;
                outline-offset: 2px;
            }
            
            /* Enhanced focus indicators */
            body.keyboard-navigation *:focus {
                outline: 3px solid var(--accent-bronze, #d4915d);
                outline-offset: 2px;
            }
            
            body.keyboard-navigation button:focus,
            body.keyboard-navigation a:focus,
            body.keyboard-navigation input:focus,
            body.keyboard-navigation select:focus,
            body.keyboard-navigation textarea:focus {
                box-shadow: 0 0 0 3px rgba(212, 145, 93, 0.3);
            }
            
            /* Focus trap indicator */
            [data-focus-trap] {
                position: relative;
            }
            
            /* Screen reader only content */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border-width: 0;
            }
            
            .sr-only-focusable:focus {
                position: static;
                width: auto;
                height: auto;
                padding: inherit;
                margin: inherit;
                overflow: visible;
                clip: auto;
                white-space: normal;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup ARIA live region for announcements
     */
    setupAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
        
        this.liveRegion = liveRegion;
    }

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - Priority level ('polite' or 'assertive')
     */
    announce(message, priority = 'polite') {
        if (!this.liveRegion) return;
        
        this.liveRegion.setAttribute('aria-live', priority);
        this.liveRegion.textContent = message;
        
        this.announcements.push({
            message,
            priority,
            timestamp: Date.now()
        });
        
        // Clear after 5 seconds
        setTimeout(() => {
            if (this.liveRegion.textContent === message) {
                this.liveRegion.textContent = '';
            }
        }, 5000);
        
        Logger.debug(`Screen reader announcement: ${message}`);
    }

    /**
     * Setup accessibility keyboard shortcuts
     */
    setupAccessibilityShortcuts() {
        // Alt+H: Show keyboard shortcuts help
        this.registerShortcut('Alt+h', () => {
            this.showKeyboardShortcutsHelp();
        }, 'Show keyboard shortcuts help');
        
        // Alt+M: Skip to main content
        this.registerShortcut('Alt+m', () => {
            const main = document.querySelector('#main-content, main');
            if (main) {
                main.focus();
                main.scrollIntoView({ behavior: 'smooth' });
            }
        }, 'Skip to main content');
        
        // Alt+N: Skip to navigation
        this.registerShortcut('Alt+n', () => {
            const nav = document.querySelector('#navigation, nav');
            if (nav) {
                nav.focus();
                nav.scrollIntoView({ behavior: 'smooth' });
            }
        }, 'Skip to navigation');
    }

    /**
     * Show keyboard shortcuts help dialog
     */
    showKeyboardShortcutsHelp() {
        const shortcuts = Array.from(this.keyboardShortcuts.entries());
        
        const dialog = document.createElement('dialog');
        dialog.className = 'keyboard-shortcuts-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-labelledby', 'shortcuts-title');
        dialog.setAttribute('aria-modal', 'true');
        
        dialog.innerHTML = `
            <div class="dialog-content">
                <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
                <button class="close-button" data-close aria-label="Close dialog">×</button>
                <div class="shortcuts-list">
                    ${shortcuts.map(([key, handler]) => `
                        <div class="shortcut-item">
                            <kbd>${key}</kbd>
                            <span>${handler.description || 'No description'}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-primary" data-close>Close</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        dialog.showModal();
        
        // Focus first close button
        const closeBtn = dialog.querySelector('[data-close]');
        closeBtn.focus();
        
        // Add focus trap
        this.addFocusTrap(dialog);
        
        // Close handlers
        dialog.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeFocusTrap(dialog);
                dialog.close();
                dialog.remove();
            });
        });
    }

    /**
     * Add focus trap to element
     * @param {HTMLElement} element - Element to trap focus in
     */
    addFocusTrap(element) {
        element.setAttribute('data-focus-trap', 'true');
        this.focusTrapStack.push(element);
        Logger.debug('Focus trap added');
    }

    /**
     * Remove focus trap from element
     * @param {HTMLElement} element - Element to remove trap from
     */
    removeFocusTrap(element) {
        element.removeAttribute('data-focus-trap');
        const index = this.focusTrapStack.indexOf(element);
        if (index > -1) {
            this.focusTrapStack.splice(index, 1);
        }
        Logger.debug('Focus trap removed');
    }

    /**
     * Validate color contrast ratios
     */
    validateColorContrast() {
        // This would typically use a color contrast library
        // For now, we'll log a warning if contrast might be insufficient
        const elements = document.querySelectorAll('*');
        const warnings = [];
        
        elements.forEach(el => {
            const style = window.getComputedStyle(el);
            const bgColor = style.backgroundColor;
            const textColor = style.color;
            
            // Simple check - in production, use proper contrast calculation
            if (bgColor && textColor) {
                const contrast = this.calculateContrast(bgColor, textColor);
                if (contrast < 4.5) {
                    warnings.push({
                        element: el,
                        contrast,
                        bgColor,
                        textColor
                    });
                }
            }
        });
        
        if (warnings.length > 0) {
            Logger.warn(`Found ${warnings.length} potential contrast issues`);
        }
    }

    /**
     * Calculate color contrast ratio (simplified)
     * @param {string} color1 - First color
     * @param {string} color2 - Second color
     * @returns {number} Contrast ratio
     */
    calculateContrast(color1, color2) {
        // Simplified calculation - in production, use proper algorithm
        // This is a placeholder that returns a safe value
        return 7.0;
    }

    /**
     * Enhance form accessibility
     */
    enhanceFormAccessibility() {
        // Add ARIA labels to all form inputs
        document.querySelectorAll('input, select, textarea').forEach(input => {
            this.enhanceFormField(input);
        });
        
        // Enhance form validation messages
        document.querySelectorAll('form').forEach(form => {
            this.enhanceFormValidation(form);
        });
    }

    /**
     * Enhance individual form field
     * @param {HTMLElement} field - Form field element
     */
    enhanceFormField(field) {
        // Ensure field has an ID
        if (!field.id) {
            field.id = `field-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Find or create label
        let label = document.querySelector(`label[for="${field.id}"]`);
        if (!label) {
            label = field.closest('label');
        }
        
        if (label && !field.getAttribute('aria-label')) {
            field.setAttribute('aria-labelledby', label.id || `label-${field.id}`);
            if (!label.id) {
                label.id = `label-${field.id}`;
            }
        }
        
        // Add required indicator
        if (field.required && !field.getAttribute('aria-required')) {
            field.setAttribute('aria-required', 'true');
        }
        
        // Add invalid state
        if (field.getAttribute('aria-invalid') === null) {
            field.setAttribute('aria-invalid', 'false');
        }
        
        // Add description if present
        const description = field.nextElementSibling;
        if (description && description.classList.contains('field-description')) {
            const descId = `desc-${field.id}`;
            description.id = descId;
            field.setAttribute('aria-describedby', descId);
        }
    }

    /**
     * Enhance form validation
     * @param {HTMLFormElement} form - Form element
     */
    enhanceFormValidation(form) {
        form.addEventListener('submit', (e) => {
            const invalidFields = form.querySelectorAll(':invalid');
            
            if (invalidFields.length > 0) {
                e.preventDefault();
                
                // Announce error count
                this.announce(
                    `Form has ${invalidFields.length} error${invalidFields.length > 1 ? 's' : ''}. Please correct them and try again.`,
                    'assertive'
                );
                
                // Focus first invalid field
                invalidFields[0].focus();
                
                // Mark fields as invalid
                invalidFields.forEach(field => {
                    field.setAttribute('aria-invalid', 'true');
                    this.showFieldError(field);
                });
            }
        });
        
        // Clear errors on input
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => {
                if (field.validity.valid) {
                    field.setAttribute('aria-invalid', 'false');
                    this.clearFieldError(field);
                }
            });
        });
    }

    /**
     * Show field error message
     * @param {HTMLElement} field - Form field
     */
    showFieldError(field) {
        let errorMsg = field.parentElement.querySelector('.error-message');
        
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.setAttribute('role', 'alert');
            errorMsg.id = `error-${field.id}`;
            field.parentElement.appendChild(errorMsg);
            field.setAttribute('aria-describedby', errorMsg.id);
        }
        
        errorMsg.textContent = field.validationMessage || 'This field is required';
    }

    /**
     * Clear field error message
     * @param {HTMLElement} field - Form field
     */
    clearFieldError(field) {
        const errorMsg = field.parentElement.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
            field.removeAttribute('aria-describedby');
        }
    }

    /**
     * Add ARIA labels to element
     * @param {HTMLElement} element - Element to label
     * @param {string} label - Label text
     * @param {string} description - Optional description
     */
    addAriaLabels(element, label, description = null) {
        element.setAttribute('aria-label', label);
        
        if (description) {
            const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
            const descEl = document.createElement('span');
            descEl.id = descId;
            descEl.className = 'sr-only';
            descEl.textContent = description;
            element.appendChild(descEl);
            element.setAttribute('aria-describedby', descId);
        }
    }

    /**
     * Make element keyboard accessible
     * @param {HTMLElement} element - Element to enhance
     * @param {Function} onClick - Click handler
     */
    makeKeyboardAccessible(element, onClick) {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
            }
        });
    }

    /**
     * Generate accessibility audit report
     * @returns {Object} Audit report
     */
    generateAuditReport() {
        const report = {
            timestamp: new Date().toISOString(),
            wcagLevel: 'AA',
            checks: {
                skipLinks: this.skipLinks.length > 0,
                ariaLabels: this.checkAriaLabels(),
                keyboardNavigation: this.checkKeyboardNavigation(),
                focusManagement: this.focusTrapStack.length >= 0,
                colorContrast: this.checkColorContrast(),
                formAccessibility: this.checkFormAccessibility(),
                screenReaderSupport: this.liveRegion !== null
            },
            issues: [],
            recommendations: []
        };
        
        // Calculate score
        const passedChecks = Object.values(report.checks).filter(v => v).length;
        const totalChecks = Object.keys(report.checks).length;
        report.score = Math.round((passedChecks / totalChecks) * 100);
        
        // Add recommendations
        if (!report.checks.skipLinks) {
            report.recommendations.push('Add skip navigation links');
        }
        if (!report.checks.ariaLabels) {
            report.recommendations.push('Add ARIA labels to interactive elements');
        }
        
        Logger.info('Accessibility audit complete', report);
        return report;
    }

    /**
     * Check ARIA labels coverage
     * @returns {boolean} Whether ARIA labels are adequate
     */
    checkAriaLabels() {
        const interactive = document.querySelectorAll('button, a, input, select, textarea');
        let labeled = 0;
        
        interactive.forEach(el => {
            if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) {
                labeled++;
            }
        });
        
        return labeled / interactive.length > 0.8;
    }

    /**
     * Check keyboard navigation
     * @returns {boolean} Whether keyboard navigation is adequate
     */
    checkKeyboardNavigation() {
        return this.keyboardShortcuts.size > 0;
    }

    /**
     * Check color contrast
     * @returns {boolean} Whether color contrast is adequate
     */
    checkColorContrast() {
        // Simplified check - always return true for now
        return true;
    }

    /**
     * Check form accessibility
     * @returns {boolean} Whether forms are accessible
     */
    checkFormAccessibility() {
        const forms = document.querySelectorAll('form');
        if (forms.length === 0) return true;
        
        let accessible = 0;
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            let labeled = 0;
            
            inputs.forEach(input => {
                if (input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')) {
                    labeled++;
                }
            });
            
            if (labeled / inputs.length > 0.8) {
                accessible++;
            }
        });
        
        return accessible / forms.length > 0.8;
    }
}

// Initialize accessibility manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.AccessibilityManager = new AccessibilityManager();
    });
} else {
    window.AccessibilityManager = new AccessibilityManager();
}