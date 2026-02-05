# Trust Scenarios Analysis
> "Does strict scoping cover all forms of expertise?"

We are testing the `(Scope, Issuer, AttributeWhitelist)` model against real-world scenarios.

## 1. The Core Scenarios (Fully Covered)

### Scenario A: Domain Delegation (The "Department" Model)
*   **Case**: "I don't know code. I trust the Engineering Lead (Alice) to rate skills. I don't know money. I trust the CFO (Bob) to set budgets."
*   **Implementation**:
    *   `Trust(Alice, scope="engineering", filter=["skills"])`
    *   `Trust(Bob, scope="finance", filter=["budget"])`
*   **Result**: Covered. Alice cannot falsify the budget; Bob cannot fake skills.

### Scenario B: Transitive Delegation (The "Chain of Command" Model)
*   **Case**: "I trust Alice (VP). Alice trusts Bob (Director). Bob trusts Charlie (Manager)."
*   **Implementation**:
    *   Root -> Trust(Alice, "eng")
    *   Alice -> Trust(Bob, "eng")
    *   Bob -> Trust(Charlie, "eng")
*   **Result**: Covered. The recursive traversal finds Charlie. If Root revokes Alice, the whole branch is cut.

### Scenario C: Unintended Scope Leak
*   **Case**: "I trust Alice for 'Generic' claims, but I don't want her changing the 'Constitution'."
*   **Implementation**:
    *   `Trust(Alice, scope="generic", filter=null)`
    *   `Trust(Root, scope="constitution", filter=null)`
*   **Result**: Covered, assuming the application queries the specific scope.

---

## 2. Advanced Scenarios (Partial / Gaps)

### Scenario D: Subject-Constraint ("The Mentor" Model)
*   **Case**: "I trust Alice to grade **Students**, but I do **not** trust her to grade **Professors**."
*   **Current Model**: `Trust(Alice, scope="grading", filter=["grade"])`.
*   **Gap**: The filter allows Alice to issue a VC where `credentialSubject.id` is a Professor.
*   **Fix Required**: `filters.subjectPattern` (e.g. `subjectId` must match `urn:student:*`).

### Scenario E: Threshold Trust ("The Jury" Model)
*   **Case**: "I trust a 'Guilty' verdict only if **12** trusted jurors all sign it." or "I trust a Value Assessment only if **3** appraisers agree."
*   **Current Model**: Finds the set of trusted Agents {A, B, C...}. Accepts VCs from *any* of them.
*   **Gap**: The architecture is "Set Membership" (OR logic), not "Aggregation" (AND logic).
*   **Fix Required**: This belongs in the **Resolution Strategy** (Pass 3), not the Trust Graph. The Resolver must implement `Multisig` or `Consensus` logic.

### Scenario F: Role-Based Trust ("The Badge" Model)
*   **Case**: "I don't know who the CTO is, but whoever holds the `urn:badge:cto` credential is trusted."
*   **Current Model**: Trusts *DIDs* (Public Keys).
*   **Gap**: We need a "Resolve Holder" step.
*   **Fix Required**: The Trust Graph traversal must support indirect edges: `Trust(HolderOf("urn:badge:cto"))` -> Look up holder -> Add DID to set.

### Scenario G: Value-Constraint ("The Spending Limit" Model)
*   **Case**: "I trust Bob to approve expenses, but only **under $500**."
*   **Current Model**: `Trust(Bob, scope="finance", filter=["expense"])`.
*   **Gap**: Bob can sign an expense for $1,000,000.
*   **Fix Required**: Constraint Logic (Zod Schema refinement? or Logic Gates in the Trust VC?).

---

## 3. Conclusion & Recommendations

The current architecture covers **Structural Authority** (Who can speak on What).
It fails to cover **Logic Authority** (Constraints on Values, Subjects, or Consensus).

### Recommendation
1.  **Keep the Trust Graph Simple**: It answers "Is this person allowed to speak?".
2.  **Move Logic to Zod**: For "Spending Limits" (Scenario G) or "Subject Types" (Scenario D), use **Schemas**.
    *   *Example*: Define a `SmallExpenseSchema` (max 500). Trust Bob only for `SmallExpenseSchema`.
3.  **Move Consensus to Resolver**: For "Jury" (Scenario E), the `Graph` aggregation function should define the consensus rule (e.g. `Reducers.consensus(3)`).
