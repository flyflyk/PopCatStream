const IP = '20.92.229.26'; // 伺服器 IP 地址
const express = require('express');
const https = require('https');
const { Server } = require('socket.io');
const fs = require('fs');
const cors = require('cors');
const app = express();

const corsOptions = {
  origin: `https://${IP}:8443`, // 允許的 CORS 來源
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));

const options = {
  key: fs.readFileSync('/home/popcat/PopCatStream/key.pem'), 
  cert: fs.readFileSync('/home/popcat/PopCatStream/cert.pem'), 
};

const server = https.createServer(options, app);
const io = new Server(server, {
    cors: {
      origin: [`https://${IP}:8443`, `https://${IP}:8444`],
      methods: ['GET', 'POST'],
    },
  });

// 用來記錄已經連接的用戶
const connectedUsers = {}; 

// 用來儲存直播狀態
let liveStreamOffer = null;

io.on('connection', (socket) => {
    const userId = socket.id;  // 使用 socket.id 作為用戶 ID

    // 檢查用戶是否已經連接過
    if (connectedUsers[userId]) {
        console.log(`Duplicate connection attempt from: ${userId}`);
        socket.disconnect();  // 如果已經連接過，則斷開連接
        return;
    }

    // 記錄新的用戶連接
    connectedUsers[userId] = true;

    console.log(`User connected: ${userId}`);
    socket.broadcast.emit('user-new', userId); // 通知其他人有新用戶進來
    console.log(`Broadcasting new user: ${userId}`);

    // 收到訊息
    socket.on('message', (data) => {
        console.log(`Received message from ${data.username}: ${data.message}`);
        io.emit('message', data);  // 廣播訊息
    });

    // 收到 offer，並轉發給目標用戶
    socket.on('offer', ({ offer, to }) => {
        console.log(`Received offer from ${userId} to ${to}:`, offer); 
        
        if (!liveStreamOffer) {
            liveStreamOffer = offer;
            console.log('Setting liveStreamOffer:', liveStreamOffer);
        }

        if (connectedUsers[to]) {
            // 如果目標用戶在線，轉發 offer
            io.to(to).emit('offer', { offer, from: userId });
            console.log(`Forwarding offer from ${userId} to ${to}`);
        }
    });

    // 收到 answer，並轉發給目標用戶
    socket.on('answer', ({ answer, to }) => {
        console.log(`Forwarding answer from ${userId} to ${to}`);
        if (connectedUsers[to]) {
            io.to(to).emit('answer', { answer, from: userId });
        }
    });

    // 收到 ICE candidate，並轉發給目標用戶
    socket.on('ice-candidate', ({ candidate, to }) => {
        console.log(`Forwarding ICE candidate from ${userId} to ${to}`);
        if (connectedUsers[to]) {
            io.to(to).emit('ice-candidate', { candidate, from: userId });
        }
    });

    // 處理用戶斷開連接
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${userId}`);
        delete connectedUsers[userId]; // 從已連接用戶列表中刪除
        socket.broadcast.emit('disconnection', userId); // 通知其他用戶該用戶已斷開連接
    });
});

// 伺服器監聽端口
const PORT = 8444;  
server.listen(PORT, () => {
    console.log(`Server running on https://${IP}:${PORT}`);  
});
