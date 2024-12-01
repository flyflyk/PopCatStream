const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// 初始化 Express 和 Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 存儲連接用戶
const users = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    users[socket.id] = socket;

    // 通知其他用戶有新用戶加入
    socket.broadcast.emit('new-user', socket.id);

    // 接收 offer 並轉發給目標用戶
    socket.on('offer', ({ offer, to }) => {
        if (users[to]) {
            users[to].emit('offer', { offer, from: socket.id });
        }
    });

    // 接收 answer 並轉發給目標用戶
    socket.on('answer', ({ answer, to }) => {
        if (users[to]) {
            users[to].emit('answer', { answer, from: socket.id });
        }
    });

    // 接收 ICE 候選者並轉發給目標用戶
    socket.on('ice-candidate', ({ candidate, to }) => {
        if (users[to]) {
            users[to].emit('ice-candidate', { candidate, from: socket.id });
        }
    });

    // 當用戶斷開連接時
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
        socket.broadcast.emit('disconnect', socket.id);
    });
});

// 啟動伺服器
const PORT = 8443;
server.listen(PORT, () => {
    console.log(`Server running on https://127.0.0.1:${PORT}`);
});
