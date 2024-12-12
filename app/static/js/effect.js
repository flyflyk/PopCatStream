function showFireworksEffect() {
    (async () => {
        await tsParticles.load("tsparticles", {
            preset: "fireworks",
        });
        })();
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
