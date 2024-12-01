const socket = io.connect('https://20.92.229.26:8444');
const peerConnections = {};
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

document.getElementById('shareScreenButton').addEventListener('click', async () => {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        broadcastStream(screenStream);
    } catch (err) {
        console.error("Error: " + err);
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
    const liveVideo = document.getElementById('liveVideo'); // 本地顯示
    liveVideo.srcObject = stream;

    for (const [id, peerConnection] of Object.entries(peerConnections)) {
        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
    }

    for (const [id, peerConnection] of Object.entries(peerConnections)) {
        peerConnection.addTrack(stream.getTracks()[0], stream);
    }
}


socket.on('new-user', (id) => {
    if (!peerConnections[id]) {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnections[id] = peerConnection;

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, to: id });
            }
        };

        peerConnection.ontrack = (event) => {
            const remoteVideo = document.createElement('video');
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.autoplay = true;
            remoteVideo.id = id; // 設置 ID 以便顯示和移除
            document.getElementById('remoteVideos').appendChild(remoteVideo);
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

socket.on('connected', ({ id }) => {
    console.log("Connected with ID:", id);
});
