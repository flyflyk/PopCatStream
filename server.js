import express from 'express';
import { createServer } from 'https';
import { Server } from 'socket.io';
import { readFileSync } from 'fs';
import cors from 'cors';

const app = express();
const corsOptions = {
  origin: 'https://20.92.229.26',
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));

const options = {
  key: readFileSync('/home/popcat/PopCatStream/key.pem'), 
  cert: readFileSync('/home/popcat/PopCatStream/cert.pem'), 
};
const server = createServer(options, app);
const io = new Server(server);
const users = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  users[socket.id] = socket;

  socket.broadcast.emit('new-user', socket.id);

  socket.on('message', (data) => {
    console.log(`Received message from ${data.username}: ${data.message}`);
    io.emit('message', data);
  });

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
