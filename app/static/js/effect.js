function initFireworksEffect() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 0, // 零表示不顯示，根據需要顯示煙火時再調整
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#FFD700" // 黃金色
            },
            shape: {
                type: "circle", // 煙火粒子為圓形
            },
            opacity: {
                value: 1,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0
                }
            },
            size: {
                value: 5,
                random: true,
                anim: {
                    enable: true,
                    speed: 10,
                    size_min: 1
                }
            },
            line_linked: {
                enable: false // 關閉粒子之間的連接
            },
            move: {
                enable: true,
                speed: 10,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab"
                },
                onclick: {
                    enable: true,
                    mode: "push" // 點擊時推送更多粒子
                }
            }
        }
    });
}

// 顯示煙火特效
function showFireworksEffect() {
    // 激活煙火動畫
    initFireworksEffect();

    // 設置粒子的數量和顏色，使它們看起來像煙火
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 100, // 顯示100個煙火粒子
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#FFD700" // 黃金色
            },
            shape: {
                type: "circle",
            },
            opacity: {
                value: 1,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0
                }
            },
            size: {
                value: 8,
                random: true,
                anim: {
                    enable: true,
                    speed: 10,
                    size_min: 1
                }
            },
            line_linked: {
                enable: false
            },
            move: {
                enable: true,
                speed: 15,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false
            }
        }
    });

    // 給予一段時間後清除特效
    setTimeout(() => {
        document.getElementById('particles-js').innerHTML = ''; // 清除煙火特效
    }, 3000); // 3秒後清除
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
