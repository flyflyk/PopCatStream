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

function showFireworksEffect() {
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

    setTimeout(() => {
        document.getElementById('particles-js').innerHTML = '';
    }, 3000);
}

sendGiftButton.addEventListener('click', () => {
    if (selectedGift === 'fireworks') {
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
