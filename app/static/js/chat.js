let username = '';
const chatInput = document.getElementById('chat-input');

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

    // 確保從 localStorage 或其他來源獲取 username
    const username = localStorage.getItem('username') || '匿名用戶';

    if (message) {
        const chatBox = document.getElementById('chat-box');
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

