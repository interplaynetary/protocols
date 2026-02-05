
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { generateKeyPair, issueGenericVC } from "../implementation/vc";
import { processVCsToNodes, aggregateCapacityFromVCs } from "../implementation/vc-bridge";
import { aggregateUp, Extractors, Reducers, Graph } from "../implementation/aggregation";

describe("VC Bridge & Generic Aggregation", () => {
    it("Aggregates Capacity from Parent Groups defined by VCs", async () => {
        // 1. Setup Keys
        const issuerKey = await generateKeyPair();

        // 2. Create VCs

        // VC 1: Group A has Capacity 100
        const groupVC = await issueGenericVC(issuerKey, {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "id": "urn:uuid:vc-1",
            "type": ["VerifiableCredential"],
            "issuer": issuerKey.controller,
            "issuanceDate": new Date().toISOString(),
            "credentialSubject": {
                "id": "urn:group:A",
                "potential": {
                    "type": "LaborCapacity",
                    "magnitude": 100
                }
            }
        });

        // VC 2: Alice is a member of Group A
        const aliceVC = await issueGenericVC(issuerKey, {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "id": "urn:uuid:vc-2",
            "type": ["VerifiableCredential"],
            "issuer": issuerKey.controller,
            "issuanceDate": new Date().toISOString(),
            "credentialSubject": {
                "id": "urn:user:Alice",
                "potential": {
                    "type": "Membership",
                    "magnitude": 0,
                    "memberOf": ["urn:group:A"]
                }
            }
        });

        // 3. Process via Bridge
        const vcs = [groupVC, aliceVC];
        const nodes = await processVCsToNodes(vcs);

        // Verify verification worked
        expect(nodes.length).toBe(2);

        // 4. Manual Verification of Graph Structure
        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        const alice = nodeMap.get("urn:user:Alice");
        const group = nodeMap.get("urn:group:A");

        expect(alice).toBeDefined();
        expect(group).toBeDefined();
        expect(alice?.memberOf?.has("urn:group:A")).toBe(true);

        // 5. Run Generic Aggregation (Upward)
        const totalCapacity = aggregateUp(
            alice!,
            (id) => nodeMap.get(id), // Lookup function
            Extractors.relations("memberOf"), // Topology
            Extractors.potentialsByType("LaborCapacity"), // Extractor returns number[]
            // Reducer must handle (acc: number, val: number[])
            (acc, magnitudes) => acc + magnitudes.reduce((a, b) => a + b, 0),
            0 // Initial
        );

        expect(totalCapacity).toBe(100);
    });

    it("Convenience Function test", async () => {
        const issuerKey = await generateKeyPair();

        const groupVC = await issueGenericVC(issuerKey, {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "id": "urn:group:B",
                "potential": { "type": "Physics", "magnitude": 50 }
            }
        });

        const userVC = await issueGenericVC(issuerKey, {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "id": "urn:user:Bob",
                "potential": { "type": "Membership", "magnitude": 0, "memberOf": ["urn:group:B"] }
            }
        });

        const result = await aggregateCapacityFromVCs(
            [groupVC, userVC],
            "Physics",
            "urn:user:Bob"
        );

        expect(result).toBe(50);
    });

    it("Unified Validation: Issues and Aggregates using Shared Schema", async () => {
        const issuerKey = await generateKeyPair();

        // 1. Define Shared Schema (e.g. imported from definitions)
        const BudgetSchema = z.object({
            departmentBudget: z.number().min(0)
        });

        // 2. Issue VC with Validation (Write Side)
        // This would THROW if we tried to issue a negative budget
        const groupVC = await issueGenericVC(issuerKey, {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "id": "urn:group:Devs",
                "memberOf": ["urn:dept:Engineering"],
                "departmentBudget": 1000
            }
        }, BudgetSchema); // <--- Validates here!

        // 3. Aggregate with Validation (Read Side)
        const nodes = await processVCsToNodes([groupVC]);
        const graph = new Graph(nodes);

        const totalBudget = graph.from("urn:group:Devs").aggregateUp(
            "memberOf",
            (n) => Extractors.schema(BudgetSchema)(n)?.departmentBudget, // <--- Validates AND extracts field
            Reducers.sum,
            0
        );

        // Since node has no parents in this test, it returns initial (0).
        // Let's make it aggregate from self or add a child to verify flow?
        // Actually, aggregateUp aggregates FROM PARENTS.
        // So we need a child.
    });

    it("Unified Flow: Child aggregates budget from Parent", async () => {
        const issuerKey = await generateKeyPair();
        const BudgetSchema = z.object({ departmentBudget: z.number().min(0) });

        const parentVC = await issueGenericVC(issuerKey, {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "id": "urn:parent",
                "departmentBudget": 5000
            }
        }, BudgetSchema);

        const childVC = await issueGenericVC(issuerKey, {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "id": "urn:child",
                "memberOf": ["urn:parent"]
            }
        }); // No schema needed for simple membership

        const nodes = await processVCsToNodes([parentVC, childVC]);
        const graph = new Graph(nodes);

        const result = graph.from("urn:child").aggregateUp(
            "memberOf",
            (n) => Extractors.schema(BudgetSchema)(n)?.departmentBudget,
            Reducers.sum,
            0
        );

        const value = result;

        expect(value).toBe(5000);
    });

    it("Resolution Strategy: Per-Observer LWW and Multi-Observer Merge", async () => {
        const issuerA = await generateKeyPair();
        const issuerB = await generateKeyPair();

        // 1. Issuer A says: Subject has Budget 100 (Time 1)
        const vcA1 = await issueGenericVC(issuerA, {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential"],
            "issuanceDate": "2024-01-01T00:00:00Z",
            "credentialSubject": { "id": "urn:subject", "budget": 100, "memberOf": ["urn:group:A1"] }
        });

        // 2. Issuer A says: Subject has Budget 200 (Time 2) - Should Overwrite A1
        const vcA2 = await issueGenericVC(issuerA, {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential"],
            "issuanceDate": "2024-01-02T00:00:00Z",
            "credentialSubject": { "id": "urn:subject", "budget": 200, "memberOf": ["urn:group:A2"] }
        });

        // 3. Issuer B says: Subject is member of Group B - Should Merge with A2
        const vcB = await issueGenericVC(issuerB, {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential"],
            "issuanceDate": "2024-01-02T00:00:00Z",
            "credentialSubject": { "id": "urn:subject", "memberOf": ["urn:group:B"] }
        });

        // Process all 3 VCs
        // Expected: A1 is discarded (stale). A2 and B are merged.
        const nodes = await processVCsToNodes([vcA1, vcA2, vcB]);
        const subject = nodes.find(n => n.id === "urn:subject");

        expect(subject).toBeDefined();

        // Check LWW (A2 over A1)
        expect(subject?.budget).toBe(200);

        // Check Merge (A2 + B)
        // memberOf should contain BOTH A2's claim and B's claim
        const members = Extractors.relations("memberOf")(subject!);
        expect(members?.has("urn:group:A1")).toBe(false); // Discarded A1
        expect(members?.has("urn:group:A2")).toBe(true);  // Kept A2
        expect(members?.has("urn:group:B")).toBe(true);   // Kept B
    });
});
