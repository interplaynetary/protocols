import { z } from 'zod';

/**
 * Shared Zod Schemas
 * 
 * These schemas can be used for both:
 * 1. Validating input before issuing a Verifiable Credential (Write side)
 * 2. Validating nodes during Graph Aggregation (Read side)
 */

export const LaborCapacitySchema = z.object({
    potential: z.object({
        type: z.literal("LaborCapacity"),
        magnitude: z.number().min(0)
    })
});

export const MembershipSchema = z.object({
    memberOf: z.array(z.string()).or(z.set(z.string())),
    potential: z.object({
        type: z.literal("Membership"),
        magnitude: z.number()
    }).optional() // Optional because sometimes memberOf is direct
});

// Example of a custom economic attribute
export const BudgetSchema = z.object({
    departmentBudget: z.number().min(0),
    currency: z.string().default("USD")
});

/**
 * Generic Trust Claim
 * 
 * Defines delegation of authority.
 * "I (Issuer) trust these DIDs (trusts) regarding this Scope (scope)."
 */
export const TrustClaimSchema = z.object({
    scope: z.string(), // e.g., "urn:scope:engineering"
    trusts: z.array(z.string()), // List of DIDs

    // Granular Filters (Optional)
    // If present, trust is limited to VCs matching these constraints.
    filters: z.object({
        attributes: z.array(z.string()).optional(), // e.g., ["memberOf", "budget"] (Only these keys)

        // Advanced: MongoDB-style subset query? (Maybe too complex for now)
        // Let's stick to Attribute Whitelisting for now as requested.
    }).optional()
});
