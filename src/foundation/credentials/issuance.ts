import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import {
    type VerifiableCredential,
    VerifiableCredentialSchema,
    type CredentialSubject
} from './schemas/vc'
import {
    type Keypair,
    sign
} from '../identity/keys'
import naclUtil from 'tweetnacl-util'
const { encodeBase64 } = naclUtil

// ═══════════════════════════════════════════════════════════════════════
// VC ISSUANCE
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create and sign a Verifiable Credential
 */
export async function issueCredential(
    issuerKey: Keypair,
    subject: CredentialSubject,
    type: string[] = ['VerifiableCredential'],
    expirationDate?: string
): Promise<VerifiableCredential> {

    const issuanceDate = new Date().toISOString()

    // 1. Construct unsigned VC object
    const unsignedVC: VerifiableCredential = {
        '@context': [
            'https://www.w3.org/2018/credentials/v1'
        ],
        id: `urn:uuid:${uuidv4()}`,
        type: Array.from(new Set(['VerifiableCredential', ...type])),
        issuer: { id: issuerKey.did },
        issuanceDate,
        expirationDate,
        credentialSubject: subject
    }

    // 2. Validate schema before signing
    VerifiableCredentialSchema.omit({ proof: true }).parse(unsignedVC)

    // 3. Create Proof (JWS-like detached signature)
    // We sign the canonicalized string representation of the VC
    // For simplicity in this Foundation Layer, we just sign JSON.stringify(unsignedVC)
    // In production, we'd use RDF canonicalization (URDNA2015).
    const message = new TextEncoder().encode(JSON.stringify(unsignedVC))
    const signature = sign(message, issuerKey.privateKey)

    // 4. Attach Proof
    const proof = {
        type: 'Ed25519Signature2020',
        created: issuanceDate,
        verificationMethod: `${issuerKey.did}#${issuerKey.did.split(':').pop()}`,
        proofPurpose: 'assertionMethod',
        jws: encodeBase64(signature) // Simplified JWS format
    }

    const signedVC = {
        ...unsignedVC,
        proof
    }

    return signedVC
}
