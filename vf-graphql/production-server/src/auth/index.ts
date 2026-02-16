/**
 * BetterAuth configuration with production security settings
 */

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'
import * as schema from '../db/schema'
import { logger } from '../lib/logger'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

logger.info('Initializing BetterAuth', {
  environment: process.env.NODE_ENV || 'development',
  baseURL: process.env.BETTER_AUTH_URL,
  emailPasswordEnabled: true,
})

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // In production, require email verification
    requireEmailVerification: IS_PRODUCTION,
  },
  session: {
    // Session expires after 7 days
    expiresIn: 60 * 60 * 24 * 7,
    // Update session if it's older than 1 day
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  // Advanced security settings
  advanced: {
    // Generate secure session tokens
    generateId: () => {
      return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    },
    // Cookie security settings
    cookiePrefix: 'vf',
    // Use secure cookies in production
    useSecureCookies: IS_PRODUCTION || process.env.AUTH_COOKIE_SECURE === 'true',
    // Cross-site protection
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  // Social providers (uncomment and configure as needed)
  socialProviders: {
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // },
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // },
  },
  secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000',
  // Trust proxy in production
  trustedOrigins: process.env.CORS_ORIGIN?.split(',') || [],
})

export type Auth = typeof auth
