/**
 * Toast Notification System
 * Provides user feedback for actions with beautiful animations
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.maxToasts = 5;
        this.defaultDuration = 4000;
        this.init();
    }

    /**
     * Initialize toast container
     */
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
    }

    /**
     * Create toast element
     */
    createToast(message, type = 'info', duration = this.defaultDuration) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        // Colors based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        toast.style.cssText = `
            background: rgba(26, 26, 46, 0.98);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            border-left: 4px solid ${colors[type]};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 500px;
            pointer-events: auto;
            animation: slideIn 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.5;
        `;

        const icon = document.createElement('span');
        icon.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: ${colors[type]};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        `;
        icon.textContent = icons[type];

        const messageEl = document.createElement('span');
        messageEl.style.cssText = 'flex: 1;';
        messageEl.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: color 0.2s;
        `;
        closeBtn.innerHTML = '×';
        closeBtn.onmouseover = () => closeBtn.style.color = 'white';
        closeBtn.onmouseout = () => closeBtn.style.color = 'rgba(255, 255, 255, 0.6)';
        closeBtn.onclick = () => this.removeToast(toast);

        toast.appendChild(icon);
        toast.appendChild(messageEl);
        toast.appendChild(closeBtn);

        return toast;
    }

    /**
     * Show toast notification
     */
    show(message, type = 'info', duration = this.defaultDuration) {
        // Remove oldest toast if at max capacity
        if (this.toasts.length >= this.maxToasts) {
            this.removeToast(this.toasts[0]);
        }

        const toast = this.createToast(message, type, duration);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        return toast;
    }

    /**
     * Remove toast with animation
     */
    removeToast(toast) {
        if (!toast || !toast.parentElement) {
            return;
        }

        toast.style.animation = 'slideOut 0.3s ease-out';
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    /**
     * Success toast
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    /**
     * Error toast
     */
    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    /**
     * Warning toast
     */
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    /**
     * Info toast
     */
    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    /**
     * Clear all toasts
     */
    clearAll() {
        this.toasts.forEach(toast => this.removeToast(toast));
    }
}

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @media (max-width: 640px) {
        #toast-container {
            left: 10px;
            right: 10px;
            top: 10px;
        }
        
        .toast {
            min-width: auto !important;
            max-width: none !important;
        }
    }
`;
document.head.appendChild(style);

// Create global instance
window.toast = new ToastManager();