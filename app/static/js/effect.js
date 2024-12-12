// 顯示特效的函式
function showFireworksEffect() {
    const effectContainer = document.getElementById('effect-container');
    const fireworks = document.createElement('div');
    fireworks.classList.add('fireworks');
    fireworks.textContent = '🎆';  // 這裡可以替換成任何您喜歡的煙火符號
    effectContainer.appendChild(fireworks);

    // 煙火顯示 2 秒後自動消失
    setTimeout(() => {
        fireworks.remove();
    }, 2000);
}

// 顯示全螢幕煙火
function showFullscreenFireworks() {
    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.id = 'fullscreen-fireworks';
    const fireworks = document.createElement('div');
    fireworks.classList.add('fireworks-fullscreen');
    fireworks.textContent = '🎆';  // 可以替換成其他煙火符號
    fullscreenContainer.appendChild(fireworks);
    
    document.body.appendChild(fullscreenContainer);

    // 2 秒後隱藏全螢幕煙火
    setTimeout(() => {
        fullscreenContainer.remove();
    }, 2000);
}

// 當用戶送出煙火禮物時觸發顯示特效
sendGiftButton.addEventListener('click', () => {
    if (selectedGift === 'fireworks') {
        // 顯示煙火特效
        showFireworksEffect();
        showFullscreenFireworks();  // 顯示全螢幕煙火
    }

    if (selectedGift) {
        const giftData = { username: username, gift: selectedGift };

        // 通知伺服器送禮物事件
        socket.emit('send-gift', giftData);

        // 隱藏模態框
        giftModal.style.display = 'none';
    } else {
        alert('請先選擇一個禮物');
    }
});
