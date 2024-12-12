const fireworks = new Fireworks('#fireworks-container', {
    maxRockets: 10,       
    rocketSpawnInterval: 350, 
    numParticles: 100,       
    explosionMinSize: 5,     
    explosionMaxSize: 30,    
    explosionChance: 0.75,   
    explosionSpeed: 3,       
    explosionDelay: 0,       
    trailDelay: 0,           
    trailSpeed: 0.5,        
    background: 'rgba(0, 0, 0, 0)',
    particleColor: '#FFD700' // 粒子顏色（黃色）
});

function showFireworksEffect() {
    fireworks.start();
    setTimeout(() => {
        fireworks.stop();
    }, 3000);
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
