// 安裝 ws 庫
// 在你的Node.js應用目錄中運行：npm install ws

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    ws.on('message', message => {
        console.log('received: %s', message);
        // 將訊息廣播給所有連接的客戶端
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.send('Welcome to the chat');
});

console.log('WebSocket server is running on ws://localhost:8080');
