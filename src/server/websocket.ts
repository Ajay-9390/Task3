import { Server as WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

let wss: WebSocketServer | null = null;

export function initWebSocket(server: HttpServer) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
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

export function broadcastNotification(data: any) {
  if (!wss) return;

  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
