/**
 * HLPFL Forms - UX Enhancements
 * Advanced user experience features including form wizards, tooltips, and interactions
 * Part of Phase 9: User Experience Enhancement
 * 
 * @module ux-enhancements
 * @version 1.0.0
 */

class UXEnhancementManager {
    constructor() {
        this.tooltips = new Map();
        this.modals = new Map();
        this.drawers = new Map();
        this.accordions = new Map();
        this.tabs = new Map();
        this.wizards = new Map();
        
        this.init();
    }

    /**
     * Initialize UX enhancement system
     */
    init() {
        this.initTooltips();
        this.initModals();
        this.initDrawers();
        this.initAccordions();
        this.initTabs();
        this.initContextMenus();
        this.initProgressiveDisclosure();
        console.log('✨ UX Enhancement system initialized');
    }

    /* ============================================
       TOOLTIP SYSTEM
       ============================================ */

    /**
     * Initialize tooltips
     */
    initTooltips() {
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.showTooltip(target);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.hideTooltip(target);
            }
        });

        // Keyboard support
        document.addEventListener('focusin', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.showTooltip(target);
            }
        });

        document.addEventListener('focusout', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.hideTooltip(target);
            }
        });
    }

    /**
     * Show tooltip
     * @param {HTMLElement} element - Element with tooltip
     */
    showTooltip(element) {
        const text = element.dataset.tooltip;
        const position = element.dataset.tooltipPosition || 'top';
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = text;
        tooltip.setAttribute('role', 'tooltip');
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 8;
                break;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        
        // Animate in
        if (window.AnimationManager) {
            window.AnimationManager.play(tooltip, 'fadeIn', { duration: 150 });
        }
        
        this.tooltips.set(element, tooltip);
    }

    /**
     * Hide tooltip
     * @param {HTMLElement} element - Element with tooltip
     */
    async hideTooltip(element) {
        const tooltip = this.tooltips.get(element);
        if (tooltip) {
            if (window.AnimationManager) {
                await window.AnimationManager.play(tooltip, 'fadeOut', { duration: 150 });
            }
            tooltip.remove();
            this.tooltips.delete(element);
        }
    }

    /* ============================================
       MODAL SYSTEM
       ============================================ */

    /**
     * Initialize modals
     */
    initModals() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal-trigger]');
            if (trigger) {
                const modalId = trigger.dataset.modalTrigger;
                this.openModal(modalId);
            }

            const close = e.target.closest('[data-modal-close]');
            if (close) {
                const modal = close.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            }
        });

        // Close on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                const modal = e.target.querySelector('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal.open');
                openModals.forEach(modal => this.closeModal(modal.id));
            }
        });
    }

    /**
     * Open modal
     * @param {string} modalId - Modal ID
     */
    async openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        // Show modal
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');

        // Animate
        if (window.AnimationManager) {
            await window.AnimationManager.parallel([
                { element: backdrop, animation: 'fadeIn' },
                { element: modal, animation: 'scaleIn' }
            ]);
        }

        // Focus first focusable element
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
            focusable.focus();
        }

        this.modals.set(modalId, { modal, backdrop });
    }

    /**
     * Close modal
     * @param {string} modalId - Modal ID
     */
    async closeModal(modalId) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return;

        const { modal, backdrop } = modalData;

        // Animate out
        if (window.AnimationManager) {
            await window.AnimationManager.parallel([
                { element: backdrop, animation: 'fadeOut' },
                { element: modal, animation: 'scaleOut' }
            ]);
        }

        // Remove
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        backdrop.remove();

        this.modals.delete(modalId);
    }

    /* ============================================
       DRAWER SYSTEM
       ============================================ */

    /**
     * Initialize drawers
     */
    initDrawers() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-drawer-trigger]');
            if (trigger) {
                const drawerId = trigger.dataset.drawerTrigger;
                this.toggleDrawer(drawerId);
            }
        });
    }

    /**
     * Toggle drawer
     * @param {string} drawerId - Drawer ID
     */
    async toggleDrawer(drawerId) {
        const drawer = document.getElementById(drawerId);
        if (!drawer) return;

        const isOpen = drawer.classList.contains('open');

        if (isOpen) {
            await this.closeDrawer(drawerId);
        } else {
            await this.openDrawer(drawerId);
        }
    }

    /**
     * Open drawer
     * @param {string} drawerId - Drawer ID
     */
    async openDrawer(drawerId) {
        const drawer = document.getElementById(drawerId);
        if (!drawer) return;

        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');

        const position = drawer.dataset.drawerPosition || 'right';
        const animation = position === 'left' ? 'slideInLeft' : 'slideInRight';

        if (window.AnimationManager) {
            await window.AnimationManager.play(drawer, animation);
        }

        this.drawers.set(drawerId, drawer);
    }

    /**
     * Close drawer
     * @param {string} drawerId - Drawer ID
     */
    async closeDrawer(drawerId) {
        const drawer = this.drawers.get(drawerId);
        if (!drawer) return;

        const position = drawer.dataset.drawerPosition || 'right';
        const animation = position === 'left' ? 'slideOutLeft' : 'slideOutRight';

        if (window.AnimationManager) {
            await window.AnimationManager.play(drawer, animation);
        }

        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');

        this.drawers.delete(drawerId);
    }

    /* ============================================
       ACCORDION SYSTEM
       ============================================ */

    /**
     * Initialize accordions
     */
    initAccordions() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-accordion-trigger]');
            if (trigger) {
                this.toggleAccordion(trigger);
            }
        });
    }

    /**
     * Toggle accordion
     * @param {HTMLElement} trigger - Accordion trigger
     */
    toggleAccordion(trigger) {
        const content = trigger.nextElementSibling;
        if (!content || !content.classList.contains('accordion-content')) return;

        const isOpen = content.classList.contains('open');

        // Close other accordions in same group
        const group = trigger.closest('[data-accordion-group]');
        if (group) {
            const openItems = group.querySelectorAll('.accordion-content.open');
            openItems.forEach(item => {
                if (item !== content) {
                    item.classList.remove('open');
                    item.previousElementSibling.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Toggle current accordion
        if (isOpen) {
            content.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        } else {
            content.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
        }
    }

    /* ============================================
       TAB SYSTEM
       ============================================ */

    /**
     * Initialize tabs
     */
    initTabs() {
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('[data-tab]');
            if (tab) {
                this.switchTab(tab);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const tab = e.target.closest('[data-tab]');
            if (!tab) return;

            const tabList = tab.closest('[role="tablist"]');
            if (!tabList) return;

            const tabs = Array.from(tabList.querySelectorAll('[data-tab]'));
            const currentIndex = tabs.indexOf(tab);

            let nextIndex;

            if (e.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft') {
                nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            } else if (e.key === 'Home') {
                nextIndex = 0;
            } else if (e.key === 'End') {
                nextIndex = tabs.length - 1;
            }

            if (nextIndex !== undefined) {
                e.preventDefault();
                tabs[nextIndex].focus();
                this.switchTab(tabs[nextIndex]);
            }
        });
    }

    /**
     * Switch tab
     * @param {HTMLElement} tab - Tab element
     */
    switchTab(tab) {
        const tabList = tab.closest('[role="tablist"]');
        if (!tabList) return;

        const targetId = tab.dataset.tab;
        const target = document.getElementById(targetId);
        if (!target) return;

        // Deactivate all tabs
        const allTabs = tabList.querySelectorAll('[data-tab]');
        allTabs.forEach(t => {
            t.setAttribute('aria-selected', 'false');
            t.classList.remove('active');
        });

        // Hide all panels
        const container = target.parentElement;
        const allPanels = container.querySelectorAll('[role="tabpanel"]');
        allPanels.forEach(p => {
            p.hidden = true;
        });

        // Activate selected tab
        tab.setAttribute('aria-selected', 'true');
        tab.classList.add('active');
        target.hidden = false;

        // Animate panel
        if (window.AnimationManager) {
            window.AnimationManager.play(target, 'fadeIn', { duration: 200 });
        }
    }

    /* ============================================
       CONTEXT MENU SYSTEM
       ============================================ */

    /**
     * Initialize context menus
     */
    initContextMenus() {
        document.addEventListener('contextmenu', (e) => {
            const target = e.target.closest('[data-context-menu]');
            if (target) {
                e.preventDefault();
                this.showContextMenu(target, e.clientX, e.clientY);
            }
        });

        // Close on click outside
        document.addEventListener('click', () => {
            this.hideAllContextMenus();
        });
    }

    /**
     * Show context menu
     * @param {HTMLElement} element - Element with context menu
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    showContextMenu(element, x, y) {
        const menuId = element.dataset.contextMenu;
        const menu = document.getElementById(menuId);
        if (!menu) return;

        // Position menu
        menu.style.position = 'fixed';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.display = 'block';

        // Animate
        if (window.AnimationManager) {
            window.AnimationManager.play(menu, 'scaleIn', { duration: 150 });
        }
    }

    /**
     * Hide all context menus
     */
    hideAllContextMenus() {
        const menus = document.querySelectorAll('[data-context-menu-content]');
        menus.forEach(menu => {
            menu.style.display = 'none';
        });
    }

    /* ============================================
       PROGRESSIVE DISCLOSURE
       ============================================ */

    /**
     * Initialize progressive disclosure
     */
    initProgressiveDisclosure() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-disclosure-trigger]');
            if (trigger) {
                this.toggleDisclosure(trigger);
            }
        });
    }

    /**
     * Toggle disclosure
     * @param {HTMLElement} trigger - Disclosure trigger
     */
    async toggleDisclosure(trigger) {
        const targetId = trigger.dataset.disclosureTrigger;
        const target = document.getElementById(targetId);
        if (!target) return;

        const isHidden = target.hidden;

        if (isHidden) {
            target.hidden = false;
            trigger.setAttribute('aria-expanded', 'true');
            if (window.AnimationManager) {
                await window.AnimationManager.play(target, 'fadeIn');
            }
        } else {
            if (window.AnimationManager) {
                await window.AnimationManager.play(target, 'fadeOut');
            }
            target.hidden = true;
            trigger.setAttribute('aria-expanded', 'false');
        }
    }

    /* ============================================
       FORM WIZARD SYSTEM
       ============================================ */

    /**
     * Create form wizard
     * @param {string} formId - Form ID
     * @param {Object} options - Wizard options
     */
    createWizard(formId, options = {}) {
        const form = document.getElementById(formId);
        if (!form) return;

        const wizard = {
            form,
            steps: Array.from(form.querySelectorAll('[data-wizard-step]')),
            currentStep: 0,
            options: {
                showProgress: true,
                validateOnNext: true,
                ...options
            }
        };

        // Create progress indicator
        if (wizard.options.showProgress) {
            this.createWizardProgress(wizard);
        }

        // Create navigation buttons
        this.createWizardNavigation(wizard);

        // Show first step
        this.showWizardStep(wizard, 0);

        this.wizards.set(formId, wizard);
        return wizard;
    }

    /**
     * Create wizard progress indicator
     * @param {Object} wizard - Wizard object
     */
    createWizardProgress(wizard) {
        const progress = document.createElement('div');
        progress.className = 'wizard-progress';
        progress.setAttribute('role', 'progressbar');
        progress.setAttribute('aria-valuemin', '0');
        progress.setAttribute('aria-valuemax', wizard.steps.length);
        progress.setAttribute('aria-valuenow', '1');

        const steps = wizard.steps.map((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'wizard-progress-step';
            stepEl.textContent = index + 1;
            return stepEl;
        });

        steps.forEach(step => progress.appendChild(step));
        wizard.form.insertBefore(progress, wizard.form.firstChild);
        wizard.progressElement = progress;
    }

    /**
     * Create wizard navigation
     * @param {Object} wizard - Wizard object
     */
    createWizardNavigation(wizard) {
        const nav = document.createElement('div');
        nav.className = 'wizard-navigation';

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'btn btn-secondary';
        prevBtn.textContent = 'Previous';
        prevBtn.addEventListener('click', () => this.wizardPrevious(wizard));

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'btn btn-primary';
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => this.wizardNext(wizard));

        nav.appendChild(prevBtn);
        nav.appendChild(nextBtn);
        wizard.form.appendChild(nav);

        wizard.prevButton = prevBtn;
        wizard.nextButton = nextBtn;
    }

    /**
     * Show wizard step
     * @param {Object} wizard - Wizard object
     * @param {number} stepIndex - Step index
     */
    async showWizardStep(wizard, stepIndex) {
        // Hide all steps
        wizard.steps.forEach(step => step.hidden = true);

        // Show current step
        const currentStep = wizard.steps[stepIndex];
        currentStep.hidden = false;

        // Animate
        if (window.AnimationManager) {
            await window.AnimationManager.play(currentStep, 'fadeIn');
        }

        // Update progress
        if (wizard.progressElement) {
            const progressSteps = wizard.progressElement.querySelectorAll('.wizard-progress-step');
            progressSteps.forEach((step, index) => {
                step.classList.toggle('active', index === stepIndex);
                step.classList.toggle('completed', index < stepIndex);
            });
            wizard.progressElement.setAttribute('aria-valuenow', stepIndex + 1);
        }

        // Update buttons
        wizard.prevButton.disabled = stepIndex === 0;
        wizard.nextButton.textContent = stepIndex === wizard.steps.length - 1 ? 'Submit' : 'Next';

        wizard.currentStep = stepIndex;
    }

    /**
     * Go to next wizard step
     * @param {Object} wizard - Wizard object
     */
    async wizardNext(wizard) {
        // Validate current step if enabled
        if (wizard.options.validateOnNext) {
            const currentStep = wizard.steps[wizard.currentStep];
            const inputs = currentStep.querySelectorAll('input, select, textarea');
            let valid = true;

            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    input.reportValidity();
                    valid = false;
                }
            });

            if (!valid) return;
        }

        // Check if last step
        if (wizard.currentStep === wizard.steps.length - 1) {
            wizard.form.submit();
            return;
        }

        // Go to next step
        await this.showWizardStep(wizard, wizard.currentStep + 1);
    }

    /**
     * Go to previous wizard step
     * @param {Object} wizard - Wizard object
     */
    async wizardPrevious(wizard) {
        if (wizard.currentStep > 0) {
            await this.showWizardStep(wizard, wizard.currentStep - 1);
        }
    }

    /**
     * Destroy UX enhancement manager
     */
    destroy() {
        this.tooltips.forEach(tooltip => tooltip.remove());
        this.tooltips.clear();
        this.modals.clear();
        this.drawers.clear();
        this.accordions.clear();
        this.tabs.clear();
        this.wizards.clear();
        console.log('UX Enhancement system destroyed');
    }
}

// Create global instance
window.UXEnhancementManager = new UXEnhancementManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UXEnhancementManager;
}