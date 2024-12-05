const IP = '20.92.229.26';
const socket = io.connect(`https://${IP}:8444`);
const peerConnections = {};
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const remoteVideo = document.getElementById('remoteVideo');

// Handle incoming offer from the broadcaster
socket.on('offer', async ({ offer, from }) => {
    console.log(`Received offer from broadcaster ${from}`);

    // Create a new peer connection for the broadcaster
    if (!peerConnections[from]) {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnections[from] = peerConnection;

        // Set up event to handle tracks (remote streams)
        peerConnection.ontrack = (event) => {
            const remoteStream = event.streams[0];
            if (remoteStream) {
                console.log('Displaying remote stream from broadcaster');
                remoteVideo.srcObject = remoteStream;
            } else {
                console.error('No remote stream received.');
            }
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, to: from });
            }
        };

        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            // Send the answer back to the broadcaster
            socket.emit('answer', { answer: peerConnection.localDescription, to: from });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }
});

// Handle incoming ICE candidates
socket.on('ice-candidate', ({ candidate, from }) => {
    console.log(`Received ICE candidate from broadcaster ${from}`);
    const peerConnection = peerConnections[from];
    if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch((error) => {
            console.error('Error adding received ICE candidate:', error);
        });
    }
});

// Handle broadcaster disconnection
socket.on('user-disconnected', (id) => {
    console.log(`Broadcaster ${id} disconnected`);

    // Close and remove the peer connection
    const peerConnection = peerConnections[id];
    if (peerConnection) {
        peerConnection.close();
        delete peerConnections[id];
    }
});
