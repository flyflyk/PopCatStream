const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// 初始化 Express 伺服器
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 伺服器靜態檔案路徑
app.use(express.static('public'));

// 用來儲存所有連接的用戶 ID 和相對應的流
let connectedUsers = {};

// 當有新的用戶連接時
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 儲存新用戶連接
    connectedUsers[socket.id] = socket;

    // 處理來自用戶的視訊流
    socket.on('stream', (data) => {
        console.log(`Received stream from: ${socket.id}`);

        // 儲存流並轉發給其他用戶
        socket.broadcast.emit('stream', { stream: data.stream, from: socket.id });

        // 如果需要儲存流或其他操作，這裡可以進行處理
    });

    // 處理 ICE candidate
    socket.on('ice-candidate', (data) => {
        console.log('Received ICE candidate:', data);

        if (connectedUsers[data.to]) {
            connectedUsers[data.to].emit('ice-candidate', { candidate: data.candidate, from: socket.id });
        }
    });

    // 處理 offer
    socket.on('offer', (data) => {
        console.log('Received offer:', data);

        if (connectedUsers[data.to]) {
            connectedUsers[data.to].emit('offer', { offer: data.offer, from: socket.id });
        }
    });

    // 處理 answer
    socket.on('answer', (data) => {
        console.log('Received answer:', data);

        if (connectedUsers[data.to]) {
            connectedUsers[data.to].emit('answer', { answer: data.answer, from: socket.id });
        }
    });

    // 用戶斷開連接時
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete connectedUsers[socket.id]; // 清除已斷開的用戶
    });
});

// 啟動伺服器
const port = 8444;
server.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});
