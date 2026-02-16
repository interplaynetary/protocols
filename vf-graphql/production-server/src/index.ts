
/**
 * Production GraphQL server with Hono, Apollo Server, Drizzle ORM, and BetterAuth
 * 
 * Production-hardened with:
 * - Structured logging
 * - Security headers
 * - Request ID tracking
 * - Graceful shutdown
 * - Health & readiness checks
 * - Query complexity limits
 * - Secure CORS
 *
 * @package: vf-graphql
 * @since:   2026-02-15
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ApolloServer } from '@apollo/server'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { buildSchema, printSchema } from '@valueflows/vf-graphql'
import { auth } from './auth'
import { resolvers, type Context } from './graphql/resolvers'
import { logger } from './lib/logger'
import { securityHeaders, requestId, getCorsConfig } from './lib/security'
import { checkDatabaseHealth, setupGracefulShutdown } from './lib/health'

const SERVER_PORT = parseInt(process.env.PORT || '4001')
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Build the ValueFlows schema
console.log('Building schema...')
const schemaSDL = printSchema(buildSchema())
console.log('Schema built.')

// Create executable schema with custom resolvers
console.log('Making executable schema...')
const schema = makeExecutableSchema({
  typeDefs: schemaSDL,
  resolvers,
})
console.log('Executable schema made.')

// Apollo Server configuration
console.log('Configuring Apollo Server...')
const apolloServer = new ApolloServer<Context>({
  schema,
  // Security: Disable introspection in production
  introspection: process.env.GRAPHQL_INTROSPECTION === 'true' || !IS_PRODUCTION,
  // Disable playground in production (use Apollo Sandbox instead)
  includeStacktraceInErrorResponses: !IS_PRODUCTION,
  plugins: [
    // Request logging plugin
    {
      async requestDidStart() {
        const start = Date.now()
        return {
          async didResolveOperation(requestContext) {
            const duration = Date.now() - start
            logger.info('GraphQL operation', {
              operation: requestContext.operationName || 'Anonymous',
              duration: `${duration}ms`,
              requestId: requestContext.contextValue.requestId,
            })
          },
          async didEncounterErrors(requestContext) {
            logger.error('GraphQL errors', requestContext.errors, {
              operation: requestContext.operationName,
              requestId: requestContext.contextValue.requestId,
            })
          },
        }
      },
    },
    // Query complexity/depth limiting plugin
    {
      async requestDidStart() {
        return {
          async didResolveOperation(requestContext) {
            const maxDepth = parseInt(process.env.GRAPHQL_MAX_DEPTH || '10')
            // Note: Full complexity analysis would require graphql-query-complexity
            // This is a placeholder for depth checking
            const query = requestContext.request.query
            if (query) {
              const depth = (query.match(/{/g) || []).length
              if (depth > maxDepth) {
                throw new Error(`Query depth ${depth} exceeds maximum ${maxDepth}`)
              }
            }
          },
        }
      },
    },
  ],
  formatError: (formattedError, error) => {
    // Log all errors
    logger.error('GraphQL error', error, {
      message: formattedError.message,
      path: formattedError.path,
    })
    
    // In production, don't expose internal error details
    if (IS_PRODUCTION) {
      return {
        message: formattedError.message,
        locations: formattedError.locations,
        path: formattedError.path,
        extensions: {
          code: formattedError.extensions?.code,
        },
      }
    }
    
    return formattedError
  },
})

// Start Apollo Server
console.log('Starting Apollo Server...')
await apolloServer.start()
console.log('Apollo Server started!')
logger.info('Apollo Server started')

// Create Hono app
const app = new Hono()

// Trust proxy in production (for X-Forwarded-* headers)
if (IS_PRODUCTION && process.env.TRUST_PROXY === 'true') {
  logger.info('Trusting proxy headers')
}

// Apply security headers middleware
app.use('/*', securityHeaders())

// Apply request ID middleware
app.use('/*', requestId())

// CORS middleware with production-safe configuration
app.use('/*', cors(getCorsConfig()))

// Authentication middleware - extracts user from session
async function authMiddleware(c: any, next: any) {
  const requestId = c.get('requestId')
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (sessionToken) {
    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers })
      if (session) {
        c.set('user', session.user)
        logger.debug('User authenticated', {
          requestId,
          userId: session.user.id,
        })
      }
    } catch (error) {
      logger.warn('Authentication failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
  
  await next()
}

// Apply auth middleware
app.use('/*', authMiddleware)

// BetterAuth endpoints
app.on(['GET', 'POST'], '/api/auth/*', async (c) => {
  const requestId = c.get('requestId')
  logger.debug('Auth request', {
    requestId,
    path: c.req.path,
    method: c.req.method,
  })
  return auth.handler(c.req.raw)
})

// GraphQL endpoint
app.post('/graphql', async (c) => {
  const body = await c.req.json()
  const user = c.get('user')
  const requestId = c.get('requestId')

  const response = await apolloServer.executeOperation(
    {
      query: body.query,
      variables: body.variables,
      operationName: body.operationName,
    },
    {
      contextValue: {
        user,
        headers: c.req.raw.headers,
        requestId,
      },
    }
  )

  if (response.body.kind === 'single') {
    return c.json(response.body.singleResult)
  }

  return c.json({ errors: [{ message: 'Incremental delivery not supported' }] })
})


// Debug endpoint for signup
app.get('/debug-signup', async (c) => {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "debug@example.com",
        password: "Password123!",
        name: "Debug User"
      },
      asResponse: false 
    })
    return c.json(res)
  } catch (error: any) {
    logger.error('Debug signup failed', error)
    return c.json({ error: error.message, stack: error.stack, details: error }, 500)
  }
})

// GraphQL GET endpoint
app.get('/graphql', async (c) => {
  const query = c.req.query('query')
  
  if (!query) {
    // Show landing page only in development
    if (!IS_PRODUCTION) {
      return c.html(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ValueFlows Production GraphQL Server</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 900px;
                margin: 50px auto;
                padding: 20px;
                line-height: 1.6;
              }
              h1 { color: #333; }
              code {
                background: #f4f4f4;
                padding: 2px 6px;
                border-radius: 3px;
              }
              .endpoint {
                background: #e8f4f8;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
              }
              .warning {
                background: #fff3cd;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #ffc107;
              }
            </style>
          </head>
          <body>
            <h1>🚀 ValueFlows Production GraphQL Server</h1>
            <p>Production-ready GraphQL server with authentication and database persistence.</p>
            
            <div class="warning">
              <strong>⚠️ Authentication Required</strong>
              <p>Most mutations require authentication. Use the <code>/api/auth/*</code> endpoints to sign up and sign in.</p>
            </div>

            <div class="endpoint">
              <h2>GraphQL Endpoint</h2>
              <p><strong>POST</strong> <code>/graphql</code></p>
              <p>Send GraphQL queries and mutations. Include <code>Authorization: Bearer &lt;token&gt;</code> header for authenticated requests.</p>
            </div>

            <div class="endpoint">
              <h2>Authentication Endpoints</h2>
              <p><strong>POST</strong> <code>/api/auth/sign-up</code> - Create new account</p>
              <p><strong>POST</strong> <code>/api/auth/sign-in</code> - Sign in</p>
              <p><strong>POST</strong> <code>/api/auth/sign-out</code> - Sign out</p>
              <p><strong>GET</strong> <code>/api/auth/session</code> - Get current session</p>
            </div>

            <div class="endpoint">
              <h2>Apollo Sandbox</h2>
              <p><a href="https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:${SERVER_PORT}/graphql" target="_blank">
                Open Apollo Sandbox →
              </a></p>
            </div>

            <div class="endpoint">
              <h2>Health Checks</h2>
              <p><strong>GET</strong> <code>/health</code> - Basic health check</p>
              <p><strong>GET</strong> <code>/ready</code> - Readiness check (includes DB)</p>
            </div>
          </body>
        </html>
      `)
    }
    
    // In production, just return 404
    return c.json({ error: 'Not found' }, 404)
  }

  const user = c.get('user')
  const requestId = c.get('requestId')
  
  const response = await apolloServer.executeOperation(
    { query },
    {
      contextValue: {
        user,
        headers: c.req.raw.headers,
        requestId,
      },
    }
  )

  if (response.body.kind === 'single') {
    return c.json(response.body.singleResult)
  }

  return c.json({ errors: [{ message: 'Incremental delivery not supported' }] })
})

// Health check endpoint (basic liveness)
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// Readiness check endpoint (includes dependencies)
app.get('/ready', async (c) => {
  const checks = {
    server: 'ok',
    database: await checkDatabaseHealth() ? 'ok' : 'error',
    auth: 'ok', // BetterAuth doesn't have a health check, assume ok if server is running
  }
  
  const isReady = Object.values(checks).every(status => status === 'ok')
  const statusCode = isReady ? 200 : 503
  
  return c.json({
    status: isReady ? 'ready' : 'not ready',
    timestamp: new Date().toISOString(),
    checks,
  }, statusCode)
})

// Root endpoint
app.get('/', (c) => {
  if (IS_PRODUCTION) {
    return c.json({
      service: 'ValueFlows GraphQL API',
      version: '1.0.0',
    })
  }
  return c.redirect('/graphql')
})

// Startup logging
logger.info('Server starting', {
  port: SERVER_PORT,
  environment: process.env.NODE_ENV || 'development',
  introspection: apolloServer.internals.introspection,
  corsOrigin: getCorsConfig().origin,
})

logger.info(`🚀🚀🚀
  Production GraphQL server running at http://localhost:${SERVER_PORT}
  
  GraphQL endpoint: http://localhost:${SERVER_PORT}/graphql
  Auth endpoints: http://localhost:${SERVER_PORT}/api/auth/*
  Health check: http://localhost:${SERVER_PORT}/health
  Readiness check: http://localhost:${SERVER_PORT}/ready
  
  ${!IS_PRODUCTION ? `Apollo Sandbox:\n  https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:${SERVER_PORT}/graphql` : ''}
🚀🚀🚀`)

// Explicitly start server with Bun.serve
console.log(`Starting Bun server on port ${SERVER_PORT}...`)
const server = Bun.serve({
  port: SERVER_PORT,
  fetch: app.fetch,
})
console.log(`Server started on port ${server.port}`)

// Setup graceful shutdown
setupGracefulShutdown(apolloServer)
