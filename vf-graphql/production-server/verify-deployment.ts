#!/usr/bin/env bun

/**
 * Pre-deployment verification script
 * Run this before deploying to production to catch common issues
 */

import { logger } from './src/lib/logger'

interface CheckResult {
  name: string
  passed: boolean
  message: string
  critical: boolean
}

const results: CheckResult[] = []

function check(name: string, condition: boolean, message: string, critical = true) {
  results.push({ name, passed: condition, message, critical })
  
  if (condition) {
    logger.info(`✅ ${name}`)
  } else {
    const logFn = critical ? logger.error : logger.warn
    logFn(`${critical ? '❌' : '⚠️'} ${name}: ${message}`)
  }
}

logger.info('🔍 Running pre-deployment checks...\n')

// Environment checks
check(
  'NODE_ENV',
  process.env.NODE_ENV === 'production',
  'NODE_ENV should be "production"'
)

check(
  'Database URL',
  !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'),
  'DATABASE_URL must be set and not point to localhost'
)

check(
  'Auth Secret',
  !!process.env.BETTER_AUTH_SECRET && 
  process.env.BETTER_AUTH_SECRET !== 'your-secret-key-change-in-production' &&
  process.env.BETTER_AUTH_SECRET.length >= 32,
  'BETTER_AUTH_SECRET must be set and be at least 32 characters'
)

check(
  'Auth URL',
  !!process.env.BETTER_AUTH_URL && 
  process.env.BETTER_AUTH_URL.startsWith('https://'),
  'BETTER_AUTH_URL must be set and use HTTPS'
)

check(
  'GraphQL Introspection',
  process.env.GRAPHQL_INTROSPECTION === 'false',
  'GRAPHQL_INTROSPECTION should be disabled in production'
)

check(
  'CORS Origin',
  !!process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*',
  'CORS_ORIGIN must be set to specific domain(s), not "*"'
)

check(
  'Secure Cookies',
  process.env.AUTH_COOKIE_SECURE === 'true',
  'AUTH_COOKIE_SECURE should be true for HTTPS'
)

check(
  'Log Format',
  process.env.LOG_FORMAT === 'json',
  'LOG_FORMAT should be "json" for production',
  false
)

check(
  'Trust Proxy',
  process.env.TRUST_PROXY === 'true',
  'TRUST_PROXY should be true if behind reverse proxy',
  false
)

// Database pool checks
const poolMax = parseInt(process.env.DB_POOL_MAX || '10')
const poolMin = parseInt(process.env.DB_POOL_MIN || '2')

check(
  'Database Pool Size',
  poolMax >= poolMin && poolMax <= 20,
  'DB_POOL_MAX should be between DB_POOL_MIN and 20',
  false
)

// Summary
console.log('\n' + '='.repeat(50))
const criticalFailures = results.filter(r => !r.passed && r.critical)
const warnings = results.filter(r => !r.passed && !r.critical)
const passed = results.filter(r => r.passed)

logger.info(`\n📊 Summary:`)
logger.info(`  ✅ Passed: ${passed.length}`)
if (warnings.length > 0) {
  logger.warn(`  ⚠️  Warnings: ${warnings.length}`)
}
if (criticalFailures.length > 0) {
  logger.error(`  ❌ Critical Failures: ${criticalFailures.length}`)
}

if (criticalFailures.length > 0) {
  logger.error('\n🚫 DEPLOYMENT BLOCKED - Fix critical issues before deploying')
  process.exit(1)
} else if (warnings.length > 0) {
  logger.warn('\n⚠️  Deployment allowed but warnings should be addressed')
  process.exit(0)
} else {
  logger.info('\n✅ All checks passed - Ready for deployment!')
  process.exit(0)
}
