const fireworksContainer = document.getElementById('fireworks-container');

// 使用 fireworks 作為全局對象，而不是構造函數
const fireworks = new Fireworks(fireworksContainer, {  // 確保 Fireworks 是全局對象
    speed: 3,
    particles: 100,
    explosion: 5,
    brightness: 100,
    color: ['#ff0044', '#fffb00', '#00bfff', '#00ff00'],
    trace: 3,
    delay: 30,
});

// 顯示煙火效果
function showFireworksEffect() {
    fireworks.start();  // 啟動煙火效果
    setTimeout(() => {
        fireworks.stop();  // 3秒後停止煙火
    }, 3000); // 3秒後停止
}

// 當用戶選擇煙火禮物時觸發
sendGiftButton.addEventListener('click', () => {
    if (selectedGift === 'fireworks') {
        // 顯示煙火特效
        showFireworksEffect();
    }

    if (selectedGift) {
        const giftData = { username: username, gift: selectedGift };
        socket.emit('send-gift', giftData);
        giftModal.style.display = 'none';
    } else {
        alert('請先選擇一個禮物');
    }
});
