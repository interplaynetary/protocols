/**
 * GraphQL / GraphiQL server with Apollo Server v4
 *
 * @package: vf-graphql
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-03-18
 * @updated: 2026-02-14 - Upgraded to Apollo Server v4
 */

const express = require('express')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default')
const { express: voyagerMiddleware } = require('graphql-voyager/middleware')
const { addMocksToSchema } = require('@graphql-tools/mock')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const cors = require('cors')
const bodyParser = require('body-parser')

const SERVER_PORT = process.env.PORT || 3000
const SCHEMA_VIEWER_PATH = '/viewer'

const { buildSchema, printSchema } = require('@valueflows/vf-graphql')

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
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ 
      embed: true,
      includeCookies: true 
    }),
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
  formatError: (formattedError, error) => {
    // Add custom error formatting
    console.error('GraphQL Error:', formattedError)
    return formattedError
  },
  introspection: true,
})

const app = express()

async function startServer() {
  await server.start()

  // Apply middleware
  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        // Add context here if needed
        headers: req.headers,
      }),
    })
  )

  // GraphQL Voyager for schema visualization
  app.use(SCHEMA_VIEWER_PATH, voyagerMiddleware({
    endpointUrl: '/graphql',
    displayOptions: {
      hideRoot: true,
      showLeafFields: true,
    },
  }))

  // Start the server
  app.listen({ port: SERVER_PORT }, () => {
    console.log(`🚀🚀🚀
      Query browser at http://localhost:${SERVER_PORT}/graphql
      Schema visualiser at http://localhost:${SERVER_PORT}${SCHEMA_VIEWER_PATH}
  🚀🚀🚀`)
  })
}

startServer().catch(console.error)
