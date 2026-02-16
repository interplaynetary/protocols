/**
 * Security middleware for Hono
 */

import { Context, Next } from 'hono'

/**
 * Security headers middleware
 */
export function securityHeaders() {
  return async (c: Context, next: Next) => {
    await next()
    
    // Set security headers
    c.header('X-Frame-Options', 'DENY')
    c.header('X-Content-Type-Options', 'nosniff')
    c.header('X-XSS-Protection', '1; mode=block')
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    
    // Remove server header
    c.header('X-Powered-By', '')
  }
}

/**
 * Request ID middleware
 */
export function requestId() {
  return async (c: Context, next: Next) => {
    const requestId = c.req.header('X-Request-ID') || 
                      `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    c.set('requestId', requestId)
    c.header('X-Request-ID', requestId)
    
    await next()
  }
}

/**
 * CORS configuration for production
 */
export function getCorsConfig() {
  const isProduction = process.env.NODE_ENV === 'production'
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || []

  return {
    origin: isProduction && allowedOrigins.length > 0 
      ? allowedOrigins 
      : '*',
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposeHeaders: ['X-Request-ID'],
    maxAge: 86400,
  }
}
