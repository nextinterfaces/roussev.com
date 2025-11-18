import app from './app.js';
import { config, paths } from './config/index.js';
import { ensureDir } from './utils/fs.js';
import { queueService } from './services/queue.service.js';
import { logger } from './utils/logger.js';

// Ensure uploads directory exists
ensureDir(paths.uploadsDir);

const server = app.listen(config.port, () => {
  logger.info(`PDF Analyzer Service listening on port ${config.port}`);
});

// Handle graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server...');
  
  try {
    // Close the queue service
    await queueService.close();
    logger.info('Queue service closed');
    
    // Close the HTTP server
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    
    // Force close server after 5 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 5000);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});
