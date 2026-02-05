import {
    type VerifiableCredential,
    VerifiableCredentialSchema
} from './schemas/vc'
import {
    verify,
    decodeBase58
} from '../identity/keys'
import naclUtil from 'tweetnacl-util'
const { decodeBase64 } = naclUtil

// ... (existing code, we just replace the imports and the helper function, 
// using replace_file_content to swap the whole file or large chunks is safer if unstable)

// ═══════════════════════════════════════════════════════════════════════
// VC VERIFICATION
// ═══════════════════════════════════════════════════════════════════════

export interface VerificationResult {
    verified: boolean
    errors: string[]
}

/**
 * Verify a Verifiable Credential
 */
export async function verifyCredential(
    vc: VerifiableCredential
): Promise<VerificationResult> {
    const errors: string[] = []

    // 1. Schema Validation
    const parseResult = VerifiableCredentialSchema.safeParse(vc)
    if (!parseResult.success) {
        return { verified: false, errors: parseResult.error.errors.map(e => e.message) }
    }

    // 2. Check Proof existence
    if (!vc.proof) {
        return { verified: false, errors: ['Missing proof'] }
    }

    // 3. Expiration Check
    if (vc.expirationDate) {
        const now = new Date()
        const exp = new Date(vc.expirationDate)
        if (now > exp) {
            errors.push('Credential expired')
        }
    }

    // 4. Signature Verification
    try {
        // Reconstruct the message that was signed (unsigned VC)
        // IMPORTANT: precise reconstruction is critical. 
        // We must remove the proof property.
        const { proof, ...unsignedVC } = vc // eslint-disable-line @typescript-eslint/no-unused-vars

        // Canonicalize logic must match issuance exactly. 
        // Here: JSON.stringify
        const message = new TextEncoder().encode(JSON.stringify(unsignedVC))

        // Extract public key from DID in proof validation method
        // method format: did:key:z6Mfoo#z6Mfoo
        // We assume did:key format where the DID itself contains the public key
        const method = vc.proof.verificationMethod
        const did = method.split('#')[0]

        // Extract raw public key bytes from did:key
        const publicKey = extractPublicKeyFromDID(did)
        const signature = decodeBase64(vc.proof.jws)

        const valid = verify(message, signature, publicKey)

        if (!valid) {
            errors.push('Invalid signature')
        }

    } catch (e: any) {
        errors.push(`Verification error: ${e.message}`)
    }

    return {
        verified: errors.length === 0,
        errors
    }
}

/**
 * Helper to extract Ed25519 public key from did:key
 * did:key:z6MkqRE...
 */
function extractPublicKeyFromDID(did: string): Uint8Array {
    // 1. Remove prefix
    if (!did.startsWith('did:key:z')) {
        throw new Error('Unsupported DID format. Only did:key:z supported.')
    }
    const base58 = did.slice(9) // remove 'did:key:z'

    // 2. Decode Base58
    const bytes = decodeBase58(base58)

    // 3. Remove Multicodec prefix for Ed25519 (0xed01 is 2 bytes)
    // Check prefix
    if (bytes[0] === 0xed && bytes[1] === 0x01) {
        return bytes.slice(2)
    }

    throw new Error(`Unsupported key type in DID. Expected Ed25519 (0xed01). Found: ${bytes[0].toString(16)} ${bytes[1].toString(16)}`)
}
