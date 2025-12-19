/**
 * HLPFL Forms - Performance Optimization System
 * 
 * Makes everything FAST - lightning quick page loads and interactions
 */

class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    
    console.log('⚡ Initializing Performance Optimizer...');
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Lazy load images
    this.setupLazyLoading();
    
    // Optimize fonts
    this.optimizeFonts();
    
    // Setup request deduplication
    this.setupRequestOptimization();
    
    // Monitor performance
    this.monitorPerformance();
    
    this.initialized = true;
    console.log('✅ Performance Optimizer Active');
  }

  preloadCriticalResources() {
    const criticalResources = [
      { href: '/css/hlpfl-colors.css', as: 'style' },
      { href: '/css/enhanced-branding.css', as: 'style' },
      { href: '/logo.svg', as: 'image' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      document.head.appendChild(link);
    });
  }

  setupLazyLoading() {
    // Lazy load images
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    // Also observe dynamically added images
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'IMG' && node.dataset.src) {
            imageObserver.observe(node);
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  optimizeFonts() {
    // Use font-display: swap for better performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  setupRequestOptimization() {
    // Override fetch to add deduplication
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options = {}] = args;
      const key = `${url}-${JSON.stringify(options)}`;

      // Check if request is already pending
      if (this.pendingRequests.has(key)) {
        return await this.pendingRequests.get(key);
      }

      // Make request
      const promise = originalFetch(...args);
      this.pendingRequests.set(key, promise);

      try {
        const response = await promise;
        this.pendingRequests.delete(key);
        return response;
      } catch (error) {
        this.pendingRequests.delete(key);
        throw error;
      }
    };
  }

  monitorPerformance() {
    // Log page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        if (perfData) {
          const loadTime = perfData.loadEventEnd - perfData.fetchStart;
          const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
          
          console.log('📊 Performance Metrics:');
          console.log(`  Page Load Time: ${(loadTime / 1000).toFixed(2)}s`);
          console.log(`  DOM Content Loaded: ${(domContentLoaded / 1000).toFixed(2)}s`);
          
          // Log to analytics if available
          if (window.gtag) {
            gtag('event', 'timing_complete', {
              name: 'page_load',
              value: Math.round(loadTime),
              event_category: 'Performance'
            });
          }
        }
      }, 0);
    });
  }

  // Debounce utility
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle utility
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Initialize immediately
const perfOptimizer = new PerformanceOptimizer();
perfOptimizer.initialize();

// Export for use
window.PerformanceOptimizer = perfOptimizer;

console.log('🚀 Performance Optimizer Loaded');