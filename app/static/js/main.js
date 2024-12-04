function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true'; // localStorage會永久保存
}

function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
}

function toggleDropdown() {
    const dropdownList = document.getElementById('dropdownProfile');
    dropdownList.style.display = dropdownList.style.display === 'none' ? 'block' : 'none';
}

function toggleMenu() {
    var menuOptions = document.getElementById('menu-options');
    if (menuOptions.style.display === 'none') {
        menuOptions.style.display = 'block';
    } else {
        menuOptions.style.display = 'none';
    }
}

window.onload = function() {
    const authButtons = document.getElementById('auth-buttons');
    const menuOptions = document.getElementById('menu-options');
    const username = localStorage.getItem('username') || '匿名用戶';

    if (isLoggedIn()) {
        authButtons.innerHTML = `
            <div class="dropdown">
                <img src="/static/images/profile.png" alt="Profile" class="profile-icon" onclick="toggleDropdown()">
                <div id="dropdownProfile" class="dropdown-content">
                    <a>${username}</a>
                    <a href="/profile?username=${username}">個人資料</a>
                    <a href="/" onclick="logout()">登出</a>
                </div>
            </div>
        `;
        menuOptions.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 9px;">
                <button onclick="window.location.href='/createLive'">建立直播</button>
                <button onclick="window.location.href='/joinLive'">加入直播</button>
                <button onclick="window.location.href='/channels'">頻道分類</button>
            </div>
        `;

    } else {
        authButtons.innerHTML = `
            <button class="login-button" onclick="openLoginModal()">Log in</button>
            <button class="signup-button" onclick="openSignupModal()">Sign up</button>
        `;
        menuOptions.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 9px;">
                <button onclick="window.location.href='/channels'">頻道分類</button>
            </div>
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