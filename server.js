const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const users = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    users[socket.id] = socket;

    socket.broadcast.emit('new-user', socket.id);

    socket.on('offer', ({ offer, to }) => {
        console.log(`Forwarding offer from ${socket.id} to ${to}`);
        if (users[to]) {
            users[to].emit('offer', { offer, from: socket.id });
        }
    });

    socket.on('answer', ({ answer, to }) => {
        console.log(`Forwarding answer from ${socket.id} to ${to}`);
        if (users[to]) {
            users[to].emit('answer', { answer, from: socket.id });
        }
    });

    socket.on('ice-candidate', ({ candidate, to }) => {
        console.log(`Forwarding ICE candidate from ${socket.id} to ${to}`);
        if (users[to]) {
            users[to].emit('ice-candidate', { candidate, from: socket.id });
        }
    });
    
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
        socket.broadcast.emit('disconnect', socket.id);
    });
});

// 啟動伺服器
const PORT = 8444;
server.listen(PORT, () => {
    console.log(`Server running on https://127.0.0.1:${PORT}`);
});
