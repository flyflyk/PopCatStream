const socket = io.connect('https://4.188.74.220:8443');
const peerConnections = {};
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// 當用戶點擊螢幕分享按鈕
document.getElementById('shareScreenButton').addEventListener('click', async () => {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        broadcastStream(screenStream);
    } catch (err) {
        console.error("Error: " + err);
    }
});

// 當用戶點擊鏡頭開啟按鈕
document.getElementById('startCameraButton').addEventListener('click', async () => {
    try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        broadcastStream(cameraStream);
    } catch (err) {
        console.error("Error: " + err);
    }
});

// 將媒體流廣播給所有用戶
function broadcastStream(stream) {
    const liveVideo = document.getElementById('liveVideo'); // 本地顯示
    liveVideo.srcObject = stream;

    // 將流中的每條軌道添加到每個 PeerConnection
    for (const [id, peerConnection] of Object.entries(peerConnections)) {
        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
    }
}

socket.on('new-user', (id) => {
    if (!peerConnections[id]) {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnections[id] = peerConnection;

        // 添加 ICE 候選者和軌道處理邏輯
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, to: id });
            }
        };

        peerConnection.ontrack = (event) => {
            const remoteVideo = document.createElement('video');
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.autoplay = true;
            document.getElementById('remoteVideos').appendChild(remoteVideo);
        };
    }
});

// 當接收到 offer 時，回應 answer
socket.on('offer', async ({ offer, from }) => {
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnections[from] = peerConnection;

    // 當接收到遠端流時，顯示到直播區域
    peerConnection.ontrack = (event) => {
        const remoteVideo = document.createElement('video');
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        remoteVideo.controls = false;
        document.getElementById('remoteVideos').appendChild(remoteVideo);
    };

    // 傳遞 ICE 候選者
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', { candidate: event.candidate, to: from });
        }
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit('answer', { answer: peerConnection.localDescription, to: from });
});

// 當接收到 answer 時，設置遠端描述
socket.on('answer', ({ answer, from }) => {
    peerConnections[from].setRemoteDescription(new RTCSessionDescription(answer));
});

// 當接收到 ICE 候選者時，添加到對應的 PeerConnection
socket.on('ice-candidate', ({ candidate, from }) => {
    peerConnections[from].addIceCandidate(new RTCIceCandidate(candidate));
});

// 當有用戶離開時，移除對應的 WebRTC 連接
socket.on('disconnect', (id) => {
    if (peerConnections[id]) {
        peerConnections[id].close();
        delete peerConnections[id];
    }

    // 移除對應的遠端視頻
    const remoteVideo = document.getElementById(id);
    if (remoteVideo) remoteVideo.remove();
});

socket.on('connected', ({ id }) => {
    console.log("Connected with ID:", id);
});
