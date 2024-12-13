function initFireworksEffect() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 0, // 初始為零，根據需要動態生成粒子
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#FFD700" // 黃金色
            },
            shape: {
                type: "circle", // 粒子形狀為圓形
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
                enable: false // 關閉粒子連線效果
            },
            move: {
                enable: true,
                speed: 10,
                direction: "top", // 粒子主要向上移動
                random: true, // 隨機化方向角度
                straight: false,
                out_mode: "out", // 粒子超出畫布時消失
                bounce: false
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: false // 禁用滑鼠懸停交互
                },
                onclick: {
                    enable: false // 禁用滑鼠點擊交互
                }
            }
        }
    });
}

function showFireworksEffect() {
    // 初始化煙火效果
    initFireworksEffect();

    particlesJS('particles-js', {
        particles: {
            number: {
                value: 100, // 每次顯示100個粒子
                density: {
                    enable: false // 禁用密度影響，僅使用固定數量
                }
            },
            color: {
                value: "#FFD700" // 粒子顏色
            },
            shape: {
                type: "circle", // 粒子形狀
            },
            opacity: {
                value: 1,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    opacity_min: 0
                }
            },
            size: {
                value: 6,
                random: true,
                anim: {
                    enable: true,
                    speed: 5,
                    size_min: 2
                }
            },
            line_linked: {
                enable: false // 關閉粒子之間的連線
            },
            move: {
                enable: true,
                speed: 15, // 粒子向上的速度
                direction: "top", // 固定主要向上移動
                random: true, // 隨機偏移角度
                straight: false, // 允許曲線移動
                out_mode: "out", // 粒子移動到畫布外後消失
                bounce: false
            }
        }
    });

    // 設定煙火持續時間
    setTimeout(() => {
        document.getElementById('particles-js').innerHTML = ''; // 清除粒子效果
    }, 3000); // 3秒後停止效果
}

// 綁定送禮按鈕事件
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
