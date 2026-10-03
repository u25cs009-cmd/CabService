import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (authOptions = {}) => {
  if (socket && socket.connected) {
    return socket;
  }

  // Socket server URL
  const SOCKET_URL = window.location.origin;

  socket = io(SOCKET_URL, {
    auth: authOptions,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000
  });

  socket.on('connect', () => {
    console.log('[SocketService] Connected to server socket:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[SocketService] Connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
