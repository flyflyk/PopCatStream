function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true'; // localStorage會永久保存
}

function login() {
    localStorage.setItem('loggedIn', 'true');
}

function logout() {
    localStorage.removeItem('loggedIn');
}

function toggleDropdown() {
    const dropdownList = document.getElementById('dropdownProfile');
    dropdownList.style.display = dropdownList.style.display === 'none' ? 'block' : 'none';
}

window.onload = function() {
    const authButtons = document.getElementById('auth-buttons');

    if (isLoggedIn()) {
        authButtons.innerHTML = `
            <div class="dropdown">
                <img src="/static/images/profile.png" alt="Profile" class="profile-icon" onclick="toggleDropdown()">
                <div id="dropdownProfile" class="dropdown-content">
                    <a href="/profile">個人資料</a>
                    <a href="/" onclick="logout()">登出</a>
                </div>
            </div>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="login-button" onclick="openLoginModal()">Log in</button>
            <button class="signup-button" onclick="openSignupModal()">Sign up</button>
        `;
    }
};

// 點擊頁面其他地方時，關閉下拉選單
window.onclick = function(event) {
    if (!event.target.matches('img')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.style.display === 'block') {
                openDropdown.style.display = 'none';
            }
        }
    }
}