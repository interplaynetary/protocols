import { describe, it, expect } from 'vitest'
import { generateKeypair } from '../../identity/keys'
import { delegateCapability, verifyUcan } from '../delegation'

describe('Credentials - UCAN', () => {
    it('should issue and verify a UCAN', async () => {
        const issuer = await generateKeypair()
        const audience = await generateKeypair()

        const caps = [
            {
                with: "playnet://drive/files",
                can: "fs/READ"
            }
        ]

        const ucan = await delegateCapability(issuer, audience.did, caps)

        expect(ucan.payload.iss).toBe(issuer.did)
        expect(ucan.payload.aud).toBe(audience.did)

        // Manual implementation returns `encoded` property
        const result = await verifyUcan(ucan.encoded)

        expect(result.ok).toBe(true)
    })

    it('should reject verified but expired UCAN', async () => {
        const issuer = await generateKeypair()
        const audience = await generateKeypair()
        const caps = [{ with: "resource", can: "action" }]

        // Expired 10 seconds ago
        const ucan = await delegateCapability(issuer, audience.did, caps, -10)

        const result = await verifyUcan(ucan.encoded)
        expect(result.ok).toBe(false)
        expect(result.error).toContain('Expired')
    })
})
