// Dashboard JavaScript

// Check authentication
function requireAuth() {
    const token = localStorage.getItem('hlpfl_token');
    if (!token) {
        window.location.href = '/login.html';
        return null;
    }
    return token;
}

// API call helper
async function apiCall(endpoint, method = 'GET', data = null) {
    const token = requireAuth();
    if (!token) return;
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(endpoint, options);
    
    if (response.status === 401) {
        localStorage.removeItem('hlpfl_token');
        window.location.href = '/login.html';
        return;
    }
    
    return response.json();
}

// Load dashboard stats
async function loadStats() {
    try {
        const stats = await apiCall('/api/dashboard/stats');
        
        if (stats) {
            document.getElementById('totalForms').textContent = stats.totalForms || 0;
            document.getElementById('totalSubmissions').textContent = stats.totalSubmissions || 0;
            document.getElementById('todaySubmissions').textContent = stats.todaySubmissions || 0;
            document.getElementById('conversionRate').textContent = (stats.conversionRate || 0) + '%';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent forms
async function loadRecentForms() {
    try {
        const forms = await apiCall('/api/forms?limit=5');
        
        const container = document.getElementById('recentForms');
        
        if (!forms || forms.length === 0) {
            container.innerHTML = '<p>No forms yet. <a href="/forms.html?action=create">Create your first form</a></p>';
            return;
        }
        
        container.innerHTML = forms.map(form => `
            <div style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 1rem;">
                <h3>${form.name}</h3>
                <p>Created: ${new Date(form.created_at).toLocaleDateString()}</p>
                <a href="/forms.html?id=${form.id}">View Details</a>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading forms:', error);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('hlpfl_token');
    localStorage.removeItem('hlpfl_user');
    window.location.href = '/';
}

// Initialize dashboard
if (document.querySelector('.dashboard')) {
    requireAuth();
    loadStats();
    loadRecentForms();
}