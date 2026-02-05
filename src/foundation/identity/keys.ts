import * as Signer from '@ucanto/principal/ed25519'
import nacl from 'tweetnacl'
// tweetnacl-util is CommonJS
import naclUtil from 'tweetnacl-util'
const { encodeBase64, decodeBase64 } = naclUtil

// ═══════════════════════════════════════════════════════════════════════
// KEY MANAGEMENT  
// ═══════════════════════════════════════════════════════════════════════

/**
 * Keypair structure
 * Note: privateKey will be the 32-byte seed for compatibility
 */
export interface Keypair {
    privateKey: Uint8Array
    publicKey: Uint8Array
    did: string
    // Encryption keys (Curve25519)
    encryptionPrivateKey: Uint8Array
    encryptionPublicKey: Uint8Array
}

/**
 * Ensure value is a Uint8Array (handles ucanto archive format)
 */
function toUint8Array(value: any): Uint8Array {
    if (value instanceof Uint8Array) {
        return value
    }

    if (value && typeof value === 'object') {
        // Handle TypedArray views
        if (value.buffer instanceof ArrayBuffer) {
            return new Uint8Array(value.buffer, value.byteOffset || 0, value.byteLength || value.length)
        }

        // Handle plain objects with numeric keys { "0": 10, "1": 20 }
        // These might not have a length property
        const keys = Object.keys(value)
        if (keys.length > 0 && keys.every(k => !isNaN(parseInt(k)))) {
            const length = keys.length
            const arr = new Uint8Array(length)
            for (let i = 0; i < length; i++) {
                arr[i] = value[i]
            }
            return arr
        }

        // Handle array-like with length
        if ('length' in value && typeof value.length === 'number') {
            return new Uint8Array(Array.from(value))
        }
    }

    throw new Error(`Cannot convert to Uint8Array: ${typeof value} ${value?.constructor?.name}`)
}

/**
 * Generate a new Ed25519 keypair and Curve25519 keypair from the same seed
 */
export async function generateKeypair(): Promise<Keypair> {
    const signer = await Signer.generate()
    const did = signer.did()
    const archive = signer.toArchive()

    // 1. Extract Signing Key (Ed25519)
    // Extract private key from archive keys object
    const privateKeyFull = toUint8Array(archive.keys[did])

    // Bytes 2-34: 32-byte Seed
    const seed = privateKeyFull.slice(2, 34)

    // Public key (verifier) is prefix (2 bytes) + 32 bytes key
    const publicKeyFull = toUint8Array(signer.verifier)
    const publicKey = publicKeyFull.slice(2) // 32 bytes

    // 2. Generate Encryption Key (Curve25519 / X25519)
    // We reuse the exact same 32-byte seed.
    // This creates a deterministic, distinct keypair for encryption.
    const encryptionKeypair = nacl.box.keyPair.fromSecretKey(seed)

    return {
        privateKey: seed,
        publicKey: publicKey,
        did: did,
        encryptionPrivateKey: encryptionKeypair.secretKey,
        encryptionPublicKey: encryptionKeypair.publicKey
    }
}

/**
 * Recover a keypair from a known 32-byte seed
 */
export async function recoverKeypair(seed: Uint8Array): Promise<Keypair> {
    const signer = await Signer.generate() // Dummy generation just to get types, we won't use it

    // 1. Generate Signing Key from Seed
    const keypair = nacl.sign.keyPair.fromSeed(seed)
    const publicKey = keypair.publicKey
    const did = deriveRootDID(publicKey)

    // 2. Generate Encryption Key from Seed
    const encryptionKeypair = nacl.box.keyPair.fromSecretKey(seed)

    return {
        privateKey: seed,
        publicKey: publicKey,
        did: did,
        encryptionPrivateKey: encryptionKeypair.secretKey,
        encryptionPublicKey: encryptionKeypair.publicKey
    }
}

/**
 * Derive DID from public key
 */
export function deriveRootDID(publicKeyRaw: Uint8Array): string {
    // Add Ed25519 public key multicodec prefix (0xed, 0x01)
    const multicodec = new Uint8Array([0xed, 0x01])
    const combined = new Uint8Array(multicodec.length + publicKeyRaw.length)
    combined.set(multicodec)
    combined.set(publicKeyRaw, multicodec.length)

    const base58 = encodeBase58(combined)
    return `did:key:z${base58}`
}

export function encodeBase58(bytes: Uint8Array): string {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    let num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''))

    if (num === 0n) return ALPHABET[0]

    let result = ''
    while (num > 0n) {
        result = ALPHABET[Number(num % 58n)] + result
        num = num / 58n
    }

    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
        result = ALPHABET[0] + result
    }

    return result
}

export function decodeBase58(str: string): Uint8Array {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    const base = BigInt(58)
    let num = BigInt(0)

    for (const char of str) {
        const index = ALPHABET.indexOf(char)
        if (index === -1) throw new Error(`Invalid Base58 character: ${char}`)
        num = num * base + BigInt(index)
    }

    let hex = num.toString(16)
    if (hex.length % 2 !== 0) hex = '0' + hex

    // Add leading zeros
    let leadingZeros = 0
    for (const char of str) {
        if (char === ALPHABET[0]) leadingZeros++
        else break
    }

    const bytes = new Uint8Array(hex.length / 2 + leadingZeros)
    for (let i = 0; i < leadingZeros; i++) bytes[i] = 0
    for (let i = 0; i < hex.length; i += 2) {
        bytes[leadingZeros + i / 2] = parseInt(hex.slice(i, i + 2), 16)
    }

    return bytes
}

/**
 * Sign a message with private key
 */
export function sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array {
    const key = toUint8Array(privateKey)

    // Using 32-byte seed
    if (key.length === 32) {
        const keypair = nacl.sign.keyPair.fromSeed(key)
        return nacl.sign.detached(message, keypair.secretKey)
    }

    // Using 64-byte secret key
    if (key.length === 64) {
        return nacl.sign.detached(message, key)
    }

    throw new Error(`Invalid private key length: ${key.length}. Expected 32 (seed) or 64 (secret key)`)
}

/**
 * Verify a signature
 */
export function verify(
    message: Uint8Array,
    signature: Uint8Array,
    publicKey: Uint8Array
): boolean {
    return nacl.sign.detached.verify(message, signature, toUint8Array(publicKey))
}

// ═══════════════════════════════════════════════════════════════════════
// SECURE STORAGE
// ═══════════════════════════════════════════════════════════════════════

export interface EncryptedKeypair {
    ciphertext: string
    nonce: string
    salt: string
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<Uint8Array> {
    const encoder = new TextEncoder()
    const passphraseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        'PBKDF2',
        false,
        ['deriveBits']
    )

    const bits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        passphraseKey,
        256
    )

    return new Uint8Array(bits)
}

export async function exportKeypair(
    keypair: Keypair,
    passphrase: string
): Promise<EncryptedKeypair> {
    const salt = nacl.randomBytes(32)
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
    const key = await deriveKey(passphrase, salt)

    const privateKey = toUint8Array(keypair.privateKey)
    const ciphertext = nacl.secretbox(privateKey, nonce, key)

    return {
        ciphertext: encodeBase64(ciphertext),
        nonce: encodeBase64(nonce),
        salt: encodeBase64(salt)
    }
}

export async function importKeypair(
    encrypted: EncryptedKeypair,
    passphrase: string
): Promise<Keypair> {
    const ciphertext = decodeBase64(encrypted.ciphertext)
    const nonce = decodeBase64(encrypted.nonce)
    const salt = decodeBase64(encrypted.salt)
    const key = await deriveKey(passphrase, salt)

    const privateKeySeed = nacl.secretbox.open(ciphertext, nonce, key)

    if (!privateKeySeed) {
        throw new Error('Failed to decrypt keypair: invalid passphrase')
    }

    // Reconstruct keys from seed
    const kp = nacl.sign.keyPair.fromSeed(privateKeySeed)
    const publicKey = kp.publicKey
    const did = deriveRootDID(publicKey)

    // Reconstruct encryption keys
    const encryptionKp = nacl.box.keyPair.fromSecretKey(privateKeySeed)

    return {
        privateKey: privateKeySeed,
        publicKey: publicKey,
        did: did,
        encryptionPrivateKey: encryptionKp.secretKey,
        encryptionPublicKey: encryptionKp.publicKey
    }
}

// ═══════════════════════════════════════════════════════════════════════
// INDEXEDDB STORAGE
// ═══════════════════════════════════════════════════════════════════════

const DB_NAME = 'foundation-identity'
const DB_VERSION = 1
const STORE_NAME = 'keypairs'

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        }
    })
}

export async function storeKeypair(name: string, encrypted: EncryptedKeypair): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.put(encrypted, name)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
        tx.oncomplete = () => db.close()
    })
}

export async function retrieveKeypair(name: string): Promise<EncryptedKeypair | null> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const request = store.get(name)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result || null)
        tx.oncomplete = () => db.close()
    })
}

export async function deleteKeypair(name: string): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.delete(name)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
        tx.oncomplete = () => db.close()
    })
}

export async function listKeypairs(): Promise<string[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const request = store.getAllKeys()
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result as string[])
        tx.oncomplete = () => db.close()
    })
}
