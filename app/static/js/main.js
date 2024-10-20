function isLoggedIn() {
    return sessionStorage.getItem('loggedIn') === 'true'; 
}

function login() {
    sessionStorage.setItem('loggedIn', 'true');
}

function logout() {
    sessionStorage.removeItem('loggedIn');
}

window.onload = function() {
    const authButtons = document.getElementById('auth-buttons');

    if (isLoggedIn()) {
        authButtons.innerHTML = `
            <a href="/profile">
                <img src="/static/images/profile.png" alt="Profile" style="height: 40px; border-radius: 50%;">
            </a>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="login-button" onclick="openLoginModal()">Log in</button>
            <button class="signup-button" onclick="openSignupModal()">Sign up</button>
        `;
    }
};