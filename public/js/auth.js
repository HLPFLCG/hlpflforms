// Authentication JavaScript

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    setTimeout(() => messageDiv.innerHTML = '', 5000);
}

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('hlpfl_token');
    if (token && window.location.pathname.includes('login')) {
        window.location.href = '/dashboard.html';
    }
}

// Login Form Handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('hlpfl_token', data.token);
                localStorage.setItem('hlpfl_user', JSON.stringify(data.user));
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => window.location.href = '/dashboard.html', 1000);
            } else {
                showMessage(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

// Register Form Handler
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 8) {
            showMessage('Password must be at least 8 characters', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Account created! Redirecting to login...', 'success');
                setTimeout(() => window.location.href = '/login.html', 2000);
            } else {
                showMessage(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

// Logout function
function logout() {
    localStorage.removeItem('hlpfl_token');
    localStorage.removeItem('hlpfl_user');
    window.location.href = '/';
}

// Check auth on page load
checkAuth();