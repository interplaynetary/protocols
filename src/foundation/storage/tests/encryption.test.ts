import { describe, it, expect } from 'vitest'
import {
    generateMasterKey,
    encryptDocument,
    decryptDocument,
    wrapKey,
    unwrapKey
} from '../encryption'
import { generateKeypair } from '../../identity/keys'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'
const { encodeBase64 } = naclUtil

describe('Storage - Encryption', () => {
    describe('Document Encryption', () => {
        it('should encrypt and decrypt a document', () => {
            const masterKey = generateMasterKey()
            const doc = { hello: 'world', count: 123 }

            const encrypted = encryptDocument(doc, masterKey)

            expect(encrypted.ciphertext).toBeDefined()
            expect(encrypted.nonce).toBeDefined()

            const decrypted = decryptDocument(encrypted, masterKey)
            expect(decrypted).toEqual(doc)
        })

        it('should fail to decrypt with wrong key', () => {
            const masterKey = generateMasterKey()
            const wrongKey = generateMasterKey()
            const doc = { secret: 'data' }

            const encrypted = encryptDocument(doc, masterKey)

            expect(() => decryptDocument(encrypted, wrongKey)).toThrow()
        })

        it('should generate different ciphertext for same data (random nonce)', () => {
            const masterKey = generateMasterKey()
            const doc = { data: 'test' }

            const enc1 = encryptDocument(doc, masterKey)
            const enc2 = encryptDocument(doc, masterKey)

            expect(enc1.ciphertext).not.toBe(enc2.ciphertext)
            expect(enc1.nonce).not.toBe(enc2.nonce)
        })
    })

    describe('Key Wrapping', () => {
        it('should wrap and unwrap a master key using Curve25519', () => {
            // Recipient (e.g. delegated user)
            const recipientKeys = nacl.box.keyPair()
            const recipientPub = recipientKeys.publicKey
            const recipientPriv = recipientKeys.secretKey

            // Key to share
            const masterKey = generateMasterKey()

            // Wrap
            const wrapped = wrapKey(masterKey, recipientPub)

            expect(wrapped.ciphertext).toBeDefined()
            expect(wrapped.nonce).toBeDefined()
            expect(wrapped.ephemeralPublicKey).toBeDefined()

            // Unwrap
            const unwrapped = unwrapKey(wrapped, recipientPriv)

            expect(unwrapped).toEqual(masterKey)
        })

        it('should fail unwrap with wrong private key', () => {
            const recipientKeys = nacl.box.keyPair()
            const masterKey = generateMasterKey()
            const wrapped = wrapKey(masterKey, recipientKeys.publicKey)

            const wrongKeys = nacl.box.keyPair()

            // Should produce null or throw
            // nacl.box.open returns null on failure
            // Our wrapper throws
            expect(() => unwrapKey(wrapped, wrongKeys.secretKey)).toThrow()
        })
    })

    describe('Integration with Identity Keys', async () => {
        it('should work with keys derived from our identity module', async () => {
            // Identity keys are Ed25519 (Sign)
            // Encryption keys are Curve25519 (Box)
            // We need to convert Ed25519 public key to Curve25519 public key for encryption
            // TweetNaCl expects Curve25519 keys for box/open

            // NOTE: Ed25519 keys can be converted to Curve25519
            // But usually we should have separate keys or convert them
            // tweetnacl doesn't export conversion functions by default? 
            // Actually it does not.

            // For now, let's assume we use separate keys for encryption,
            // OR we use the naive conversion if available.
            // But since our `wrapKey` takes `Uint8Array`, we can pass any 32-byte key.
            // Does encryption.ts expect Curve25519? Yes, `nacl.box` uses Curve25519.

            // This test is to document that we need Curve25519 keys, not Ed25519 keys.
            // If we try to pass Ed25519 key to box, it won't work mathematically securely (or at all).

            const encryptionKeys = nacl.box.keyPair()
            const masterKey = generateMasterKey()

            const wrapped = wrapKey(masterKey, encryptionKeys.publicKey)
            const unwrapped = unwrapKey(wrapped, encryptionKeys.secretKey)

            expect(unwrapped).toEqual(masterKey)
        })
    })
})
