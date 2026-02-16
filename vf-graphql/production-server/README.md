# ValueFlows Production Server

Production-ready GraphQL server for ValueFlows with authentication, database persistence, and modern tooling.

## 🚀 Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Web Framework**: [Hono](https://hono.dev/) - Ultrafast, lightweight web framework
- **GraphQL**: [Apollo Server v4](https://www.apollographql.com/docs/apollo-server/) - Production-ready GraphQL server
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Type-safe SQL ORM
- **Database**: PostgreSQL (configurable)
- **Authentication**: [BetterAuth](https://www.better-auth.com/) - Modern TypeScript-first auth
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation

## 📋 Prerequisites

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- PostgreSQL database running
- Node.js 18+ (for compatibility, though Bun is primary runtime)

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd production-server
bun install
```

### 2. Configure Environment

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL` - Your PostgreSQL connection string
- `BETTER_AUTH_SECRET` - A secure random string for auth
- `PORT` - Server port (default: 4000)

### 3. Database Setup

Generate and run migrations:

```bash
# Generate migration files from schema
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Or push schema directly (for development)
bun run db:push
```

### 4. Start Development Server

```bash
bun run dev
```

The server will start at `http://localhost:4000` (or your configured PORT).

## 📚 API Endpoints

### GraphQL

- **POST** `/graphql` - GraphQL endpoint
    - Send queries and mutations
    - Include `Authorization: Bearer <token>` header for authenticated requests

### Authentication

- **POST** `/api/auth/sign-up` - Create new account

    ```json
    {
    	"email": "user@example.com",
    	"password": "secure-password",
    	"name": "User Name"
    }
    ```

- **POST** `/api/auth/sign-in` - Sign in

    ```json
    {
    	"email": "user@example.com",
    	"password": "secure-password"
    }
    ```

- **POST** `/api/auth/sign-out` - Sign out
- **GET** `/api/auth/session` - Get current session

### Utilities

- **GET** `/health` - Health check endpoint
- **GET** `/` - Server info page

## 🔍 Development Tools

### Drizzle Studio

Visual database browser:

```bash
bun run db:studio
```

Opens at `https://local.drizzle.studio`

### Apollo Sandbox

Interactive GraphQL playground:

```
https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:4000/graphql
```

## 📖 Database Schema

The database includes:

### BetterAuth Tables

- `users` - User accounts
- `sessions` - Active sessions
- `accounts` - OAuth provider accounts
- `verifications` - Email verification tokens

### ValueFlows Tables

- `agents` - Economic agents (people, organizations)
- `resources` - Economic resources
- `resource_specifications` - Resource types/specs
- `economic_events` - Economic events (transfers, production, etc.)
- `processes` - Economic processes
- `commitments` - Future commitments

## 🔐 Authentication Flow

1. **Sign Up**: Create account via `/api/auth/sign-up`
2. **Sign In**: Get session token via `/api/auth/sign-in`
3. **Use Token**: Include in GraphQL requests:
    ```
    Authorization: Bearer <session-token>
    ```
4. **Protected Mutations**: Most mutations require authentication

## 🎯 Example GraphQL Queries

### Query Agents (No Auth Required)

```graphql
query {
	agents {
		id
		name
		note
	}
}
```

### Create Agent (Auth Required)

```graphql
mutation {
	createAgent(
		input: { name: "My Organization", note: "A cooperative organization" }
	) {
		id
		name
	}
}
```

### Create Economic Event (Auth Required)

```graphql
mutation {
	createEconomicEvent(
		input: {
			action: "transfer"
			provider: "agent-id-1"
			receiver: "agent-id-2"
			resourceQuantity: { hasNumericalValue: 10, hasUnit: "unit-id" }
		}
	) {
		id
		action
	}
}
```

## 🚀 Production Deployment

### Environment Variables

Ensure these are set in production:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<strong-random-secret>
BETTER_AUTH_URL=https://your-domain.com
PORT=4000
```

### Database Migrations

Always run migrations before deploying:

```bash
bun run db:migrate
```

### Running in Production

```bash
bun run start
```

## 🔧 Configuration

### Adding OAuth Providers

Edit `src/auth/index.ts` and uncomment/configure providers:

```typescript
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
}
```

### Custom Resolvers

Add resolvers in `src/graphql/resolvers.ts`:

```typescript
export const resolvers = {
	Query: {
		myCustomQuery: async (_, args, context) => {
			// Your logic here
		},
	},
};
```

### Database Schema Changes

1. Edit `src/db/schema.ts`
2. Generate migration: `bun run db:generate`
3. Review migration in `drizzle/` directory
4. Apply: `bun run db:migrate`

## 📝 Scripts

- `bun run dev` - Start development server with watch mode
- `bun run start` - Start production server
- `bun run db:generate` - Generate migrations from schema
- `bun run db:migrate` - Run migrations
- `bun run db:push` - Push schema directly (dev only)
- `bun run db:studio` - Open Drizzle Studio

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall/network settings

### Authentication Not Working

- Verify `BETTER_AUTH_SECRET` is set
- Check `BETTER_AUTH_URL` matches your domain
- Ensure session table exists in database

### GraphQL Errors

- Check server logs for detailed errors
- Verify schema is valid
- Test queries in Apollo Sandbox

## 📚 Additional Resources

- [Hono Documentation](https://hono.dev/)
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [BetterAuth Docs](https://www.better-auth.com/)
- [ValueFlows Specification](https://www.valueflo.ws/)

## 🤝 Contributing

This is part of the ValueFlows GraphQL monorepo. See the main README for contribution guidelines.

## 📄 License

Apache-2.0
