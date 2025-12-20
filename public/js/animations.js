/**
 * HLPFL Forms - Animation System
 * Comprehensive animation library for smooth, delightful user experiences
 * Part of Phase 9: User Experience Enhancement
 * 
 * @module animations
 * @version 1.0.0
 */

class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.observers = new Map();
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.defaultDuration = 300;
        this.defaultEasing = 'ease-in-out';
        
        this.init();
    }

    /**
     * Initialize animation system
     */
    init() {
        this.setupReducedMotionListener();
        this.registerDefaultAnimations();
        this.setupIntersectionObservers();
        console.log('✨ Animation system initialized');
    }

    /**
     * Setup reduced motion preference listener
     */
    setupReducedMotionListener() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', (e) => {
            this.prefersReducedMotion = e.matches;
            console.log(`Reduced motion: ${this.prefersReducedMotion ? 'enabled' : 'disabled'}`);
        });
    }

    /**
     * Register default animation presets
     */
    registerDefaultAnimations() {
        // Fade animations
        this.register('fadeIn', {
            keyframes: [
                { opacity: 0 },
                { opacity: 1 }
            ],
            options: { duration: 300, easing: 'ease-in' }
        });

        this.register('fadeOut', {
            keyframes: [
                { opacity: 1 },
                { opacity: 0 }
            ],
            options: { duration: 300, easing: 'ease-out' }
        });

        // Slide animations
        this.register('slideInLeft', {
            keyframes: [
                { transform: 'translateX(-100%)', opacity: 0 },
                { transform: 'translateX(0)', opacity: 1 }
            ],
            options: { duration: 400, easing: 'ease-out' }
        });

        this.register('slideInRight', {
            keyframes: [
                { transform: 'translateX(100%)', opacity: 0 },
                { transform: 'translateX(0)', opacity: 1 }
            ],
            options: { duration: 400, easing: 'ease-out' }
        });

        this.register('slideInUp', {
            keyframes: [
                { transform: 'translateY(100%)', opacity: 0 },
                { transform: 'translateY(0)', opacity: 1 }
            ],
            options: { duration: 400, easing: 'ease-out' }
        });

        this.register('slideInDown', {
            keyframes: [
                { transform: 'translateY(-100%)', opacity: 0 },
                { transform: 'translateY(0)', opacity: 1 }
            ],
            options: { duration: 400, easing: 'ease-out' }
        });

        // Scale animations
        this.register('scaleIn', {
            keyframes: [
                { transform: 'scale(0)', opacity: 0 },
                { transform: 'scale(1)', opacity: 1 }
            ],
            options: { duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
        });

        this.register('scaleOut', {
            keyframes: [
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(0)', opacity: 0 }
            ],
            options: { duration: 300, easing: 'ease-in' }
        });

        // Bounce animation
        this.register('bounce', {
            keyframes: [
                { transform: 'translateY(0)' },
                { transform: 'translateY(-20px)' },
                { transform: 'translateY(0)' },
                { transform: 'translateY(-10px)' },
                { transform: 'translateY(0)' }
            ],
            options: { duration: 600, easing: 'ease-in-out' }
        });

        // Shake animation
        this.register('shake', {
            keyframes: [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ],
            options: { duration: 500, easing: 'ease-in-out' }
        });

        // Pulse animation
        this.register('pulse', {
            keyframes: [
                { transform: 'scale(1)' },
                { transform: 'scale(1.05)' },
                { transform: 'scale(1)' }
            ],
            options: { duration: 400, easing: 'ease-in-out' }
        });

        // Rotate animation
        this.register('rotate', {
            keyframes: [
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(360deg)' }
            ],
            options: { duration: 600, easing: 'linear' }
        });

        // Flip animation
        this.register('flip', {
            keyframes: [
                { transform: 'rotateY(0deg)' },
                { transform: 'rotateY(180deg)' }
            ],
            options: { duration: 600, easing: 'ease-in-out' }
        });

        // Zoom animations
        this.register('zoomIn', {
            keyframes: [
                { transform: 'scale(0.5)', opacity: 0 },
                { transform: 'scale(1)', opacity: 1 }
            ],
            options: { duration: 300, easing: 'ease-out' }
        });

        this.register('zoomOut', {
            keyframes: [
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(0.5)', opacity: 0 }
            ],
            options: { duration: 300, easing: 'ease-in' }
        });

        // Success celebration
        this.register('celebrate', {
            keyframes: [
                { transform: 'scale(1) rotate(0deg)' },
                { transform: 'scale(1.2) rotate(5deg)' },
                { transform: 'scale(1.1) rotate(-5deg)' },
                { transform: 'scale(1.2) rotate(5deg)' },
                { transform: 'scale(1) rotate(0deg)' }
            ],
            options: { duration: 600, easing: 'ease-in-out' }
        });
    }

    /**
     * Register a custom animation
     * @param {string} name - Animation name
     * @param {Object} config - Animation configuration
     */
    register(name, config) {
        this.animations.set(name, config);
    }

    /**
     * Play an animation on an element
     * @param {HTMLElement} element - Target element
     * @param {string} animationName - Animation name
     * @param {Object} options - Animation options
     * @returns {Promise<void>}
     */
    async play(element, animationName, options = {}) {
        if (!element) {
            console.warn('Animation target element not found');
            return;
        }

        // Skip animations if reduced motion is preferred
        if (this.prefersReducedMotion) {
            return;
        }

        const animation = this.animations.get(animationName);
        if (!animation) {
            console.warn(`Animation "${animationName}" not found`);
            return;
        }

        const animationOptions = {
            ...animation.options,
            ...options
        };

        try {
            const webAnimation = element.animate(animation.keyframes, animationOptions);
            await webAnimation.finished;
        } catch (error) {
            console.error('Animation error:', error);
        }
    }

    /**
     * Play animation sequence
     * @param {Array} sequence - Array of animation steps
     * @returns {Promise<void>}
     */
    async sequence(sequence) {
        for (const step of sequence) {
            await this.play(step.element, step.animation, step.options);
            if (step.delay) {
                await this.delay(step.delay);
            }
        }
    }

    /**
     * Play animations in parallel
     * @param {Array} animations - Array of animation configs
     * @returns {Promise<void>}
     */
    async parallel(animations) {
        const promises = animations.map(anim => 
            this.play(anim.element, anim.animation, anim.options)
        );
        await Promise.all(promises);
    }

    /**
     * Setup intersection observers for scroll animations
     */
    setupIntersectionObservers() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const animation = element.dataset.scrollAnimation || 'fadeIn';
                        this.play(element, animation);
                        observer.unobserve(element);
                    }
                });
            },
            { threshold: 0.1 }
        );

        this.observers.set('scroll', observer);
    }

    /**
     * Observe element for scroll animation
     * @param {HTMLElement} element - Element to observe
     * @param {string} animation - Animation name
     */
    observeScroll(element, animation = 'fadeIn') {
        if (!element) return;
        
        element.dataset.scrollAnimation = animation;
        const observer = this.observers.get('scroll');
        if (observer) {
            observer.observe(element);
        }
    }

    /**
     * Create a delay
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Animate element entrance
     * @param {HTMLElement} element - Target element
     * @param {string} direction - Direction (left, right, up, down)
     */
    async enter(element, direction = 'up') {
        const animationMap = {
            left: 'slideInLeft',
            right: 'slideInRight',
            up: 'slideInUp',
            down: 'slideInDown'
        };
        
        await this.play(element, animationMap[direction] || 'fadeIn');
    }

    /**
     * Animate element exit
     * @param {HTMLElement} element - Target element
     * @param {string} direction - Direction (left, right, up, down)
     */
    async exit(element, direction = 'up') {
        const animationMap = {
            left: 'slideOutLeft',
            right: 'slideOutRight',
            up: 'slideOutUp',
            down: 'slideOutDown'
        };
        
        await this.play(element, animationMap[direction] || 'fadeOut');
    }

    /**
     * Show element with animation
     * @param {HTMLElement} element - Target element
     * @param {string} animation - Animation name
     */
    async show(element, animation = 'fadeIn') {
        if (!element) return;
        
        element.style.display = '';
        await this.play(element, animation);
    }

    /**
     * Hide element with animation
     * @param {HTMLElement} element - Target element
     * @param {string} animation - Animation name
     */
    async hide(element, animation = 'fadeOut') {
        if (!element) return;
        
        await this.play(element, animation);
        element.style.display = 'none';
    }

    /**
     * Toggle element visibility with animation
     * @param {HTMLElement} element - Target element
     * @param {string} showAnimation - Show animation name
     * @param {string} hideAnimation - Hide animation name
     */
    async toggle(element, showAnimation = 'fadeIn', hideAnimation = 'fadeOut') {
        if (!element) return;
        
        const isVisible = element.style.display !== 'none';
        if (isVisible) {
            await this.hide(element, hideAnimation);
        } else {
            await this.show(element, showAnimation);
        }
    }

    /**
     * Animate number counting
     * @param {HTMLElement} element - Target element
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} duration - Duration in ms
     */
    async countUp(element, start, end, duration = 1000) {
        if (!element) return;
        
        const startTime = performance.now();
        const range = end - start;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (range * easeOut);
            
            element.textContent = Math.round(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Create ripple effect on click
     * @param {HTMLElement} element - Target element
     * @param {Event} event - Click event
     */
    ripple(element, event) {
        if (!element || this.prefersReducedMotion) return;
        
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Animate progress bar
     * @param {HTMLElement} element - Progress bar element
     * @param {number} progress - Progress percentage (0-100)
     * @param {number} duration - Duration in ms
     */
    async progressBar(element, progress, duration = 500) {
        if (!element) return;
        
        const startWidth = parseFloat(element.style.width) || 0;
        const endWidth = Math.min(Math.max(progress, 0), 100);
        
        await this.play(element, 'custom', {
            duration,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        element.style.width = `${endWidth}%`;
    }

    /**
     * Create loading spinner animation
     * @param {HTMLElement} element - Target element
     */
    startSpinner(element) {
        if (!element) return;
        
        element.classList.add('spinning');
        this.play(element, 'rotate', { 
            duration: 1000, 
            iterations: Infinity 
        });
    }

    /**
     * Stop loading spinner animation
     * @param {HTMLElement} element - Target element
     */
    stopSpinner(element) {
        if (!element) return;
        
        element.classList.remove('spinning');
    }

    /**
     * Destroy animation manager
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.animations.clear();
        console.log('Animation system destroyed');
    }
}

// Create global instance
window.AnimationManager = new AnimationManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}