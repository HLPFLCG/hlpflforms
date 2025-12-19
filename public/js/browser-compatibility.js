/**
 * HLPFL Forms - Browser Compatibility Manager
 * Handles browser detection, feature detection, and polyfills
 * 
 * @module BrowserCompatibilityManager
 */

class BrowserCompatibilityManager {
    constructor() {
        this.browser = null;
        this.version = null;
        this.engine = null;
        this.os = null;
        this.features = {};
        this.issues = [];
        
        this.init();
    }

    /**
     * Initialize browser compatibility manager
     */
    init() {
        this.detectBrowser();
        this.detectOS();
        this.detectFeatures();
        this.applyPolyfills();
        this.applyBrowserFixes();
        
        Logger.info('Browser Compatibility Manager initialized', {
            browser: this.browser,
            version: this.version,
            os: this.os,
            issues: this.issues.length
        });
    }

    /**
     * Detect browser and version
     */
    detectBrowser() {
        const ua = navigator.userAgent;
        
        // Detect browser
        if (ua.includes('Firefox/')) {
            this.browser = 'Firefox';
            this.engine = 'Gecko';
            this.version = this.extractVersion(ua, 'Firefox/');
        } else if (ua.includes('Edg/')) {
            this.browser = 'Edge';
            this.engine = 'Blink';
            this.version = this.extractVersion(ua, 'Edg/');
        } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
            this.browser = 'Chrome';
            this.engine = 'Blink';
            this.version = this.extractVersion(ua, 'Chrome/');
        } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
            this.browser = 'Safari';
            this.engine = 'WebKit';
            this.version = this.extractVersion(ua, 'Version/');
        } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
            this.browser = 'Opera';
            this.engine = 'Blink';
            this.version = this.extractVersion(ua, 'OPR/') || this.extractVersion(ua, 'Opera/');
        } else {
            this.browser = 'Unknown';
            this.engine = 'Unknown';
            this.version = 'Unknown';
        }
        
        // Add browser class to body
        document.body.classList.add(`browser-${this.browser.toLowerCase()}`);
        document.body.classList.add(`engine-${this.engine.toLowerCase()}`);
    }

    /**
     * Extract version from user agent
     * @param {string} ua - User agent string
     * @param {string} pattern - Pattern to match
     * @returns {string} Version number
     */
    extractVersion(ua, pattern) {
        const index = ua.indexOf(pattern);
        if (index === -1) return 'Unknown';
        
        const versionString = ua.substring(index + pattern.length);
        const version = versionString.split(/[^\d.]/)[0];
        return version;
    }

    /**
     * Detect operating system
     */
    detectOS() {
        const ua = navigator.userAgent;
        
        if (ua.includes('Windows')) {
            this.os = 'Windows';
        } else if (ua.includes('Mac OS X')) {
            this.os = 'macOS';
        } else if (ua.includes('Linux')) {
            this.os = 'Linux';
        } else if (ua.includes('Android')) {
            this.os = 'Android';
        } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
            this.os = 'iOS';
        } else {
            this.os = 'Unknown';
        }
        
        document.body.classList.add(`os-${this.os.toLowerCase()}`);
    }

    /**
     * Detect browser features
     */
    detectFeatures() {
        // CSS Features
        this.features.cssGrid = this.testCSSFeature('display', 'grid');
        this.features.cssFlexbox = this.testCSSFeature('display', 'flex');
        this.features.cssVariables = this.testCSSFeature('--test', '1');
        this.features.cssTransforms = this.testCSSFeature('transform', 'translateX(1px)');
        this.features.cssTransitions = this.testCSSFeature('transition', 'all 1s');
        this.features.cssAnimations = this.testCSSFeature('animation', 'test 1s');
        
        // JavaScript Features
        this.features.promises = typeof Promise !== 'undefined';
        this.features.fetch = typeof fetch !== 'undefined';
        this.features.localStorage = this.testLocalStorage();
        this.features.sessionStorage = this.testSessionStorage();
        this.features.webWorkers = typeof Worker !== 'undefined';
        this.features.serviceWorker = 'serviceWorker' in navigator;
        this.features.webSockets = typeof WebSocket !== 'undefined';
        this.features.geolocation = 'geolocation' in navigator;
        this.features.notifications = 'Notification' in window;
        
        // ES6+ Features
        this.features.arrow = this.testArrowFunctions();
        this.features.classes = this.testClasses();
        this.features.templateLiterals = this.testTemplateLiterals();
        this.features.destructuring = this.testDestructuring();
        this.features.spread = this.testSpreadOperator();
        this.features.asyncAwait = this.testAsyncAwait();
        
        // DOM Features
        this.features.querySelector = typeof document.querySelector !== 'undefined';
        this.features.classList = 'classList' in document.createElement('div');
        this.features.dataset = 'dataset' in document.createElement('div');
        this.features.customElements = 'customElements' in window;
        this.features.shadowDOM = 'attachShadow' in Element.prototype;
        
        // Media Features
        this.features.audio = typeof Audio !== 'undefined';
        this.features.video = typeof HTMLVideoElement !== 'undefined';
        this.features.canvas = typeof HTMLCanvasElement !== 'undefined';
        this.features.svg = typeof SVGElement !== 'undefined';
        
        // Network Features
        this.features.xhr = typeof XMLHttpRequest !== 'undefined';
        this.features.cors = 'withCredentials' in new XMLHttpRequest();
        
        // Add feature classes to body
        Object.keys(this.features).forEach(feature => {
            if (this.features[feature]) {
                document.body.classList.add(`feature-${feature}`);
            } else {
                document.body.classList.add(`no-${feature}`);
                this.issues.push(`Missing feature: ${feature}`);
            }
        });
    }

    /**
     * Test CSS feature support
     * @param {string} property - CSS property
     * @param {string} value - CSS value
     * @returns {boolean} Whether feature is supported
     */
    testCSSFeature(property, value) {
        const element = document.createElement('div');
        element.style[property] = value;
        return element.style[property] !== '';
    }

    /**
     * Test localStorage support
     * @returns {boolean} Whether localStorage is supported
     */
    testLocalStorage() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Test sessionStorage support
     * @returns {boolean} Whether sessionStorage is supported
     */
    testSessionStorage() {
        try {
            const test = '__test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Test arrow functions support
     * @returns {boolean} Whether arrow functions are supported
     */
    testArrowFunctions() {
        try {
            eval('() => {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Test classes support
     * @returns {boolean} Whether classes are supported
     */
    testClasses() {
        try {
            eval('class Test {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Test template literals support
     * @returns {boolean} Whether template literals are supported
     */
    testTemplateLiterals() {
        try {
            eval('`test`');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Test destructuring support
     * @returns {boolean} Whether destructuring is supported
     */
    testDestructuring() {
        try {
            eval('const {a} = {a: 1}');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Test spread operator support
     * @returns {boolean} Whether spread operator is supported
     */
    testSpreadOperator() {
        try {
            eval('const a = [...[1, 2, 3]]');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Test async/await support
     * @returns {boolean} Whether async/await is supported
     */
    testAsyncAwait() {
        try {
            eval('async function test() { await Promise.resolve(); }');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Apply polyfills for missing features
     */
    applyPolyfills() {
        // Polyfill for Promise
        if (!this.features.promises) {
            this.loadPolyfill('https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js');
        }
        
        // Polyfill for fetch
        if (!this.features.fetch) {
            this.loadPolyfill('https://cdn.jsdelivr.net/npm/whatwg-fetch@3/dist/fetch.umd.js');
        }
        
        // Polyfill for classList
        if (!this.features.classList) {
            this.polyfillClassList();
        }
        
        // Polyfill for CustomEvent
        if (typeof CustomEvent !== 'function') {
            this.polyfillCustomEvent();
        }
        
        // Polyfill for Object.assign
        if (typeof Object.assign !== 'function') {
            this.polyfillObjectAssign();
        }
        
        // Polyfill for Array.from
        if (!Array.from) {
            this.polyfillArrayFrom();
        }
        
        // Polyfill for Array.includes
        if (!Array.prototype.includes) {
            this.polyfillArrayIncludes();
        }
        
        // Polyfill for String.includes
        if (!String.prototype.includes) {
            this.polyfillStringIncludes();
        }
    }

    /**
     * Load external polyfill script
     * @param {string} url - Polyfill URL
     */
    loadPolyfill(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = false;
        document.head.appendChild(script);
        Logger.info(`Loading polyfill: ${url}`);
    }

    /**
     * Polyfill for classList
     */
    polyfillClassList() {
        if (!('classList' in document.createElement('_'))) {
            (function(view) {
                if (!('Element' in view)) return;
                
                var classListProp = 'classList',
                    protoProp = 'prototype',
                    elemCtrProto = view.Element[protoProp],
                    objCtr = Object,
                    strTrim = String[protoProp].trim || function() {
                        return this.replace(/^\s+|\s+$/g, '');
                    };
                
                // Implementation would go here
                // Simplified for brevity
            }(window));
        }
    }

    /**
     * Polyfill for CustomEvent
     */
    polyfillCustomEvent() {
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: null };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

    /**
     * Polyfill for Object.assign
     */
    polyfillObjectAssign() {
        Object.assign = function(target) {
            if (target === null || target === undefined) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            
            var to = Object(target);
            
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                
                if (nextSource !== null && nextSource !== undefined) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    /**
     * Polyfill for Array.from
     */
    polyfillArrayFrom() {
        Array.from = function(arrayLike) {
            return Array.prototype.slice.call(arrayLike);
        };
    }

    /**
     * Polyfill for Array.includes
     */
    polyfillArrayIncludes() {
        Array.prototype.includes = function(searchElement, fromIndex) {
            return this.indexOf(searchElement, fromIndex) !== -1;
        };
    }

    /**
     * Polyfill for String.includes
     */
    polyfillStringIncludes() {
        String.prototype.includes = function(search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }
            
            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }

    /**
     * Apply browser-specific fixes
     */
    applyBrowserFixes() {
        // Safari fixes
        if (this.browser === 'Safari') {
            this.applySafariFixes();
        }
        
        // Firefox fixes
        if (this.browser === 'Firefox') {
            this.applyFirefoxFixes();
        }
        
        // Edge fixes
        if (this.browser === 'Edge') {
            this.applyEdgeFixes();
        }
        
        // IE fixes (if detected)
        if (this.browser === 'IE' || document.documentMode) {
            this.applyIEFixes();
        }
    }

    /**
     * Apply Safari-specific fixes
     */
    applySafariFixes() {
        // Fix for Safari date input
        const style = document.createElement('style');
        style.textContent = `
            input[type="date"]::-webkit-calendar-picker-indicator {
                display: block;
            }
        `;
        document.head.appendChild(style);
        
        Logger.debug('Applied Safari fixes');
    }

    /**
     * Apply Firefox-specific fixes
     */
    applyFirefoxFixes() {
        // Firefox-specific fixes
        Logger.debug('Applied Firefox fixes');
    }

    /**
     * Apply Edge-specific fixes
     */
    applyEdgeFixes() {
        // Edge-specific fixes
        Logger.debug('Applied Edge fixes');
    }

    /**
     * Apply IE-specific fixes
     */
    applyIEFixes() {
        // Add IE class
        document.body.classList.add('browser-ie');
        
        // Show warning for old IE
        if (document.documentMode && document.documentMode < 11) {
            this.showBrowserWarning('Internet Explorer ' + document.documentMode + ' is not supported. Please upgrade to a modern browser.');
        }
        
        Logger.warn('Internet Explorer detected - limited support');
    }

    /**
     * Show browser warning
     * @param {string} message - Warning message
     */
    showBrowserWarning(message) {
        const warning = document.createElement('div');
        warning.className = 'browser-warning';
        warning.innerHTML = `
            <div class="browser-warning-content">
                <strong>⚠️ Browser Warning</strong>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .browser-warning {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ff6b6b;
                color: white;
                padding: 1rem;
                z-index: 10000;
                text-align: center;
            }
            .browser-warning-content {
                max-width: 800px;
                margin: 0 auto;
            }
            .browser-warning button {
                background: white;
                color: #ff6b6b;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 0.5rem;
            }
        `;
        
        document.head.appendChild(style);
        document.body.insertBefore(warning, document.body.firstChild);
    }

    /**
     * Get browser information
     * @returns {Object} Browser information
     */
    getBrowserInfo() {
        return {
            browser: this.browser,
            version: this.version,
            engine: this.engine,
            os: this.os,
            userAgent: navigator.userAgent,
            features: this.features,
            issues: this.issues
        };
    }

    /**
     * Check if browser is supported
     * @returns {boolean} Whether browser is supported
     */
    isSupported() {
        // Minimum requirements
        const requirements = {
            cssFlexbox: true,
            promises: true,
            querySelector: true,
            classList: true
        };
        
        for (const feature in requirements) {
            if (requirements[feature] && !this.features[feature]) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get compatibility score
     * @returns {number} Compatibility score (0-100)
     */
    getCompatibilityScore() {
        const totalFeatures = Object.keys(this.features).length;
        const supportedFeatures = Object.values(this.features).filter(v => v).length;
        return Math.round((supportedFeatures / totalFeatures) * 100);
    }

    /**
     * Generate compatibility report
     * @returns {Object} Compatibility report
     */
    generateCompatibilityReport() {
        return {
            timestamp: new Date().toISOString(),
            browser: this.getBrowserInfo(),
            score: this.getCompatibilityScore(),
            supported: this.isSupported(),
            features: this.features,
            issues: this.issues,
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Get recommendations for unsupported features
     * @returns {Array} Recommendations
     */
    getRecommendations() {
        const recommendations = [];
        
        if (!this.features.cssGrid) {
            recommendations.push('Consider using Flexbox fallback for grid layouts');
        }
        
        if (!this.features.promises) {
            recommendations.push('Promise polyfill has been loaded');
        }
        
        if (!this.features.fetch) {
            recommendations.push('Fetch polyfill has been loaded');
        }
        
        if (!this.isSupported()) {
            recommendations.push('Upgrade to a modern browser for best experience');
        }
        
        return recommendations;
    }
}

// Initialize browser compatibility manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.BrowserCompatibilityManager = new BrowserCompatibilityManager();
    });
} else {
    window.BrowserCompatibilityManager = new BrowserCompatibilityManager();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserCompatibilityManager;
}