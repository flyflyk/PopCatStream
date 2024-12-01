const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');
let username = localStorage.getItem('username') || '匿名用戶';

socket.on('message', function(data) {
    if (username != data.username) {  
        const messageElement = document.createElement('div');
        messageElement.textContent = `${data.username}: ${data.message}`;
        messageElement.style.color = '#4B0082';
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;  // 滾動到最新的訊息
    }
});

// 監聽 Enter 鍵事件
chatInput.addEventListener('keydown', function(event) {
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
