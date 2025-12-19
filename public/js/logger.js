/**
 * Comprehensive Logging System for HLPFL Forms
 * Provides structured logging with levels, timestamps, and context
 */

const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4
};

class Logger {
    constructor(context = 'App') {
        this.context = context;
        this.minLevel = LogLevel.INFO;
        this.logs = [];
        this.maxLogs = 1000;
        
        // In production, set to WARN or ERROR
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            this.minLevel = LogLevel.WARN;
        }
    }

    /**
     * Format log entry with timestamp and context
     */
    formatLog(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const levelName = Object.keys(LogLevel).find(key => LogLevel[key] === level);
        
        const logEntry = {
            timestamp,
            level: levelName,
            context: this.context,
            message,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Store in memory (limited to maxLogs)
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        return logEntry;
    }

    /**
     * Log debug information
     */
    debug(message, data = null) {
        if (this.minLevel <= LogLevel.DEBUG) {
            const entry = this.formatLog(LogLevel.DEBUG, message, data);
            console.debug(`[${entry.timestamp}] [${this.context}] ${message}`, data || '');
        }
    }

    /**
     * Log informational messages
     */
    info(message, data = null) {
        if (this.minLevel <= LogLevel.INFO) {
            const entry = this.formatLog(LogLevel.INFO, message, data);
            console.log(`[${entry.timestamp}] [${this.context}] ${message}`, data || '');
        }
    }

    /**
     * Log warnings
     */
    warn(message, data = null) {
        if (this.minLevel <= LogLevel.WARN) {
            const entry = this.formatLog(LogLevel.WARN, message, data);
            console.warn(`[${entry.timestamp}] [${this.context}] ${message}`, data || '');
        }
    }

    /**
     * Log errors
     */
    error(message, error = null) {
        if (this.minLevel <= LogLevel.ERROR) {
            const errorData = error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : null;
            
            const entry = this.formatLog(LogLevel.ERROR, message, errorData);
            console.error(`[${entry.timestamp}] [${this.context}] ${message}`, error || '');
            
            // Send to error tracking service in production
            this.sendToErrorTracking(entry);
        }
    }

    /**
     * Log critical errors that require immediate attention
     */
    critical(message, error = null) {
        const errorData = error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
        } : null;
        
        const entry = this.formatLog(LogLevel.CRITICAL, message, errorData);
        console.error(`[CRITICAL] [${entry.timestamp}] [${this.context}] ${message}`, error || '');
        
        // Always send critical errors
        this.sendToErrorTracking(entry);
    }

    /**
     * Send error to tracking service (placeholder for future implementation)
     */
    sendToErrorTracking(entry) {
        // TODO: Implement error tracking service integration (e.g., Sentry)
        // For now, store in localStorage for debugging
        try {
            const errors = JSON.parse(localStorage.getItem('hlpfl_errors') || '[]');
            errors.push(entry);
            // Keep only last 50 errors
            if (errors.length > 50) {
                errors.shift();
            }
            localStorage.setItem('hlpfl_errors', JSON.stringify(errors));
        } catch (e) {
            console.error('Failed to store error:', e);
        }
    }

    /**
     * Get all logs
     */
    getLogs(level = null) {
        if (level !== null) {
            return this.logs.filter(log => LogLevel[log.level] >= level);
        }
        return this.logs;
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * Export logs as JSON
     */
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }

    /**
     * Download logs as file
     */
    downloadLogs() {
        const blob = new Blob([this.exportLogs()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hlpfl-logs-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    const logger = new Logger('GlobalErrorHandler');
    logger.error('Uncaught error', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    const logger = new Logger('GlobalErrorHandler');
    logger.error('Unhandled promise rejection', event.reason);
});

// Export for use in other modules
window.Logger = Logger;
window.LogLevel = LogLevel;