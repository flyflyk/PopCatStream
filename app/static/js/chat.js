const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');
const giftButton = document.getElementById('gift-button');
const giftModal = document.getElementById('gift-modal');
const closeGiftModal = document.getElementById('close-gift-modal');
const sendGiftButton = document.getElementById('send-gift-button');
let selectedGift = null;

let username = localStorage.getItem('username') || '匿名用戶';

socket.on('message', function (data) {
    if (username != data.username) {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${data.username}: ${data.message}`;
        messageElement.style.color = '#4B0082';
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // 滾動到最新的訊息
    }
});

socket.on('receive-gift', (giftData) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${giftData.username} 贈送了 ${giftData.gift}`;
    messageElement.style.color = '#FFD700';
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// 顯示模態框
giftButton.addEventListener('click', () => {
    giftModal.style.display = 'flex';
    selectedGift = null; // 重置選擇

    // 清除選擇樣式
    document.querySelectorAll('.gift-option').forEach((btn) => {
        btn.classList.remove('selected'); 
    });
});

// 隱藏模態框
closeGiftModal.addEventListener('click', () => {
    giftModal.style.display = 'none';
    
    // 清除選擇樣式
    document.querySelectorAll('.gift-option').forEach((btn) => {
        btn.classList.remove('selected'); 
    });
});

// 選擇禮物
document.querySelectorAll('.gift-option').forEach((button) => {  // 修改選擇器為 .gift-option
    button.addEventListener('click', () => {
        selectedGift = button.getAttribute('data-gift');
        document.querySelectorAll('.gift-option').forEach((btn) => {
            btn.classList.remove('selected'); // 清除選擇樣式
        });
        button.classList.add('selected'); // 添加選擇樣式
    });
});

// 發送禮物
sendGiftButton.addEventListener('click', () => {
    if (selectedGift) {
        const giftData = { username: username, gift: selectedGift };

        // 通知伺服器送禮物事件
        socket.emit('send-gift', giftData);

        // 隱藏模態框
        giftModal.style.display = 'none';

        // 清除選擇樣式
        document.querySelectorAll('.gift-option').forEach((btn) => {
            btn.classList.remove('selected'); 
        });
    } else {
        alert('請先選擇一個禮物');
    }
});

window.onload = async function () {
    try {
        const response = await fetch('/get_username');
        if (response.ok) {
            const data = await response.json();
            username = data.username;
        } else {
            console.error('User not logged in');
        }
    } catch (error) {
        console.error('Error fetching username:', error);
    }
};

// 監聽 Enter 鍵事件
chatInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage(); 
    }
});

function sendMessage() {
    const message = chatInput.value.trim();

    if (message && username != '匿名用戶') {
        socket.emit('message', { username: username, message: message });

        const messageElement = document.createElement('div');
        messageElement.textContent = `${username}: ${message}`;
        messageElement.style.color = '#4B0082';
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        chatInput.value = '';
    } else {
        console.error('訊息為空，請輸入訊息');
    }
}
