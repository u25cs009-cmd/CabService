import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`[Pi-Pip-Pip API] Server running on port ${PORT}`);
    console.log(`[Pi-Pip-Pip API] Socket.IO real-time engine initialized.`);
    console.log(`[Pi-Pip-Pip API] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
