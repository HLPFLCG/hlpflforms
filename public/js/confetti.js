/**
 * HLPFL Forms - Confetti System
 * Success celebration animations with confetti
 * Part of Phase 9: User Experience Enhancement
 * 
 * @module confetti
 * @version 1.0.0
 */

class ConfettiManager {
    constructor() {
        this.container = null;
        this.colors = ['#FF6B6B', '#4ECDC4', '#d4945c', '#FFD93D', '#6BCB77'];
        this.init();
    }

    /**
     * Initialize confetti system
     */
    init() {
        this.createContainer();
        console.log('🎉 Confetti system initialized');
    }

    /**
     * Create confetti container
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'confetti-container';
        this.container.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.container);
    }

    /**
     * Launch confetti
     * @param {Object} options - Confetti options
     */
    launch(options = {}) {
        const config = {
            particleCount: 100,
            spread: 70,
            origin: { x: 0.5, y: 0.5 },
            colors: this.colors,
            ...options
        };

        for (let i = 0; i < config.particleCount; i++) {
            this.createParticle(config);
        }
    }

    /**
     * Create a single confetti particle
     * @param {Object} config - Configuration
     */
    createParticle(config) {
        const particle = document.createElement('div');
        particle.className = 'confetti';
        
        // Random color
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        particle.style.background = color;
        
        // Random size
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random starting position
        const startX = (config.origin.x * window.innerWidth) + (Math.random() - 0.5) * config.spread;
        const startY = config.origin.y * window.innerHeight;
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        
        // Random animation duration
        const duration = Math.random() * 2 + 2;
        particle.style.animationDuration = `${duration}s`;
        
        // Random rotation
        const rotation = Math.random() * 360;
        particle.style.setProperty('--rotation', `${rotation}deg`);
        
        this.container.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => particle.remove(), duration * 1000);
    }

    /**
     * Celebrate success
     */
    celebrate() {
        // Center burst
        this.launch({
            particleCount: 50,
            spread: 70,
            origin: { x: 0.5, y: 0.5 }
        });
        
        // Left side
        setTimeout(() => {
            this.launch({
                particleCount: 30,
                spread: 50,
                origin: { x: 0.2, y: 0.6 }
            });
        }, 200);
        
        // Right side
        setTimeout(() => {
            this.launch({
                particleCount: 30,
                spread: 50,
                origin: { x: 0.8, y: 0.6 }
            });
        }, 400);
    }

    /**
     * Fireworks effect
     */
    fireworks() {
        const positions = [
            { x: 0.2, y: 0.3 },
            { x: 0.5, y: 0.2 },
            { x: 0.8, y: 0.3 },
            { x: 0.3, y: 0.6 },
            { x: 0.7, y: 0.6 }
        ];

        positions.forEach((pos, index) => {
            setTimeout(() => {
                this.launch({
                    particleCount: 40,
                    spread: 60,
                    origin: pos
                });
            }, index * 300);
        });
    }

    /**
     * Rain effect
     */
    rain() {
        const interval = setInterval(() => {
            this.launch({
                particleCount: 5,
                spread: 100,
                origin: { x: Math.random(), y: 0 }
            });
        }, 100);

        setTimeout(() => clearInterval(interval), 3000);
    }

    /**
     * Cannon effect
     * @param {string} side - 'left' or 'right'
     */
    cannon(side = 'left') {
        const origin = side === 'left' 
            ? { x: 0, y: 1 }
            : { x: 1, y: 1 };

        this.launch({
            particleCount: 100,
            spread: 70,
            origin
        });
    }

    /**
     * Clear all confetti
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    /**
     * Destroy confetti manager
     */
    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        console.log('Confetti system destroyed');
    }
}

// Create global instance
window.ConfettiManager = new ConfettiManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfettiManager;
}