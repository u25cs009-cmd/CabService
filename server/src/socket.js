import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Driver from './models/Driver.js';
import Booking from './models/Booking.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = [process.env.CLIENT_URL, process.env.CUSTOM_DOMAIN].filter(Boolean);
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== 'production' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
          return callback(null, true);
        }
        if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        if (!process.env.CLIENT_URL && process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(new Error('Socket.IO CORS Policy: Origin not allowed'));
      },
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      const trackingToken = socket.handshake.auth?.trackingToken || socket.handshake.query?.trackingToken;

      const jwtSecret = process.env.JWT_SECRET || 'pipippip_secret_jwt_key_2026_dev_mode';

      if (token) {
        try {
          const decoded = jwt.verify(token, jwtSecret);
          if (decoded.role === 'admin') {
            socket.user = { role: 'admin', userId: decoded.userId };
            return next();
          } else if (decoded.role === 'driver') {
            socket.user = { role: 'driver', userId: decoded.userId, driverId: decoded.driverId };
            return next();
          }
        } catch (err) {
          // Token verification failed, try trackingToken if present
        }
      }

      if (trackingToken) {
        const booking = await Booking.findOne({ trackingToken });
        if (booking) {
          socket.user = { role: 'customer', trackingToken, bookingId: booking._id };
          return next();
        }
      }

      // Anonymous / Guest connection for general status
      socket.user = { role: 'guest' };
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const { role, driverId, trackingToken } = socket.user || {};

    if (role === 'admin') {
      socket.join('room:admin');
    } else if (role === 'driver' && driverId) {
      socket.join(`room:driver:${driverId}`);
    } else if (role === 'customer' && trackingToken) {
      socket.join(`room:trip:${trackingToken}`);
    }

    // Driver GPS Location Update Event
    socket.on('driver:location_update', async (data) => {
      try {
        if (socket.user?.role !== 'driver' || !socket.user?.driverId) return;

        const { lng, lat, heading = 0, speed = 0 } = data || {};
        if (typeof lng !== 'number' || typeof lat !== 'number') return;

        // 1. Update Driver document in DB
        const updatedDriver = await Driver.findByIdAndUpdate(
          socket.user.driverId,
          {
            location: { type: 'Point', coordinates: [lng, lat] },
            heading,
            speed,
            lastLocationUpdate: new Date()
          },
          { new: true }
        );

        if (!updatedDriver) return;

        // 2. Broadcast updated position to Admin room
        io.to('room:admin').emit('admin:driver_location', {
          driverId: updatedDriver._id,
          name: updatedDriver.name,
          vehicleNumber: updatedDriver.vehicleNumber,
          vehicleType: updatedDriver.vehicleType,
          status: updatedDriver.status,
          isOnline: updatedDriver.isOnline,
          location: { lng, lat },
          heading,
          speed,
          timestamp: new Date()
        });

        // 3. If driver is on an active trip, push location to booking route trail & emit to customer room
        const activeTrip = await Booking.findOne({
          driver: updatedDriver._id,
          status: { $in: ['assigned', 'on_the_way', 'arrived', 'in_progress'] }
        });

        if (activeTrip && activeTrip.trackingToken) {
          // Append point to routeTrail
          activeTrip.routeTrail.push({
            lat,
            lng,
            heading,
            speed,
            timestamp: new Date()
          });
          await activeTrip.save();

          // Emit live tracking event to customer room
          io.to(`room:trip:${activeTrip.trackingToken}`).emit('trip:location_update', {
            bookingId: activeTrip._id,
            trackingToken: activeTrip.trackingToken,
            driverId: updatedDriver._id,
            driverLocation: { lat, lng },
            heading,
            speed,
            status: activeTrip.status,
            timestamp: new Date()
          });
        }
      } catch (err) {
        console.error('Error handling driver:location_update socket event:', err);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};
