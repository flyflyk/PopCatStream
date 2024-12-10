const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// 初始化 express 和 http 伺服器
const app = express();
const server = http.createServer(app);
const io = socketIo(server); // 初始化 socket.io 伺服器

// 設置靜態文件路徑（如 HTML、JS、CSS）
app.use(express.static('public'));

// 用來保存目前所有連線中的使用者 ID
let users = {};

// 當有新的連線進來時的處理邏輯
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 當一個新用戶連線時，將用戶 ID 保存，並通知其他用戶
    socket.on('join', () => {
        users[socket.id] = socket;
        console.log('Users connected:', Object.keys(users));

        // 通知其他用戶有新用戶加入
        socket.broadcast.emit('user-new', socket.id);
    });

    // 處理來自直播者的 offer 訊息
    socket.on('offer', (data) => {
        console.log(`Received offer from ${socket.id}:`, data.offer);

        // 向指定的接收者（觀眾）發送 offer
        if (data.to) {
            const peerSocket = users[data.to];
            if (peerSocket) {
                peerSocket.emit('offer', {
                    offer: data.offer,
                    from: socket.id
                });
                console.log(`Sent offer to ${data.to}`);
            }
        }
        // 如果沒有指定接收者，則將 offer 傳給所有連線中的觀眾
        else {
            for (const id in users) {
                if (id !== socket.id) {
                    users[id].emit('offer', {
                        offer: data.offer,
                        from: socket.id
                    });
                    console.log(`Sent offer to ${id}`);
                }
            }
        }
    });

    // 處理來自觀眾的 answer 訊息
    socket.on('answer', (data) => {
        console.log(`Received answer from ${socket.id}:`, data.answer);

        const peerSocket = users[data.to];
        if (peerSocket) {
            peerSocket.emit('answer', {
                answer: data.answer,
                from: socket.id
            });
            console.log(`Sent answer to ${data.to}`);
        }
    });

    // 處理 ICE candidate 訊息
    socket.on('ice-candidate', (data) => {
        console.log(`Received ICE candidate from ${socket.id}:`, data.candidate);

        const peerSocket = users[data.to];
        if (peerSocket) {
            peerSocket.emit('ice-candidate', {
                candidate: data.candidate,
                from: socket.id
            });
            console.log(`Sent ICE candidate to ${data.to}`);
        }
    });

    // 當用戶斷開連線時
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.id];

        // 通知其他用戶該用戶已經離開
        socket.broadcast.emit('user-disconnected', socket.id);
    });
});

// 啟動伺服器
const port = process.env.PORT || 8444;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
