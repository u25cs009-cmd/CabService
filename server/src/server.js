import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Pi-Pip-Pip API] Server running on port ${PORT}`);
    console.log(`[Pi-Pip-Pip API] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
