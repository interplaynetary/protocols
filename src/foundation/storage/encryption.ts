import nacl from 'tweetnacl'
// tweetnacl-util is CommonJS
import naclUtil from 'tweetnacl-util'
const { encodeBase64, decodeBase64 } = naclUtil

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface EncryptedDocument {
    ciphertext: string
    nonce: string
    // Optional key ID if using multiple keys
    kid?: string
}

export interface WrappedKey {
    ciphertext: string
    nonce: string
    ephemeralPublicKey: string
}

/**
 * Generate a random 32-byte master key for AES-like encryption (XSalsa20)
 */
export function generateMasterKey(): Uint8Array {
    return nacl.randomBytes(32)
}

// ═══════════════════════════════════════════════════════════════════════
// DOCUMENT ENCRYPTION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Encrypt a document/object using a master key
 */
export function encryptDocument<T>(
    doc: T,
    masterKey: Uint8Array
): EncryptedDocument {
    const json = JSON.stringify(doc)
    const message = new TextEncoder().encode(json)
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)

    const ciphertext = nacl.secretbox(message, nonce, masterKey)

    return {
        ciphertext: encodeBase64(ciphertext),
        nonce: encodeBase64(nonce)
    }
}

/**
 * Decrypt a document using a master key
 */
export function decryptDocument<T>(
    encrypted: EncryptedDocument,
    masterKey: Uint8Array
): T {
    const ciphertext = decodeBase64(encrypted.ciphertext)
    const nonce = decodeBase64(encrypted.nonce)

    const message = nacl.secretbox.open(ciphertext, nonce, masterKey)

    if (!message) {
        throw new Error('Failed to decrypt document')
    }

    const json = new TextDecoder().decode(message)
    return JSON.parse(json)
}

// ═══════════════════════════════════════════════════════════════════════
// KEY WRAPPING (for delegation)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Wrap (encrypt) a master key for a specific recipient
 * Uses ephemeral-static Diffie-Hellman (Authenticated Encryption with ephemeral key)
 */
export function wrapKey(
    masterKey: Uint8Array,
    recipientPublicKey: Uint8Array
): WrappedKey {
    // 1. Generate ephemeral keypair
    const ephemeral = nacl.box.keyPair()

    // 2. Generate nonce
    const nonce = nacl.randomBytes(nacl.box.nonceLength)

    // 3. Encrypt master key
    const ciphertext = nacl.box(
        masterKey,
        nonce,
        recipientPublicKey,
        ephemeral.secretKey
    )

    return {
        ciphertext: encodeBase64(ciphertext),
        nonce: encodeBase64(nonce),
        ephemeralPublicKey: encodeBase64(ephemeral.publicKey)
    }
}

/**
 * Unwrap (decrypt) a master key
 */
export function unwrapKey(
    wrapped: WrappedKey,
    recipientPrivateKey: Uint8Array
): Uint8Array {
    const ciphertext = decodeBase64(wrapped.ciphertext)
    const nonce = decodeBase64(wrapped.nonce)
    const ephemeralPub = decodeBase64(wrapped.ephemeralPublicKey)

    const masterKey = nacl.box.open(
        ciphertext,
        nonce,
        ephemeralPub,
        recipientPrivateKey
    )

    if (!masterKey) {
        throw new Error('Failed to unwrap key')
    }

    return masterKey
}
