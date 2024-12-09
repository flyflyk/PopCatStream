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

// 取得所有當前的直播間
function fetchLiveRooms() {
    fetch('https://20.92.229.26:8444/live-rooms')
        .then(response => response.json())
        .then(data => {
            const liveRoomsContainer = document.getElementById('live-rooms');
            liveRoomsContainer.innerHTML = ''; // 清空現有的直播間列表
            if (data.length === 0) {
                liveRoomsContainer.innerHTML = '<p>No live rooms available</p>';
            } else {
                data.forEach(room => {
                    const roomElement = document.createElement('div');
                    roomElement.classList.add('live-room');
                    roomElement.innerHTML = `
                        <h3>${room.name}</h3>
                        <button onclick="joinLive('${room.name}')">Join</button>
                    `;
                    liveRoomsContainer.appendChild(roomElement);
                });
            }
        })
        .catch(err => {
            console.error('Error fetching live rooms:', err);
        });
}

// 加入指定的直播間
function joinLive(roomName) {
    if (!isLoggedIn()) {
        alert('Please log in to join a live room.');
        return;
    }

    const username = localStorage.getItem('username');
    const socket = io('https://20.92.229.26:8444');

    // 加入直播間
    socket.emit('join-live', roomName);
    alert(`Joined live room: ${roomName}`);
}

window.onload = function () {
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

    // 顯示所有當前的直播間
    fetchLiveRooms();
};

// 點擊頁面其他地方時，關閉下拉選單
window.onclick = function (event) {
    if (!event.target.matches('img')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.style.display === 'block') {
                openDropdown.style.display = 'none';
            }
        }
    }
};




