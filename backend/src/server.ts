import app from './app';
import config from './config/env';
import { AppDataSource } from './config/database';
import logger from './config/logger';
import dotenv from 'dotenv';

// Load environment variables
const environment = process.env.NODE_ENV || 'development';
const envFile = `.env.${environment}`;
dotenv.config({ path: envFile });

const port = process.env.PORT || config.port || 5000;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully');

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error(`Error during Data Source initialization: ${error}`);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  logger.error('Uncaught Exception', {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', { message: reason.message || reason });
  process.exit(1);
});

// Start the server
startServer();
