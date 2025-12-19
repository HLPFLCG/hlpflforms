// Cloudflare Pages Functions Middleware

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // Handle OPTIONS
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }
    
    // API routes
    if (url.pathname.startsWith('/api/')) {
        try {
            const response = await handleAPI(request, env, url);
            // Add CORS headers to response
            Object.entries(corsHeaders).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
            return response;
        } catch (error) {
            console.error('API Error:', error);
            return new Response(JSON.stringify({ error: 'Internal server error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
    
    // Continue to static assets
    return next();
}

async function handleAPI(request, env, url) {
    const path = url.pathname;
    const method = request.method;
    
    // Auth endpoints
    if (path === '/api/auth/register' && method === 'POST') {
        return handleRegister(request, env);
    }
    
    if (path === '/api/auth/login' && method === 'POST') {
        return handleLogin(request, env);
    }
    
    // Protected endpoints - require authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return jsonResponse({ error: 'Authentication required' }, 401);
    }
    
    // Verify token (simplified - in production use proper JWT)
    const userId = await verifyToken(token, env);
    if (!userId) {
        return jsonResponse({ error: 'Invalid token' }, 401);
    }
    
    // Dashboard stats
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
    
    // Form submission (public endpoint)
    if (path.startsWith('/api/submit/')) {
        const formId = path.replace('/api/submit/', '');
        return handleSubmission(formId, request, env);
    }
    
    return jsonResponse({ error: 'Endpoint not found' }, 404);
}

// Helper functions
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function generateToken(userId, env) {
    const token = crypto.randomUUID();
    // In production, use proper JWT with expiration
    return `${userId}:${token}`;
}

async function verifyToken(token, env) {
    // Simplified token verification
    // In production, use proper JWT verification
    const parts = token.split(':');
    if (parts.length !== 2) return null;
    return parseInt(parts[0]);
}

// Auth handlers
// In-memory storage (temporary - replace with D1 database in production)
const users = [];
const forms = [];
const submissions = [];

async function handleRegister(request, env) {
    try {
        const { name, email, password } = await request.json();
        
        if (!name || !email || !password) {
            return jsonResponse({ error: 'Missing required fields' }, 400);
        }
        
        if (password.length < 8) {
            return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
        }
        
        const hashedPassword = await hashPassword(password);
        
        // Check if user exists
        const existing = users.find(u => u.email === email);
        
        if (existing) {
            return jsonResponse({ error: 'Email already registered' }, 400);
        }
        
        // Create user
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword,
            created_at: new Date().toISOString()
        };
        users.push(newUser);
        
        return jsonResponse({ 
            success: true, 
            message: 'Account created successfully' 
        }, 201);
        
    } catch (error) {
        console.error('Register error:', error);
        return jsonResponse({ error: 'Registration failed' }, 500);
    }
}

async function handleLogin(request, env) {
    try {
        const { email, password } = await request.json();
        
        if (!email || !password) {
            return jsonResponse({ error: 'Missing email or password' }, 400);
        }
        
        const hashedPassword = await hashPassword(password);
        
        const user = users.find(u => u.email === email && u.password === hashedPassword);
        
        if (!user) {
            return jsonResponse({ error: 'Invalid email or password' }, 401);
        }
        
        const token = await generateToken(user.id, env);
        
        return jsonResponse({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return jsonResponse({ error: 'Login failed' }, 500);
    }
}

// Dashboard handlers
async function getDashboardStats(userId, env) {
    try {
        const userForms = forms.filter(f => f.user_id === userId);
        const userFormIds = userForms.map(f => f.id);
        const userSubmissions = submissions.filter(s => userFormIds.includes(s.form_id));
        
        const today = new Date().toISOString().split('T')[0];
        const todaySubmissions = userSubmissions.filter(s => 
            s.created_at.split('T')[0] === today
        );
        
        return jsonResponse({
            totalForms: userForms.length,
            totalSubmissions: userSubmissions.length,
            todaySubmissions: todaySubmissions.length,
            conversionRate: 0
        });
        
    } catch (error) {
        console.error('Stats error:', error);
        return jsonResponse({ error: 'Failed to load stats' }, 500);
    }
}

// Forms handlers
async function getForms(userId, env, url) {
    try {
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const userForms = forms.filter(f => f.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);
        
        return jsonResponse(userForms);
        
    } catch (error) {
        console.error('Get forms error:', error);
        return jsonResponse({ error: 'Failed to load forms' }, 500);
    }
}

async function createForm(userId, request, env) {
    try {
        const { name, description, fields, styling } = await request.json();
        
        if (!name || !fields) {
            return jsonResponse({ error: 'Missing required fields' }, 400);
        }
        
        const formId = crypto.randomUUID();
        
        const newForm = {
            id: formId,
            user_id: userId,
            name,
            description: description || '',
            fields: JSON.stringify(fields),
            styling: JSON.stringify(styling || {}),
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        forms.push(newForm);
        
        return jsonResponse({ 
            success: true, 
            formId,
            message: 'Form created successfully' 
        }, 201);
        
    } catch (error) {
        console.error('Create form error:', error);
        return jsonResponse({ error: 'Failed to create form' }, 500);
    }
}

// Submission handler (public)
async function handleSubmission(formId, request, env) {
    try {
        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Method not allowed' }, 405);
        }
        
        // Check if form exists and is active
        const form = forms.find(f => f.id === formId && f.active);
        
        if (!form) {
            return jsonResponse({ error: 'Form not found or inactive' }, 404);
        }
        
        const data = await request.json();
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const userAgent = request.headers.get('User-Agent') || 'unknown';
        
        // Store submission
        const newSubmission = {
            id: submissions.length + 1,
            form_id: formId,
            data: JSON.stringify(data),
            ip_address: ip,
            user_agent: userAgent,
            created_at: new Date().toISOString()
        };
        
        submissions.push(newSubmission);
        
        return jsonResponse({ 
            success: true, 
            message: 'Submission received' 
        });
        
    } catch (error) {
        console.error('Submission error:', error);
        return jsonResponse({ error: 'Failed to process submission' }, 500);
    }
}