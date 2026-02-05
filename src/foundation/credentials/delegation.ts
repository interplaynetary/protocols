import { Keypair, sign, verify, decodeBase58 } from '../identity/keys'
import naclUtil from 'tweetnacl-util'
const { encodeBase64, decodeBase64 } = naclUtil

// ═══════════════════════════════════════════════════════════════════════
// LIGHTWEIGHT UCAN IMPLEMENTATION (v0.10.0 subset)
// ═══════════════════════════════════════════════════════════════════════

export interface Capability {
    with: string
    can: string
}

export interface UcanPayload {
    iss: string
    aud: string
    exp: number
    nbf?: number
    att: Capability[]
    prf?: string[] // nested encoded UCANs
    fct?: any[]
}

export interface UcanHeader {
    alg: string
    typ: string
    ucv: string
}

export interface Ucan {
    header: UcanHeader
    payload: UcanPayload
    signature: string
    encoded: string
}

function base64UrlEncode(str: string): string {
    return Buffer.from(str).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

function base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/')
    while (str.length % 4) str += '='
    return Buffer.from(str, 'base64').toString()
}

/**
 * Delegate capabilities (Issue UCAN)
 */
export async function delegateCapability(
    issuer: Keypair,
    audienceDID: string,
    capabilities: Capability[],
    expirationSeconds: number = 3600,
    proofs: string[] = []
): Promise<Ucan> {
    const header: UcanHeader = {
        alg: 'EdDSA',
        typ: 'JWT',
        ucv: '0.10.0'
    }

    const now = Math.floor(Date.now() / 1000)
    const payload: UcanPayload = {
        iss: issuer.did,
        aud: audienceDID,
        exp: now + expirationSeconds,
        att: capabilities,
        prf: proofs
    }

    const encodedHeader = base64UrlEncode(JSON.stringify(header))
    const encodedPayload = base64UrlEncode(JSON.stringify(payload))
    const dataToSign = `${encodedHeader}.${encodedPayload}`

    const signatureBytes = sign(new TextEncoder().encode(dataToSign), issuer.privateKey)
    // UCAN uses standard Base64Url for signature? Spec says Raw Base64Url
    const signature = Buffer.from(signatureBytes).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

    const encoded = `${dataToSign}.${signature}`

    return {
        header,
        payload,
        signature,
        encoded
    }
}

/**
 * Verify a UCAN
 */
export async function verifyUcan(
    encodedUcan: string,
    _audiences: string[] = [] // Optional Audience check
): Promise<{ ok: boolean, error?: string }> {
    try {
        const parts = encodedUcan.split('.')
        if (parts.length !== 3) return { ok: false, error: 'Invalid token format' }

        const [encodedHeader, encodedPayload, signature] = parts

        // 1. Decode Header & Payload
        const header = JSON.parse(base64UrlDecode(encodedHeader))
        const payload = JSON.parse(base64UrlDecode(encodedPayload))

        if (header.alg !== 'EdDSA') return { ok: false, error: 'Unsupported algorithm' }

        // 2. Check Expiration
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp < now) return { ok: false, error: 'Expired' }

        // 3. Verify Signature
        const dataToVerify = `${encodedHeader}.${encodedPayload}`
        const message = new TextEncoder().encode(dataToVerify)

        // Decode signature from Base64Url
        let sigStr = signature.replace(/-/g, '+').replace(/_/g, '/')
        while (sigStr.length % 4) sigStr += '='
        const signatureBytes = new Uint8Array(Buffer.from(sigStr, 'base64'))

        // Extract public key from Issuer DID
        const issDID = payload.iss
        if (!issDID.startsWith('did:key:z')) return { ok: false, error: 'Unsupported DID format' }

        // Extract Ed25519 key (skip multicodec prefix)
        const keyBytes = decodeBase58(issDID.slice(9))
        if (keyBytes[0] !== 0xed || keyBytes[1] !== 0x01) {
            return { ok: false, error: 'Not an Ed25519 key' }
        }
        const publicKey = keyBytes.slice(2)

        const valid = verify(message, signatureBytes, publicKey)

        return { ok: valid, error: valid ? undefined : 'Invalid signature' }

    } catch (e: any) {
        return { ok: false, error: e.message }
    }
}
