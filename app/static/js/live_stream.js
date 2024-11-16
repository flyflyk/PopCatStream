function toggleMenu() {
    var menuOptions = document.getElementById('menu-options');
    if (menuOptions.style.display === 'none') {
        menuOptions.style.display = 'block';
    } else {
        menuOptions.style.display = 'none';
    }
}

function toggleDropdown() {
    const dropdownList = document.getElementById('dropdownProfile');
    dropdownList.style.display = dropdownList.style.display === 'none' ? 'block' : 'none';
}

window.onload = function() {
    const authButtons = document.getElementById('auth-buttons');
    const createButton = document.getElementById('create-button');

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
        createButton.innerHTML = `<button>建立直播</button>`;
        createButton.onclick = function() {
            window.location.href = '/createLive';
        };

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

// 添加事件監聽器，處理螢幕分享和鏡頭開啟功能
document.getElementById('shareScreenButton').addEventListener('click', async () => {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const liveVideo = document.getElementById('liveVideo'); // 統一顯示螢幕分享或鏡頭內容
        liveVideo.srcObject = screenStream;
    } catch (err) {
        console.error("Error: " + err);
    }
});

document.getElementById('startCameraButton').addEventListener('click', async () => {
    try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const liveVideo = document.getElementById('liveVideo'); // 統一顯示螢幕分享或鏡頭內容
        liveVideo.srcObject = cameraStream;
    } catch (err) {
        console.error("Error: " + err);
    }
});

function sendMessage() {
    var chatBox = document.getElementById('chat-box');
    var chatInput = document.getElementById('chat-input');
    var message = chatInput.value;

    if (message.trim() !== '') {
        var newMessage = document.createElement('div');
        newMessage.textContent = message;
        newMessage.style.marginBottom = '10px';
        chatBox.appendChild(newMessage);
        chatInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}
