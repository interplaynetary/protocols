import { describe, it, expect, beforeEach } from 'vitest'
import {
    generateKeypair,
    deriveRootDID,
    sign,
    verify,
    exportKeypair,
    importKeypair,
    type Keypair
} from '../keys'

describe('Identity - Keys', () => {
    let keypair: Keypair

    beforeEach(async () => {
        keypair = await generateKeypair()
    })

    describe('generateKeypair', () => {
        it('should generate a valid keypair', async () => {
            const kp = await generateKeypair()

            expect(kp.privateKey).toBeInstanceOf(Uint8Array)
            expect(kp.publicKey).toBeInstanceOf(Uint8Array)
            expect(kp.did).toMatch(/^did:key:/)
            expect(kp.privateKey.length).toBeGreaterThan(0)
            expect(kp.publicKey.length).toBe(32) // Ed25519 public key is 32 bytes
        })

        it('should generate different keypairs each time', async () => {
            const kp1 = await generateKeypair()
            const kp2 = await generateKeypair()

            expect(kp1.did).not.toBe(kp2.did)
            expect(kp1.privateKey).not.toEqual(kp2.privateKey)
        })
    })

    describe('deriveRootDID', () => {
        it('should derive consistent DID from public key', () => {
            const did1 = deriveRootDID(keypair.publicKey)
            const did2 = deriveRootDID(keypair.publicKey)

            expect(did1).toBe(did2)
            expect(did1).toBe(keypair.did)
        })

        it('should generate did:key format', () => {
            const did = deriveRootDID(keypair.publicKey)
            expect(did).toMatch(/^did:key:z[1-9A-HJ-NP-Za-km-z]+$/)
        })
    })

    describe('sign and verify', () => {
        it('should sign and verify a message', () => {
            const message = new TextEncoder().encode('Hello, Foundation!')
            const signature = sign(message, keypair.privateKey)

            expect(signature).toBeInstanceOf(Uint8Array)
            expect(signature.length).toBe(64) // Ed25519 signature is 64 bytes

            const isValid = verify(message, signature, keypair.publicKey)
            expect(isValid).toBe(true)
        })

        it('should fail verification with wrong message', () => {
            const message = new TextEncoder().encode('Hello!')
            const wrongMessage = new TextEncoder().encode('Goodbye!')
            const signature = sign(message, keypair.privateKey)

            const isValid = verify(wrongMessage, signature, keypair.publicKey)
            expect(isValid).toBe(false)
        })

        it('should fail verification with wrong public key', async () => {
            const message = new TextEncoder().encode('Hello!')
            const signature = sign(message, keypair.privateKey)

            const otherKeypair = await generateKeypair()
            const isValid = verify(message, signature, otherKeypair.publicKey)
            expect(isValid).toBe(false)
        })
    })

    describe('exportKeypair and importKeypair', () => {
        const passphrase = 'super-secret-passphrase'

        it('should export and import keypair with passphrase', async () => {
            const encrypted = await exportKeypair(keypair, passphrase)

            expect(encrypted.ciphertext).toBeTruthy()
            expect(encrypted.nonce).toBeTruthy()
            expect(encrypted.salt).toBeTruthy()

            const imported = await importKeypair(encrypted, passphrase)

            expect(imported.did).toBe(keypair.did)
            expect(imported.publicKey).toEqual(new Uint8Array(keypair.publicKey))
            expect(imported.privateKey).toEqual(new Uint8Array(keypair.privateKey))
        })

        it('should fail import with wrong passphrase', async () => {
            const encrypted = await exportKeypair(keypair, passphrase)

            await expect(
                importKeypair(encrypted, 'wrong-passphrase')
            ).rejects.toThrow('invalid passphrase')
        })

        it('should create different ciphertext each time (random nonce)', async () => {
            const encrypted1 = await exportKeypair(keypair, passphrase)
            const encrypted2 = await exportKeypair(keypair, passphrase)

            expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext)
            expect(encrypted1.nonce).not.toBe(encrypted2.nonce)

            // But both should decrypt to same key
            const imported1 = await importKeypair(encrypted1, passphrase)
            const imported2 = await importKeypair(encrypted2, passphrase)

            expect(imported1.did).toBe(imported2.did)
        })

        it('should roundtrip sign/verify after export/import', async () => {
            const message = new TextEncoder().encode('Test message')
            const signature = sign(message, keypair.privateKey)

            const encrypted = await exportKeypair(keypair, passphrase)
            const imported = await importKeypair(encrypted, passphrase)

            const isValid = verify(message, signature, imported.publicKey)
            expect(isValid).toBe(true)

            const newSignature = sign(message, imported.privateKey)
            const isNewValid = verify(message, newSignature, keypair.publicKey)
            expect(isNewValid).toBe(true)
        })
    })
})
