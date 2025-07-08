// User storage key
const USERS_KEY = 'diapro_users';
const SESSION_KEY = 'diapro_session';

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}
function setUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function setSession(username) {
    sessionStorage.setItem(SESSION_KEY, username);
}
function getSession() {
    return sessionStorage.getItem(SESSION_KEY);
}
function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

// Signup logic
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const age = document.getElementById('signup-age').value.trim();
        const gender = document.getElementById('signup-gender').value;
        const weight = document.getElementById('signup-weight').value.trim();
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const message = document.getElementById('signup-message');
        let users = getUsers();
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            message.textContent = 'Username already exists. Please choose another.';
            return;
        }
        users.push({ username, password });
        setUsers(users);
        setSession(username);
        // Save profile info
        const profileData = { name, age, gender, weight };
        localStorage.setItem('diapro_profile', JSON.stringify(profileData));
        message.style.color = '#388e3c';
        message.textContent = 'Signup successful! Redirecting...';
        setTimeout(() => window.location.href = 'dashboard.html', 1200);
    });
}

// Login logic
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const message = document.getElementById('login-message');
        let users = getUsers();
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (!user) {
            message.textContent = 'Invalid username or password.';
            return;
        }
        setSession(username);
        message.style.color = '#388e3c';
        message.textContent = 'Login successful! Redirecting...';
        setTimeout(() => window.location.href = 'dashboard.html', 1200);
    });
}

// Logout logic
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        clearSession();
        window.location.href = 'login.html';
    });
}

// Utility: If not logged in, redirect to login from protected pages
document.addEventListener('DOMContentLoaded', function() {
    const protectedPages = ['dashboard.html', 'medication.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    if (protectedPages.includes(currentPage) && !getSession()) {
        window.location.href = 'login.html';
    }
    // If on login/signup and already logged in, redirect to dashboard
    if ((loginForm || signupForm) && getSession()) {
        window.location.href = 'dashboard.html';
    }
});