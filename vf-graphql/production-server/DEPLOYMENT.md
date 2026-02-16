# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

Before deploying to production, verify all items:

### ✅ Security

- [ ] `BETTER_AUTH_SECRET` is a strong random string (not default)
- [ ] `GRAPHQL_INTROSPECTION=false` in production
- [ ] `GRAPHQL_PLAYGROUND=false` in production
- [ ] `CORS_ORIGIN` set to your frontend domain (not `*`)
- [ ] `AUTH_COOKIE_SECURE=true` for HTTPS
- [ ] `AUTH_COOKIE_SAME_SITE=strict` or `lax`
- [ ] All secrets stored in platform secret manager (not committed)

### ✅ Database

- [ ] `DATABASE_URL` points to production database
- [ ] Connection pooling configured (`DB_POOL_MAX`, `DB_POOL_MIN`)
- [ ] Migrations run before server starts
- [ ] Database backups configured

### ✅ Observability

- [ ] `LOG_LEVEL=info` or `warn` for production
- [ ] `LOG_FORMAT=json` for structured logging
- [ ] Error tracking configured (Sentry DSN if using)
- [ ] Health checks accessible (`/health`, `/ready`)

### ✅ Performance

- [ ] Query complexity limits set (`GRAPHQL_MAX_DEPTH`)
- [ ] Database query timeouts configured
- [ ] Connection pool sized appropriately

### ✅ Environment

- [ ] `NODE_ENV=production`
- [ ] `TRUST_PROXY=true` if behind reverse proxy
- [ ] All required environment variables set

---

## 📦 Platform-Specific Deployment

### Fly.io

**1. Install Fly CLI**

```bash
curl -L https://fly.io/install.sh | sh
```

**2. Create `fly.toml`**

```toml
app = "valueflows-graphql"
primary_region = "iad"

[build]
  [build.args]
    NODE_VERSION = "20"

[env]
  NODE_ENV = "production"
  PORT = "8080"
  LOG_FORMAT = "json"
  LOG_LEVEL = "info"
  GRAPHQL_INTROSPECTION = "false"
  TRUST_PROXY = "true"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    timeout = "5s"
    path = "/health"

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    timeout = "5s"
    path = "/ready"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

**3. Set Secrets**

```bash
fly secrets set BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set CORS_ORIGIN="https://your-frontend.com"
```

**4. Deploy**

```bash
fly deploy
```

---

### Railway

**1. Create `railway.json`**

```json
{
	"$schema": "https://railway.app/railway.schema.json",
	"build": {
		"builder": "NIXPACKS"
	},
	"deploy": {
		"startCommand": "bun run start",
		"healthcheckPath": "/health",
		"healthcheckTimeout": 100,
		"restartPolicyType": "ON_FAILURE",
		"restartPolicyMaxRetries": 10
	}
}
```

**2. Set Environment Variables in Railway Dashboard**

```
NODE_ENV=production
BETTER_AUTH_SECRET=<generate-strong-secret>
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGIN=https://your-frontend.com
GRAPHQL_INTROSPECTION=false
LOG_FORMAT=json
TRUST_PROXY=true
```

**3. Deploy**

```bash
railway up
```

---

### Render

**1. Create `render.yaml`**

```yaml
services:
    - type: web
      name: valueflows-graphql
      env: docker
      plan: starter
      buildCommand: bun install
      startCommand: bun run start
      healthCheckPath: /health
      envVars:
          - key: NODE_ENV
            value: production
          - key: PORT
            value: 4000
          - key: LOG_FORMAT
            value: json
          - key: GRAPHQL_INTROSPECTION
            value: false
          - key: TRUST_PROXY
            value: true
          - key: BETTER_AUTH_SECRET
            generateValue: true
          - key: DATABASE_URL
            fromDatabase:
                name: valueflows-db
                property: connectionString
          - key: CORS_ORIGIN
            value: https://your-frontend.com

databases:
    - name: valueflows-db
      plan: starter
      databaseName: valueflows
      user: valueflows
```

**2. Deploy**

```bash
render deploy
```

---

### Docker (Self-Hosted)

**1. Create `Dockerfile`**

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY . .

# Run migrations and start
CMD ["sh", "-c", "bun run db:migrate && bun run start"]

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1
```

**2. Create `docker-compose.yml`**

```yaml
version: "3.8"

services:
    app:
        build: .
        ports:
            - "4000:4000"
        environment:
            NODE_ENV: production
            DATABASE_URL: postgresql://postgres:password@db:5432/valueflows
            BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
            CORS_ORIGIN: ${CORS_ORIGIN}
            GRAPHQL_INTROSPECTION: "false"
            LOG_FORMAT: json
        depends_on:
            db:
                condition: service_healthy
        restart: unless-stopped

    db:
        image: postgres:16-alpine
        environment:
            POSTGRES_DB: valueflows
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: password
        volumes:
            - postgres_data:/var/lib/postgresql/data
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U postgres"]
            interval: 10s
            timeout: 5s
            retries: 5

volumes:
    postgres_data:
```

**3. Deploy**

```bash
docker-compose up -d
```

---

## 🔄 Migration Strategy

### Automated Migrations (Recommended)

Add to your start script in `package.json`:

```json
{
	"scripts": {
		"start": "bun run db:migrate && bun run src/index.ts"
	}
}
```

### Manual Migrations

For zero-downtime deployments:

```bash
# 1. Run migrations first
bun run db:migrate

# 2. Then deploy new code
# (platform-specific deploy command)
```

---

## 📊 Monitoring & Logging

### Structured Logs

All logs are JSON-formatted in production. Example:

```json
{
	"timestamp": "2026-02-15T19:00:00.000Z",
	"level": "info",
	"message": "GraphQL operation",
	"operation": "getAgents",
	"duration": "45ms",
	"requestId": "req_1234567890_abc123"
}
```

### Log Aggregation

Forward logs to your preferred service:

- **Datadog**: Use Datadog agent
- **Logtail**: Forward JSON logs
- **CloudWatch**: Use AWS CloudWatch agent
- **Papertrail**: Syslog forwarding

### Error Tracking (Sentry)

Add to `package.json`:

```bash
bun add @sentry/node @sentry/profiling-node
```

Update `src/index.ts`:

```typescript
import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		environment: process.env.NODE_ENV,
		tracesSampleRate: 0.1,
	});
}
```

---

## 🔐 Secrets Management

### Generate Strong Secrets

```bash
# BETTER_AUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Platform Secret Managers

- **Fly.io**: `fly secrets set KEY=value`
- **Railway**: Environment variables in dashboard
- **Render**: Environment variables in dashboard
- **AWS**: AWS Secrets Manager
- **GCP**: Google Secret Manager
- **Azure**: Azure Key Vault

---

## ✅ Post-Deployment Verification

### 1. Health Checks

```bash
curl https://your-domain.com/health
curl https://your-domain.com/ready
```

### 2. GraphQL Endpoint

```bash
curl -X POST https://your-domain.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

### 3. Authentication

```bash
# Sign up
curl -X POST https://your-domain.com/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "secure123", "name": "Test User"}'

# Sign in
curl -X POST https://your-domain.com/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "secure123"}'
```

### 4. Verify Security Headers

```bash
curl -I https://your-domain.com/health
# Should see: X-Frame-Options, X-Content-Type-Options, etc.
```

### 5. Check Logs

```bash
# Platform-specific log viewing
fly logs          # Fly.io
railway logs      # Railway
render logs       # Render
docker logs app   # Docker
```

---

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check firewall rules
- Ensure database is accessible from app
- Check connection pool settings

### Authentication Not Working

- Verify `BETTER_AUTH_SECRET` is set
- Check `BETTER_AUTH_URL` matches your domain
- Ensure cookies are secure (HTTPS required)
- Check CORS settings

### High Memory Usage

- Reduce `DB_POOL_MAX`
- Check for memory leaks in custom resolvers
- Monitor query complexity

### Slow Queries

- Add database indexes
- Reduce `GRAPHQL_MAX_DEPTH`
- Implement query caching
- Use DataLoader for N+1 queries

---

## 📈 Scaling Considerations

### Horizontal Scaling

- Stateless design allows multiple instances
- Use external session store if needed
- Database connection pooling per instance

### Database Scaling

- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer)
- Query optimization and indexing

### Caching

- Add Redis for session storage
- Implement GraphQL response caching
- Use CDN for static assets

---

## 🔄 CI/CD Pipeline Example

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
    push:
        branches: [main]

jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3

            - uses: oven-sh/setup-bun@v1
              with:
                  bun-version: latest

            - name: Install dependencies
              run: bun install

            - name: Type check
              run: bun run tsc --noEmit

            - name: Run tests
              run: bun test

            - name: Deploy to Fly.io
              run: |
                  curl -L https://fly.io/install.sh | sh
                  flyctl deploy --remote-only
              env:
                  FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## 📚 Additional Resources

- [Hono Deployment Guide](https://hono.dev/getting-started/deployment)
- [Drizzle ORM Production Best Practices](https://orm.drizzle.team/docs/production)
- [BetterAuth Security Guide](https://www.better-auth.com/docs/security)
- [Apollo Server Production Checklist](https://www.apollographql.com/docs/apollo-server/deployment/production)
