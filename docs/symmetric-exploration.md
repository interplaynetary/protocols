# Symmetric Allocation Protocol: A Theoretical Exploration

> [!NOTE]
> This document explores a theoretical "Symmetric" version of the Priority-Based Allocation protocol, distinguishing it from the current "Provider-Driven" implementation.

## 1. The Concept of Symmetry

In the current implementation (`allocation-local.ts`), the process is asymmetric:
- **Provider (Active)**: Initiates allocation based on priorities (Push).
- **Recipient (Reactive)**: Corrects allocation based on preferences (Pull).

A **Symmetric Protocol** would treat both sides as equal originators of "intent". Both Providers and Recipients would simultaneously "propose" their ideal distributions, and the system would reconcile these proposals into a stable match.

### The "Dual-Proposal" Model

Instead of $Alloc = f(ProviderPush, RecipientCorrection)$, we imagine:

$$ Alloc_{pr} = \text{Balance}( \text{Offer}_{pr}, \text{Request}_{pr} ) $$

Where:
- $\text{Offer}_{pr}$: The amount Provider $p$ *wants* to give Recipient $r$ (based on $p$'s priorities).
- $\text{Request}_{pr}$: The amount Recipient $r$ *wants* to receive from Provider $p$ (based on $r$'s preferences).

---

## 2. Mathematical Formulation

### 2.1 Initialization (Symmetric Intent)

Both sides calculate their "Ideal Vectors" independently, ignoring the constraints of the other side initially.

#### Provider's Ideal Offer ($O$)
For each Provider Slot $p$ with capacity $C_p$:
$$ O_{pr} = C_p \times \frac{Weight(p \to r)}{\sum_k Weight(p \to k)} $$
*This represents how the Provider would distribute resources if Recipients had infinite capacity.*

#### Recipient's Ideal Request ($R$)
For each Need Slot $r$ with need $N_r$:
$$ R_{pr} = N_r \times \frac{Weight(r \to p)}{\sum_k Weight(r \to k)} $$
*This represents how the Recipient would compose their supply if Providers had infinite capacity.*

### 2.2 Reconciliation (The "Meeting of Minds")

We need a function to combine these conflicting intents. The **Geometric Mean** is a strong candidate for symmetric matching because it penalizes zero-preference from *either* side heavily (if one side wants 0, the result is 0).

$$ \text{Tentative}_{pr} = \sqrt{O_{pr} \times R_{pr}} $$

*Alternatively: A weighted harmonic mean could be used to prioritize the "more constrained" side.*

### 2.3 Iterative Convergence (Alternating Projections)

Since $\text{Tentative}_{pr}$ likely violates both $C_p$ and $N_r$ constraints, we must iteratively project the matrix onto the valid constraint sets. This is widely known as **RAS Method**, **Iterative Proportional Fitting (IPF)**, or **Sinkhorn-Knopp Algorithm**.

**Algorithm:**
1.  Initialize $A_{pr} = \text{Tentative}_{pr}$
2.  **Row Scaling (Provider Constraints)**:
    Scale each row $p$ so $\sum_r A_{pr} \le C_p$.
    $$ A_{pr} \leftarrow A_{pr} \times \frac{C_p}{\sum_k A_{pk}} $$
3.  **Column Scaling (Recipient Constraints)**:
    Scale each column $r$ so $\sum_p A_{pr} \le N_r$.
    $$ A_{pr} \leftarrow A_{pr} \times \frac{N_r}{\sum_k A_{kp}} $$
4.  **Repeat** until convergence.

## 3. Comparison with Current Protocol

| Feature | Current Protocol (Asymmetric) | Symmetric Protocol (IPF/Sinkhorn) |
| :--- | :--- | :--- |
| **Philosophy** | "Providers give, Recipients adjusting" | "Market clearing of mutual desires" |
| **Priority** | Provider Priorities are "base", Recipient Preferences are "modifiers". | Both Priorities are structurally equal. |
| **Zero-Alloc** | If Provider wants to give 0, Recipient cannot "pull" (mostly). | If *either* side wants 0, result is 0. |
| **Displacement** | High-priority providers explicitly "displace" lower ones. | Displacement emerges naturally from competitive scaling. |
| **Complexity** | Linear Initialization + Corrective Iterations. | Fully Iterative (potentially slower convergence). |

## 4. Why the Current Asymmetry Exists

The `priority.md` document highlights **"Hidden Demand Discovery"**.

> *Problem with Symmetry*: If a Provider *doesn't know* a Recipient wants them (low priority), and the Recipient *doesn't know* the Provider is available (low preference), a symmetric initialization might result in $0 \times 0 = 0$.

The current **Provider Push** model allows a high-priority Provider to say "I really want to support X", even if X didn't ask for it initially, forcing X to reconsider (if X has "hidden demand").

**To make the Symmetric version work**, we would need a **Discovery Phase** where $O_{pr}$ and $R_{pr}$ are calculated with full awareness of the *potential* graph, ensuring no potential match is zeroed out prematurely.

## 5. Latency and Distributed State

When applied to a distributed network with variable latency, the two models behave very differently.

### 5.1 The "Stale Signal" Problem

*   **Symmetric Logic**: $Alloc \propto \sqrt{O_{pr} \times R_{pr}}$
    *   Requires active signals from **both** sides to establish *any* allocation.
    *   **Failure Mode**: If the Recipient is offline or lagging, $R_{pr}$ might be treated as unknown or 0. If 0, the entire allocation collapses to 0. The Provider cannot unilaterally assist.
    *   **Result**: High sensitivity to latency. "No deal without handshake."

*   **Asymmetric Logic**: $Alloc = \text{ProviderPush} - \text{RecipientCorrection}$
    *   **Success Mode**: The Provider *optimistically* allocates capacity based on their own priority.
    *   **Latency Resilience**: If the Recipient is lagging, the allocation *exists* (it just might not be the Recipient's ideal mix). Resources flow. The correction signal arrives later to refine it.
    *   **Result**: "Optimistic Availability." Service is maintained even with partial state.

### 5.2 Synchronization Overhead

*   **Symmetric (IPF)**: Requires multiple rounds of message passing (Provider -> Recipient -> Provider -> Recipient) to converge. In high-latency networks, this "ping-pong" negotiation can take significant time to stabilize.
*   **Asymmetric**:
    *   **Phase 1 (Push)**: Immediate. 0-RTT for the Provider's local decision.
    *   **Phase 2 (Converge)**: Corrective. Can happen asynchronously. The system degrades gracefully to "Provider's Choice" in the absence of Recipient feedback.

> [!IMPORTANT]
> The Asymmetric model is essentially **Event Consistency** favored towards the **Supplier**. In a resource-provisioning network (where supply is the hard constraint), this is often the more robust choice.

## 6. Proposed "Symmetric" Implementation Strategy

If we were to pivot to a symmetric model, we would implement **Weighted Iterative Proportional Fitting (W-IPF)**.

```typescript
// Pseudocode for Symmetric Allocation

function calculateSymmetricAllocation(capacitySlots, needSlots) {
    // 1. Calculate Interaction Weights (Bilateral Enthusiasm)
    const weights = matrix(capacitySlots, needSlots, (p, r) => {
        return Math.sqrt(p.priorityFor(r) * r.priorityFor(p));
    });

    // 2. Iterative Scaling (Sinkhorn)
    let matrix = weights;
    while (!converged) {
        // Scale Rows (Provider Capacity)
        matrix = scaleRows(matrix, capacitySlots);
        
        // Scale Columns (Recipient Need)
        matrix = scaleCols(matrix, needSlots);
    }
    
    return matrix;
}
```

This balances the power dynamic completely. A match only happens if there is **mutual alignment**, and the magnitude is determined by the geometric mean of their reciprocal interest, constrained by physical limits.
