import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import dotenv from 'dotenv'

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


const LOW_STOCK_LIMIT = 5; // Make sure this constant is accessible

connectDB(); 
mongoose.connection.once('open', () => {
  console.log('MongoDB connection successful. Scheduling cron jobs...');
}); // Schedule cron after DB is open

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
  console.error('MongoDB connection error:', err);
});


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const server = app.listen(port, () => {
  logger.info(`Server started on port ${port}`);
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

async function gracefulShutdown() {
  logger.info('Shutting down server...');
  try {
     // Stop all scheduled cron jobs on shutdown
     cron.getTasks().forEach(task => task.stop());
     logger.info('Stopped all cron tasks.');

    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');
    server.close(() => {
      logger.info('Server closed.');
      process.exit(0);
    });
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
}