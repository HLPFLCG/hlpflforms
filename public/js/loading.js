/**
 * Loading State Manager
 * Provides beautiful loading states, skeletons, and progress indicators
 */

class LoadingManager {
    constructor() {
        this.activeLoaders = new Set();
        this.logger = new Logger('LoadingManager');
        this.init();
    }

    /**
     * Initialize loading manager
     */
    init() {
        this.injectStyles();
    }

    /**
     * Inject loading styles
     */
    injectStyles() {
        if (document.getElementById('loading-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            /* Loading Overlay */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(4px);
            }

            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top-color: #D4915D;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Skeleton Loading */
            .skeleton {
                background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
                background-size: 200% 100%;
                animation: loading 1.5s ease-in-out infinite;
                border-radius: 4px;
            }

            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            .skeleton-text {
                height: 16px;
                margin-bottom: 8px;
            }

            .skeleton-title {
                height: 24px;
                width: 60%;
                margin-bottom: 16px;
            }

            .skeleton-card {
                height: 200px;
                border-radius: 8px;
            }

            .skeleton-circle {
                width: 50px;
                height: 50px;
                border-radius: 50%;
            }

            /* Button Loading State */
            .btn-loading {
                position: relative;
                pointer-events: none;
                opacity: 0.7;
            }

            .btn-loading::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                top: 50%;
                left: 50%;
                margin-left: -8px;
                margin-top: -8px;
                border: 2px solid transparent;
                border-top-color: currentColor;
                border-radius: 50%;
                animation: spin 0.6s linear infinite;
            }

            /* Progress Bar */
            .progress-bar {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
                overflow: hidden;
                position: relative;
            }

            .progress-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #D4915D, #E5A26E);
                transition: width 0.3s ease;
                border-radius: 2px;
            }

            .progress-bar-indeterminate .progress-bar-fill {
                width: 30%;
                animation: progress-indeterminate 1.5s ease-in-out infinite;
            }

            @keyframes progress-indeterminate {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(400%); }
            }

            /* Pulse Animation */
            .pulse {
                animation: pulse 2s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show full-page loading overlay
     */
    showOverlay(message = 'Loading...') {
        const id = 'loading-overlay-' + Date.now();
        
        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 20px; font-size: 16px;">${message}</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.activeLoaders.add(id);
        
        return id;
    }

    /**
     * Hide loading overlay
     */
    hideOverlay(id) {
        const overlay = document.getElementById(id);
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                overlay.remove();
                this.activeLoaders.delete(id);
            }, 300);
        }
    }

    /**
     * Show loading state on element
     */
    showElementLoading(element, type = 'spinner') {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) {
            return;
        }

        el.dataset.originalContent = el.innerHTML;
        el.classList.add('loading');

        if (type === 'spinner') {
            el.innerHTML = '<div class="loading-spinner" style="width: 30px; height: 30px; margin: 20px auto;"></div>';
        } else if (type === 'skeleton') {
            this.showSkeleton(el);
        }
    }

    /**
     * Hide loading state on element
     */
    hideElementLoading(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) {
            return;
        }

        if (el.dataset.originalContent) {
            el.innerHTML = el.dataset.originalContent;
            delete el.dataset.originalContent;
        }
        el.classList.remove('loading');
    }

    /**
     * Show skeleton loading
     */
    showSkeleton(element, config = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) {
            return;
        }

        const {
            lines = 3,
            type = 'text',
            height = '16px'
        } = config;

        let skeletonHTML = '';

        if (type === 'text') {
            for (let i = 0; i < lines; i++) {
                const width = i === lines - 1 ? '60%' : '100%';
                skeletonHTML += `<div class="skeleton skeleton-text" style="height: ${height}; width: ${width};"></div>`;
            }
        } else if (type === 'card') {
            skeletonHTML = '<div class="skeleton skeleton-card"></div>';
        } else if (type === 'circle') {
            skeletonHTML = '<div class="skeleton skeleton-circle"></div>';
        } else if (type === 'title') {
            skeletonHTML = '<div class="skeleton skeleton-title"></div>';
        }

        el.innerHTML = skeletonHTML;
    }

    /**
     * Show button loading state
     */
    showButtonLoading(button, text = null) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) {
            return;
        }

        btn.dataset.originalText = btn.textContent;
        btn.disabled = true;
        btn.classList.add('btn-loading');
        
        if (text) {
            btn.textContent = text;
        }
    }

    /**
     * Hide button loading state
     */
    hideButtonLoading(button) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) {
            return;
        }

        btn.disabled = false;
        btn.classList.remove('btn-loading');
        
        if (btn.dataset.originalText) {
            btn.textContent = btn.dataset.originalText;
            delete btn.dataset.originalText;
        }
    }

    /**
     * Create progress bar
     */
    createProgressBar(container, options = {}) {
        const {
            indeterminate = false,
            progress = 0,
            height = '4px'
        } = options;

        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) {
            return null;
        }

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar' + (indeterminate ? ' progress-bar-indeterminate' : '');
        progressBar.style.height = height;

        const fill = document.createElement('div');
        fill.className = 'progress-bar-fill';
        fill.style.width = indeterminate ? '30%' : `${progress}%`;

        progressBar.appendChild(fill);
        el.appendChild(progressBar);

        return {
            element: progressBar,
            setProgress: (value) => {
                fill.style.width = `${value}%`;
            },
            remove: () => {
                progressBar.remove();
            }
        };
    }

    /**
     * Show loading for async operation
     */
    async withLoading(operation, options = {}) {
        const {
            overlay = false,
            message = 'Loading...',
            element = null,
            button = null
        } = options;

        let overlayId;
        
        try {
            if (overlay) {
                overlayId = this.showOverlay(message);
            }
            
            if (element) {
                this.showElementLoading(element);
            }
            
            if (button) {
                this.showButtonLoading(button);
            }

            const result = await operation();
            return result;

        } catch (error) {
            this.logger.error('Operation failed', error);
            throw error;

        } finally {
            if (overlayId) {
                this.hideOverlay(overlayId);
            }
            
            if (element) {
                this.hideElementLoading(element);
            }
            
            if (button) {
                this.hideButtonLoading(button);
            }
        }
    }

    /**
     * Clear all active loaders
     */
    clearAll() {
        this.activeLoaders.forEach(id => {
            const overlay = document.getElementById(id);
            if (overlay) {
                overlay.remove();
            }
        });
        this.activeLoaders.clear();
    }
}

// Create global instance
window.loadingManager = new LoadingManager();