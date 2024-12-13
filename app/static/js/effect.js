function initFireworksEffect() {
    particlesJS('firework-container', {
        particles: {
            number: {
                value: 0,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
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
                value: 5,
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
                speed: 10,
                direction: "top", // 粒子主要向上移動
                random: false, // 隨機化方向角度
                straight: true,
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

function initExplosionEffect() {
    particlesJS('firework-explode-container', {
        particles: {
            number: {
                value: 100,
                density: {
                    enable: true,
                    value_area: 800,
                },
            },
            color: {
                value: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
            },
            shape: {
                type: 'circle',
            },
            opacity: {
                value: 1,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    opacity_min: 0.1,
                },
            },
            size: {
                value: 5,
                random: true,
                anim: {
                    enable: true,
                    speed: 10,
                    size_min: 1,
                },
            },
            line_linked: {
                enable: false,
            },
            move: {
                enable: true,
                speed: 3,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false,
            },
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onclick: {
                    enable: true,
                    mode: 'push', // 點擊時生成更多粒子
                },
            },
        },
    });
}

function showFireworksEffect() {
    initFireworksEffect();

    particlesJS('firework-container', {
        particles: {
            number: {
                value: 10,
                density: {
                    enable: false
                }
            },
            color: {
                value: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
            },
            shape: {
                type: "circle",
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
                enable: false
            },
            move: {
                enable: true,
                speed: 15,
                direction: "top",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false
            }
        }
    });

    setTimeout(() => {
        showExplosionEffect()
    }, 500);

    setTimeout(() => {
        document.getElementById('firework-container').innerHTML = '';
    }, 5000);
}

function showExplosionEffect() {
    const explosionContainer = document.getElementById('firework-explode-container');
    explosionContainer.style.position = 'absolute';
    explosionContainer.style.top = '20%'; // 設置爆炸在畫面上方
    explosionContainer.style.left = '50%';
    explosionContainer.style.transform = 'translateX(-50%)';
    explosionContainer.style.width = '100%';
    explosionContainer.style.height = '15%';

    initExplosionEffect();

    setTimeout(() => {
        explosionContainer.innerHTML = '';
    }, 4500);
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
