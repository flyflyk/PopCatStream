const IP = '20.92.229.26';
const socket = io.connect(`https://${IP}:8444`);
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const liveVideo = document.getElementById('liveVideo');
const shareScreenButton = document.getElementById('shareScreenButton');
const startCameraButton = document.getElementById('startCameraButton');
const stopStreamButton = document.getElementById('stopStreamButton');
let peerConnections = {};

function generateUniqueId() {
    return 'peer_' + Math.random().toString(36).substr(2, 9);
}

// Broadcast local stream to all connected peers
function broadcastStream(stream) {
    liveVideo.srcObject = stream;

    Object.values(peerConnections).forEach(async (peerConnection) => {
        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', { offer, to: peerConnection.id });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    });

}

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




startCameraButton.addEventListener('click', async () => {
    try {
        // 開啟攝像頭，獲取視頻流
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        // 顯示當前流
        
       // liveVideo.srcObject = cameraStream;

        // 立即開始推送直播流
        broadcastStream(cameraStream); // <---- 在這裡直接推送直播流

        // 隱藏開始直播按鈕，顯示停止直播按鈕
        shareScreenButton.style.display = 'none';
        startCameraButton.style.display = 'none';
        stopStreamButton.style.display = 'inline-block';
    } catch (err) {
        console.error("Error accessing camera:", err);
    }
});








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

socket.on('answer', ({ answer, from }) => {
    if (peerConnections[from]) {
        peerConnections[from].setRemoteDescription(new RTCSessionDescription(answer));
    }
});

socket.on('ice-candidate', ({ candidate, from }) => {
    if (peerConnections[from]) {
        peerConnections[from].addIceCandidate(new RTCIceCandidate(candidate));
    }
});
