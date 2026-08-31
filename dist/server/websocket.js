"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocket = initWebSocket;
exports.broadcastNotification = broadcastNotification;
const ws_1 = require("ws");
let wss = null;
function initWebSocket(server) {
    wss = new ws_1.Server({ server, path: '/ws' });
    wss.on('connection', (ws) => {
        console.log('⚡ Client connected to GHMC WebSocket Notification Server');
        ws.send(JSON.stringify({
            type: 'CONNECTED',
            message: 'Connected to GHMC Real-Time Notification Stream'
        }));
        ws.on('close', () => {
            console.log('⚡ Client disconnected from WebSocket');
        });
    });
    return wss;
}
function broadcastNotification(data) {
    if (!wss)
        return;
    const payload = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(payload);
        }
    });
}
