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

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  users[socket.id] = socket;

  socket.broadcast.emit('user-new', socket.id);
  console.log(`Broadcasting new user: ${socket.id}`);

  socket.on('message', (data) => {
    console.log(`Received message from ${data.username}: ${data.message}`);
    io.emit('message', data);
  });

  socket.on('send-gift', (giftData) => {
    console.log('收到禮物:', giftData);
    io.emit('receive-gift', giftData);
  });

  socket.on('offer', ({ offer, to }) => {
    console.log(`Received offer from ${socket.id} to ${to}:`, offer); 
    if (users[to]) {
      users[to].emit('offer', { offer, from: socket.id });
      console.log(`Forwarding offer from ${socket.id} to ${to}`);
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





