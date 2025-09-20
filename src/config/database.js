import 'dotenv/config.js';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import logger from './logger.js';

// Neon configuration
neonConfig.useSecureWebSocket = process.env.NODE_ENV === 'production';

if (!process.env.DATABASE_URL) {
  logger.error('DATABASE_URL is not defined');
  throw new Error('DATABASE_URL is required');
}

const sql = neon(process.env.DATABASE_URL, {
  arrayMode: false,
  fullResults: false,
});

const db = drizzle(sql, {
  logger: process.env.NODE_ENV === 'development' ? {
    logQuery: (query, params) => {
      logger.debug('Database Query:', { query, params });
    },
  } : false,
});

// Test database connection
const testConnection = async () => {
  try {
    await sql`SELECT 1`;
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

// Test connection on startup
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

export { sql, db, testConnection };
