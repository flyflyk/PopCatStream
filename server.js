const cluster = require('cluster');
const os = require('os');
const express = require('express');
const https = require('https');
const { Server } = require('socket.io');
const fs = require('fs');
const cors = require('cors');
const redis = require('redis');
const IP = '20.92.229.26';

const corsOptions = {
  origin: `https://${IP}:8443`,
  methods: ['GET', 'POST'],
};

const options = {
  key: fs.readFileSync('/home/popcat/PopCatStream/key.pem'),
  cert: fs.readFileSync('/home/popcat/PopCatStream/cert.pem'),
};

const numCPUs = os.cpus().length; // 獲取 CPU 數量

// 使用 Redis 客戶端
const redisClient = redis.createClient({
  host: 'localhost', // Redis 的地址，這裡使用本地的 Redis 服務
  port: 6379, // Redis 的端口
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// 如果是主進程，創建多個工作進程
if (cluster.isMaster) {
  console.log(`Master process started: ${process.pid}`);

  // 根據 CPU 數量創建工作進程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // 工作進程部分
  const app = express();
  app.use(cors(corsOptions));

  const server = https.createServer(options, app);
  const io = new Server(server, {
    cors: {
      origin: [`https://${IP}:8443`, `https://${IP}:8444`],
      methods: ['GET', 'POST'],
    },
  });

  const users = {}; // 每個進程都有自己的 users
  let liveRooms = {};  // 存儲所有直播間的資料

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    users[socket.id] = socket;

    socket.broadcast.emit('user-new', socket.id);
    console.log(`Broadcasting new user: ${socket.id}`);

    // 當用戶創建直播時
    socket.on('create-live', (roomName) => {
      const roomId = socket.id;  // 使用 socket.id 作為唯一標識
      liveRooms[roomId] = { name: roomName, creator: socket.id };
      console.log(`New live room created: ${roomName} (ID: ${roomId})`);
      socket.emit('live-created', { roomId, roomName });  // 回傳創建的直播間資訊
    });

    // 當用戶加入直播時
    socket.on('join-live', (roomId) => {
      console.log(`User ${socket.id} joined room: ${roomId}`);
      socket.join(roomId);  // 用戶加入指定的房間
    });

    // 當用戶離開時
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // 根據需要刪除直播間，這裡刪除創建者不在線時的直播間
      for (let roomId in liveRooms) {
        if (liveRooms[roomId].creator === socket.id) {
          // 如果該用戶是創建者，並且該直播間沒有其他用戶，則刪除直播間
          delete liveRooms[roomId];
          console.log(`Live room deleted: ${roomId}`);
        }
      }
      delete users[socket.id];
    });

    socket.on('message', (data) => {
      console.log(`Received message from ${data.username}: ${data.message}`);
      io.emit('message', data);
    });

    socket.on('offer', ({ offer, to }) => {
      console.log(`Received offer from ${socket.id} to ${to}:`, offer);

      // 將 liveStreamOffer 存儲到 Redis 中，使用 socket.id 作為 key
      redisClient.set(socket.id + ':offer', JSON.stringify(offer), (err) => {
        if (err) {
          console.error('Failed to store offer in Redis:', err);
        }
      });

      // 如果目標用戶在線，轉發 offer 給該用戶
      if (users[to]) {
        users[to].emit('offer', { offer, from: socket.id });
        console.log(`Forwarding offer from ${socket.id} to ${to}`);
      }
    });

    // 當新用戶連接時，檢查 Redis 中是否存在已有的 offer
    socket.on('user-new', (id) => {
      if (users[id]) {
        // 從 Redis 中獲取對應的 offer
        redisClient.get(id + ':offer', (err, offer) => {
          if (err) {
            console.error('Failed to retrieve offer from Redis:', err);
            return;
          }
          if (offer) {
            console.log('Sending liveStreamOffer to new user:', id);
            users[id].emit('offer', { offer: JSON.parse(offer), from: socket.id });
          } else {
            console.log('No offer available for new user:', id);
          }
        });
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
  });

  // 路由：返回當前所有直播間
  app.get('/live-rooms', (req, res) => {
    res.json(Object.values(liveRooms));  // 返回所有直播間的資料
  });

  // 其他路由配置
  app.use(express.static('public'));

  const PORT = process.env.PORT || 8444;
  server.listen(PORT, () => {
    console.log(`Server running on https://${IP}:${PORT} with worker ${process.pid}`);
  });
}
