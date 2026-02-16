# ValueFlows GraphQL MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes the ValueFlows GraphQL schema as MCP tools and resources for AI model integration.

## What is this?

This MCP server allows AI models (like Claude) to:

- Explore the ValueFlows GraphQL schema
- Execute GraphQL queries against the schema
- Get detailed information about specific types
- List all available types in the schema

## Installation

```bash
cd mcp-server
bun install
bun run build
```

## Usage

### Running the Server

The MCP server uses stdio transport for communication:

```bash
bun run start
```

### Connecting to Claude Desktop

Add this configuration to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
	"mcpServers": {
		"valueflows-graphql": {
			"command": "bun",
			"args": [
				"run",
				"/absolute/path/to/vf-graphql/mcp-server/dist/index.js"
			]
		}
	}
}
```

Replace `/absolute/path/to/vf-graphql` with the actual path to your vf-graphql repository.

### Testing with MCP Inspector

You can test the MCP server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector bun run start
```

This will open a web interface where you can test the available tools and resources.

## Available Tools

### `query_graphql`

Execute a GraphQL query against the ValueFlows schema.

**Parameters:**

- `query` (string, required): The GraphQL query to execute
- `variables` (object, optional): Variables for the GraphQL query

**Example:**

```json
{
	"query": "{ __schema { types { name } } }"
}
```

### `get_type_info`

Get detailed information about a specific GraphQL type.

**Parameters:**

- `typeName` (string, required): The name of the type to inspect

**Example:**

```json
{
	"typeName": "EconomicEvent"
}
```

### `list_types`

List all available types in the ValueFlows schema.

**Parameters:**

- `kind` (string, optional): Filter by type kind (OBJECT, INTERFACE, UNION, ENUM, INPUT_OBJECT, SCALAR)

**Example:**

```json
{
	"kind": "OBJECT"
}
```

## Available Resources

### `vf://schema/sdl`

The complete ValueFlows GraphQL schema in SDL (Schema Definition Language) format.

### `vf://schema/introspection`

The complete ValueFlows GraphQL schema introspection result in JSON format.

## Development

### Watch Mode

Run the server in watch mode during development:

```bash
bun run dev
```

### Building

```bash
bun run build
```

## Architecture

The MCP server is built using:

- **@modelcontextprotocol/sdk**: Official MCP SDK for TypeScript
- **@valueflows/vf-graphql**: The ValueFlows GraphQL schema (workspace dependency)
- **graphql**: GraphQL execution engine

The server exposes the ValueFlows schema through MCP's standardized protocol, allowing AI models to understand and interact with the schema programmatically.

## Use Cases

- **Schema Exploration**: AI models can explore the ValueFlows schema to understand available types and fields
- **Query Generation**: AI models can generate and test GraphQL queries
- **Documentation**: AI models can provide information about specific types and their relationships
- **Development Assistance**: Helps developers understand the ValueFlows schema through AI-powered exploration

## License

Apache-2.0
