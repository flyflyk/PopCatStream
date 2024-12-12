const fireworksContainer = document.getElementById('fireworks-container');

// 初始化煙火效果
const fireworksInstance = new Fireworks(fireworksContainer, {  // Changed to fireworksInstance
    // 配置選項
    speed: 3, // 粒子速度
    particles: 100, // 顯示的煙火粒子數量
    explosion: 5, // 爆炸程度
    brightness: 100, // 煙火亮度
    color: ['#ff0044', '#fffb00', '#00bfff', '#00ff00'], // 煙火顏色
    trace: 3, // 輸出痕跡
    delay: 30, // 延遲時間
});

// 顯示煙火效果
function showFireworksEffect() {
    fireworksInstance.start();  // Use fireworksInstance here
    setTimeout(() => {
        fireworksInstance.stop();  // And here
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
