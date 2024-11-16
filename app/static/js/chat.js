let username = '';

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
    
    if (message && username) {
        const chatBox = document.getElementById('chat-box');
        const messageElement = document.createElement('div');
        messageElement.textContent = `${username}: ${message}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Clear the input field
        chatInput.value = '';
    } else if (!username) {
        console.error('Username not available');
    }
}
