// 更新后的 JavaScript 代碼
const socket = io.connect('https://20.92.229.26:8444');
const peerConnections = {};  // 存儲所有的 peerConnection
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// 顯示視頻流的函數
function displayStream(stream) {
    const liveVideo = document.getElementById('liveVideo');
    if (liveVideo) {
        liveVideo.srcObject = stream;
    } else {
        console.error('Error: Video element with id "liveVideo" not found.');
    }
}

// 當新用戶連接時
socket.on('user-new', (id) => {
    console.log("New user connected:", id);
    
    if (!peerConnections[id]) {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnection.id = id;
        peerConnections[id] = peerConnection;

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, to: id });
            }
        };

        peerConnection.ontrack = (event) => {
            console.log(`Received track from remote peer ${id}`);
            if (event.streams && event.streams.length > 0) {
                const remoteStream = event.streams[0];

                // 創建新的 video 元素並設置大小
                const remoteVideo = document.createElement('video');
                remoteVideo.srcObject = remoteStream;
                remoteVideo.autoplay = true;
                remoteVideo.controls = false;
                remoteVideo.width = 700;  // 設定為與 liveVideo 相同的寬度
                remoteVideo.height = 400; // 設定為與 liveVideo 相同的高度

                // 將遠端視頻元素添加到 remoteVideos 容器中
                document.getElementById('remoteVideos').appendChild(remoteVideo);
            } else {
                console.error(`No remote stream received from peer ${id}.`);
            }
        };

        const localStream = document.getElementById('liveVideo').srcObject;
        if (localStream) {
            localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
        }
    }
});

// 當收到來自某個用戶的 offer 時
socket.on('offer', async ({ offer, from }) => {
    console.log(`Received offer from ${from}:`, offer);
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnection.id = from;
    peerConnections[from] = peerConnection;

    peerConnection.ontrack = (event) => {
        console.log("Received track from remote peer");
        const remoteVideo = document.createElement('video');
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        remoteVideo.controls = false;
        remoteVideo.width = 700;  // 設定為與 liveVideo 相同的寬度
        remoteVideo.height = 400; // 設定為與 liveVideo 相同的高度

        // 將遠端視頻元素添加到 remoteVideos 容器中
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
