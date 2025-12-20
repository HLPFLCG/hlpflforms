/**
 * HLPFL Forms - Auto-Save System
 * Automatic form data saving with local storage
 * Part of Phase 9: User Experience Enhancement
 * 
 * @module auto-save
 * @version 1.0.0
 */

class AutoSaveManager {
    constructor() {
        this.forms = new Map();
        this.saveDelay = 1000; // 1 second debounce
        this.storagePrefix = 'hlpfl_autosave_';
        this.init();
    }

    /**
     * Initialize auto-save system
     */
    init() {
        this.setupAutoSave();
        this.restoreFormData();
        console.log('💾 Auto-save system initialized');
    }

    /**
     * Setup auto-save for forms
     */
    setupAutoSave() {
        // Find all forms with auto-save enabled
        const forms = document.querySelectorAll('[data-auto-save]');
        
        forms.forEach(form => {
            this.enableAutoSave(form);
        });
    }

    /**
     * Enable auto-save for a form
     * @param {HTMLFormElement} form - Form element
     */
    enableAutoSave(form) {
        const formId = form.id || this.generateFormId(form);
        
        // Create debounced save function
        const debouncedSave = this.debounce(() => {
            this.saveFormData(form, formId);
        }, this.saveDelay);

        // Listen to input changes
        form.addEventListener('input', debouncedSave);
        form.addEventListener('change', debouncedSave);

        // Listen to form submission
        form.addEventListener('submit', () => {
            this.clearFormData(formId);
        });

        this.forms.set(formId, {
            form,
            debouncedSave
        });

        // Show auto-save indicator
        this.createAutoSaveIndicator(form, formId);
    }

    /**
     * Save form data to local storage
     * @param {HTMLFormElement} form - Form element
     * @param {string} formId - Form ID
     */
    saveFormData(form, formId) {
        const formData = new FormData(form);
        const data = {};

        // Convert FormData to object
        for (const [key, value] of formData.entries()) {
            // Handle multiple values (checkboxes)
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        // Save to local storage
        const storageKey = this.storagePrefix + formId;
        localStorage.setItem(storageKey, JSON.stringify({
            data,
            timestamp: Date.now()
        }));

        // Update indicator
        this.updateAutoSaveIndicator(formId, 'saved');

        console.log(`Form data saved: ${formId}`);
    }

    /**
     * Restore form data from local storage
     */
    restoreFormData() {
        const forms = document.querySelectorAll('[data-auto-save]');
        
        forms.forEach(form => {
            const formId = form.id || this.generateFormId(form);
            const storageKey = this.storagePrefix + formId;
            const savedData = localStorage.getItem(storageKey);

            if (savedData) {
                try {
                    const { data, timestamp } = JSON.parse(savedData);
                    
                    // Check if data is not too old (24 hours)
                    const age = Date.now() - timestamp;
                    if (age < 24 * 60 * 60 * 1000) {
                        this.populateForm(form, data);
                        this.showRestoreNotification(form, formId);
                    } else {
                        // Clear old data
                        localStorage.removeItem(storageKey);
                    }
                } catch (error) {
                    console.error('Error restoring form data:', error);
                }
            }
        });
    }

    /**
     * Populate form with saved data
     * @param {HTMLFormElement} form - Form element
     * @param {Object} data - Form data
     */
    populateForm(form, data) {
        Object.entries(data).forEach(([name, value]) => {
            const elements = form.elements[name];
            
            if (!elements) return;

            // Handle multiple elements (radio buttons, checkboxes)
            if (elements.length > 1) {
                Array.from(elements).forEach(element => {
                    if (element.type === 'checkbox') {
                        element.checked = Array.isArray(value) 
                            ? value.includes(element.value)
                            : value === element.value;
                    } else if (element.type === 'radio') {
                        element.checked = element.value === value;
                    }
                });
            } else {
                const element = elements;
                
                if (element.type === 'checkbox') {
                    element.checked = value === 'on' || value === true;
                } else if (element.type === 'radio') {
                    element.checked = element.value === value;
                } else {
                    element.value = value;
                }
            }
        });
    }

    /**
     * Clear form data from local storage
     * @param {string} formId - Form ID
     */
    clearFormData(formId) {
        const storageKey = this.storagePrefix + formId;
        localStorage.removeItem(storageKey);
        console.log(`Form data cleared: ${formId}`);
    }

    /**
     * Create auto-save indicator
     * @param {HTMLFormElement} form - Form element
     * @param {string} formId - Form ID
     */
    createAutoSaveIndicator(form, formId) {
        const indicator = document.createElement('div');
        indicator.className = 'auto-save-indicator';
        indicator.id = `auto-save-${formId}`;
        indicator.innerHTML = `
            <span class="auto-save-icon">💾</span>
            <span class="auto-save-text">Auto-save enabled</span>
        `;
        
        // Insert at the beginning of the form
        form.insertBefore(indicator, form.firstChild);
    }

    /**
     * Update auto-save indicator
     * @param {string} formId - Form ID
     * @param {string} status - Status ('saving', 'saved', 'error')
     */
    updateAutoSaveIndicator(formId, status) {
        const indicator = document.getElementById(`auto-save-${formId}`);
        if (!indicator) return;

        const text = indicator.querySelector('.auto-save-text');
        const icon = indicator.querySelector('.auto-save-icon');

        switch (status) {
            case 'saving':
                text.textContent = 'Saving...';
                icon.textContent = '⏳';
                break;
            case 'saved':
                text.textContent = 'All changes saved';
                icon.textContent = '✓';
                setTimeout(() => {
                    text.textContent = 'Auto-save enabled';
                    icon.textContent = '💾';
                }, 2000);
                break;
            case 'error':
                text.textContent = 'Save failed';
                icon.textContent = '⚠️';
                break;
        }
    }

    /**
     * Show restore notification
     * @param {HTMLFormElement} form - Form element
     * @param {string} formId - Form ID
     */
    showRestoreNotification(form, formId) {
        const notification = document.createElement('div');
        notification.className = 'restore-notification';
        notification.innerHTML = `
            <div class="restore-notification-content">
                <span class="restore-notification-icon">📋</span>
                <span class="restore-notification-text">We restored your previous work</span>
                <button type="button" class="restore-notification-dismiss" data-dismiss="${formId}">
                    ✕
                </button>
            </div>
        `;

        form.insertBefore(notification, form.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (window.AnimationManager) {
                window.AnimationManager.play(notification, 'fadeOut').then(() => {
                    notification.remove();
                });
            } else {
                notification.remove();
            }
        }, 5000);

        // Manual dismiss
        notification.querySelector('.restore-notification-dismiss').addEventListener('click', () => {
            if (window.AnimationManager) {
                window.AnimationManager.play(notification, 'fadeOut').then(() => {
                    notification.remove();
                });
            } else {
                notification.remove();
            }
        });
    }

    /**
     * Generate form ID
     * @param {HTMLFormElement} form - Form element
     * @returns {string}
     */
    generateFormId(form) {
        return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get all saved forms
     * @returns {Array}
     */
    getSavedForms() {
        const savedForms = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.storagePrefix)) {
                const data = localStorage.getItem(key);
                try {
                    savedForms.push({
                        key,
                        formId: key.replace(this.storagePrefix, ''),
                        data: JSON.parse(data)
                    });
                } catch (error) {
                    console.error('Error parsing saved form:', error);
                }
            }
        }
        
        return savedForms;
    }

    /**
     * Clear all saved forms
     */
    clearAllSavedForms() {
        const keys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.storagePrefix)) {
                keys.push(key);
            }
        }
        
        keys.forEach(key => localStorage.removeItem(key));
        console.log(`Cleared ${keys.length} saved forms`);
    }

    /**
     * Destroy auto-save manager
     */
    destroy() {
        this.forms.clear();
        console.log('Auto-save system destroyed');
    }
}

// Create global instance
window.AutoSaveManager = new AutoSaveManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoSaveManager;
}