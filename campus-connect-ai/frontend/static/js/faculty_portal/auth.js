const API_BASE_URL = '/api/faculty_portal';
const TOKEN_KEY = 'faculty_portal_auth_token';
const FACULTY_DATA_KEY = 'faculty_portal_user_data';

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem(TOKEN_KEY) !== null;
}

// Get the authentication token
function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Make authenticated API request
async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = getAuthToken();
    
    if (!token) {
        window.location.href = '/faculty_portal/login';
        throw new Error('No authentication token found');
    }
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '/faculty_portal/login';
                throw new Error('Session expired');
            }
            throw new Error('API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

// Save authentication data
function saveAuthData(token, facultyData) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(FACULTY_DATA_KEY, JSON.stringify(facultyData));
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch('/api/faculty/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        saveAuthData(data.token, data.faculty);
        window.location.href = '/faculty_portal/dashboard';
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Add login form handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        const errorMessage = document.getElementById('error-message');
        const loginButton = document.getElementById('login-button');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                loginButton.disabled = true;
                loginButton.textContent = 'Logging in...';
                await login(email, password);
            } catch (error) {
                errorMessage.textContent = error.message;
                errorMessage.classList.add('show');
                loginButton.disabled = false;
                loginButton.textContent = 'Login';
            }
        });
    }
});

// Check auth status and redirect if needed
if (window.location.pathname === '/faculty' || window.location.pathname === '/faculty/') {
    if (isAuthenticated()) {
        window.location.href = '/faculty_portal/dashboard';
    }
}

// Export auth functions
window.facultyAuth = {
    isAuthenticated,
    getAuthToken,
    apiRequest
};