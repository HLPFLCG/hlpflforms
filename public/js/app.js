/**
 * Main Application Initialization
 * Loads all core modules and initializes the application
 */

(function() {
    'use strict';

    /**
     * Application Configuration
     */
    const APP_CONFIG = {
        name: 'HLPFL Forms',
        version: '2.0.0',
        apiBaseURL: '/api',
        environment: window.location.hostname === 'localhost' ? 'development' : 'production'
    };

    /**
     * Initialize Application
     */
    async function initializeApp() {
        const logger = new Logger('App');
        logger.info('Initializing HLPFL Forms', APP_CONFIG);

        try {
            // Check browser compatibility
            checkBrowserCompatibility();

            // Initialize core modules
            initializeModules();

            // Setup global error handlers
            setupErrorHandlers();

            // Setup performance monitoring
            setupPerformanceMonitoring();

            // Clear expired local storage
            Utils.clearExpiredLocalStorage();

            // Check authentication
            if (window.authManager) {
                authManager.checkAuth();
            }

            logger.info('Application initialized successfully');

        } catch (error) {
            logger.critical('Failed to initialize application', error);
            showCriticalError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Check browser compatibility
     */
    function checkBrowserCompatibility() {
        const requiredFeatures = [
            'Promise',
            'fetch',
            'localStorage',
            'sessionStorage',
            'URLSearchParams',
            'FormData'
        ];

        const missingFeatures = requiredFeatures.filter(feature => {
            return !(feature in window);
        });

        if (missingFeatures.length > 0) {
            throw new Error(`Browser missing required features: ${missingFeatures.join(', ')}`);
        }
    }

    /**
     * Initialize core modules
     */
    function initializeModules() {
        // Modules are initialized via their respective scripts
        // This function can be used for additional setup
        
        // Set API base URL
        if (window.apiClient) {
            apiClient.baseURL = APP_CONFIG.apiBaseURL;
        }
    }

    /**
     * Setup global error handlers
     */
    function setupErrorHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            const logger = new Logger('GlobalError');
            logger.error('Uncaught error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });

            // Show user-friendly error message
            if (window.toast) {
                toast.error('An unexpected error occurred. Please try again.');
            }
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            const logger = new Logger('GlobalError');
            logger.error('Unhandled promise rejection', event.reason);

            // Show user-friendly error message
            if (window.toast) {
                toast.error('An unexpected error occurred. Please try again.');
            }
        });

        // Network error handler
        window.addEventListener('offline', () => {
            if (window.toast) {
                toast.warning('You are offline. Some features may not work.');
            }
        });

        window.addEventListener('online', () => {
            if (window.toast) {
                toast.success('You are back online.');
            }
        });
    }

    /**
     * Setup performance monitoring
     */
    function setupPerformanceMonitoring() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            const logger = new Logger('Performance');

            // Monitor long tasks
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            logger.warn('Long task detected', {
                                duration: entry.duration,
                                startTime: entry.startTime
                            });
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task API not supported
            }

            // Log page load metrics
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        logger.info('Page load metrics', {
                            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                            totalTime: perfData.loadEventEnd - perfData.fetchStart
                        });
                    }
                }, 0);
            });
        }
    }

    /**
     * Show critical error
     */
    function showCriticalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        errorDiv.innerHTML = `
            <div style="text-align: center; max-width: 500px; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h1 style="font-size: 24px; margin-bottom: 16px;">Application Error</h1>
                <p style="font-size: 16px; color: #ccc; margin-bottom: 24px;">${message}</p>
                <button onclick="window.location.reload()" style="
                    background: #D4915D;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-size: 16px;
                    cursor: pointer;
                ">Reload Page</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * Export app config
     */
    window.APP_CONFIG = APP_CONFIG;

    /**
     * Initialize when DOM is ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

})();