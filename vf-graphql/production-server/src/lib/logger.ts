/**
 * Structured logging utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  requestId?: string
  userId?: string
  operation?: string
  [key: string]: any
}

class Logger {
  private level: LogLevel
  private format: 'json' | 'pretty'

  constructor() {
    this.level = (process.env.LOG_LEVEL as LogLevel) || 'info'
    this.format = (process.env.LOG_FORMAT as 'json' | 'pretty') || 'pretty'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.level)
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    
    if (this.format === 'json') {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...context,
      })
    }

    // Pretty format for development
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[level]
    
    return `${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      }
      console.error(this.formatMessage('error', message, errorContext))
    }
  }
}

export const logger = new Logger()

// Request ID generator
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
}
