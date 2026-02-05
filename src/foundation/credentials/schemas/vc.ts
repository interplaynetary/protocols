import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════
// W3C VERIFIABLE CREDENTIAL SCHEMAS
// ═══════════════════════════════════════════════════════════════════════

export const ProofSchema = z.object({
    type: z.string(),
    created: z.string().datetime(),
    verificationMethod: z.string(),
    proofPurpose: z.string(),
    jws: z.string()
})

export const CredentialSubjectSchema = z.record(z.string(), z.any())

export const VerifiableCredentialSchema = z.object({
    '@context': z.array(z.string()),
    id: z.string().url(),
    type: z.array(z.string()),
    issuer: z.union([z.string(), z.object({ id: z.string() })]),
    issuanceDate: z.string().datetime(),
    expirationDate: z.string().datetime().optional(),
    credentialSubject: CredentialSubjectSchema,
    proof: ProofSchema.optional() // Optional before signing
})

export type Proof = z.infer<typeof ProofSchema>
export type CredentialSubject = z.infer<typeof CredentialSubjectSchema>
export type VerifiableCredential = z.infer<typeof VerifiableCredentialSchema>
