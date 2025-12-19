// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Load user profile
    loadUserProfile();
    setupEventListeners();
});

function setupEventListeners() {
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    // Password form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    // Avatar upload
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }

    // Generate API key
    const generateKeyBtn = document.getElementById('generateKeyBtn');
    if (generateKeyBtn) {
        generateKeyBtn.addEventListener('click', generateApiKey);
    }
}

async function loadUserProfile() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const user = data.user;

            // Update profile display
            document.getElementById('profileName').textContent = user.username || 'User';
            document.getElementById('profileEmail').textContent = user.email || 'user@example.com';
            
            // Update form fields
            document.getElementById('firstName').value = user.firstName || '';
            document.getElementById('lastName').value = user.lastName || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('company').value = user.company || '';

            // Update avatar
            const avatarImg = document.getElementById('avatarImg');
            if (avatarImg) {
                const name = user.username || 'User';
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c87941&color=fff&size=150`;
            }

            // Load user stats
            await loadUserStats();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadUserStats() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const stats = await response.json();
            document.getElementById('userForms').textContent = stats.totalForms || 0;
            document.getElementById('userSubmissions').textContent = stats.totalSubmissions || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value
    };

    try {
        // In production, this would update the profile via API
        console.log('Updating profile:', formData);
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }

    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }

    try {
        // In production, this would update the password via API
        console.log('Changing password');
        alert('Password changed successfully!');
        
        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Failed to change password');
    }
}

async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
    }

    try {
        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('avatarImg').src = e.target.result;
        };
        reader.readAsDataURL(file);

        // In production, this would upload to server
        console.log('Uploading avatar:', file.name);
        alert('Avatar updated successfully!');
    } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload avatar');
    }
}

async function generateApiKey() {
    if (!confirm('Generate a new API key? This will invalidate your current key.')) {
        return;
    }

    try {
        // Generate random API key
        const apiKey = 'hlpfl_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        // Store in localStorage (in production, this would be stored securely on server)
        localStorage.setItem('apiKey', apiKey);

        // Update display
        document.getElementById('apiKeyDisplay').textContent = apiKey;
        
        alert('New API key generated successfully!');
    } catch (error) {
        console.error('Error generating API key:', error);
        alert('Failed to generate API key');
    }
}

function copyApiKey() {
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');
    const apiKey = apiKeyDisplay.textContent;

    if (apiKey.includes('•')) {
        alert('Please reveal the API key first');
        return;
    }

    navigator.clipboard.writeText(apiKey).then(() => {
        alert('API key copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy API key');
    });
}

function toggleApiKey() {
    const apiKeyDisplay = document.getElementById('apiKeyDisplay');
    const currentText = apiKeyDisplay.textContent;

    if (currentText.includes('•')) {
        // Show API key
        const apiKey = localStorage.getItem('apiKey') || 'No API key generated yet';
        apiKeyDisplay.textContent = apiKey;
    } else {
        // Hide API key
        apiKeyDisplay.textContent = '••••••••••••••••••••••••••••••••';
    }
}