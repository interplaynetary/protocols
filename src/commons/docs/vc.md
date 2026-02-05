# The Observer-Claim-Effect Model (Verifiable Credentials)

## 1. Core Ontology

The system consists of **Observers** making **Claims** about **Entities**, **Attributes**, and **Values**.

### The Mechanism
1.  **Observer**: An agent (Person, Sensor, System) that witnesses an event or state.
2.  **Claim**: A statement in the format: "I observed Entity $E$ has Attribute $A$ with Value $V$."
3.  **Effect (VC)**: The rigorous, cryptographic **product** of the observation. It attests to a **State Change ($\Delta$)** for an attribute.

### The Formula
$$Effect = Sign_{Observer}(Entity, Attribute, \Delta Value, Timestamp)$$

## 2. The Product: The Verifiable Credential

In this system, a VC is not just a digital badge. It is the **output product** of an observation operation.

*   **Input**: Observation (Labor of observing/verifying).
*   **Output**: A timestamped VC (The "Effect").
*   **Function**: Acts as a state transition (+/-) on the global ledger of truth.

### Structure of an Effect
```json
{
  "id": "urn:uuid:...",
  "type": ["VerifiableCredential", "Effect"],
  "issuer": "did:observer:Alice",
  "issuanceDate": "2024-03-15T08:00:00Z",
  "credentialSubject": {
    "id": "did:entity:Bob",
    "attribute": "Skill.Carpentry",
    "value": "Level 5",
    "delta": "+1",  // Optional: For quantitative attributes
    "context": "Observed during Bridge Construction OP100"
  },
  "proof": { ... }
}
```

## 3. Operational Examples

### Case 1: Skill Verification
*   **Observer**: Evaluator (Senior Carpenter)
*   **Entity**: Bob (Apprentice)
*   **Attribute**: `Carpentry.Competence`
*   **Observation**: Bob successfully built a chair.
*   **Effect (VC)**: "Bob's Carpentry Competence is confirmed at Level 3."
*   **State Change**: `Carpentry.Level: 2 -> 3`

### Case 2: Consumption (Inventory State)
*   **Observer**: Silo Sensor (or Manager)
*   **Entity**: Wheat Silo A
*   **Attribute**: `Inventory.Wheat`
*   **Observation**: 50kg removed for milling.
*   **Effect (VC)**: "Silo A Wheat Inventory -50kg."
*   **State Change**: `Inventory: 1000 -> 950`

### Case 3: Labor Contribution
*   **Observer**: Workstation / Peer
*   **Entity**: Alice
*   **Attribute**: `Labor.Hours.Contributed`
*   **Observation**: Alice worked 4 hours.
*   **Effect (VC)**: "Alice contributed +4 hours to OP100."
*   **State Change**: `Alice.TotalHours: 100 -> 104`

## 4. The System Architecture

### No Central State, Only Effects
The "Current State" of the system is simply the summation of all valid, timestamped Effects.

$$State(Entity, Attribute)_t = \sum_{i=0}^t Effect_i(Entity, Attribute, \Delta)$$

### The Role of Trust
Trust is placed in the **Observer**.
*   We do not trust the "Database".
*   We trust the **Observer's Signature** on the Effect.
*   If an Observer is found unreliable, we filter out their Effects from the summation.

## 5. Summary
*   **Inputs**: Reality.
*   **Process**: Observation.
*   **Output**: Effect (VC).
*   **Result**: Validated History.

This turns "Accounting" into a decentralized production process where the product is **Truth**.