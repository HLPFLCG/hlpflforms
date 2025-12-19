/**
 * Performance Monitoring System
 * Tracks and reports performance metrics for optimization
 */

class PerformanceMonitor {
    constructor() {
        this.logger = new Logger('PerformanceMonitor');
        this.metrics = {
            pageLoad: {},
            resources: [],
            interactions: [],
            vitals: {}
        };
        this.init();
    }

    /**
     * Initialize performance monitoring
     */
    init() {
        if (!('performance' in window)) {
            this.logger.warn('Performance API not available');
            return;
        }

        // Monitor page load
        this.monitorPageLoad();

        // Monitor Core Web Vitals
        this.monitorCoreWebVitals();

        // Monitor resources
        this.monitorResources();

        // Monitor long tasks
        this.monitorLongTasks();

        // Monitor user interactions
        this.monitorInteractions();
    }

    /**
     * Monitor page load performance
     */
    monitorPageLoad() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                
                if (perfData) {
                    this.metrics.pageLoad = {
                        // DNS lookup
                        dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
                        
                        // TCP connection
                        tcpConnection: perfData.connectEnd - perfData.connectStart,
                        
                        // Request/Response
                        requestTime: perfData.responseStart - perfData.requestStart,
                        responseTime: perfData.responseEnd - perfData.responseStart,
                        
                        // DOM processing
                        domProcessing: perfData.domComplete - perfData.domInteractive,
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        
                        // Page load
                        pageLoad: perfData.loadEventEnd - perfData.loadEventStart,
                        totalTime: perfData.loadEventEnd - perfData.fetchStart,
                        
                        // Transfer size
                        transferSize: perfData.transferSize,
                        encodedBodySize: perfData.encodedBodySize,
                        decodedBodySize: perfData.decodedBodySize
                    };

                    this.logger.info('Page Load Metrics', this.metrics.pageLoad);
                    this.reportMetrics('pageLoad', this.metrics.pageLoad);
                }
            }, 0);
        });
    }

    /**
     * Monitor Core Web Vitals
     */
    monitorCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        this.observeLCP();

        // First Input Delay (FID)
        this.observeFID();

        // Cumulative Layout Shift (CLS)
        this.observeCLS();

        // First Contentful Paint (FCP)
        this.observeFCP();

        // Time to First Byte (TTFB)
        this.observeTTFB();
    }

    /**
     * Observe Largest Contentful Paint
     */
    observeLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
                this.logger.info('LCP', this.metrics.vitals.lcp);
                
                // LCP should be < 2.5s for good performance
                if (this.metrics.vitals.lcp > 2500) {
                    this.logger.warn('LCP is above recommended threshold', {
                        value: this.metrics.vitals.lcp,
                        threshold: 2500
                    });
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            this.logger.warn('LCP observation not supported');
        }
    }

    /**
     * Observe First Input Delay
     */
    observeFID() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.vitals.fid = entry.processingStart - entry.startTime;
                    this.logger.info('FID', this.metrics.vitals.fid);
                    
                    // FID should be < 100ms for good performance
                    if (this.metrics.vitals.fid > 100) {
                        this.logger.warn('FID is above recommended threshold', {
                            value: this.metrics.vitals.fid,
                            threshold: 100
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            this.logger.warn('FID observation not supported');
        }
    }

    /**
     * Observe Cumulative Layout Shift
     */
    observeCLS() {
        try {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                
                this.metrics.vitals.cls = clsValue;
                this.logger.info('CLS', this.metrics.vitals.cls);
                
                // CLS should be < 0.1 for good performance
                if (this.metrics.vitals.cls > 0.1) {
                    this.logger.warn('CLS is above recommended threshold', {
                        value: this.metrics.vitals.cls,
                        threshold: 0.1
                    });
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            this.logger.warn('CLS observation not supported');
        }
    }

    /**
     * Observe First Contentful Paint
     */
    observeFCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.vitals.fcp = entry.startTime;
                        this.logger.info('FCP', this.metrics.vitals.fcp);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['paint'] });
        } catch (e) {
            this.logger.warn('FCP observation not supported');
        }
    }

    /**
     * Observe Time to First Byte
     */
    observeTTFB() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                this.metrics.vitals.ttfb = perfData.responseStart - perfData.requestStart;
                this.logger.info('TTFB', this.metrics.vitals.ttfb);
                
                // TTFB should be < 600ms for good performance
                if (this.metrics.vitals.ttfb > 600) {
                    this.logger.warn('TTFB is above recommended threshold', {
                        value: this.metrics.vitals.ttfb,
                        threshold: 600
                    });
                }
            }
        });
    }

    /**
     * Monitor resource loading
     */
    monitorResources() {
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            
            resources.forEach(resource => {
                this.metrics.resources.push({
                    name: resource.name,
                    type: resource.initiatorType,
                    duration: resource.duration,
                    size: resource.transferSize,
                    cached: resource.transferSize === 0
                });
            });

            // Analyze resource performance
            this.analyzeResources();
        });
    }

    /**
     * Analyze resource performance
     */
    analyzeResources() {
        const byType = {};
        let totalSize = 0;
        let totalDuration = 0;

        this.metrics.resources.forEach(resource => {
            if (!byType[resource.type]) {
                byType[resource.type] = {
                    count: 0,
                    size: 0,
                    duration: 0
                };
            }

            byType[resource.type].count++;
            byType[resource.type].size += resource.size;
            byType[resource.type].duration += resource.duration;

            totalSize += resource.size;
            totalDuration += resource.duration;
        });

        this.logger.info('Resource Analysis', {
            byType,
            totalResources: this.metrics.resources.length,
            totalSize: Utils.formatBytes(totalSize),
            totalDuration: `${totalDuration.toFixed(2)}ms`
        });

        // Warn about large resources
        this.metrics.resources.forEach(resource => {
            if (resource.size > 500000) { // > 500KB
                this.logger.warn('Large resource detected', {
                    name: resource.name,
                    size: Utils.formatBytes(resource.size),
                    type: resource.type
                });
            }

            if (resource.duration > 1000) { // > 1s
                this.logger.warn('Slow resource detected', {
                    name: resource.name,
                    duration: `${resource.duration.toFixed(2)}ms`,
                    type: resource.type
                });
            }
        });
    }

    /**
     * Monitor long tasks
     */
    monitorLongTasks() {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.logger.warn('Long task detected', {
                        duration: entry.duration,
                        startTime: entry.startTime
                    });
                }
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            this.logger.warn('Long task observation not supported');
        }
    }

    /**
     * Monitor user interactions
     */
    monitorInteractions() {
        const interactionTypes = ['click', 'input', 'scroll'];
        
        interactionTypes.forEach(type => {
            document.addEventListener(type, Utils.throttle((event) => {
                const startTime = performance.now();
                
                requestAnimationFrame(() => {
                    const duration = performance.now() - startTime;
                    
                    if (duration > 100) {
                        this.logger.warn('Slow interaction detected', {
                            type,
                            duration: `${duration.toFixed(2)}ms`,
                            target: event.target.tagName
                        });
                    }
                });
            }, 1000));
        });
    }

    /**
     * Report metrics to analytics
     */
    reportMetrics(category, data) {
        // TODO: Send to analytics service
        // For now, just store in localStorage
        try {
            const metrics = JSON.parse(localStorage.getItem('hlpfl_performance_metrics') || '[]');
            metrics.push({
                category,
                data,
                timestamp: new Date().toISOString(),
                url: window.location.href
            });
            
            // Keep only last 100 metrics
            if (metrics.length > 100) {
                metrics.shift();
            }
            
            localStorage.setItem('hlpfl_performance_metrics', JSON.stringify(metrics));
        } catch (e) {
            this.logger.error('Failed to store performance metrics', e);
        }
    }

    /**
     * Get all metrics
     */
    getMetrics() {
        return this.metrics;
    }

    /**
     * Get performance score
     */
    getPerformanceScore() {
        const scores = {
            lcp: this.scoreLCP(),
            fid: this.scoreFID(),
            cls: this.scoreCLS(),
            fcp: this.scoreFCP(),
            ttfb: this.scoreTTFB()
        };

        const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

        return {
            scores,
            overall: avgScore,
            grade: this.getGrade(avgScore)
        };
    }

    /**
     * Score LCP (0-100)
     */
    scoreLCP() {
        const lcp = this.metrics.vitals.lcp;
        if (!lcp) return 0;
        if (lcp <= 2500) return 100;
        if (lcp <= 4000) return 50;
        return 0;
    }

    /**
     * Score FID (0-100)
     */
    scoreFID() {
        const fid = this.metrics.vitals.fid;
        if (!fid) return 0;
        if (fid <= 100) return 100;
        if (fid <= 300) return 50;
        return 0;
    }

    /**
     * Score CLS (0-100)
     */
    scoreCLS() {
        const cls = this.metrics.vitals.cls;
        if (cls === undefined) return 0;
        if (cls <= 0.1) return 100;
        if (cls <= 0.25) return 50;
        return 0;
    }

    /**
     * Score FCP (0-100)
     */
    scoreFCP() {
        const fcp = this.metrics.vitals.fcp;
        if (!fcp) return 0;
        if (fcp <= 1800) return 100;
        if (fcp <= 3000) return 50;
        return 0;
    }

    /**
     * Score TTFB (0-100)
     */
    scoreTTFB() {
        const ttfb = this.metrics.vitals.ttfb;
        if (!ttfb) return 0;
        if (ttfb <= 600) return 100;
        if (ttfb <= 1500) return 50;
        return 0;
    }

    /**
     * Get grade from score
     */
    getGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Export metrics
     */
    exportMetrics() {
        return JSON.stringify(this.metrics, null, 2);
    }

    /**
     * Download metrics
     */
    downloadMetrics() {
        const blob = new Blob([this.exportMetrics()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-metrics-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Create global instance
window.performanceMonitor = new PerformanceMonitor();