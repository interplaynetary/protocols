import { describe, it, expect } from 'vitest'
import { generateKeypair } from '../../identity/keys'
import { issueCredential } from '../issuance'
import { verifyCredential } from '../verification'

describe('Credentials - VC', () => {
    it('should issue and verify a credential', async () => {
        const issuer = await generateKeypair()
        const subject = {
            id: 'did:example:123',
            degree: {
                type: 'BachelorDegree',
                date: '2023-01-01'
            }
        }

        // Issue
        const vc = await issueCredential(issuer, subject)

        expect(vc.issuer).toEqual({ id: issuer.did })
        expect(vc.credentialSubject).toEqual(subject)
        expect(vc.proof).toBeDefined()

        // Verify
        const result = await verifyCredential(vc)
        expect(result.verified).toBe(true)
        expect(result.errors).toHaveLength(0)
    })

    it('should reject a tampered credential', async () => {
        const issuer = await generateKeypair()
        const subject = { foo: 'bar' }

        const vc = await issueCredential(issuer, subject)

        // Tamper with the subject
        const tamperedVC = {
            ...vc,
            credentialSubject: { foo: 'baz' }
        }

        const result = await verifyCredential(tamperedVC)
        expect(result.verified).toBe(false)
        expect(result.errors).toContain('Invalid signature')
    })

    it('should reject an expired credential', async () => {
        const issuer = await generateKeypair()
        const subject = { foo: 'bar' }

        // Issue with past expiration date
        const pastDate = new Date(Date.now() - 10000).toISOString()
        const vc = await issueCredential(issuer, subject, ['VerifiableCredential'], pastDate)

        const result = await verifyCredential(vc)
        expect(result.verified).toBe(false)
        expect(result.errors).toContain('Credential expired')
    })
})
