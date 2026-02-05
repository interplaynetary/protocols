import { describe, it, expect } from 'vitest'
import { generateKeypair } from '../identity/keys'
import { wrapKey, unwrapKey, generateMasterKey } from '../storage/encryption'
import nacl from 'tweetnacl'

describe('Integration: Identity <-> Storage', () => {
    it('should allow User A to share a key with User B using Identity Keys', async () => {
        // 1. Identify User A and User B
        const alice = await generateKeypair()
        const bob = await generateKeypair()

        // 2. Alice has a master key she wants to share
        const masterKey = generateMasterKey()

        // 3. Alice wraps the key for Bob
        // Correctly using Bob's encryptionPublicKey (Curve25519)
        const wrappedForBob = wrapKey(masterKey, bob.encryptionPublicKey)

        // 4. Bob receives wrapped key and unwraps it
        // Correctly using Bob's encryptionPrivateKey (Curve25519)
        try {
            const unwrapped = unwrapKey(wrappedForBob, bob.encryptionPrivateKey)
            expect(unwrapped).toEqual(masterKey)
        } catch (e: any) {
            throw new Error("Key integration failed: " + e.message)
        }
    })
})
