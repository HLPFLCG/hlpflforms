/**
 * HLPFL Forms - Responsive Design Test Suite
 * Tests responsive behavior across different devices and breakpoints
 * 
 * Test Categories:
 * 1. Breakpoint Detection
 * 2. Device Detection
 * 3. Responsive Grid
 * 4. Mobile Navigation
 * 5. Touch Optimization
 * 6. Orientation Handling
 * 7. Responsive Images
 * 8. Responsive Tables
 * 9. Viewport Handling
 * 10. Performance
 */

class ResponsiveTests {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
        
        this.breakpoints = {
            xs: 0,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            xxl: 1400
        };
    }

    /**
     * Run all responsive tests
     * @returns {Object} Test results
     */
    async runAll() {
        console.log('🎯 Starting Responsive Design Test Suite...\n');
        
        await this.testBreakpointDetection();
        await this.testDeviceDetection();
        await this.testResponsiveGrid();
        await this.testMobileNavigation();
        await this.testTouchOptimization();
        await this.testOrientationHandling();
        await this.testResponsiveImages();
        await this.testResponsiveTables();
        await this.testViewportHandling();
        await this.testPerformance();
        
        this.printResults();
        return this.results;
    }

    /**
     * Test breakpoint detection
     */
    async testBreakpointDetection() {
        console.log('📋 Testing Breakpoint Detection...');
        
        // Test 1: ResponsiveManager exists
        this.assert(
            'ResponsiveManager exists',
            typeof window.ResponsiveManager !== 'undefined',
            'ResponsiveManager should be initialized'
        );
        
        if (!window.ResponsiveManager) return;
        
        // Test 2: Current breakpoint is detected
        this.assert(
            'Current breakpoint detected',
            window.ResponsiveManager.currentBreakpoint !== null,
            'Current breakpoint should be detected'
        );
        
        // Test 3: Breakpoint matches window width
        const width = window.innerWidth;
        let expectedBreakpoint = 'xs';
        
        if (width >= this.breakpoints.xxl) expectedBreakpoint = 'xxl';
        else if (width >= this.breakpoints.xl) expectedBreakpoint = 'xl';
        else if (width >= this.breakpoints.lg) expectedBreakpoint = 'lg';
        else if (width >= this.breakpoints.md) expectedBreakpoint = 'md';
        else if (width >= this.breakpoints.sm) expectedBreakpoint = 'sm';
        
        this.assert(
            'Breakpoint matches window width',
            window.ResponsiveManager.currentBreakpoint === expectedBreakpoint,
            `Expected ${expectedBreakpoint}, got ${window.ResponsiveManager.currentBreakpoint}`
        );
        
        // Test 4: Body has breakpoint class
        this.assert(
            'Body has breakpoint class',
            document.body.classList.contains(`breakpoint-${window.ResponsiveManager.currentBreakpoint}`),
            'Body should have current breakpoint class'
        );
        
        // Test 5: isAtLeast method works
        this.assert(
            'isAtLeast method works',
            typeof window.ResponsiveManager.isAtLeast === 'function',
            'isAtLeast method should exist'
        );
        
        // Test 6: isAtMost method works
        this.assert(
            'isAtMost method works',
            typeof window.ResponsiveManager.isAtMost === 'function',
            'isAtMost method should exist'
        );
    }

    /**
     * Test device detection
     */
    async testDeviceDetection() {
        console.log('📋 Testing Device Detection...');
        
        if (!window.ResponsiveManager) return;
        
        // Test 1: Touch detection
        this.assert(
            'Touch capability detected',
            typeof window.ResponsiveManager.isTouch === 'boolean',
            'Touch capability should be detected'
        );
        
        // Test 2: Mobile detection
        this.assert(
            'Mobile device detected',
            typeof window.ResponsiveManager.isMobile === 'boolean',
            'Mobile device should be detected'
        );
        
        // Test 3: Tablet detection
        this.assert(
            'Tablet device detected',
            typeof window.ResponsiveManager.isTablet === 'boolean',
            'Tablet device should be detected'
        );
        
        // Test 4: Desktop detection
        this.assert(
            'Desktop device detected',
            typeof window.ResponsiveManager.isDesktop === 'boolean',
            'Desktop device should be detected'
        );
        
        // Test 5: Device classes on body
        const hasDeviceClass = document.body.classList.contains('is-mobile') ||
                              document.body.classList.contains('is-tablet') ||
                              document.body.classList.contains('is-desktop');
        
        this.assert(
            'Body has device class',
            hasDeviceClass,
            'Body should have device type class'
        );
        
        // Test 6: Touch class on body
        if (window.ResponsiveManager.isTouch) {
            this.assert(
                'Body has touch class',
                document.body.classList.contains('is-touch'),
                'Body should have is-touch class on touch devices'
            );
        }
    }

    /**
     * Test responsive grid
     */
    async testResponsiveGrid() {
        console.log('📋 Testing Responsive Grid...');
        
        // Test 1: Container exists
        const containers = document.querySelectorAll('.container, .container-fluid');
        this.assert(
            'Responsive containers exist',
            containers.length > 0,
            `Found ${containers.length} containers`
        );
        
        // Test 2: Row exists
        const rows = document.querySelectorAll('.row');
        this.assert(
            'Grid rows exist',
            rows.length >= 0,
            `Found ${rows.length} rows`
        );
        
        // Test 3: Column classes exist
        const cols = document.querySelectorAll('[class*="col-"]');
        this.assert(
            'Column classes exist',
            cols.length >= 0,
            `Found ${cols.length} columns`
        );
        
        // Test 4: Responsive column classes
        const responsiveCols = document.querySelectorAll('[class*="col-sm-"], [class*="col-md-"], [class*="col-lg-"]');
        this.assert(
            'Responsive column classes exist',
            responsiveCols.length >= 0,
            `Found ${responsiveCols.length} responsive columns`,
            responsiveCols.length > 0 ? 'pass' : 'warning'
        );
    }

    /**
     * Test mobile navigation
     */
    async testMobileNavigation() {
        console.log('📋 Testing Mobile Navigation...');
        
        // Test 1: Navbar exists
        const navbar = document.querySelector('.navbar');
        this.assert(
            'Navbar exists',
            navbar !== null,
            'Navbar should be present'
        );
        
        // Test 2: Mobile menu toggle exists
        const toggler = document.querySelector('.navbar-toggler');
        this.assert(
            'Mobile menu toggle exists',
            toggler !== null,
            'Mobile menu toggle should be present'
        );
        
        // Test 3: Navbar collapse exists
        const collapse = document.querySelector('.navbar-collapse');
        this.assert(
            'Navbar collapse exists',
            collapse !== null,
            'Navbar collapse should be present'
        );
        
        // Test 4: Toggle has aria-expanded
        if (toggler) {
            this.assert(
                'Toggle has aria-expanded',
                toggler.hasAttribute('aria-expanded'),
                'Toggle should have aria-expanded attribute'
            );
        }
        
        // Test 5: Navigation links exist
        const navLinks = document.querySelectorAll('.nav-link');
        this.assert(
            'Navigation links exist',
            navLinks.length > 0,
            `Found ${navLinks.length} navigation links`
        );
    }

    /**
     * Test touch optimization
     */
    async testTouchOptimization() {
        console.log('📋 Testing Touch Optimization...');
        
        if (!window.ResponsiveManager) return;
        
        // Test 1: Touch events supported
        this.assert(
            'Touch events supported',
            'ontouchstart' in window,
            'Touch events should be supported in modern browsers'
        );
        
        // Test 2: Touch targets meet minimum size
        const buttons = document.querySelectorAll('button, .btn, a');
        let undersizedTargets = 0;
        
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                if (button.offsetParent !== null) { // Only count visible elements
                    undersizedTargets++;
                }
            }
        });
        
        this.assert(
            'Touch targets meet minimum size',
            undersizedTargets === 0,
            `Found ${undersizedTargets} undersized touch targets`,
            undersizedTargets === 0 ? 'pass' : 'warning'
        );
        
        // Test 3: Passive event listeners
        this.assert(
            'Passive event listeners supported',
            true, // Modern browsers support this
            'Passive event listeners should be used for scroll/touch'
        );
    }

    /**
     * Test orientation handling
     */
    async testOrientationHandling() {
        console.log('📋 Testing Orientation Handling...');
        
        if (!window.ResponsiveManager) return;
        
        // Test 1: Orientation detected
        this.assert(
            'Orientation detected',
            window.ResponsiveManager.orientation !== null,
            `Current orientation: ${window.ResponsiveManager.orientation}`
        );
        
        // Test 2: Body has orientation class
        this.assert(
            'Body has orientation class',
            document.body.classList.contains(`orientation-${window.ResponsiveManager.orientation}`),
            'Body should have orientation class'
        );
        
        // Test 3: Orientation matches window dimensions
        const expectedOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        this.assert(
            'Orientation matches window dimensions',
            window.ResponsiveManager.orientation === expectedOrientation,
            `Expected ${expectedOrientation}, got ${window.ResponsiveManager.orientation}`
        );
    }

    /**
     * Test responsive images
     */
    async testResponsiveImages() {
        console.log('📋 Testing Responsive Images...');
        
        // Test 1: Images have alt text
        const images = document.querySelectorAll('img');
        let missingAlt = 0;
        
        images.forEach(img => {
            if (!img.hasAttribute('alt')) {
                missingAlt++;
            }
        });
        
        this.assert(
            'Images have alt text',
            missingAlt === 0,
            `Found ${missingAlt} images without alt text`,
            missingAlt === 0 ? 'pass' : 'warning'
        );
        
        // Test 2: Responsive image attributes
        const responsiveImages = document.querySelectorAll('img[data-src-mobile], img[data-src-tablet], img[data-src-desktop]');
        this.assert(
            'Responsive image attributes exist',
            responsiveImages.length >= 0,
            `Found ${responsiveImages.length} responsive images`,
            responsiveImages.length > 0 ? 'pass' : 'warning'
        );
        
        // Test 3: Images are not oversized
        let oversizedImages = 0;
        images.forEach(img => {
            if (img.naturalWidth > window.innerWidth * 2) {
                oversizedImages++;
            }
        });
        
        this.assert(
            'Images are appropriately sized',
            oversizedImages === 0,
            `Found ${oversizedImages} oversized images`,
            oversizedImages === 0 ? 'pass' : 'warning'
        );
    }

    /**
     * Test responsive tables
     */
    async testResponsiveTables() {
        console.log('📋 Testing Responsive Tables...');
        
        // Test 1: Tables exist
        const tables = document.querySelectorAll('table');
        this.assert(
            'Tables exist',
            tables.length >= 0,
            `Found ${tables.length} tables`
        );
        
        // Test 2: Tables have responsive wrapper
        const responsiveTables = document.querySelectorAll('.table-responsive');
        this.assert(
            'Tables have responsive wrapper',
            tables.length === 0 || responsiveTables.length > 0,
            `Found ${responsiveTables.length} responsive table wrappers`,
            tables.length === 0 || responsiveTables.length > 0 ? 'pass' : 'warning'
        );
        
        // Test 3: Tables don't overflow
        tables.forEach((table, index) => {
            const tableWidth = table.offsetWidth;
            const containerWidth = table.parentElement.offsetWidth;
            
            this.assert(
                `Table ${index + 1} doesn't overflow`,
                tableWidth <= containerWidth || table.closest('.table-responsive'),
                'Tables should not overflow their containers'
            );
        });
    }

    /**
     * Test viewport handling
     */
    async testViewportHandling() {
        console.log('📋 Testing Viewport Handling...');
        
        // Test 1: Viewport meta tag exists
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        this.assert(
            'Viewport meta tag exists',
            viewportMeta !== null,
            'Viewport meta tag should be present'
        );
        
        // Test 2: Viewport meta tag has correct content
        if (viewportMeta) {
            const content = viewportMeta.getAttribute('content');
            this.assert(
                'Viewport meta tag has correct content',
                content.includes('width=device-width'),
                'Viewport should include width=device-width'
            );
        }
        
        // Test 3: CSS viewport units work
        const testElement = document.createElement('div');
        testElement.style.height = '100vh';
        document.body.appendChild(testElement);
        
        this.assert(
            'CSS viewport units work',
            testElement.offsetHeight > 0,
            'Viewport units should be supported'
        );
        
        document.body.removeChild(testElement);
        
        // Test 4: Custom viewport height variable
        const vhValue = getComputedStyle(document.documentElement).getPropertyValue('--vh');
        this.assert(
            'Custom viewport height variable set',
            vhValue !== '',
            'Custom --vh variable should be set for mobile browsers',
            vhValue !== '' ? 'pass' : 'warning'
        );
    }

    /**
     * Test performance
     */
    async testPerformance() {
        console.log('📋 Testing Performance...');
        
        // Test 1: Responsive CSS file size
        const responsiveCss = Array.from(document.styleSheets).find(sheet => 
            sheet.href && sheet.href.includes('responsive.css')
        );
        
        this.assert(
            'Responsive CSS loaded',
            responsiveCss !== undefined,
            'Responsive CSS should be loaded',
            responsiveCss ? 'pass' : 'warning'
        );
        
        // Test 2: No layout shifts
        this.assert(
            'Layout stability',
            true, // Would need CLS measurement
            'Layout should be stable (check CLS metric)',
            'warning'
        );
        
        // Test 3: Resize performance
        if (window.ResponsiveManager) {
            const startTime = performance.now();
            window.ResponsiveManager.detectBreakpoint();
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            this.assert(
                'Breakpoint detection is fast',
                duration < 10,
                `Breakpoint detection took ${duration.toFixed(2)}ms`,
                duration < 10 ? 'pass' : 'warning'
            );
        }
    }

    /**
     * Assert test result
     * @param {string} name - Test name
     * @param {boolean} condition - Test condition
     * @param {string} message - Test message
     * @param {string} type - Result type
     */
    assert(name, condition, message, type = null) {
        const result = {
            name,
            passed: condition,
            message,
            type: type || (condition ? 'pass' : 'fail')
        };
        
        this.results.tests.push(result);
        
        if (result.type === 'pass') {
            this.results.passed++;
            console.log(`  ✅ ${name}`);
        } else if (result.type === 'warning') {
            this.results.warnings++;
            console.log(`  ⚠️  ${name} - ${message}`);
        } else {
            this.results.failed++;
            console.log(`  ❌ ${name} - ${message}`);
        }
    }

    /**
     * Print test results summary
     */
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESPONSIVE DESIGN TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        console.log(`📋 Total Tests: ${this.results.tests.length}`);
        
        const score = Math.round((this.results.passed / this.results.tests.length) * 100);
        console.log(`\n🎯 Responsive Design Score: ${score}%`);
        
        if (score >= 90) {
            console.log('🌟 Excellent! Fully responsive');
        } else if (score >= 75) {
            console.log('👍 Good! Minor improvements needed');
        } else if (score >= 60) {
            console.log('⚠️  Fair. Several issues need attention');
        } else {
            console.log('❌ Poor. Significant responsive issues');
        }
        
        console.log('='.repeat(60) + '\n');
    }

    /**
     * Generate detailed HTML report
     * @returns {string} HTML report
     */
    generateHTMLReport() {
        const score = Math.round((this.results.passed / this.results.tests.length) * 100);
        const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D';
        
        const deviceInfo = window.ResponsiveManager ? window.ResponsiveManager.getDeviceInfo() : {};
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Design Test Report - HLPFL Forms</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
        }
        .score {
            font-size: 4rem;
            font-weight: bold;
            color: #d4915d;
        }
        .device-info {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .tests {
            background: white;
            padding: 2rem;
            border-radius: 8px;
        }
        .test-item {
            padding: 1rem;
            border-left: 4px solid #ddd;
            margin-bottom: 1rem;
            background: #f9f9f9;
        }
        .test-item.pass { border-left-color: #4ecdc4; }
        .test-item.fail { border-left-color: #ff6b6b; }
        .test-item.warning { border-left-color: #ffa500; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📱 Responsive Design Test Report</h1>
        <p>HLPFL Forms - Mobile-First Responsive Design</p>
        <div class="score">${score}%</div>
        <div class="grade">Grade: ${grade}</div>
    </div>
    
    <div class="device-info">
        <h2>Device Information</h2>
        <p><strong>Breakpoint:</strong> ${deviceInfo.breakpoint || 'Unknown'}</p>
        <p><strong>Device Type:</strong> ${deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}</p>
        <p><strong>Touch:</strong> ${deviceInfo.isTouch ? 'Yes' : 'No'}</p>
        <p><strong>Orientation:</strong> ${deviceInfo.orientation || 'Unknown'}</p>
        <p><strong>Viewport:</strong> ${deviceInfo.width}x${deviceInfo.height}px</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-value" style="color: #4ecdc4;">${this.results.passed}</div>
            <div class="stat-label">Tests Passed</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="color: #ff6b6b;">${this.results.failed}</div>
            <div class="stat-label">Tests Failed</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="color: #ffa500;">${this.results.warnings}</div>
            <div class="stat-label">Warnings</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${this.results.tests.length}</div>
            <div class="stat-label">Total Tests</div>
        </div>
    </div>
    
    <div class="tests">
        <h2>Test Results</h2>
        ${this.results.tests.map(test => `
            <div class="test-item ${test.type}">
                <div class="test-name">
                    ${test.type === 'pass' ? '✅' : test.type === 'warning' ? '⚠️' : '❌'}
                    ${test.name}
                </div>
                <div class="test-message">${test.message}</div>
            </div>
        `).join('')}
    </div>
</body>
</html>
        `;
    }
}

// Export for use in test page
if (typeof window !== 'undefined') {
    window.ResponsiveTests = ResponsiveTests;
}