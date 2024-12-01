const express = require('express');
const https = require('https');
const { Server } = require('socket.io');
const fs = require('fs');
const cors = require('cors');

const app = express();
const corsOptions = {
  origin: 'https://20.92.229.26',
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));

const options = {
  key: fs.readFileSync('key.pem'), 
  cert: fs.readFileSync('cert.pem'), 
};
const server = https.createServer(options, app);
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

const PORT = 8444;  
server.listen(PORT, () => {
  console.log(`Server running on https://20.92.229.26:${PORT}`);  
});
