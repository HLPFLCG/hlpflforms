/**
 * HLPFL Forms - Browser Compatibility Test Suite
 * Tests browser compatibility across different browsers and versions
 * 
 * Test Categories:
 * 1. Browser Detection
 * 2. Feature Detection
 * 3. CSS Compatibility
 * 4. JavaScript Compatibility
 * 5. DOM Compatibility
 * 6. ES6+ Features
 * 7. Polyfills
 * 8. Browser-Specific Fixes
 * 9. Performance
 * 10. Overall Compatibility
 */

class BrowserCompatibilityTests {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
    }

    /**
     * Run all browser compatibility tests
     * @returns {Object} Test results
     */
    async runAll() {
        console.log('🎯 Starting Browser Compatibility Test Suite...\n');
        
        await this.testBrowserDetection();
        await this.testFeatureDetection();
        await this.testCSSCompatibility();
        await this.testJavaScriptCompatibility();
        await this.testDOMCompatibility();
        await this.testES6Features();
        await this.testPolyfills();
        await this.testBrowserFixes();
        await this.testPerformance();
        await this.testOverallCompatibility();
        
        this.printResults();
        return this.results;
    }

    /**
     * Test browser detection
     */
    async testBrowserDetection() {
        console.log('📋 Testing Browser Detection...');
        
        if (!window.BrowserCompatibilityManager) {
            this.assert('BrowserCompatibilityManager exists', false, 'Manager not initialized');
            return;
        }
        
        const bcm = window.BrowserCompatibilityManager;
        
        // Test 1: Browser detected
        this.assert(
            'Browser detected',
            bcm.browser !== null && bcm.browser !== 'Unknown',
            `Detected: ${bcm.browser}`
        );
        
        // Test 2: Version detected
        this.assert(
            'Browser version detected',
            bcm.version !== null && bcm.version !== 'Unknown',
            `Version: ${bcm.version}`
        );
        
        // Test 3: Engine detected
        this.assert(
            'Browser engine detected',
            bcm.engine !== null && bcm.engine !== 'Unknown',
            `Engine: ${bcm.engine}`
        );
        
        // Test 4: OS detected
        this.assert(
            'Operating system detected',
            bcm.os !== null && bcm.os !== 'Unknown',
            `OS: ${bcm.os}`
        );
        
        // Test 5: Body has browser class
        this.assert(
            'Body has browser class',
            document.body.classList.contains(`browser-${bcm.browser.toLowerCase()}`),
            'Browser class should be added to body'
        );
    }

    /**
     * Test feature detection
     */
    async testFeatureDetection() {
        console.log('📋 Testing Feature Detection...');
        
        if (!window.BrowserCompatibilityManager) return;
        
        const bcm = window.BrowserCompatibilityManager;
        const features = bcm.features;
        
        // Test CSS features
        this.assert(
            'CSS Flexbox detected',
            typeof features.cssFlexbox === 'boolean',
            `Flexbox: ${features.cssFlexbox}`
        );
        
        this.assert(
            'CSS Grid detected',
            typeof features.cssGrid === 'boolean',
            `Grid: ${features.cssGrid}`
        );
        
        this.assert(
            'CSS Variables detected',
            typeof features.cssVariables === 'boolean',
            `Variables: ${features.cssVariables}`
        );
        
        // Test JavaScript features
        this.assert(
            'Promises detected',
            typeof features.promises === 'boolean',
            `Promises: ${features.promises}`
        );
        
        this.assert(
            'Fetch API detected',
            typeof features.fetch === 'boolean',
            `Fetch: ${features.fetch}`
        );
        
        this.assert(
            'LocalStorage detected',
            typeof features.localStorage === 'boolean',
            `LocalStorage: ${features.localStorage}`
        );
    }

    /**
     * Test CSS compatibility
     */
    async testCSSCompatibility() {
        console.log('📋 Testing CSS Compatibility...');
        
        if (!window.BrowserCompatibilityManager) return;
        
        const bcm = window.BrowserCompatibilityManager;
        
        // Test 1: Flexbox support
        this.assert(
            'Flexbox supported',
            bcm.features.cssFlexbox,
            'Flexbox is required for layout',
            bcm.features.cssFlexbox ? 'pass' : 'fail'
        );
        
        // Test 2: Grid support
        this.assert(
            'CSS Grid supported',
            bcm.features.cssGrid,
            'Grid enhances layout capabilities',
            bcm.features.cssGrid ? 'pass' : 'warning'
        );
        
        // Test 3: CSS Variables support
        this.assert(
            'CSS Variables supported',
            bcm.features.cssVariables,
            'Variables enable theming',
            bcm.features.cssVariables ? 'pass' : 'warning'
        );
        
        // Test 4: Transforms support
        this.assert(
            'CSS Transforms supported',
            bcm.features.cssTransforms,
            'Transforms enable animations',
            bcm.features.cssTransforms ? 'pass' : 'warning'
        );
        
        // Test 5: Transitions support
        this.assert(
            'CSS Transitions supported',
            bcm.features.cssTransitions,
            'Transitions enable smooth effects',
            bcm.features.cssTransitions ? 'pass' : 'warning'
        );
    }

    /**
     * Test JavaScript compatibility
     */
    async testJavaScriptCompatibility() {
        console.log('📋 Testing JavaScript Compatibility...');
        
        if (!window.BrowserCompatibilityManager) return;
        
        const bcm = window.BrowserCompatibilityManager;
        
        // Test 1: Promises
        this.assert(
            'Promises supported',
            bcm.features.promises,
            'Promises are required for async operations',
            bcm.features.promises ? 'pass' : 'fail'
        );
        
        // Test 2: Fetch API
        this.assert(
            'Fetch API supported',
            bcm.features.fetch,
            'Fetch is used for network requests',
            bcm.features.fetch ? 'pass' : 'warning'
        );
        
        // Test 3: Arrow functions
        this.assert(
            'Arrow functions supported',
            bcm.features.arrow,
            'Arrow functions are used throughout',
            bcm.features.arrow ? 'pass' : 'warning'
        );
        
        // Test 4: Classes
        this.assert(
            'ES6 Classes supported',
            bcm.features.classes,
            'Classes are used for components',
            bcm.features.classes ? 'pass' : 'warning'
        );
        
        // Test 5: Template literals
        this.assert(
            'Template literals supported',
            bcm.features.templateLiterals,
            'Template literals are used for strings',
            bcm.features.templateLiterals ? 'pass' : 'warning'
        );
    }

    /**
     * Test DOM compatibility
     */
    async testDOMCompatibility() {
        console.log('📋 Testing DOM Compatibility...');
        
        if (!window.BrowserCompatibilityManager) return;
        
        const bcm = window.BrowserCompatibilityManager;
        
        // Test 1: querySelector
        this.assert(
            'querySelector supported',
            bcm.features.querySelector,
            'querySelector is required for DOM manipulation',
            bcm.features.querySelector ? 'pass' : 'fail'
        );
        
        // Test 2: classList
        this.assert(
            'classList supported',
            bcm.features.classList,
            'classList is used for class manipulation',
            bcm.features.classList ? 'pass' : 'warning'
        );
        
        // Test 3: dataset
        this.assert(
            'dataset supported',
            bcm.features.dataset,
            'dataset is used for data attributes',
            bcm.features.dataset ? 'pass' : 'warning'
        );
    }

    /**
     * Test ES6+ features
     */
    async testES6Features() {
        console.log('📋 Testing ES6+ Features...');
        
        if (!window.BrowserCompatibilityManager) return;
        
        const bcm = window.BrowserCompatibilityManager;
        
        // Test 1: Destructuring
        this.assert(
            'Destructuring supported',
            bcm.features.destructuring,
            'Destructuring is used in code',
            bcm.features.destructuring ? 'pass' : 'warning'
        );
        
        // Test 2: Spread operator
        this.assert(
            'Spread operator supported',
            bcm.features.spread,
            'Spread operator is used in code',
            bcm.features.spread ? 'pass' : 'warning'
        );
        
        // Test 3: Async/await
        this.assert(
            'Async/await supported',
            bcm.features.asyncAwait,
            'Async/await is used for async operations',
            bcm.features.asyncAwait ? 'pass' : 'warning'
        );
    }

    /**
     * Test polyfills
     */
    async testPolyfills() {
        console.log('📋 Testing Polyfills...');
        
        // Test 1: Promise polyfill
        this.assert(
            'Promise available',
            typeof Promise !== 'undefined',
            'Promise should be available (native or polyfilled)'
        );
        
        // Test 2: Fetch polyfill
        this.assert(
            'Fetch available',
            typeof fetch !== 'undefined',
            'Fetch should be available (native or polyfilled)'
        );
        
        // Test 3: Object.assign
        this.assert(
            'Object.assign available',
            typeof Object.assign === 'function',
            'Object.assign should be available'
        );
        
        // Test 4: Array.from
        this.assert(
            'Array.from available',
            typeof Array.from === 'function',
            'Array.from should be available'
        );
        
        // Test 5: Array.includes
        this.assert(
            'Array.includes available',
            typeof Array.prototype.includes === 'function',
            'Array.includes should be available'
        );
    }

    /**
     * Test browser-specific fixes
     */
    async testBrowserFixes() {
        console.log('📋 Testing Browser-Specific Fixes...');
        
        if (!window.BrowserCompatibilityManager) return;
        
        const bcm = window.BrowserCompatibilityManager;
        
        // Test 1: Browser class applied
        this.assert(
            'Browser-specific class applied',
            document.body.className.includes('browser-'),
            'Browser class should be on body'
        );
        
        // Test 2: No critical issues
        this.assert(
            'No critical compatibility issues',
            bcm.issues.length < 5,
            `Found ${bcm.issues.length} issues`,
            bcm.issues.length < 5 ? 'pass' : 'warning'
        );
    }

    /**
     * Test performance
     */
    async testPerformance() {
        console.log('📋 Testing Performance...');
        
        if (!window.BrowserCompatibilityManager) return;
        
        const bcm = window.BrowserCompatibilityManager;
        
        // Test 1: Initialization time
        const startTime = performance.now();
        bcm.detectBrowser();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.assert(
            'Browser detection is fast',
            duration < 10,
            `Detection took ${duration.toFixed(2)}ms`,
            duration < 10 ? 'pass' : 'warning'
        );
        
        // Test 2: Feature detection time
        const startTime2 = performance.now();
        bcm.detectFeatures();
        const endTime2 = performance.now();
        const duration2 = endTime2 - startTime2;
        
        this.assert(
            'Feature detection is fast',
            duration2 < 50,
            `Detection took ${duration2.toFixed(2)}ms`,
            duration2 < 50 ? 'pass' : 'warning'
        );
    }

    /**
     * Test overall compatibility
     */
    async testOverallCompatibility() {
        console.log('📋 Testing Overall Compatibility...');
        
        if (!window.BrowserCompatibilityManager) return;
        
        const bcm = window.BrowserCompatibilityManager;
        
        // Test 1: Browser is supported
        this.assert(
            'Browser is supported',
            bcm.isSupported(),
            'Browser meets minimum requirements',
            bcm.isSupported() ? 'pass' : 'fail'
        );
        
        // Test 2: Compatibility score
        const score = bcm.getCompatibilityScore();
        this.assert(
            'Compatibility score is good',
            score >= 70,
            `Score: ${score}%`,
            score >= 90 ? 'pass' : score >= 70 ? 'warning' : 'fail'
        );
        
        // Test 3: Generate report
        const report = bcm.generateCompatibilityReport();
        this.assert(
            'Compatibility report generated',
            report !== null && typeof report === 'object',
            'Report should contain browser info and features'
        );
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
        console.log('📊 BROWSER COMPATIBILITY TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        console.log(`📋 Total Tests: ${this.results.tests.length}`);
        
        const score = Math.round((this.results.passed / this.results.tests.length) * 100);
        console.log(`\n🎯 Browser Compatibility Score: ${score}%`);
        
        if (score >= 90) {
            console.log('🌟 Excellent! Fully compatible');
        } else if (score >= 75) {
            console.log('👍 Good! Minor compatibility issues');
        } else if (score >= 60) {
            console.log('⚠️  Fair. Several compatibility issues');
        } else {
            console.log('❌ Poor. Significant compatibility issues');
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
        
        const browserInfo = window.BrowserCompatibilityManager ? 
            window.BrowserCompatibilityManager.getBrowserInfo() : {};
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser Compatibility Test Report - HLPFL Forms</title>
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
        .browser-info {
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
        <h1>🌐 Browser Compatibility Test Report</h1>
        <p>HLPFL Forms - Cross-Browser Compatibility</p>
        <div class="score">${score}%</div>
        <div class="grade">Grade: ${grade}</div>
    </div>
    
    <div class="browser-info">
        <h2>Browser Information</h2>
        <p><strong>Browser:</strong> ${browserInfo.browser || 'Unknown'} ${browserInfo.version || ''}</p>
        <p><strong>Engine:</strong> ${browserInfo.engine || 'Unknown'}</p>
        <p><strong>OS:</strong> ${browserInfo.os || 'Unknown'}</p>
        <p><strong>User Agent:</strong> ${browserInfo.userAgent || 'Unknown'}</p>
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
    window.BrowserCompatibilityTests = BrowserCompatibilityTests;
}