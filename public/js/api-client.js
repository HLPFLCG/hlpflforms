/**
 * Centralized API Client with error handling, logging, and retry logic
 */

class APIClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.logger = new Logger('APIClient');
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    /**
     * Get authentication token from localStorage
     */
    getAuthToken() {
        return localStorage.getItem('token');
    }

    /**
     * Set authentication token
     */
    setAuthToken(token) {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    /**
     * Get headers with authentication
     */
    getHeaders(customHeaders = {}) {
        const headers = { ...this.defaultHeaders, ...customHeaders };
        const token = this.getAuthToken();
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    /**
     * Make HTTP request with retry logic
     */
    async request(endpoint, options = {}, retryCount = 0) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.headers || {})
        };

        this.logger.debug(`Making ${options.method || 'GET'} request to ${url}`, config);

        try {
            const response = await fetch(url, config);
            
            // Log response
            this.logger.debug(`Response from ${url}`, {
                status: response.status,
                statusText: response.statusText
            });

            // Handle different status codes
            if (response.status === 401) {
                this.logger.warn('Unauthorized request - clearing token');
                this.setAuthToken(null);
                window.location.href = '/login.html';
                throw new Error('Unauthorized - please login again');
            }

            if (response.status === 403) {
                throw new Error('Forbidden - you do not have permission');
            }

            if (response.status === 404) {
                throw new Error('Resource not found');
            }

            if (response.status === 429) {
                // Rate limited - retry with exponential backoff
                if (retryCount < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, retryCount);
                    this.logger.warn(`Rate limited - retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
                    await this.sleep(delay);
                    return this.request(endpoint, options, retryCount + 1);
                }
                throw new Error('Rate limit exceeded - please try again later');
            }

            if (response.status >= 500) {
                // Server error - retry
                if (retryCount < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, retryCount);
                    this.logger.warn(`Server error - retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
                    await this.sleep(delay);
                    return this.request(endpoint, options, retryCount + 1);
                }
                throw new Error('Server error - please try again later');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Request failed with status ${response.status}`);
            }

            // Parse response
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();

        } catch (error) {
            this.logger.error(`Request failed: ${url}`, error);
            throw error;
        }
    }

    /**
     * Sleep utility for retry delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Upload file
     */
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }
}

// Create global instance
window.apiClient = new APIClient();