const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');
const username = localStorage.getItem('username') || '匿名用戶';

// 創建 WebSocket 連接
const socket = io.connect('https://127.0.0.1:8443');  // 與伺服器建立 WebSocket 連接

// 當接收到來自伺服器的訊息時，將訊息顯示在聊天室
socket.on('message', function(data) {
    if (username != data.username) {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${data.username}: ${data.message}`;
        messageElement.style.color = '#4B0082';
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});

// 監聽 Enter 鍵事件
chatInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        sendMessage(); 
    }
});

window.onload = async function() {
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

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();

    if (message && username != '匿名用戶') {
        // 向伺服器發送訊息
        socket.emit('message', { username: username, message: message });

        // 直接將訊息添加到本地顯示
        const messageElement = document.createElement('div');
        messageElement.textContent = `${username}: ${message}`;
        messageElement.style.color = '#4B0082';
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // 清空輸入欄
        chatInput.value = '';
    } else {
        console.error('訊息為空，請輸入訊息');
    }
}
