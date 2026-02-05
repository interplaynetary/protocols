# Generic Constraint Architecture
> "Trust, but verify... utilizing serializable predicates."

To address all scenarios generically, we must evolve "Filters" (static whitelists) into "Constraints" (dynamic logical predicates).

## 1. The Core Data Structure: `Constraint`

A constraint is a serializable rule that limits the *validity* of a detailed VC.

```typescript
type Operator = "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "in" | "contains" | "regex";

interface Constraint {
    path: string[];     // Path to the field (e.g., ["credentialSubject", "magnitude"])
    op: Operator;       // The logical operation
    value: any;         // The comparison value
}

// Updated Trust Claim
interface TrustClaim {
    scope: string;      // "urn:scope:finance"
    trusts: string[];   // ["did:bob"]
    constraints: Constraint[]; // The Generic Logic Layer
}
```

## 2. Evaluation Logic: The Intersection Principle

Trust is **restrictive**. If Alice delegates to Bob with constraints, Bob cannot override them. If Bob delegates to Charlie with *more* constraints, Charlie is bound by **both**.

**Algorithm**:
1.  **Path Finding**: Find path from Root -> Target (e.g. Root -> Alice -> Bob -> Target).
2.  **Accumulation**: Collect `constraints` at each step.
    *   $C_{total} = C_{root} \cup C_{alice} \cup C_{bob}$
3.  **Validation**: For a Fact VC issued by Target:
    *   `isValid = C_total.every(c => evaluate(c, vc))`

## 3. Applying to Scenarios

### Scenario G: Value-Constraint ("Spending Limit")
*   **Goal**: Bob can only sign expenses < 500.
*   **Constraint**:
    ```json
    { "path": ["credentialSubject", "magnitude"], "op": "lt", "value": 500 }
    ```
*   **Effect**: A VC with magnitude 1000 fails validation immediately during the Resolution Phase.

### Scenario D: Subject-Constraint ("Only Students")
*   **Goal**: Alice can only rate Students.
*   **Constraint**:
    ```json
    { "path": ["credentialSubject", "id"], "op": "regex", "value": "^urn:student:" }
    ```

### Scenario F: Role-Based Trust ("The Badge Holder")
*   **Goal**: Trust anyone who has the CTO Badge.
*   **Constraint** (Meta):
    This requires a special path prefix, e.g., `@issuer`.
    ```json
    { "path": ["@issuer", "verifiedCredentials", "type"], "op": "contains", "value": "CTOBadge" }
    ```
*   **Resolution**: The resolver must look up the Issuer's *own* credentials before validating their signature on the Fact.

### Scenario E: Thresholds ("The Jury")
*   **Goal**: Need 12 signatures.
*   **Solution**: This is a **Policy**, not a Constraint on a single VC.
    *   The "Trust Graph" outputs a *Set of Valid Candidates*.
    *   The "Aggregation Policy" checks the count.
    *   *Generic Approach*: `Aggregator(Policy<Threshold=12>)`.

## 4. Implementation Map

1.  **Schema Update**: Update `TrustClaimSchema` in `schemas.ts` to include `constraints`.
2.  **Evaluator**: Implement a pure function `evaluateConstraint(vc, constraint): boolean`.
3.  **Integration**: Hook this into `resolveTrustedGraph` (Pass 2 Filter).

## 5. Why this is "Generic"
We are not coding "Spending Limits" or "Student Checks". We are coding an **Expression Evaluator**.
The *users* (Issuers) define the logic by signing VCs with constraints. The system just executes the logic. This supports infinite future scenarios without code changes.
