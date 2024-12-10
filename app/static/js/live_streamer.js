const IP = '20.92.229.26';  // 替換為你的伺服器 IP 地址
const socket = io.connect(`https://${IP}:8444`); // 確保與伺服器建立連線
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const liveVideo = document.getElementById('liveVideo');
const shareScreenButton = document.getElementById('shareScreenButton');
const startCameraButton = document.getElementById('startCameraButton');
const stopStreamButton = document.getElementById('stopStreamButton');
let peerConnections = {}; // 用來保存每個 peer 的連接

// 開始推流的函式
async function broadcastStream(stream) {
    liveVideo.srcObject = stream;  // 顯示本地的流
    
    // 確認 peerConnections 是否有值
    console.log('Current peerConnections:', peerConnections);

    // 如果有其他連接者，就向每個 peer 發送 offer
    if (Object.keys(peerConnections).length > 0) {
        Object.values(peerConnections).forEach(async (peerConnection) => {
            console.log('Adding tracks to peerConnection:', peerConnection.id); // 調試輸出

            // 把本地流的所有 track 加入 peerConnection
            stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

            try {
                const offer = await peerConnection.createOffer();  // 創建 offer
                console.log('Created offer:', offer);  // 顯示創建的 offer
                await peerConnection.setLocalDescription(offer);    // 設置本地描述

                // 發送 offer 到伺服器
                socket.emit('offer', { offer, to: peerConnection.id });
                console.log('Offer sent to server:', offer);
            } catch (error) {
                console.error('Error creating offer:', error);
            }
        });
    } else {
        // 即使沒有觀眾，也持續將流推送給伺服器
        console.log('No peers connected, broadcasting offer to server...');
        const offer = await createOfferForServer();  // 創建並發送 offer 即使沒有觀眾

        socket.emit('offer', { offer, to: null });  // `to: null` 表示沒有目標 peer
        console.log('Offer sent to server, no peers connected.');
    }
}

// 用於創建並返回給伺服器的 offer
async function createOfferForServer() {
    const peerConnection = new RTCPeerConnection();  // 初始化一個新的 peer connection
    // 這裡如果你有更多的需求，可以把 stream 加到 peerConnection

    // 創建並返回 offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);  // 設置本地描述
    return offer;
}

// 開始錄影/共享螢幕
shareScreenButton.addEventListener('click', async () => {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        broadcastStream(screenStream);
        shareScreenButton.style.display = 'none';
        startCameraButton.style.display = 'none';
        stopStreamButton.style.display = 'inline-block';
    } catch (err) {
        console.error("Error sharing screen:", err);
    }
});

// 開啟攝像頭並開始直播
startCameraButton.addEventListener('click', async () => {
    try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        broadcastStream(cameraStream); // 直接推送流

        shareScreenButton.style.display = 'none';
        startCameraButton.style.display = 'none';
        stopStreamButton.style.display = 'inline-block';
    } catch (err) {
        console.error("Error accessing camera:", err);
    }
});

// 停止直播的函式
stopStreamButton.addEventListener('click', () => {
    const stream = liveVideo.srcObject;
    if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        liveVideo.srcObject = null;
        shareScreenButton.style.display = 'inline-block';
        startCameraButton.style.display = 'inline-block';
        stopStreamButton.style.display = 'none';
    }
});

// 處理新用戶連線
socket.on('user-new', (id) => {
    if (!peerConnections[id]) {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnection.id = id;
        peerConnections[id] = peerConnection;

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, to: id });
            }
        };

        const localStream = liveVideo.srcObject;
        if (localStream) {
            localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
        }
    }
});

// 處理來自其他用戶的 answer
socket.on('answer', ({ answer, from }) => {
    if (peerConnections[from]) {
        peerConnections[from].setRemoteDescription(new RTCSessionDescription(answer));
    }
});

// 處理來自其他用戶的 ice-candidate
socket.on('ice-candidate', ({ candidate, from }) => {
    if (peerConnections[from]) {
        peerConnections[from].addIceCandidate(new RTCIceCandidate(candidate));
    }
});
