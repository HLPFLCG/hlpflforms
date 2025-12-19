/**
 * HLPFL Forms - Responsive JavaScript Manager
 * Handles responsive behavior, device detection, and adaptive features
 * 
 * @module ResponsiveManager
 */

class ResponsiveManager {
    constructor() {
        this.breakpoints = {
            xs: 0,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            xxl: 1400
        };
        
        this.currentBreakpoint = null;
        this.isTouch = false;
        this.isMobile = false;
        this.isTablet = false;
        this.isDesktop = false;
        this.orientation = null;
        
        this.init();
    }

    /**
     * Initialize responsive manager
     */
    init() {
        this.detectDevice();
        this.detectBreakpoint();
        this.detectOrientation();
        this.setupEventListeners();
        this.setupMobileMenu();
        this.optimizeForTouch();
        this.handleViewportHeight();
        
        Logger.info('Responsive Manager initialized', {
            breakpoint: this.currentBreakpoint,
            isTouch: this.isTouch,
            isMobile: this.isMobile,
            orientation: this.orientation
        });
    }

    /**
     * Detect device type
     */
    detectDevice() {
        // Detect touch capability
        this.isTouch = 'ontouchstart' in window || 
                      navigator.maxTouchPoints > 0 ||
                      navigator.msMaxTouchPoints > 0;
        
        // Detect mobile
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Detect tablet
        this.isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
        
        // Detect desktop
        this.isDesktop = !this.isMobile && !this.isTablet;
        
        // Add classes to body
        document.body.classList.toggle('is-touch', this.isTouch);
        document.body.classList.toggle('is-mobile', this.isMobile);
        document.body.classList.toggle('is-tablet', this.isTablet);
        document.body.classList.toggle('is-desktop', this.isDesktop);
    }

    /**
     * Detect current breakpoint
     */
    detectBreakpoint() {
        const width = window.innerWidth;
        let breakpoint = 'xs';
        
        if (width >= this.breakpoints.xxl) {
            breakpoint = 'xxl';
        } else if (width >= this.breakpoints.xl) {
            breakpoint = 'xl';
        } else if (width >= this.breakpoints.lg) {
            breakpoint = 'lg';
        } else if (width >= this.breakpoints.md) {
            breakpoint = 'md';
        } else if (width >= this.breakpoints.sm) {
            breakpoint = 'sm';
        }
        
        if (this.currentBreakpoint !== breakpoint) {
            const oldBreakpoint = this.currentBreakpoint;
            this.currentBreakpoint = breakpoint;
            
            // Update body class
            if (oldBreakpoint) {
                document.body.classList.remove(`breakpoint-${oldBreakpoint}`);
            }
            document.body.classList.add(`breakpoint-${breakpoint}`);
            
            // Trigger breakpoint change event
            this.triggerBreakpointChange(oldBreakpoint, breakpoint);
        }
        
        return breakpoint;
    }

    /**
     * Detect orientation
     */
    detectOrientation() {
        const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        
        if (this.orientation !== orientation) {
            const oldOrientation = this.orientation;
            this.orientation = orientation;
            
            // Update body class
            if (oldOrientation) {
                document.body.classList.remove(`orientation-${oldOrientation}`);
            }
            document.body.classList.add(`orientation-${orientation}`);
            
            // Trigger orientation change event
            this.triggerOrientationChange(oldOrientation, orientation);
        }
        
        return orientation;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.detectBreakpoint();
                this.detectOrientation();
                this.handleViewportHeight();
            }, 150);
        });
        
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectOrientation();
                this.handleViewportHeight();
            }, 100);
        });
        
        // Scroll handler for mobile
        if (this.isMobile) {
            this.setupMobileScrollHandler();
        }
    }

    /**
     * Setup mobile menu
     */
    setupMobileMenu() {
        const toggler = document.querySelector('.navbar-toggler');
        const collapse = document.querySelector('.navbar-collapse');
        
        if (toggler && collapse) {
            toggler.addEventListener('click', () => {
                collapse.classList.toggle('show');
                toggler.setAttribute('aria-expanded', 
                    collapse.classList.contains('show'));
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!toggler.contains(e.target) && !collapse.contains(e.target)) {
                    collapse.classList.remove('show');
                    toggler.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close menu when clicking a link
            const navLinks = collapse.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < this.breakpoints.md) {
                        collapse.classList.remove('show');
                        toggler.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }
    }

    /**
     * Optimize for touch devices
     */
    optimizeForTouch() {
        if (!this.isTouch) return;
        
        // Remove hover effects on touch devices
        const style = document.createElement('style');
        style.textContent = `
            @media (hover: none) and (pointer: coarse) {
                *:hover {
                    /* Hover effects disabled */
                }
            }
        `;
        document.head.appendChild(style);
        
        // Add touch event handlers
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // Prevent double-tap zoom on buttons
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.click();
            }, { passive: false });
        });
    }

    /**
     * Handle viewport height for mobile browsers
     */
    handleViewportHeight() {
        // Fix for mobile browsers (address bar)
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    /**
     * Setup mobile scroll handler
     */
    setupMobileScrollHandler() {
        let lastScrollTop = 0;
        const navbar = document.querySelector('.navbar');
        
        if (!navbar) return;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                navbar.classList.add('navbar-hidden');
            } else {
                // Scrolling up
                navbar.classList.remove('navbar-hidden');
            }
            
            lastScrollTop = scrollTop;
        }, { passive: true });
    }

    /**
     * Trigger breakpoint change event
     * @param {string} oldBreakpoint - Previous breakpoint
     * @param {string} newBreakpoint - New breakpoint
     */
    triggerBreakpointChange(oldBreakpoint, newBreakpoint) {
        const event = new CustomEvent('breakpointChange', {
            detail: {
                old: oldBreakpoint,
                new: newBreakpoint,
                width: window.innerWidth
            }
        });
        window.dispatchEvent(event);
        
        Logger.debug('Breakpoint changed', {
            from: oldBreakpoint,
            to: newBreakpoint
        });
    }

    /**
     * Trigger orientation change event
     * @param {string} oldOrientation - Previous orientation
     * @param {string} newOrientation - New orientation
     */
    triggerOrientationChange(oldOrientation, newOrientation) {
        const event = new CustomEvent('orientationChange', {
            detail: {
                old: oldOrientation,
                new: newOrientation
            }
        });
        window.dispatchEvent(event);
        
        Logger.debug('Orientation changed', {
            from: oldOrientation,
            to: newOrientation
        });
    }

    /**
     * Check if current breakpoint matches
     * @param {string} breakpoint - Breakpoint to check
     * @returns {boolean} Whether breakpoint matches
     */
    is(breakpoint) {
        return this.currentBreakpoint === breakpoint;
    }

    /**
     * Check if current breakpoint is at least the specified size
     * @param {string} breakpoint - Minimum breakpoint
     * @returns {boolean} Whether breakpoint is met
     */
    isAtLeast(breakpoint) {
        const current = this.breakpoints[this.currentBreakpoint];
        const target = this.breakpoints[breakpoint];
        return current >= target;
    }

    /**
     * Check if current breakpoint is at most the specified size
     * @param {string} breakpoint - Maximum breakpoint
     * @returns {boolean} Whether breakpoint is met
     */
    isAtMost(breakpoint) {
        const current = this.breakpoints[this.currentBreakpoint];
        const target = this.breakpoints[breakpoint];
        return current <= target;
    }

    /**
     * Get device information
     * @returns {Object} Device information
     */
    getDeviceInfo() {
        return {
            breakpoint: this.currentBreakpoint,
            isTouch: this.isTouch,
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isDesktop: this.isDesktop,
            orientation: this.orientation,
            width: window.innerWidth,
            height: window.innerHeight,
            userAgent: navigator.userAgent
        };
    }

    /**
     * Make element responsive
     * @param {HTMLElement} element - Element to make responsive
     * @param {Object} config - Responsive configuration
     */
    makeResponsive(element, config) {
        const applyStyles = () => {
            const breakpoint = this.currentBreakpoint;
            const styles = config[breakpoint] || config.default || {};
            
            Object.keys(styles).forEach(property => {
                element.style[property] = styles[property];
            });
        };
        
        // Apply initial styles
        applyStyles();
        
        // Update on breakpoint change
        window.addEventListener('breakpointChange', applyStyles);
    }

    /**
     * Create responsive image
     * @param {HTMLImageElement} img - Image element
     * @param {Object} sources - Source URLs for different breakpoints
     */
    makeImageResponsive(img, sources) {
        const updateImage = () => {
            const breakpoint = this.currentBreakpoint;
            const src = sources[breakpoint] || sources.default;
            
            if (src && img.src !== src) {
                img.src = src;
            }
        };
        
        // Update initial image
        updateImage();
        
        // Update on breakpoint change
        window.addEventListener('breakpointChange', updateImage);
    }

    /**
     * Handle responsive tables
     */
    makeTablesResponsive() {
        const tables = document.querySelectorAll('table:not(.table-responsive table)');
        
        tables.forEach(table => {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }

    /**
     * Optimize images for current device
     */
    optimizeImages() {
        const images = document.querySelectorAll('img[data-src-mobile], img[data-src-tablet], img[data-src-desktop]');
        
        images.forEach(img => {
            let src;
            
            if (this.isMobile && img.dataset.srcMobile) {
                src = img.dataset.srcMobile;
            } else if (this.isTablet && img.dataset.srcTablet) {
                src = img.dataset.srcTablet;
            } else if (img.dataset.srcDesktop) {
                src = img.dataset.srcDesktop;
            }
            
            if (src && img.src !== src) {
                img.src = src;
            }
        });
    }

    /**
     * Add responsive classes to elements
     */
    addResponsiveClasses() {
        // Add responsive utility classes based on current breakpoint
        const elements = document.querySelectorAll('[data-responsive]');
        
        elements.forEach(element => {
            const config = JSON.parse(element.dataset.responsive);
            const classes = config[this.currentBreakpoint] || config.default || [];
            
            // Remove old classes
            Object.keys(config).forEach(bp => {
                if (bp !== this.currentBreakpoint && bp !== 'default') {
                    const oldClasses = config[bp] || [];
                    element.classList.remove(...oldClasses);
                }
            });
            
            // Add new classes
            element.classList.add(...classes);
        });
    }

    /**
     * Generate responsive test report
     * @returns {Object} Test report
     */
    generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            device: this.getDeviceInfo(),
            breakpoints: this.breakpoints,
            tests: []
        };
        
        // Test viewport
        report.tests.push({
            name: 'Viewport Meta Tag',
            passed: document.querySelector('meta[name="viewport"]') !== null,
            message: 'Viewport meta tag should be present'
        });
        
        // Test responsive containers
        const containers = document.querySelectorAll('.container, .container-fluid');
        report.tests.push({
            name: 'Responsive Containers',
            passed: containers.length > 0,
            message: `Found ${containers.length} responsive containers`
        });
        
        // Test responsive grid
        const rows = document.querySelectorAll('.row');
        report.tests.push({
            name: 'Responsive Grid',
            passed: rows.length > 0,
            message: `Found ${rows.length} grid rows`
        });
        
        // Test mobile menu
        const mobileMenu = document.querySelector('.navbar-toggler');
        report.tests.push({
            name: 'Mobile Menu',
            passed: mobileMenu !== null,
            message: 'Mobile menu toggle should be present'
        });
        
        // Test touch optimization
        report.tests.push({
            name: 'Touch Optimization',
            passed: this.isTouch ? document.body.classList.contains('is-touch') : true,
            message: 'Touch optimization should be applied on touch devices'
        });
        
        // Calculate score
        const passedTests = report.tests.filter(t => t.passed).length;
        report.score = Math.round((passedTests / report.tests.length) * 100);
        
        return report;
    }
}

// Initialize responsive manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ResponsiveManager = new ResponsiveManager();
    });
} else {
    window.ResponsiveManager = new ResponsiveManager();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveManager;
}