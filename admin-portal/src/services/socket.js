import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log(`[Socket.IO Client] Connected to server: ${socket.id}`);
});

socket.on('disconnect', () => {
  console.log('[Socket.IO Client] Disconnected from server');
});
