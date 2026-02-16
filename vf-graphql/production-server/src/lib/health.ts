/**
 * Database health check and connection management
 */

import { pgClient } from '../db'
import { sql } from 'drizzle-orm'
import { logger } from './logger'

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Simple query to check database connectivity
    await pgClient`SELECT 1`
    return true
  } catch (error) {
    logger.error('Database health check failed', error)
    return false
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  try {
    await pgClient.end()
    logger.info('Database connections closed')
  } catch (error) {
    logger.error('Error closing database connections', error)
  }
}

/**
 * Graceful shutdown handler
 */
export function setupGracefulShutdown(apolloServer: any) {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown`)
    
    try {
      // Stop Apollo Server
      if (apolloServer) {
        await apolloServer.stop()
        logger.info('Apollo Server stopped')
      }
      
      // Close database connections
      await closeDatabaseConnection()
      
      logger.info('Graceful shutdown complete')
      process.exit(0)
    } catch (error) {
      logger.error('Error during graceful shutdown', error)
      process.exit(1)
    }
  }

  // Handle shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
  
  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error)
    shutdown('uncaughtException')
  })
  
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', reason)
    shutdown('unhandledRejection')
  })
}
