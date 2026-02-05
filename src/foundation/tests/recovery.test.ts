import { describe, it, expect } from 'vitest'
import { generateKeypair } from '../identity/keys'
import { createBackup, restoreOne } from '../recovery'

describe('Recovery & Backup', () => {
    it('should create a backup and restore from it', async () => {
        const original = await generateKeypair()
        const passphrase = 'correct-horse-battery-staple'

        // 1. Create Backup
        const backup = await createBackup(original, passphrase)

        expect(backup.version).toBe('1.0.0')
        expect(backup.identity).toBeDefined()
        expect(backup.identity.ciphertext).toBeDefined()

        // 2. Restore
        const restored = await restoreOne(backup, passphrase)

        // Check if restored keys match original (using hex strings for easy comparison)
        const origKey = Buffer.from(original.privateKey).toString('hex')
        const restKey = Buffer.from(restored.privateKey).toString('hex')

        expect(restKey).toBe(origKey)
        expect(restored.did).toBe(original.did)
    })

    it('should fail restoration with wrong passphrase', async () => {
        const original = await generateKeypair()
        const backup = await createBackup(original, 'password123')

        await expect(restoreOne(backup, 'wrongpassword')).rejects.toThrow()
    })
})
