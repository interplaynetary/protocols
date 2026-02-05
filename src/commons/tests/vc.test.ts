
import { describe, it, expect } from "vitest";
import { generateKeyPair, issueGenericVC, verifyGenericVC } from "../implementation/vc";

describe("Generic Verifiable Credentials (Tutorial Example)", () => {

    const sampleUnsignedCredential = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "id": "https://example.com/credentials/1872",
        "type": ["VerifiableCredential", "AlumniCredential"],
        "issuer": "https://example.edu/issuers/565049", // Will be overridden or must match key
        "issuanceDate": "2010-01-01T19:23:24Z",
        "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "alumniOf": "Example University"
        }
    };

    it("Issues and Verifies an Alumni Credential", async () => {
        // 1. Generate Key
        const keyPair = await generateKeyPair();
        expect(keyPair).toBeDefined();

        // 2. Prepare Credential (override issuer to match our random key for this test)
        // In the tutorial, the key usually matches the issuer. 
        // We set issuer to the key's controller ID (or key ID base) for verification to work easily.
        const credentialToSign = {
            ...sampleUnsignedCredential,
            issuer: keyPair.controller || keyPair.id
        };

        // 3. Issue
        const signedVC = await issueGenericVC(keyPair, credentialToSign);

        expect(signedVC.proof).toBeDefined();
        expect(signedVC.credentialSubject.alumniOf).toBe("Example University");

        // 4. Verify
        const result = await verifyGenericVC(signedVC);
        if (!result.verified) console.error("Verification failed:", result.error);
        expect(result.verified).toBe(true);
    });

    it("Tamper Detection", async () => {
        const keyPair = await generateKeyPair();
        const credentialToSign = {
            ...sampleUnsignedCredential,
            issuer: keyPair.controller || keyPair.id
        };

        const signedVC = await issueGenericVC(keyPair, credentialToSign);

        // Tamper
        const tamperedVC = JSON.parse(JSON.stringify(signedVC));
        tamperedVC.credentialSubject.alumniOf = "Fake University";

        const result = await verifyGenericVC(tamperedVC);
        expect(result.verified).toBe(false);
    });
});
