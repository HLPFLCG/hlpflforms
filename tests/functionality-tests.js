/**
 * Comprehensive Functionality Tests for HLPFL Forms
 * Tests all features systematically to ensure everything works
 */

class FunctionalityTester {
    constructor() {
        this.logger = new Logger('FunctionalityTester');
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Starting Comprehensive Functionality Tests...\n');
        
        await this.testAuthentication();
        await this.testAPIClient();
        await this.testValidation();
        await this.testToastNotifications();
        await this.testLoadingStates();
        await this.testUtilities();
        await this.testLogger();
        
        this.printResults();
    }

    /**
     * Test Authentication System
     */
    async testAuthentication() {
        console.log('🔐 Testing Authentication System...');
        
        try {
            // Test 1: AuthManager exists
            this.assert(typeof window.authManager !== 'undefined', 'AuthManager is initialized');
            
            // Test 2: Token management
            authManager.setToken('test_token_123', false);
            this.assert(authManager.getToken() === 'test_token_123', 'Token storage works');
            
            // Test 3: User management
            const testUser = { id: 1, username: 'testuser', email: 'test@example.com' };
            authManager.setUser(testUser);
            const retrievedUser = authManager.getUser();
            this.assert(retrievedUser.username === 'testuser', 'User storage works');
            
            // Test 4: Permission checking
            this.assert(typeof authManager.hasPermission === 'function', 'Permission checking available');
            
            // Test 5: Role checking
            this.assert(typeof authManager.hasRole === 'function', 'Role checking available');
            
            console.log('✅ Authentication tests passed\n');
        } catch (error) {
            this.fail('Authentication', error.message);
        }
    }

    /**
     * Test API Client
     */
    async testAPIClient() {
        console.log('🌐 Testing API Client...');
        
        try {
            // Test 1: API Client exists
            this.assert(typeof window.apiClient !== 'undefined', 'API Client is initialized');
            
            // Test 2: Token management
            this.assert(typeof apiClient.getAuthToken === 'function', 'Token management available');
            
            // Test 3: HTTP methods available
            this.assert(typeof apiClient.get === 'function', 'GET method available');
            this.assert(typeof apiClient.post === 'function', 'POST method available');
            this.assert(typeof apiClient.put === 'function', 'PUT method available');
            this.assert(typeof apiClient.delete === 'function', 'DELETE method available');
            
            // Test 4: File upload support
            this.assert(typeof apiClient.uploadFile === 'function', 'File upload available');
            
            // Test 5: Retry logic
            this.assert(apiClient.maxRetries > 0, 'Retry logic configured');
            
            console.log('✅ API Client tests passed\n');
        } catch (error) {
            this.fail('API Client', error.message);
        }
    }

    /**
     * Test Validation System
     */
    async testValidation() {
        console.log('✅ Testing Validation System...');
        
        try {
            // Test 1: Validator exists
            this.assert(typeof window.validator !== 'undefined', 'Validator is initialized');
            
            // Test 2: Email validation
            this.assert(validator.isValidEmail('test@example.com'), 'Valid email accepted');
            this.assert(!validator.isValidEmail('invalid-email'), 'Invalid email rejected');
            
            // Test 3: URL validation
            this.assert(validator.isValidURL('https://example.com'), 'Valid URL accepted');
            this.assert(!validator.isValidURL('not-a-url'), 'Invalid URL rejected');
            
            // Test 4: Phone validation
            this.assert(validator.isValidPhone('1234567890'), 'Valid phone accepted');
            this.assert(!validator.isValidPhone('123'), 'Invalid phone rejected');
            
            // Test 5: Password validation
            const passwordResult = validator.validatePassword('Test123!@#');
            this.assert(passwordResult.isValid, 'Strong password accepted');
            
            const weakPassword = validator.validatePassword('weak');
            this.assert(!weakPassword.isValid, 'Weak password rejected');
            
            // Test 6: XSS sanitization
            const sanitized = validator.sanitizeHTML('<script>alert("xss")</script>');
            this.assert(!sanitized.includes('<script>'), 'XSS attack prevented');
            
            // Test 7: Form validation
            const formData = {
                email: 'test@example.com',
                password: 'Test123!@#'
            };
            const rules = {
                email: { required: true, email: true },
                password: { required: true, minLength: 8 }
            };
            const result = validator.validateForm(formData, rules);
            this.assert(result.isValid, 'Form validation works');
            
            console.log('✅ Validation tests passed\n');
        } catch (error) {
            this.fail('Validation', error.message);
        }
    }

    /**
     * Test Toast Notifications
     */
    async testToastNotifications() {
        console.log('🍞 Testing Toast Notifications...');
        
        try {
            // Test 1: Toast manager exists
            this.assert(typeof window.toast !== 'undefined', 'Toast manager is initialized');
            
            // Test 2: Toast methods available
            this.assert(typeof toast.success === 'function', 'Success toast available');
            this.assert(typeof toast.error === 'function', 'Error toast available');
            this.assert(typeof toast.warning === 'function', 'Warning toast available');
            this.assert(typeof toast.info === 'function', 'Info toast available');
            
            // Test 3: Container exists
            this.assert(toast.container !== null, 'Toast container created');
            
            // Test 4: Max toasts limit
            this.assert(toast.maxToasts === 5, 'Max toasts limit set');
            
            console.log('✅ Toast notification tests passed\n');
        } catch (error) {
            this.fail('Toast Notifications', error.message);
        }
    }

    /**
     * Test Loading States
     */
    async testLoadingStates() {
        console.log('⏳ Testing Loading States...');
        
        try {
            // Test 1: Loading manager exists
            this.assert(typeof window.loadingManager !== 'undefined', 'Loading manager is initialized');
            
            // Test 2: Overlay methods
            this.assert(typeof loadingManager.showOverlay === 'function', 'Show overlay available');
            this.assert(typeof loadingManager.hideOverlay === 'function', 'Hide overlay available');
            
            // Test 3: Element loading
            this.assert(typeof loadingManager.showElementLoading === 'function', 'Element loading available');
            this.assert(typeof loadingManager.hideElementLoading === 'function', 'Hide element loading available');
            
            // Test 4: Skeleton loading
            this.assert(typeof loadingManager.showSkeleton === 'function', 'Skeleton loading available');
            
            // Test 5: Button loading
            this.assert(typeof loadingManager.showButtonLoading === 'function', 'Button loading available');
            this.assert(typeof loadingManager.hideButtonLoading === 'function', 'Hide button loading available');
            
            // Test 6: Progress bar
            this.assert(typeof loadingManager.createProgressBar === 'function', 'Progress bar available');
            
            // Test 7: Async wrapper
            this.assert(typeof loadingManager.withLoading === 'function', 'Async wrapper available');
            
            console.log('✅ Loading state tests passed\n');
        } catch (error) {
            this.fail('Loading States', error.message);
        }
    }

    /**
     * Test Utilities
     */
    async testUtilities() {
        console.log('🔧 Testing Utilities...');
        
        try {
            // Test 1: Utils exists
            this.assert(typeof window.Utils !== 'undefined', 'Utils is initialized');
            
            // Test 2: Debounce
            this.assert(typeof Utils.debounce === 'function', 'Debounce available');
            
            // Test 3: Throttle
            this.assert(typeof Utils.throttle === 'function', 'Throttle available');
            
            // Test 4: Date formatting
            const formatted = Utils.formatDate(new Date(), 'short');
            this.assert(typeof formatted === 'string', 'Date formatting works');
            
            // Test 5: Number formatting
            const formatted2 = Utils.formatNumber(1000000);
            this.assert(formatted2.includes(','), 'Number formatting works');
            
            // Test 6: Byte formatting
            const bytes = Utils.formatBytes(1024);
            this.assert(bytes.includes('KB'), 'Byte formatting works');
            
            // Test 7: ID generation
            const id = Utils.generateId('test');
            this.assert(id.startsWith('test_'), 'ID generation works');
            
            // Test 8: Deep clone
            const obj = { a: 1, b: { c: 2 } };
            const cloned = Utils.deepClone(obj);
            this.assert(cloned.b.c === 2, 'Deep clone works');
            
            // Test 9: Capitalize
            this.assert(Utils.capitalize('hello') === 'Hello', 'Capitalize works');
            
            // Test 10: Truncate
            const truncated = Utils.truncate('Hello World', 5);
            this.assert(truncated.includes('...'), 'Truncate works');
            
            // Test 11: Device detection
            const deviceType = Utils.getDeviceType();
            this.assert(['mobile', 'tablet', 'desktop'].includes(deviceType), 'Device detection works');
            
            console.log('✅ Utility tests passed\n');
        } catch (error) {
            this.fail('Utilities', error.message);
        }
    }

    /**
     * Test Logger
     */
    async testLogger() {
        console.log('📝 Testing Logger...');
        
        try {
            // Test 1: Logger class exists
            this.assert(typeof window.Logger !== 'undefined', 'Logger class available');
            
            // Test 2: Create logger instance
            const testLogger = new Logger('TestContext');
            this.assert(testLogger.context === 'TestContext', 'Logger context set');
            
            // Test 3: Log methods available
            this.assert(typeof testLogger.debug === 'function', 'Debug method available');
            this.assert(typeof testLogger.info === 'function', 'Info method available');
            this.assert(typeof testLogger.warn === 'function', 'Warn method available');
            this.assert(typeof testLogger.error === 'function', 'Error method available');
            this.assert(typeof testLogger.critical === 'function', 'Critical method available');
            
            // Test 4: Log storage
            testLogger.info('Test message');
            const logs = testLogger.getLogs();
            this.assert(logs.length > 0, 'Logs are stored');
            
            // Test 5: Log export
            const exported = testLogger.exportLogs();
            this.assert(typeof exported === 'string', 'Log export works');
            
            console.log('✅ Logger tests passed\n');
        } catch (error) {
            this.fail('Logger', error.message);
        }
    }

    /**
     * Assert helper
     */
    assert(condition, message) {
        if (condition) {
            this.results.passed.push(message);
            console.log(`  ✓ ${message}`);
        } else {
            this.results.failed.push(message);
            console.log(`  ✗ ${message}`);
            throw new Error(message);
        }
    }

    /**
     * Fail helper
     */
    fail(category, message) {
        this.results.failed.push(`${category}: ${message}`);
        console.log(`❌ ${category} tests failed: ${message}\n`);
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.results.passed.length}`);
        console.log(`❌ Failed: ${this.results.failed.length}`);
        console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
        console.log('='.repeat(60));
        
        if (this.results.failed.length > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.failed.forEach(test => console.log(`  - ${test}`));
        }
        
        if (this.results.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            this.results.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        
        const successRate = (this.results.passed.length / (this.results.passed.length + this.results.failed.length) * 100).toFixed(2);
        console.log(`\n📈 Success Rate: ${successRate}%`);
        
        if (this.results.failed.length === 0) {
            console.log('\n🎉 ALL TESTS PASSED! 🎉');
        }
    }
}

// Auto-run tests when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const tester = new FunctionalityTester();
        tester.runAllTests();
    });
} else {
    const tester = new FunctionalityTester();
    tester.runAllTests();
}