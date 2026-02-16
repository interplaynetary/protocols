/**
 * GraphQL server with Apollo Server v4 + Hono + Bun
 *
 * @package: vf-graphql
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-03-18
 * @updated: 2026-02-15 - Migrated to Hono + Bun
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ApolloServer } from '@apollo/server'
import { addMocksToSchema } from '@graphql-tools/mock'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { buildSchema, printSchema } from '@valueflows/vf-graphql'

const SERVER_PORT = process.env.PORT || 3000

// Build the schema with mocks
const schemaSDL = printSchema(buildSchema())
const executableSchema = makeExecutableSchema({ typeDefs: schemaSDL })

const schema = addMocksToSchema({
  schema: executableSchema,
  mocks: {
    URI: () => 'http://example.com/thing',
    DateTime: () => new Date().toISOString(),
  },
  preserveResolvers: false,
})

// Create Apollo Server v4
const apolloServer = new ApolloServer({
  schema,
  introspection: true,
  plugins: [
    // Custom plugin for request logging
    {
      async requestDidStart() {
        return {
          async didResolveOperation(requestContext) {
            console.log(`🔍 Operation: ${requestContext.operationName || 'Anonymous'}`)
          },
          async didEncounterErrors(requestContext) {
            console.error('❌ Errors:', requestContext.errors)
          },
        }
      },
    },
  ],
  formatError: (formattedError) => {
    console.error('GraphQL Error:', formattedError)
    return formattedError
  },
})

// Start Apollo Server
await apolloServer.start()

// Create Hono app
const app = new Hono()

// CORS middleware
app.use('/*', cors())

// GraphQL endpoint
app.post('/graphql', async (c) => {
  const request = c.req.raw
  const body = await c.req.json()

  const response = await apolloServer.executeOperation(
    {
      query: body.query,
      variables: body.variables,
      operationName: body.operationName,
    },
    {
      contextValue: {
        headers: request.headers,
      },
    }
  )

  if (response.body.kind === 'single') {
    return c.json(response.body.singleResult)
  }

  // Handle incremental delivery (not typical for this use case)
  return c.json({ errors: [{ message: 'Incremental delivery not supported' }] })
})

// GraphQL GET endpoint for introspection queries
app.get('/graphql', async (c) => {
  const query = c.req.query('query')
  
  if (!query) {
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ValueFlows GraphQL Mock Server</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px;
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
          </style>
        </head>
        <body>
          <h1>🚀 ValueFlows GraphQL Mock Server</h1>
          <p>This server provides a mock implementation of the ValueFlows GraphQL schema.</p>
          
          <div class="endpoint">
            <h2>GraphQL Endpoint</h2>
            <p><strong>POST</strong> <code>/graphql</code></p>
            <p>Send GraphQL queries and mutations to this endpoint.</p>
          </div>

          <div class="endpoint">
            <h2>Apollo Sandbox</h2>
            <p>For an interactive GraphQL playground, use Apollo Sandbox:</p>
            <p><a href="https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:${SERVER_PORT}/graphql" target="_blank">
              Open Apollo Sandbox →
            </a></p>
          </div>

          <div class="endpoint">
            <h2>Schema Introspection</h2>
            <p>Query the schema using standard GraphQL introspection queries.</p>
          </div>
        </body>
      </html>
    `)
  }

  const response = await apolloServer.executeOperation(
    { query },
    {
      contextValue: {
        headers: c.req.raw.headers,
      },
    }
  )

  if (response.body.kind === 'single') {
    return c.json(response.body.singleResult)
  }

  return c.json({ errors: [{ message: 'Incremental delivery not supported' }] })
})

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Root endpoint
app.get('/', (c) => {
  return c.redirect('/graphql')
})

console.log(`🚀🚀🚀
  GraphQL server running at http://localhost:${SERVER_PORT}/graphql
  Health check at http://localhost:${SERVER_PORT}/health
  
  Use Apollo Sandbox for interactive queries:
  https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:${SERVER_PORT}/graphql
🚀🚀🚀`)

export default {
  port: SERVER_PORT,
  fetch: app.fetch,
}
