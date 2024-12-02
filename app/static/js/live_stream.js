const socket = io.connect('https://20.92.229.26:8444');
const peerConnections = {};
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// 用於生成唯一 id 的簡單函數
// 用來生成唯一的 ID
function generateUniqueId() {
    return 'peer_' + Math.random().toString(36).substr(2, 9);  // 隨機生成 ID，保證唯一性
}

function broadcastStream(stream) {
    const liveVideo = document.getElementById('liveVideo');
    liveVideo.srcObject = stream;

    // 遍歷所有已經建立的連接
    Object.values(peerConnections).forEach(async (peerConnection) => {
        // 確保每個 peerConnection 都有唯一的 id
        if (!peerConnection.id) {
            peerConnection.id = generateUniqueId();  // 使用生成的唯一 ID，或是某種方式手動賦予 ID
            console.log('Assigned ID to peerConnection:', peerConnection.id);
        }

        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            console.log('Sending offer to:', peerConnection.id);  // 確保 id 正確
            socket.emit('offer', { offer, to: peerConnection.id });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    });
}

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

                // 確保每個 peerConnection 都有唯一的 id
                if (!peerConnection.id) {
                    peerConnection.id = generateUniqueId();
                    console.log('Assigned ID to peerConnection:', peerConnection.id);
                }

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

socket.on('user-new', (id) => {
    console.log("New user connected:", id);
    if (!peerConnections[id]) {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnection.id = id; // 確保每個 peerConnection 都有一個唯一的 ID
        peerConnections[id] = peerConnection;

        peerConnection.onicecandidate = (event) => {
            console.log("Sending ICE candidate to", id);
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, to: id });
            }
        };

        peerConnection.ontrack = (event) => {
    console.log("Received track from remote peer");

    // 檢查是否有遠端流
    if (event.streams && event.streams.length > 0) {
        const remoteStream = event.streams[0];

        // 找到 id 為 remoteVideos 的容器
        const remoteVideosContainer = document.getElementById('remoteVideos');
        
        // 確保 remoteVideos 容器存在
        if (remoteVideosContainer) {
            // 創建新的 <video> 元素來顯示遠端視頻
            const remoteVideo = document.createElement('video');
            remoteVideo.srcObject = remoteStream;
            remoteVideo.autoplay = true;
            remoteVideo.controls = true;  // 可以根據需求設置自動播放和控制條
            
            // 設置與 liveVideo 相同的寬度和高度
            const liveVideo = document.getElementById('liveVideo');
            if (liveVideo) {
                remoteVideo.width = liveVideo.width; // 700px
                remoteVideo.height = liveVideo.height; // 400px
            }

            // 將遠端視頻元素添加到容器中
            remoteVideosContainer.appendChild(remoteVideo);
        } else {
            console.error('Error: Element with id "remoteVideos" not found.');
        }
    } else {
        console.error("No remote stream received.");
    }
};


        // 確保在新用戶連接時傳送本地流
        const localStream = liveVideo.srcObject;
        if (localStream) {
            localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
        }
    }
});

socket.on('offer', async ({ offer, from }) => {
    console.log(`Received offer from ${from}:`, offer);  // 確認收到的 offer 是否包含來自的 ID
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnection.id = from;  // 設定從哪個用戶來的 ID
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
    console.log(`Received answer from ${from}`);
    peerConnections[from].setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', ({ candidate, from }) => {
    console.log(`Received ICE candidate from ${from}`);
    peerConnections[from].addIceCandidate(new RTCIceCandidate(candidate));
});

