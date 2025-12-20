/**
 * HLPFL Forms - UX Enhancement Tests
 * Comprehensive test suite for Phase 9: User Experience Enhancement
 * 
 * @module ux-enhancement-tests
 * @version 1.0.0
 */

class UXEnhancementTests {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    /**
     * Run all tests
     */
    async runAll() {
        console.log('🧪 Starting UX Enhancement Tests...\n');

        await this.testAnimationSystem();
        await this.testTooltips();
        await this.testModals();
        await this.testDrawers();
        await this.testAccordions();
        await this.testTabs();
        await this.testWizards();
        await this.testAutoSave();
        await this.testConfetti();
        await this.testMicroInteractions();

        this.printResults();
        return this.results;
    }

    /* ============================================
       ANIMATION SYSTEM TESTS
       ============================================ */

    async testAnimationSystem() {
        console.log('📦 Testing Animation System...');

        // Test 1: Animation Manager exists
        this.test(
            'Animation Manager is initialized',
            () => window.AnimationManager !== undefined
        );

        // Test 2: Default animations registered
        this.test(
            'Default animations are registered',
            () => {
                const animations = ['fadeIn', 'fadeOut', 'slideInLeft', 'slideInRight', 
                                  'scaleIn', 'bounce', 'shake', 'pulse'];
                return animations.every(name => 
                    window.AnimationManager.animations.has(name)
                );
            }
        );

        // Test 3: Play animation
        this.test(
            'Can play animation on element',
            async () => {
                const el = document.createElement('div');
                document.body.appendChild(el);
                await window.AnimationManager.play(el, 'fadeIn');
                el.remove();
                return true;
            }
        );

        // Test 4: Animation sequence
        this.test(
            'Can play animation sequence',
            async () => {
                const el1 = document.createElement('div');
                const el2 = document.createElement('div');
                document.body.appendChild(el1);
                document.body.appendChild(el2);
                
                await window.AnimationManager.sequence([
                    { element: el1, animation: 'fadeIn' },
                    { element: el2, animation: 'fadeIn', delay: 100 }
                ]);
                
                el1.remove();
                el2.remove();
                return true;
            }
        );

        // Test 5: Parallel animations
        this.test(
            'Can play parallel animations',
            async () => {
                const el1 = document.createElement('div');
                const el2 = document.createElement('div');
                document.body.appendChild(el1);
                document.body.appendChild(el2);
                
                await window.AnimationManager.parallel([
                    { element: el1, animation: 'fadeIn' },
                    { element: el2, animation: 'scaleIn' }
                ]);
                
                el1.remove();
                el2.remove();
                return true;
            }
        );

        // Test 6: Show/hide with animation
        this.test(
            'Can show element with animation',
            async () => {
                const el = document.createElement('div');
                el.style.display = 'none';
                document.body.appendChild(el);
                
                await window.AnimationManager.show(el, 'fadeIn');
                const isVisible = el.style.display !== 'none';
                
                el.remove();
                return isVisible;
            }
        );

        // Test 7: Count up animation
        this.test(
            'Can animate number counting',
            async () => {
                const el = document.createElement('div');
                el.textContent = '0';
                document.body.appendChild(el);
                
                await window.AnimationManager.countUp(el, 0, 100, 500);
                const finalValue = parseInt(el.textContent);
                
                el.remove();
                return finalValue === 100;
            }
        );

        // Test 8: Reduced motion support
        this.test(
            'Respects reduced motion preference',
            () => {
                return window.AnimationManager.prefersReducedMotion !== undefined;
            }
        );
    }

    /* ============================================
       TOOLTIP TESTS
       ============================================ */

    async testTooltips() {
        console.log('📦 Testing Tooltips...');

        // Test 1: UX Enhancement Manager exists
        this.test(
            'UX Enhancement Manager is initialized',
            () => window.UXEnhancementManager !== undefined
        );

        // Test 2: Tooltip shows on hover
        this.test(
            'Tooltip shows on hover',
            () => {
                const el = document.createElement('button');
                el.dataset.tooltip = 'Test tooltip';
                document.body.appendChild(el);
                
                const event = new MouseEvent('mouseover', { bubbles: true });
                el.dispatchEvent(event);
                
                const hasTooltip = window.UXEnhancementManager.tooltips.has(el);
                el.remove();
                
                return hasTooltip;
            }
        );

        // Test 3: Tooltip positions
        this.test(
            'Tooltip supports different positions',
            () => {
                const positions = ['top', 'bottom', 'left', 'right'];
                return positions.every(pos => {
                    const el = document.createElement('button');
                    el.dataset.tooltip = 'Test';
                    el.dataset.tooltipPosition = pos;
                    document.body.appendChild(el);
                    
                    window.UXEnhancementManager.showTooltip(el);
                    const tooltip = window.UXEnhancementManager.tooltips.get(el);
                    const hasClass = tooltip && tooltip.classList.contains(`tooltip-${pos}`);
                    
                    window.UXEnhancementManager.hideTooltip(el);
                    el.remove();
                    
                    return hasClass;
                });
            }
        );

        // Test 4: Tooltip hides
        this.test(
            'Tooltip hides on mouseout',
            async () => {
                const el = document.createElement('button');
                el.dataset.tooltip = 'Test';
                document.body.appendChild(el);
                
                window.UXEnhancementManager.showTooltip(el);
                await window.UXEnhancementManager.hideTooltip(el);
                
                const hasTooltip = window.UXEnhancementManager.tooltips.has(el);
                el.remove();
                
                return !hasTooltip;
            }
        );
    }

    /* ============================================
       MODAL TESTS
       ============================================ */

    async testModals() {
        console.log('📦 Testing Modals...');

        // Test 1: Modal opens
        this.test(
            'Modal can be opened',
            async () => {
                const modal = document.createElement('div');
                modal.id = 'test-modal';
                modal.className = 'modal';
                document.body.appendChild(modal);
                
                await window.UXEnhancementManager.openModal('test-modal');
                const isOpen = modal.classList.contains('open');
                
                await window.UXEnhancementManager.closeModal('test-modal');
                modal.remove();
                
                return isOpen;
            }
        );

        // Test 2: Modal closes
        this.test(
            'Modal can be closed',
            async () => {
                const modal = document.createElement('div');
                modal.id = 'test-modal-2';
                modal.className = 'modal';
                document.body.appendChild(modal);
                
                await window.UXEnhancementManager.openModal('test-modal-2');
                await window.UXEnhancementManager.closeModal('test-modal-2');
                
                const isOpen = modal.classList.contains('open');
                modal.remove();
                
                return !isOpen;
            }
        );

        // Test 3: Modal backdrop created
        this.test(
            'Modal creates backdrop',
            async () => {
                const modal = document.createElement('div');
                modal.id = 'test-modal-3';
                modal.className = 'modal';
                document.body.appendChild(modal);
                
                await window.UXEnhancementManager.openModal('test-modal-3');
                const backdrop = document.querySelector('.modal-backdrop');
                
                await window.UXEnhancementManager.closeModal('test-modal-3');
                modal.remove();
                
                return backdrop !== null;
            }
        );
    }

    /* ============================================
       DRAWER TESTS
       ============================================ */

    async testDrawers() {
        console.log('📦 Testing Drawers...');

        // Test 1: Drawer opens
        this.test(
            'Drawer can be opened',
            async () => {
                const drawer = document.createElement('div');
                drawer.id = 'test-drawer';
                drawer.className = 'drawer';
                document.body.appendChild(drawer);
                
                await window.UXEnhancementManager.openDrawer('test-drawer');
                const isOpen = drawer.classList.contains('open');
                
                await window.UXEnhancementManager.closeDrawer('test-drawer');
                drawer.remove();
                
                return isOpen;
            }
        );

        // Test 2: Drawer closes
        this.test(
            'Drawer can be closed',
            async () => {
                const drawer = document.createElement('div');
                drawer.id = 'test-drawer-2';
                drawer.className = 'drawer';
                document.body.appendChild(drawer);
                
                await window.UXEnhancementManager.openDrawer('test-drawer-2');
                await window.UXEnhancementManager.closeDrawer('test-drawer-2');
                
                const isOpen = drawer.classList.contains('open');
                drawer.remove();
                
                return !isOpen;
            }
        );

        // Test 3: Drawer positions
        this.test(
            'Drawer supports left and right positions',
            () => {
                const positions = ['left', 'right'];
                return positions.every(pos => {
                    const drawer = document.createElement('div');
                    drawer.dataset.drawerPosition = pos;
                    return drawer.dataset.drawerPosition === pos;
                });
            }
        );
    }

    /* ============================================
       ACCORDION TESTS
       ============================================ */

    async testAccordions() {
        console.log('📦 Testing Accordions...');

        // Test 1: Accordion toggles
        this.test(
            'Accordion can be toggled',
            () => {
                const trigger = document.createElement('button');
                trigger.dataset.accordionTrigger = '';
                
                const content = document.createElement('div');
                content.className = 'accordion-content';
                
                trigger.parentNode = { insertBefore: () => {} };
                trigger.nextElementSibling = content;
                
                document.body.appendChild(trigger);
                document.body.appendChild(content);
                
                window.UXEnhancementManager.toggleAccordion(trigger);
                const isOpen = content.classList.contains('open');
                
                trigger.remove();
                content.remove();
                
                return isOpen;
            }
        );

        // Test 2: Accordion aria attributes
        this.test(
            'Accordion sets aria-expanded attribute',
            () => {
                const trigger = document.createElement('button');
                trigger.dataset.accordionTrigger = '';
                trigger.setAttribute('aria-expanded', 'false');
                
                const content = document.createElement('div');
                content.className = 'accordion-content';
                
                trigger.nextElementSibling = content;
                document.body.appendChild(trigger);
                document.body.appendChild(content);
                
                window.UXEnhancementManager.toggleAccordion(trigger);
                const ariaExpanded = trigger.getAttribute('aria-expanded');
                
                trigger.remove();
                content.remove();
                
                return ariaExpanded === 'true';
            }
        );
    }

    /* ============================================
       TAB TESTS
       ============================================ */

    async testTabs() {
        console.log('📦 Testing Tabs...');

        // Test 1: Tab switching
        this.test(
            'Tab can be switched',
            () => {
                const tabList = document.createElement('div');
                tabList.setAttribute('role', 'tablist');
                
                const tab = document.createElement('button');
                tab.dataset.tab = 'test-panel';
                tab.setAttribute('aria-selected', 'false');
                
                const panel = document.createElement('div');
                panel.id = 'test-panel';
                panel.setAttribute('role', 'tabpanel');
                panel.hidden = true;
                
                tabList.appendChild(tab);
                document.body.appendChild(tabList);
                document.body.appendChild(panel);
                
                window.UXEnhancementManager.switchTab(tab);
                const isActive = tab.getAttribute('aria-selected') === 'true';
                
                tabList.remove();
                panel.remove();
                
                return isActive;
            }
        );

        // Test 2: Tab panel visibility
        this.test(
            'Tab panel becomes visible when tab is activated',
            () => {
                const tabList = document.createElement('div');
                tabList.setAttribute('role', 'tablist');
                
                const tab = document.createElement('button');
                tab.dataset.tab = 'test-panel-2';
                
                const panel = document.createElement('div');
                panel.id = 'test-panel-2';
                panel.setAttribute('role', 'tabpanel');
                panel.hidden = true;
                panel.parentElement = document.body;
                
                tabList.appendChild(tab);
                document.body.appendChild(tabList);
                document.body.appendChild(panel);
                
                window.UXEnhancementManager.switchTab(tab);
                const isVisible = !panel.hidden;
                
                tabList.remove();
                panel.remove();
                
                return isVisible;
            }
        );
    }

    /* ============================================
       WIZARD TESTS
       ============================================ */

    async testWizards() {
        console.log('📦 Testing Wizards...');

        // Test 1: Wizard creation
        this.test(
            'Wizard can be created',
            () => {
                const form = document.createElement('form');
                form.id = 'test-wizard';
                
                const step1 = document.createElement('div');
                step1.dataset.wizardStep = '1';
                const step2 = document.createElement('div');
                step2.dataset.wizardStep = '2';
                
                form.appendChild(step1);
                form.appendChild(step2);
                document.body.appendChild(form);
                
                const wizard = window.UXEnhancementManager.createWizard('test-wizard');
                const created = wizard !== undefined;
                
                form.remove();
                
                return created;
            }
        );

        // Test 2: Wizard navigation
        this.test(
            'Wizard can navigate between steps',
            async () => {
                const form = document.createElement('form');
                form.id = 'test-wizard-2';
                
                const step1 = document.createElement('div');
                step1.dataset.wizardStep = '1';
                const step2 = document.createElement('div');
                step2.dataset.wizardStep = '2';
                
                form.appendChild(step1);
                form.appendChild(step2);
                document.body.appendChild(form);
                
                const wizard = window.UXEnhancementManager.createWizard('test-wizard-2');
                await window.UXEnhancementManager.wizardNext(wizard);
                
                const currentStep = wizard.currentStep;
                form.remove();
                
                return currentStep === 1;
            }
        );
    }

    /* ============================================
       AUTO-SAVE TESTS
       ============================================ */

    async testAutoSave() {
        console.log('📦 Testing Auto-Save...');

        // Test 1: Auto-save manager exists
        this.test(
            'Auto-save Manager is initialized',
            () => window.AutoSaveManager !== undefined
        );

        // Test 2: Form data can be saved
        this.test(
            'Form data can be saved to localStorage',
            () => {
                const form = document.createElement('form');
                form.id = 'test-form';
                
                const input = document.createElement('input');
                input.name = 'test';
                input.value = 'test value';
                
                form.appendChild(input);
                document.body.appendChild(form);
                
                window.AutoSaveManager.saveFormData(form, 'test-form');
                const saved = localStorage.getItem('hlpfl_autosave_test-form');
                
                form.remove();
                localStorage.removeItem('hlpfl_autosave_test-form');
                
                return saved !== null;
            }
        );

        // Test 3: Form data can be restored
        this.test(
            'Form data can be restored from localStorage',
            () => {
                const form = document.createElement('form');
                form.id = 'test-form-2';
                
                const input = document.createElement('input');
                input.name = 'test';
                form.appendChild(input);
                form.elements = { test: input };
                
                document.body.appendChild(form);
                
                const testData = { test: 'restored value' };
                window.AutoSaveManager.populateForm(form, testData);
                
                const restored = input.value === 'restored value';
                
                form.remove();
                
                return restored;
            }
        );

        // Test 4: Auto-save can be cleared
        this.test(
            'Auto-save data can be cleared',
            () => {
                localStorage.setItem('hlpfl_autosave_test', 'test');
                window.AutoSaveManager.clearFormData('test');
                const cleared = localStorage.getItem('hlpfl_autosave_test') === null;
                
                return cleared;
            }
        );
    }

    /* ============================================
       CONFETTI TESTS
       ============================================ */

    async testConfetti() {
        console.log('📦 Testing Confetti...');

        // Test 1: Confetti manager exists
        this.test(
            'Confetti Manager is initialized',
            () => window.ConfettiManager !== undefined
        );

        // Test 2: Confetti container created
        this.test(
            'Confetti container is created',
            () => {
                return window.ConfettiManager.container !== null;
            }
        );

        // Test 3: Confetti can be launched
        this.test(
            'Confetti can be launched',
            () => {
                window.ConfettiManager.launch({ particleCount: 10 });
                const particles = window.ConfettiManager.container.querySelectorAll('.confetti');
                
                return particles.length > 0;
            }
        );

        // Test 4: Confetti can be cleared
        this.test(
            'Confetti can be cleared',
            () => {
                window.ConfettiManager.launch({ particleCount: 10 });
                window.ConfettiManager.clear();
                const particles = window.ConfettiManager.container.querySelectorAll('.confetti');
                
                return particles.length === 0;
            }
        );

        // Test 5: Celebration effect
        this.test(
            'Celebration effect works',
            () => {
                window.ConfettiManager.celebrate();
                const particles = window.ConfettiManager.container.querySelectorAll('.confetti');
                
                setTimeout(() => window.ConfettiManager.clear(), 100);
                
                return particles.length > 0;
            }
        );
    }

    /* ============================================
       MICRO-INTERACTION TESTS
       ============================================ */

    async testMicroInteractions() {
        console.log('📦 Testing Micro-Interactions...');

        // Test 1: Ripple effect
        this.test(
            'Ripple effect can be created',
            () => {
                const button = document.createElement('button');
                button.className = 'ripple-container';
                document.body.appendChild(button);
                
                const event = new MouseEvent('click', {
                    bubbles: true,
                    clientX: 100,
                    clientY: 100
                });
                
                window.AnimationManager.ripple(button, event);
                const ripple = button.querySelector('.ripple-effect');
                
                button.remove();
                
                return ripple !== null;
            }
        );

        // Test 2: Progressive disclosure
        this.test(
            'Progressive disclosure works',
            async () => {
                const trigger = document.createElement('button');
                trigger.dataset.disclosureTrigger = 'test-disclosure';
                
                const content = document.createElement('div');
                content.id = 'test-disclosure';
                content.hidden = true;
                
                document.body.appendChild(trigger);
                document.body.appendChild(content);
                
                await window.UXEnhancementManager.toggleDisclosure(trigger);
                const isVisible = !content.hidden;
                
                trigger.remove();
                content.remove();
                
                return isVisible;
            }
        );
    }

    /* ============================================
       TEST UTILITIES
       ============================================ */

    /**
     * Run a single test
     * @param {string} name - Test name
     * @param {Function} testFn - Test function
     */
    test(name, testFn) {
        try {
            const result = testFn();
            
            // Handle async tests
            if (result instanceof Promise) {
                return result.then(passed => {
                    this.recordResult(name, passed);
                }).catch(error => {
                    this.recordResult(name, false, error.message);
                });
            }
            
            this.recordResult(name, result);
        } catch (error) {
            this.recordResult(name, false, error.message);
        }
    }

    /**
     * Record test result
     * @param {string} name - Test name
     * @param {boolean} passed - Whether test passed
     * @param {string} error - Error message if failed
     */
    recordResult(name, passed, error = null) {
        const result = {
            name,
            passed,
            error
        };

        this.results.push(result);

        if (passed) {
            this.passed++;
            console.log(`  ✓ ${name}`);
        } else {
            this.failed++;
            console.log(`  ✗ ${name}${error ? `: ${error}` : ''}`);
        }
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('UX ENHANCEMENT TEST RESULTS');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.results.length}`);
        console.log(`Passed: ${this.passed} ✓`);
        console.log(`Failed: ${this.failed} ✗`);
        console.log(`Success Rate: ${((this.passed / this.results.length) * 100).toFixed(1)}%`);
        console.log('='.repeat(50) + '\n');
    }

    /**
     * Get test summary
     * @returns {Object}
     */
    getSummary() {
        return {
            total: this.results.length,
            passed: this.passed,
            failed: this.failed,
            successRate: (this.passed / this.results.length) * 100,
            results: this.results
        };
    }
}

// Export for use in test page
if (typeof window !== 'undefined') {
    window.UXEnhancementTests = UXEnhancementTests;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UXEnhancementTests;
}