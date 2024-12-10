const express = require('express');
const https = require('https');
const { Server } = require('socket.io');
const fs = require('fs');
const cors = require('cors');

// 設定 IP 和端口
const IP = '20.92.229.26';
const app = express();

// 設定 CORS 配置，允許來自指定域名的請求
const corsOptions = {
  origin: [`https://${IP}:8443`, `https://${IP}:8444`],
  methods: ['GET', 'POST'],
};
app.use(cors(corsOptions));

// 讀取 SSL 憑證
const options = {
  key: fs.readFileSync('/home/popcat/PopCatStream/key.pem'),  // 請使用正確的路徑
  cert: fs.readFileSync('/home/popcat/PopCatStream/cert.pem'),  // 請使用正確的路徑
};

// 創建 HTTPS 伺服器
const server = https.createServer(options, app);

// 設置 socket.io 並配置 CORS
const io = new Server(server, {
  cors: {
    origin: [`https://${IP}:8443`, `https://${IP}:8444`], // 設定允許的來源
    methods: ['GET', 'POST'],
  },
});

// 設定靜態檔案路徑
app.use(express.static('public'));

// 儲存已連接的用戶列表
let connectedUsers = {};

// 當有用戶連接時
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 儲存用戶連接
  connectedUsers[socket.id] = socket;

  // 處理來自用戶的視訊流
  socket.on('stream', (data) => {
    console.log(`Received stream from: ${socket.id}`);
    
    // 如果有其他用戶連接，將流轉發給他們
    socket.broadcast.emit('stream', { stream: data.stream, from: socket.id });

    // 可以在此處進行其他處理，比如儲存流等
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
const port = 8443;  // 設定伺服器的端口，8443 是 HTTPS 常用端口
server.listen(port, () => {
  console.log(`Server running on https://${IP}:${port}`);
});
