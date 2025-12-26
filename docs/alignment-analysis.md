# Analysis: Two-Sided Priority Alignment

## Executive Summary
The protocol implements a **Two-Sided Matching** mechanism that simultaneously optimizes for:
1.  **Provider Priorities**: Providers allocating capacity to the needs they value most.
2.  **Recipient Preferences**: Recipients filling their needs with resources from the providers they trust/value most.

This equilibrium is achieved through a **Constrained Weighted Allocation** algorithm that minimizes the "Source Deviation" (the difference between actual and ideal allocation mixes).

---

## 1. The Alignment Problem
In a distributed commons, "Alignment" is bidirectional.

### Provider Perspective ("Where do I give?")
A provider $P$ has limited capacity $C_p$. They assign **Priority Weights** $w_p(r)$ to various recipients.
*   **Goal**: Distribute $C_p$ such that the allocation $a_{pr}$ is proportional to $w_p(r)$.
*   **Constraint**: Cannot allocate more than they have ($C_p$) or more than the recipient needs ($N_r$).

### Recipient Perspective ("Who do I receive from?")
A recipient $R$ has a total need $N_r$. They assign **Preference Weights** $w_r(p)$ to various providers (often based on trust, proximity, or quality).
*   **Goal**: Compose their total received resources such that the mix of sources matches their preference $w_r(p)$.
*   **Constraint**: Cannot receive more than $N_r$.

### The Conflict
*   **Provider A** prioritizes **Recipient X** highly.
*   **Recipient X** prefers **Provider B** highly (and dislikes A).
*   **Provider B** prioritizes **Recipient Y**.

The system must resolve these tensions to find a "Least Misery" or "Maximum Alignment" solution.

---

## 2. The Solution: Iterative Deviational Optimization

The protocol resolves this via an iterative process where both sides exert "pressure" on the allocation matrix.

### Phase 1: Provider Constraints (The "Push")
Initially, providers "push" capacity primarily based on **their own priorities**.
*   Allocations are set proportional to Provider Priority.
*   *Result*: Ensuring providers are happy, but recipients may get "spam" (resources from low-preference sources).

### Phase 2: Recipient Refinement (The "Pull" & "Filter")
The system calculates a **Total Deviation** metric that combines both perspectives:
\[
\text{Loss} = \alpha \sum (D_{provider})^2 + (1-\alpha) \sum (D_{recipient})^2
\]

*   $D_{recipient}$: The difference between the *actual* % of resources received from Provider $P$ vs the *preferred* %.

#### The Mechanism: Deviation-Based Adjustments
1.  **Retraction**: If a recipient is receiving too much from a low-preference provider, the system detects a positive deviation and reduces that allocation.
2.  **Expansion (Hidden Demand)**: If a recipient is receiving too little from a high-preference provider (even if current allocation is 0), the system detects a negative deviation and increases that allocation.
3.  **Overshoot & Clamping**: High-preference providers are allowed to temporarily "overshoot" a recipient's need limit during the adjustment phase. This allows them to displace incumbent low-preference providers when the global `enforceNeedLimits` clamp is applied.

---

## 3. Scenarios & Outcomes

### Scenario A: Perfect Consensus
*   **Setup**: Provider A loves Recipient X. Recipient X loves Provider A.
*   **Outcome**: Allocation is maximized immediately. Stability is instant.

### Scenario B: Unrequited Allocation (Spam)
*   **Setup**: Provider A prioritizes Recipient X. Recipient X has 0 preference for A.
*   **Outcome**:
    *   Phase 1 allocates to X.
    *   Phase 2 detects massive Recipient Deviation.
    *   Allocation $A \to X$ is driven toward 0.
    *   Provider A rebalances capacity to their 2nd choice.

### Scenario C: Competitive Scarcity
*   **Setup**: Recipient X needs 10.
    *   Provider A (Cap 10) offers. Priority(X)=High. RecipientPref(A)=Low.
    *   Provider B (Cap 10) offers. Priority(X)=High. RecipientPref(B)=High.
*   **Outcome**:
    *   Both A and B want to give.
    *   Recipient X applies "backpressure" against A (Low Pref) and "suction" for B (High Pref).
    *   **Result**: Provider B displaces Provider A. Provider B gives ~10. Provider A gives ~0.
    *   *Note*: This works even if B enters late (via the "Hidden Demand" fix).

### Scenario D: Partial Substitution
*   **Setup**: Recipient X needs 10. Provider B (High Pref) only has 4 Capacity.
*   **Outcome**:
    *   B fills 4 units (High Priority matches High Pref).
    *   Remaining 6 units of need are "open".
    *   Provider A (Low Pref) fills the remaining 6.
    *   *Result*: "Best available" source mix.

---

## 4. Tuning Optimality

The parameter $\alpha$ (Alpha) controls the balance of power.

| Alpha | Focus | Implication |
| :--- | :--- | :--- |
| **1.0** | **Provider Dictatorship** | Providers give to whomever *they* choose. Recipient preferences are ignored. (Good for unconditional charity). |
| **0.0** | **Recipient Dictatorship** | Recipients strictly dictate sources. Providers serve as generic resources. (Good for market-like purchasing). |
| **0.5** | **Balanced Commons** | (Default) The system finds a middle ground where strongly held priorities on *either* side can influence the outcome. |

## Conclusion
The protocol achieves optimal alignment by treating allocation as a **vector minimization problem**. It does not merely "fill buckets" but composes the *quality* of the filling to match the social topology of the network. The recent addition of **Overshoot logic** ensures that this optimization is not trapped by local minima (e.g., "bucket full"), allowing higher-quality matches to displace lower-quality ones dynamically.
