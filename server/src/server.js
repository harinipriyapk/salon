import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { seedInitialData } from './seedServices.js';

const app = express();
const port = Number(process.env.PORT) || 5000;

// Permissive CORS for local development (supports 5173, 5174, 127.0.0.1, etc.)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
      origin === process.env.CLIENT_ORIGIN
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.options('*', cors());
app.use(express.json({ limit: '50kb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'Velvet & Vine Salon API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/appointments', bookingRoutes); // Alias for backwards compatibility
app.use('/api/feedback', feedbackRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'API route not found.' }));

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ success: false, message: error.message || 'Validation error. Please review your input.' });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ success: false, message: 'Request body must be valid JSON.' });
  }
  res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Add it to server/.env.');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB database');
  await seedInitialData();
  app.listen(port, () => console.log(`Velvet & Vine API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error('Could not start the API:', error.message);
  process.exit(1);
});
