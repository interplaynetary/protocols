/**
 * Database connection setup with production-ready configuration
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { logger } from '../lib/logger'

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/valueflows'

// Connection pool configuration
const poolConfig = {
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '10'),
  connect_timeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30'),
}

logger.info('Initializing database connection', {
  poolMax: poolConfig.max,
  poolMin: poolConfig.min,
  idleTimeout: poolConfig.idle_timeout,
  connectTimeout: poolConfig.connect_timeout,
})

// Create postgres connection with pooling
const client = postgres(connectionString, {
  max: poolConfig.max,
  idle_timeout: poolConfig.idle_timeout,
  connect_timeout: poolConfig.connect_timeout,
  onnotice: () => {}, // Suppress notices in production
  debug: process.env.NODE_ENV !== 'production',
})

// Create drizzle instance
export const db = drizzle(client, { schema })

// Export the client for cleanup
export const pgClient = client

export { schema }
