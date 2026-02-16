#!/usr/bin/env node

/**
 * ValueFlows GraphQL MCP Server
 * 
 * A Model Context Protocol server that exposes the ValueFlows GraphQL schema
 * as MCP tools and resources for AI model integration.
 * 
 * @package: vf-graphql-mcp-server
 * @since:   2026-02-14
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { 
  graphql, 
  introspectionFromSchema, 
  getIntrospectionQuery,
  buildClientSchema,
  printType,
  GraphQLSchema,
  printSchema as graphqlPrintSchema,
} from 'graphql';

// Import the VF GraphQL schema builder (CommonJS module)
// @ts-ignore - No type definitions available for @valueflows/vf-graphql
const vfGraphQL = require('@valueflows/vf-graphql');
const buildSchema = vfGraphQL.buildSchema;
const printSchema = vfGraphQL.printSchema || graphqlPrintSchema;

// Build the ValueFlows schema
const vfSchema: GraphQLSchema = buildSchema();
const vfSchemaSDL = printSchema(vfSchema);

/**
 * MCP Server for ValueFlows GraphQL
 */
class ValueFlowsMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'valueflows-graphql-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error: Error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'vf://schema/sdl',
            mimeType: 'text/plain',
            name: 'ValueFlows GraphQL Schema (SDL)',
            description: 'The complete ValueFlows GraphQL schema in SDL format',
          },
          {
            uri: 'vf://schema/introspection',
            mimeType: 'application/json',
            name: 'ValueFlows GraphQL Schema (Introspection)',
            description: 'The complete ValueFlows GraphQL schema introspection result',
          },
        ],
      };
    });

    // Read a specific resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'vf://schema/sdl') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: vfSchemaSDL,
            },
          ],
        };
      }

      if (uri === 'vf://schema/introspection') {
        const introspection = introspectionFromSchema(vfSchema);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(introspection, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'query_graphql',
            description: 'Execute a GraphQL query against the ValueFlows schema with mock data',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The GraphQL query to execute',
                },
                variables: {
                  type: 'object',
                  description: 'Optional variables for the GraphQL query',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_type_info',
            description: 'Get detailed information about a specific GraphQL type in the ValueFlows schema',
            inputSchema: {
              type: 'object',
              properties: {
                typeName: {
                  type: 'string',
                  description: 'The name of the GraphQL type to inspect',
                },
              },
              required: ['typeName'],
            },
          },
          {
            name: 'list_types',
            description: 'List all available types in the ValueFlows GraphQL schema',
            inputSchema: {
              type: 'object',
              properties: {
                kind: {
                  type: 'string',
                  enum: ['OBJECT', 'INTERFACE', 'UNION', 'ENUM', 'INPUT_OBJECT', 'SCALAR'],
                  description: 'Optional filter by type kind',
                },
              },
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'query_graphql':
            return await this.handleQueryGraphQL(args);
          
          case 'get_type_info':
            return await this.handleGetTypeInfo(args);
          
          case 'list_types':
            return await this.handleListTypes(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleQueryGraphQL(args: any) {
    const { query, variables } = args;

    if (!query) {
      throw new Error('Query is required');
    }

    // Execute the query against the schema
    // Note: This uses the schema without mocks - you'd need to add mock resolvers
    // or connect to a real GraphQL endpoint for actual data
    const result = await graphql({
      schema: vfSchema,
      source: query,
      variableValues: variables,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleGetTypeInfo(args: any) {
    const { typeName } = args;

    if (!typeName) {
      throw new Error('typeName is required');
    }

    const type = vfSchema.getType(typeName);
    
    if (!type) {
      throw new Error(`Type "${typeName}" not found in schema`);
    }

    const typeInfo = printType(type);

    return {
      content: [
        {
          type: 'text',
          text: typeInfo,
        },
      ],
    };
  }

  private async handleListTypes(args: any) {
    const { kind } = args;

    const typeMap = vfSchema.getTypeMap();
    let types = Object.keys(typeMap)
      .filter(name => !name.startsWith('__')) // Filter out introspection types
      .map(name => {
        const type = typeMap[name];
        return {
          name,
          kind: type.astNode?.kind || 'Unknown',
          description: 'description' in type ? type.description : undefined,
        };
      });

    // Filter by kind if specified
    if (kind) {
      const kindMap: Record<string, string> = {
        'OBJECT': 'ObjectTypeDefinition',
        'INTERFACE': 'InterfaceTypeDefinition',
        'UNION': 'UnionTypeDefinition',
        'ENUM': 'EnumTypeDefinition',
        'INPUT_OBJECT': 'InputObjectTypeDefinition',
        'SCALAR': 'ScalarTypeDefinition',
      };
      
      const astKind = kindMap[kind];
      if (astKind) {
        types = types.filter(t => t.kind === astKind);
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(types, null, 2),
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ValueFlows GraphQL MCP Server running on stdio');
  }
}

// Start the server
const server = new ValueFlowsMCPServer();
server.run().catch(console.error);
