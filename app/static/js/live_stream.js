const socket = io.connect('https://20.92.229.26:8444');
const peerConnections = {};
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

document.getElementById('shareScreenButton').addEventListener('click', async () => {
    try {
        // 獲取螢幕共享的流
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        broadcastStream(screenStream);

        // 創建並發送 offer
        Object.values(peerConnections).forEach(async (peerConnection) => {
            try {
                // 確保在發送 offer 之前，已經將螢幕流添加到 peerConnection 中
                screenStream.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, screenStream);
                });

                // 創建 offer 並設置本地描述
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);

                // 發送 offer 給新用戶
                socket.emit('offer', { offer, to: peerConnection.id });
            } catch (error) {
                console.error("Error while creating offer:", error);
            }
        });
    } catch (err) {
        console.error("Error sharing screen:", err);
    }
});


document.getElementById('startCameraButton').addEventListener('click', async () => {
    try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        broadcastStream(cameraStream);
    } catch (err) {
        console.error("Error: " + err);
    }
});

function broadcastStream(stream) {
    const liveVideo = document.getElementById('liveVideo');
    liveVideo.srcObject = stream;

    // 遍歷所有已經建立的連接
    Object.values(peerConnections).forEach(peerConnection => {
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    });
}

socket.on('user-new', (id) => {
    console.log("New user connected:", id);
    if (!peerConnections[id]) {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnections[id] = peerConnection;

        peerConnection.onicecandidate = (event) => {
            console.log("Sending ICE candidate to", id);
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, to: id });
            }
        };

        peerConnection.ontrack = (event) => {
            console.log("Received track from user:", id);
            const remoteVideo = document.createElement('video');
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.autoplay = true;
            remoteVideo.controls = false; // 設置 ID 以便顯示和移除
            document.body.appendChild(remoteVideo);
        };

        // 確保在新用戶連接時傳送本地流
        const localStream = liveVideo.srcObject;
        if (localStream) {
            localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
        }
    }
});


socket.on('offer', async ({ offer, from }) => {
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnections[from] = peerConnection;

    peerConnection.ontrack = (event) => {
        const remoteVideo = document.createElement('video');
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        remoteVideo.controls = false;
        document.getElementById('remoteVideos').appendChild(remoteVideo);
    };

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

socket.on('answer', ({ answer, from }) => {
    peerConnections[from].setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', ({ candidate, from }) => {
    console.log(`Received ICE candidate from ${from}`);
    peerConnections[from].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('disconnect', (id) => {
    if (peerConnections[id]) {
        peerConnections[id].close();
        delete peerConnections[id];
    }

    const remoteVideo = document.getElementById(id);
    if (remoteVideo) remoteVideo.remove();
});

socket.on('connect', () => {
    console.log('Connected to server. My socket ID:', socket.id);
});
