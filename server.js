const IP = '20.92.229.26';
const express = require('express');
const https = require('https');
const { Server } = require('socket.io');
const fs = require('fs');
const cors = require('cors');
const app = express();
const corsOptions = {
  origin: `https://${IP}:8443`,
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
const users = {};


let liveStreamOffer = null;


io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  users[socket.id] = socket;

  socket.broadcast.emit('user-new', socket.id);
  console.log(`Broadcasting new user: ${socket.id}`);

  socket.on('message', (data) => {
    console.log(`Received message from ${data.username}: ${data.message}`);
    io.emit('message', data);
  });

  

  socket.on('offer', ({ offer, to }) => {
    console.log(`Received offer from ${socket.id} to ${to}:`, offer); 
   
    if (!liveStreamOffer) {
      liveStreamOffer = offer;
      console.log('Setting liveStreamOffer:', liveStreamOffer);
    }

    if (users[to]) {
      // 轉發offer給觀眾
      users[to].emit('offer', { offer, from: socket.id });
      console.log(`Forwarding offer from ${socket.id} to ${to}`);
    }
  });


// 新觀眾加入時處理
socket.on('user-new', (id) => {
  if (users[id]) {
    // 如果直播流已經存在，發送給新觀眾
    if (liveStreamOffer) {
      console.log('Sending liveStreamOffer to new user:', id);
      users[id].emit('offer', { offer: liveStreamOffer, from: socket.id });
    } else {
      console.log('No liveStreamOffer available for new user:', id);
    }
  }
});



/*舊的
  socket.on('user-new', (id) => {
    if (users[id]) {
      // 每個新連接的用戶都會收到當前直播者的流
      if (liveStreamOffer) {
        users[id].emit('offer', liveStreamOffer);  // 發送流給新觀眾
      }
    }
  });
  */
  


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

  socket.on('disconnection', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete users[socket.id];
    socket.broadcast.emit('disconnection', socket.id);
  });
});

const PORT = 8444;  
server.listen(PORT, () => {
  console.log(`Server running on https://${IP}:${PORT}`);  
});





