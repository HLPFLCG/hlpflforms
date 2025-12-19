/**
 * Enhanced Cloudflare Pages Functions Middleware
 * With security headers, rate limiting, logging, and comprehensive error handling
 */

// In-memory storage (will be replaced with D1 database)
const storage = {
    users: [
        { id: 1, username: 'admin', password: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', email: 'admin@hlpfl.org' }
    ],
    forms: [],
    submissions: [],
    sessions: new Map(),
    rateLimits: new Map()
};

// Rate limiting configuration
const RATE_LIMIT = {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    maxAuthAttempts: 5
};

/**
 * Security headers middleware
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    };
}

/**
 * Rate limiting check
 */
function checkRateLimit(identifier, maxRequests = RATE_LIMIT.maxRequests) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.windowMs;
    
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
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request) {
    const ip = request.headers.get('CF-Connecting-IP') || 
               request.headers.get('X-Forwarded-For') || 
               'unknown';
    return ip;
}

/**
 * Log request
 */
function logRequest(request, response, duration) {
    const log = {
        timestamp: new Date().toISOString(),
        method: request.method,
        url: new URL(request.url).pathname,
        status: response.status,
        duration: `${duration}ms`,
        ip: getClientIdentifier(request),
        userAgent: request.headers.get('User-Agent')
    };
    
    console.log(JSON.stringify(log));
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
            version: '2.0.0'
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
            logRequest(request, response, duration);
            
            return response;
        } catch (error) {
            console.error('API Error:', error);
            const response = jsonResponse({ 
                error: 'Internal server error',
                message: 'An unexpected error occurred. Please try again.'
            }, 500, allHeaders);
            
            const duration = Date.now() - startTime;
            logRequest(request, response, duration);
            
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
        return handleSubmission(formId, request, env);
    }
    
    // Authentication endpoints
    if (path === '/api/auth/register' && method === 'POST') {
        // Extra rate limiting for auth endpoints
        if (!checkRateLimit(`auth:${clientId}`, RATE_LIMIT.maxAuthAttempts)) {
            return jsonResponse({ 
                error: 'Too many authentication attempts',
                message: 'Please try again later.'
            }, 429);
        }
        return handleRegister(request, env);
    }
    
    if (path === '/api/auth/login' && method === 'POST') {
        if (!checkRateLimit(`auth:${clientId}`, RATE_LIMIT.maxAuthAttempts)) {
            return jsonResponse({ 
                error: 'Too many authentication attempts',
                message: 'Please try again later.'
            }, 429);
        }
        return handleLogin(request, env);
    }
    
    if (path === '/api/auth/verify' && method === 'GET') {
        return handleVerifyToken(request, env);
    }
    
    // Protected endpoints - require authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return jsonResponse({ 
            error: 'Authentication required',
            message: 'Please login to access this resource.'
        }, 401);
    }
    
    const userId = await verifyToken(token, env);
    if (!userId) {
        return jsonResponse({ 
            error: 'Invalid or expired token',
            message: 'Please login again.'
        }, 401);
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
 * Helper: Hash password
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
 * Helper: Generate token
 */
function generateToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Helper: Verify token
 */
async function verifyToken(token, env) {
    const session = storage.sessions.get(token);
    if (!session) {
        return null;
    }
    
    // Check if token is expired (24 hours)
    if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
        storage.sessions.delete(token);
        return null;
    }
    
    return session.userId;
}

/**
 * Handler: Register
 */
async function handleRegister(request, env) {
    try {
        const { username, password, email } = await request.json();
        
        // Validation
        if (!username || !password || !email) {
            return jsonResponse({ 
                error: 'Missing required fields',
                message: 'Username, password, and email are required.'
            }, 400);
        }
        
        if (username.length < 3) {
            return jsonResponse({ 
                error: 'Invalid username',
                message: 'Username must be at least 3 characters long.'
            }, 400);
        }
        
        if (password.length < 8) {
            return jsonResponse({ 
                error: 'Invalid password',
                message: 'Password must be at least 8 characters long.'
            }, 400);
        }
        
        // Check if user exists
        if (storage.users.find(u => u.username === username)) {
            return jsonResponse({ 
                error: 'Username already exists',
                message: 'Please choose a different username.'
            }, 409);
        }
        
        // Create user
        const hashedPassword = await hashPassword(password);
        const user = {
            id: storage.users.length + 1,
            username,
            password: hashedPassword,
            email,
            createdAt: new Date().toISOString()
        };
        
        storage.users.push(user);
        
        // Generate token
        const token = generateToken();
        storage.sessions.set(token, {
            userId: user.id,
            createdAt: Date.now()
        });
        
        return jsonResponse({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
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
        
        if (!username || !password) {
            return jsonResponse({ 
                error: 'Missing credentials',
                message: 'Username and password are required.'
            }, 400);
        }
        
        const user = storage.users.find(u => u.username === username);
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
        
        // Generate token
        const token = generateToken();
        storage.sessions.set(token, {
            userId: user.id,
            createdAt: Date.now()
        });
        
        return jsonResponse({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
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
 * Handler: Verify token
 */
async function handleVerifyToken(request, env) {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return jsonResponse({ valid: false }, 401);
    }
    
    const userId = await verifyToken(token, env);
    if (!userId) {
        return jsonResponse({ valid: false }, 401);
    }
    
    const user = storage.users.find(u => u.id === userId);
    return jsonResponse({
        valid: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email
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
    
    // Add submission counts
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
        
        if (!formData.name) {
            return jsonResponse({ 
                error: 'Form name is required',
                message: 'Please provide a name for your form.'
            }, 400);
        }
        
        const form = {
            id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            name: formData.name,
            description: formData.description || '',
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
        storage.forms[formIndex] = {
            ...storage.forms[formIndex],
            ...updates,
            id: formId, // Prevent ID change
            userId, // Prevent userId change
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
    
    // Also delete submissions
    storage.submissions = storage.submissions.filter(s => s.formId !== formId);
    
    return jsonResponse({ 
        success: true,
        message: 'Form deleted successfully'
    });
}

/**
 * Handler: Form submission
 */
async function handleSubmission(formId, request, env) {
    try {
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
        
        const submission = {
            id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            formId,
            data,
            ip: getClientIdentifier(request),
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