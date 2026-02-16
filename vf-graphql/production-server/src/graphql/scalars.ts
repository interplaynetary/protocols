/**
 * GraphQL Scalar Type Resolvers
 * 
 * Implements all custom scalar types required by ValueFlows:
 * - DateTime (ISO 8601)
 * - URI (web URLs, Holochain entries, etc.)
 * - Decimal (arbitrary-precision floating-point)
 */

import { GraphQLScalarType, Kind } from 'graphql'

/**
 * DateTime scalar - ISO 8601 format
 * Already implemented in scalars.ts, re-exported here for completeness
 */
export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO 8601 date-time string',
  
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString()
    }
    if (typeof value === 'string') {
      return new Date(value).toISOString()
    }
    throw new Error('DateTime must be a Date object or ISO 8601 string')
  },
  
  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid DateTime value')
      }
      return date
    }
    throw new Error('DateTime must be a string')
  },
  
  parseLiteral(ast): Date {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid DateTime value')
      }
      return date
    }
    throw new Error('DateTime must be a string')
  },
})

/**
 * URI scalar - External web URLs, Holochain entries, etc.
 * Already implemented in scalars.ts, re-exported here for completeness
 */
export const URIScalar = new GraphQLScalarType({
  name: 'URI',
  description: 'URI string (web URL, Holochain entry, or other resource identifier)',
  
  serialize(value: unknown): string {
    if (typeof value === 'string') {
      return value
    }
    throw new Error('URI must be a string')
  },
  
  parseValue(value: unknown): string {
    if (typeof value === 'string') {
      return value
    }
    throw new Error('URI must be a string')
  },
  
  parseLiteral(ast): string {
    if (ast.kind === Kind.STRING) {
      return ast.value
    }
    throw new Error('URI must be a string')
  },
})

/**
 * Decimal scalar - Arbitrary-precision floating-point
 * Represented as strings to preserve precision
 */
export const DecimalScalar = new GraphQLScalarType({
  name: 'Decimal',
  description: 'Arbitrary-precision floating-point number (IEEE 854-1987), represented as string',
  
  serialize(value: unknown): string {
    if (typeof value === 'string') {
      // Validate it's a valid number string
      if (isNaN(Number(value))) {
        throw new Error('Decimal must be a valid number string')
      }
      return value
    }
    if (typeof value === 'number') {
      return value.toString()
    }
    throw new Error('Decimal must be a string or number')
  },
  
  parseValue(value: unknown): string {
    if (typeof value === 'string') {
      if (isNaN(Number(value))) {
        throw new Error('Decimal must be a valid number string')
      }
      return value
    }
    if (typeof value === 'number') {
      return value.toString()
    }
    throw new Error('Decimal must be a string or number')
  },
  
  parseLiteral(ast): string {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT || ast.kind === Kind.FLOAT) {
      const value = ast.kind === Kind.STRING ? ast.value : ast.value.toString()
      if (isNaN(Number(value))) {
        throw new Error('Decimal must be a valid number')
      }
      return value
    }
    throw new Error('Decimal must be a string or number')
  },
})

/**
 * All scalar resolvers
 */
export const scalarResolvers = {
  DateTime: DateTimeScalar,
  URI: URIScalar,
  Decimal: DecimalScalar,
}
