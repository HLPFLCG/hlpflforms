/**
 * Enhanced Secure Middleware for Cloudflare Pages
 * With JWT validation, CSRF protection, and comprehensive security
 */

// In-memory storage (will be replaced with D1 database)
const storage = {
    users: [
        { 
            id: 1, 
            username: 'admin', 
            password: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            email: 'admin@hlpfl.org',
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'admin']
        }
    ],
    forms: [],
    submissions: [],
    sessions: new Map(),
    rateLimits: new Map(),
    csrfTokens: new Map(),
    blacklistedTokens: new Set()
};

// Security configuration
const SECURITY_CONFIG = {
    jwt: {
        secret: 'hlpfl-forms-secret-key-change-in-production',
        expiresIn: 24 * 60 * 60 * 1000, // 24 hours
        refreshExpiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
    },
    rateLimit: {
        windowMs: 60000, // 1 minute
        maxRequests: 100,
        maxAuthAttempts: 5,
        maxFormSubmissions: 10
    },
    csrf: {
        tokenLength: 32,
        expiresIn: 60 * 60 * 1000 // 1 hour
    },
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes
    }
};

/**
 * Security headers
 */
function getSecurityHeaders() {
    return {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    };
}

/**
 * CORS headers
 */
function getCORSHeaders(origin = '*') {
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
        'Access-Control-Max-Age': '86400'
    };
}

/**
 * Generate JWT token
 */
async function generateJWT(payload) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const now = Date.now();
    const jwtPayload = {
        ...payload,
        iat: Math.floor(now / 1000),
        exp: Math.floor((now + SECURITY_CONFIG.jwt.expiresIn) / 1000)
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(jwtPayload));
    
    const signature = await signJWT(`${encodedHeader}.${encodedPayload}`);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Sign JWT
 */
async function signJWT(data) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECURITY_CONFIG.jwt.secret);
    const dataToSign = encoder.encode(data);
    
    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, dataToSign);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Verify JWT token
 */
async function verifyJWT(token) {
    try {
        // Check if token is blacklisted
        if (storage.blacklistedTokens.has(token)) {
            return null;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const [encodedHeader, encodedPayload, signature] = parts;
        
        // Verify signature
        const expectedSignature = await signJWT(`${encodedHeader}.${encodedPayload}`);
        if (signature !== expectedSignature) {
            return null;
        }

        // Decode payload
        const payload = JSON.parse(atob(encodedPayload));
        
        // Check expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    const array = new Uint8Array(SECURITY_CONFIG.csrf.tokenLength);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token
 */
function validateCSRFToken(token, userId) {
    const stored = storage.csrfTokens.get(userId);
    if (!stored) {
        return false;
    }

    // Check if token matches
    if (stored.token !== token) {
        return false;
    }

    // Check if token is expired
    if (Date.now() > stored.expiresAt) {
        storage.csrfTokens.delete(userId);
        return false;
    }

    return true;
}

/**
 * Rate limiting check
 */
function checkRateLimit(identifier, maxRequests = SECURITY_CONFIG.rateLimit.maxRequests) {
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.rateLimit.windowMs;
    
    if (!storage.rateLimits.has(identifier)) {
        storage.rateLimits.set(identifier, []);
    }
    
    const requests = storage.rateLimits.get(identifier);
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
        return false;
    }
    
    recentRequests.push(now);
    storage.rateLimits.set(identifier, recentRequests);
    
    return true;
}

/**
 * Get client identifier
 */
function getClientIdentifier(request) {
    return request.headers.get('CF-Connecting-IP') || 
           request.headers.get('X-Forwarded-For') || 
           'unknown';
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
    const errors = [];
    
    if (password.length < SECURITY_CONFIG.password.minLength) {
        errors.push(`Password must be at least ${SECURITY_CONFIG.password.minLength} characters`);
    }
    
    if (SECURITY_CONFIG.password.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (SECURITY_CONFIG.password.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (SECURITY_CONFIG.password.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (SECURITY_CONFIG.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Hash password
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Sanitize input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }
    
    // Remove potential XSS patterns
    return input
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
}

/**
 * Main middleware handler
 */
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    const startTime = Date.now();
    
    // Security headers
    const securityHeaders = getSecurityHeaders();
    const corsHeaders = getCORSHeaders();
    const allHeaders = { ...securityHeaders, ...corsHeaders };
    
    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { 
            status: 204,
            headers: allHeaders 
        });
    }
    
    // Health check endpoint
    if (url.pathname === '/api/health') {
        return jsonResponse({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            security: 'enhanced'
        }, 200, allHeaders);
    }
    
    // Rate limiting
    const clientId = getClientIdentifier(request);
    if (!checkRateLimit(clientId)) {
        return jsonResponse({ 
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.'
        }, 429, allHeaders);
    }
    
    // API routes
    if (url.pathname.startsWith('/api/')) {
        try {
            const response = await handleAPI(request, env, url, clientId);
            
            // Add headers to response
            Object.entries(allHeaders).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
            
            // Log request
            const duration = Date.now() - startTime;
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                method: request.method,
                url: url.pathname,
                status: response.status,
                duration: `${duration}ms`,
                ip: clientId
            }));
            
            return response;
        } catch (error) {
            console.error('API Error:', error);
            const response = jsonResponse({ 
                error: 'Internal server error',
                message: 'An unexpected error occurred. Please try again.'
            }, 500, allHeaders);
            
            return response;
        }
    }
    
    // Continue to static assets
    const response = await next();
    
    // Add security headers to static responses
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    
    return response;
}

/**
 * API request handler
 */
async function handleAPI(request, env, url, clientId) {
    const path = url.pathname;
    const method = request.method;
    
    // Public endpoints
    
    // Form submission (public)
    if (path.startsWith('/api/submit/') && method === 'POST') {
        const formId = path.replace('/api/submit/', '');
        return handleSubmission(formId, request, env, clientId);
    }
    
    // Authentication endpoints
    if (path === '/api/auth/register' && method === 'POST') {
        if (!checkRateLimit(`auth:${clientId}`, SECURITY_CONFIG.rateLimit.maxAuthAttempts)) {
            return jsonResponse({ 
                error: 'Too many authentication attempts',
                message: 'Please try again later.'
            }, 429);
        }
        return handleRegister(request, env);
    }
    
    if (path === '/api/auth/login' && method === 'POST') {
        if (!checkRateLimit(`auth:${clientId}`, SECURITY_CONFIG.rateLimit.maxAuthAttempts)) {
            return jsonResponse({ 
                error: 'Too many authentication attempts',
                message: 'Please try again later.'
            }, 429);
        }
        return handleLogin(request, env);
    }
    
    if (path === '/api/auth/logout' && method === 'POST') {
        return handleLogout(request, env);
    }
    
    if (path === '/api/auth/refresh' && method === 'POST') {
        return handleRefreshToken(request, env);
    }
    
    if (path === '/api/auth/verify' && method === 'GET') {
        return handleVerifyToken(request, env);
    }
    
    // Get CSRF token
    if (path === '/api/csrf-token' && method === 'GET') {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return jsonResponse({ error: 'Authentication required' }, 401);
        }
        
        const payload = await verifyJWT(token);
        if (!payload) {
            return jsonResponse({ error: 'Invalid token' }, 401);
        }
        
        const csrfToken = generateCSRFToken();
        storage.csrfTokens.set(payload.userId, {
            token: csrfToken,
            expiresAt: Date.now() + SECURITY_CONFIG.csrf.expiresIn
        });
        
        return jsonResponse({ csrfToken });
    }
    
    // Protected endpoints - require authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return jsonResponse({ 
            error: 'Authentication required',
            message: 'Please login to access this resource.'
        }, 401);
    }
    
    const payload = await verifyJWT(token);
    if (!payload) {
        return jsonResponse({ 
            error: 'Invalid or expired token',
            message: 'Please login again.'
        }, 401);
    }
    
    const userId = payload.userId;
    
    // CSRF protection for state-changing operations
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
        const csrfToken = request.headers.get('X-CSRF-Token');
        if (!csrfToken || !validateCSRFToken(csrfToken, userId)) {
            return jsonResponse({ 
                error: 'CSRF validation failed',
                message: 'Invalid or expired CSRF token.'
            }, 403);
        }
    }
    
    // Dashboard endpoints
    if (path === '/api/dashboard/stats' && method === 'GET') {
        return getDashboardStats(userId, env);
    }
    
    // Forms endpoints
    if (path === '/api/forms' && method === 'GET') {
        return getForms(userId, env, url);
    }
    
    if (path === '/api/forms' && method === 'POST') {
        return createForm(userId, request, env);
    }
    
    if (path.match(/^\/api\/forms\/[^\/]+$/) && method === 'GET') {
        const formId = path.split('/').pop();
        return getForm(userId, formId, env);
    }
    
    if (path.match(/^\/api\/forms\/[^\/]+$/) && method === 'PUT') {
        const formId = path.split('/').pop();
        return updateForm(userId, formId, request, env);
    }
    
    if (path.match(/^\/api\/forms\/[^\/]+$/) && method === 'DELETE') {
        const formId = path.split('/').pop();
        return deleteForm(userId, formId, env);
    }
    
    // Submissions endpoints
    if (path.match(/^\/api\/forms\/[^\/]+\/submissions$/) && method === 'GET') {
        const formId = path.split('/')[3];
        return getSubmissions(userId, formId, env);
    }
    
    return jsonResponse({ 
        error: 'Endpoint not found',
        message: 'The requested endpoint does not exist.'
    }, 404);
}

/**
 * Helper: JSON response
 */
function jsonResponse(data, status = 200, additionalHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...additionalHeaders
        }
    });
}

/**
 * Handler: Register
 */
async function handleRegister(request, env) {
    try {
        const { username, password, email } = await request.json();
        
        // Sanitize inputs
        const sanitizedUsername = sanitizeInput(username);
        const sanitizedEmail = sanitizeInput(email);
        
        // Validation
        if (!sanitizedUsername || !password || !sanitizedEmail) {
            return jsonResponse({ 
                error: 'Missing required fields',
                message: 'Username, password, and email are required.'
            }, 400);
        }
        
        if (sanitizedUsername.length < 3) {
            return jsonResponse({ 
                error: 'Invalid username',
                message: 'Username must be at least 3 characters long.'
            }, 400);
        }
        
        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return jsonResponse({ 
                error: 'Weak password',
                message: passwordValidation.errors[0],
                errors: passwordValidation.errors
            }, 400);
        }
        
        // Check if user exists
        if (storage.users.find(u => u.username === sanitizedUsername)) {
            return jsonResponse({ 
                error: 'Username already exists',
                message: 'Please choose a different username.'
            }, 409);
        }
        
        // Create user
        const hashedPassword = await hashPassword(password);
        const user = {
            id: storage.users.length + 1,
            username: sanitizedUsername,
            password: hashedPassword,
            email: sanitizedEmail,
            role: 'user',
            permissions: ['read', 'write'],
            createdAt: new Date().toISOString()
        };
        
        storage.users.push(user);
        
        // Generate JWT token
        const token = await generateJWT({
            userId: user.id,
            username: user.username,
            role: user.role
        });
        
        // Generate CSRF token
        const csrfToken = generateCSRFToken();
        storage.csrfTokens.set(user.id, {
            token: csrfToken,
            expiresAt: Date.now() + SECURITY_CONFIG.csrf.expiresIn
        });
        
        return jsonResponse({
            success: true,
            token,
            csrfToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        }, 201);
        
    } catch (error) {
        console.error('Register error:', error);
        return jsonResponse({ 
            error: 'Registration failed',
            message: 'An error occurred during registration.'
        }, 500);
    }
}

/**
 * Handler: Login
 */
async function handleLogin(request, env) {
    try {
        const { username, password } = await request.json();
        
        // Sanitize inputs
        const sanitizedUsername = sanitizeInput(username);
        
        if (!sanitizedUsername || !password) {
            return jsonResponse({ 
                error: 'Missing credentials',
                message: 'Username and password are required.'
            }, 400);
        }
        
        const user = storage.users.find(u => u.username === sanitizedUsername);
        if (!user) {
            return jsonResponse({ 
                error: 'Invalid credentials',
                message: 'Username or password is incorrect.'
            }, 401);
        }
        
        const hashedPassword = await hashPassword(password);
        if (user.password !== hashedPassword) {
            return jsonResponse({ 
                error: 'Invalid credentials',
                message: 'Username or password is incorrect.'
            }, 401);
        }
        
        // Generate JWT token
        const token = await generateJWT({
            userId: user.id,
            username: user.username,
            role: user.role
        });
        
        // Generate CSRF token
        const csrfToken = generateCSRFToken();
        storage.csrfTokens.set(user.id, {
            token: csrfToken,
            expiresAt: Date.now() + SECURITY_CONFIG.csrf.expiresIn
        });
        
        return jsonResponse({
            success: true,
            token,
            csrfToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return jsonResponse({ 
            error: 'Login failed',
            message: 'An error occurred during login.'
        }, 500);
    }
}

/**
 * Handler: Logout
 */
async function handleLogout(request, env) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (token) {
            // Blacklist the token
            storage.blacklistedTokens.add(token);
            
            // Get user ID from token
            const payload = await verifyJWT(token);
            if (payload) {
                // Remove CSRF token
                storage.csrfTokens.delete(payload.userId);
            }
        }
        
        return jsonResponse({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return jsonResponse({ 
            error: 'Logout failed',
            message: 'An error occurred during logout.'
        }, 500);
    }
}

/**
 * Handler: Refresh token
 */
async function handleRefreshToken(request, env) {
    try {
        const { token: oldToken } = await request.json();
        
        if (!oldToken) {
            return jsonResponse({ 
                error: 'Token required',
                message: 'Refresh token is required.'
            }, 400);
        }
        
        const payload = await verifyJWT(oldToken);
        if (!payload) {
            return jsonResponse({ 
                error: 'Invalid token',
                message: 'Invalid or expired refresh token.'
            }, 401);
        }
        
        // Blacklist old token
        storage.blacklistedTokens.add(oldToken);
        
        // Generate new token
        const newToken = await generateJWT({
            userId: payload.userId,
            username: payload.username,
            role: payload.role
        });
        
        return jsonResponse({
            success: true,
            token: newToken
        });
        
    } catch (error) {
        console.error('Refresh token error:', error);
        return jsonResponse({ 
            error: 'Token refresh failed',
            message: 'An error occurred while refreshing token.'
        }, 500);
    }
}

/**
 * Handler: Verify token
 */
async function handleVerifyToken(request, env) {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return jsonResponse({ valid: false }, 401);
    }
    
    const payload = await verifyJWT(token);
    if (!payload) {
        return jsonResponse({ valid: false }, 401);
    }
    
    const user = storage.users.find(u => u.id === payload.userId);
    return jsonResponse({
        valid: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
}

/**
 * Handler: Get dashboard stats
 */
async function getDashboardStats(userId, env) {
    const userForms = storage.forms.filter(f => f.userId === userId);
    const formIds = userForms.map(f => f.id);
    const userSubmissions = storage.submissions.filter(s => formIds.includes(s.formId));
    
    const today = new Date().toDateString();
    const todaySubmissions = userSubmissions.filter(s => 
        new Date(s.createdAt).toDateString() === today
    );
    
    return jsonResponse({
        totalForms: userForms.length,
        totalSubmissions: userSubmissions.length,
        todaySubmissions: todaySubmissions.length,
        conversionRate: userForms.length > 0 ? 
            ((userSubmissions.length / (userForms.length * 100)) * 100).toFixed(2) : 0
    });
}

/**
 * Handler: Get forms
 */
async function getForms(userId, env, url) {
    const userForms = storage.forms.filter(f => f.userId === userId);
    
    const formsWithStats = userForms.map(form => ({
        ...form,
        submissionCount: storage.submissions.filter(s => s.formId === form.id).length
    }));
    
    return jsonResponse({ forms: formsWithStats });
}

/**
 * Handler: Create form
 */
async function createForm(userId, request, env) {
    try {
        const formData = await request.json();
        
        // Sanitize inputs
        const sanitizedName = sanitizeInput(formData.name);
        const sanitizedDescription = sanitizeInput(formData.description);
        
        if (!sanitizedName) {
            return jsonResponse({ 
                error: 'Form name is required',
                message: 'Please provide a name for your form.'
            }, 400);
        }
        
        const form = {
            id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            name: sanitizedName,
            description: sanitizedDescription || '',
            fields: formData.fields || [],
            settings: formData.settings || {},
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        storage.forms.push(form);
        
        return jsonResponse({ 
            success: true,
            form 
        }, 201);
        
    } catch (error) {
        console.error('Create form error:', error);
        return jsonResponse({ 
            error: 'Failed to create form',
            message: 'An error occurred while creating the form.'
        }, 500);
    }
}

/**
 * Handler: Get single form
 */
async function getForm(userId, formId, env) {
    const form = storage.forms.find(f => f.id === formId && f.userId === userId);
    
    if (!form) {
        return jsonResponse({ 
            error: 'Form not found',
            message: 'The requested form does not exist.'
        }, 404);
    }
    
    return jsonResponse({ form });
}

/**
 * Handler: Update form
 */
async function updateForm(userId, formId, request, env) {
    try {
        const formIndex = storage.forms.findIndex(f => f.id === formId && f.userId === userId);
        
        if (formIndex === -1) {
            return jsonResponse({ 
                error: 'Form not found',
                message: 'The requested form does not exist.'
            }, 404);
        }
        
        const updates = await request.json();
        
        // Sanitize inputs
        if (updates.name) {
            updates.name = sanitizeInput(updates.name);
        }
        if (updates.description) {
            updates.description = sanitizeInput(updates.description);
        }
        
        storage.forms[formIndex] = {
            ...storage.forms[formIndex],
            ...updates,
            id: formId,
            userId,
            updatedAt: new Date().toISOString()
        };
        
        return jsonResponse({ 
            success: true,
            form: storage.forms[formIndex]
        });
        
    } catch (error) {
        console.error('Update form error:', error);
        return jsonResponse({ 
            error: 'Failed to update form',
            message: 'An error occurred while updating the form.'
        }, 500);
    }
}

/**
 * Handler: Delete form
 */
async function deleteForm(userId, formId, env) {
    const formIndex = storage.forms.findIndex(f => f.id === formId && f.userId === userId);
    
    if (formIndex === -1) {
        return jsonResponse({ 
            error: 'Form not found',
            message: 'The requested form does not exist.'
        }, 404);
    }
    
    storage.forms.splice(formIndex, 1);
    storage.submissions = storage.submissions.filter(s => s.formId !== formId);
    
    return jsonResponse({ 
        success: true,
        message: 'Form deleted successfully'
    });
}

/**
 * Handler: Form submission
 */
async function handleSubmission(formId, request, env, clientId) {
    try {
        // Rate limit form submissions
        if (!checkRateLimit(`form:${formId}:${clientId}`, SECURITY_CONFIG.rateLimit.maxFormSubmissions)) {
            return jsonResponse({ 
                error: 'Too many submissions',
                message: 'Please wait before submitting again.'
            }, 429);
        }
        
        const form = storage.forms.find(f => f.id === formId);
        
        if (!form) {
            return jsonResponse({ 
                error: 'Form not found',
                message: 'The form you are trying to submit to does not exist.'
            }, 404);
        }
        
        if (form.status !== 'active') {
            return jsonResponse({ 
                error: 'Form is not accepting submissions',
                message: 'This form is currently closed.'
            }, 403);
        }
        
        const data = await request.json();
        
        // Sanitize all input data
        const sanitizedData = {};
        for (const [key, value] of Object.entries(data)) {
            sanitizedData[key] = sanitizeInput(value);
        }
        
        const submission = {
            id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            formId,
            data: sanitizedData,
            ip: clientId,
            userAgent: request.headers.get('User-Agent'),
            createdAt: new Date().toISOString()
        };
        
        storage.submissions.push(submission);
        
        return jsonResponse({ 
            success: true,
            message: 'Form submitted successfully',
            submissionId: submission.id
        }, 201);
        
    } catch (error) {
        console.error('Submission error:', error);
        return jsonResponse({ 
            error: 'Submission failed',
            message: 'An error occurred while submitting the form.'
        }, 500);
    }
}

/**
 * Handler: Get submissions
 */
async function getSubmissions(userId, formId, env) {
    const form = storage.forms.find(f => f.id === formId && f.userId === userId);
    
    if (!form) {
        return jsonResponse({ 
            error: 'Form not found',
            message: 'The requested form does not exist.'
        }, 404);
    }
    
    const submissions = storage.submissions.filter(s => s.formId === formId);
    
    return jsonResponse({ 
        submissions,
        total: submissions.length
    });
}