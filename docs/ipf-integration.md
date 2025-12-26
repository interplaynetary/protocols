# Integrating Iterative Proportional Fitting (IPF) into Asymmetric Allocation

> [!NOTE]
> This document analyzes the feasibility and implications of replacing the current "Deviational Optimization" logic (Phase 2) with a formal **Biproportional Iterative Proportional Fitting (IPF)** algorithm.

## 1. What is IPF?

**Iterative Proportional Fitting (IPF)**, also known as the **RAS method** or **Sinkhorn-Knopp algorithm**, is a procedure to adjust an initial matrix (the "seed") so that it sums to specified row and column totals (marginals) while preserving the interaction structure (odds ratios) of the seed as much as possible.

$$ \min \sum_{p,r} A_{pr} \ln \left( \frac{A_{pr}}{Seed_{pr}} \right) $$

*It minimizes the information gain (Kullback-Leibler divergence) from the Seed to the Allocation.*

---

## 2. Fit for the "Asymmetric" Model

In our Asymmetric Protocol:
- **Seed ($M$)**: Provider's Priority Distribution (The "Push").
- **Row Constraints**: Capacity $C_p$.
- **Column Constraints**: Recipient Need $N_r$.

Could Phase 2 be replaced by IPF? **Yes, and it might be superior.**

### 2.1 The Mapping

| Current Phase 2 | IPF Approach |
| :--- | :--- |
| **Input** | Allocated Matrix ($A$) from Phase 1 + Deviations | Seed Matrix ($S$) = Provider Priorities |
| **Logic** | Heuristic adjustment (`matrix += diff * alpha`) | Multiplicative scaling ($A = S \times R_i \times C_j$) |
| **Constraint** | "Global Clamping" (Reactive) | Hard Marginals (Proactive) |
| **Convergence** | Approximate (depends on step size) | Proven (if support exists) |

### 2.2 Benefits of IPF

1.  **Mathematical Rigor**: Instead of ad-hoc "pressure" and "clamping", IPF is the unique solution to "Closest matrix to Provider Priorities that respects Recipient Limits".
2.  **Stability**: It naturally handles the "displacement" logic. If a recipient is over-subscribed, IPF scales down *all* providers to that recipient, but since it preserves ratios, high-priority providers generally retain more absolute volume if their initial value was higher.
3.  **Simplicity**: Replaces complex `calculateDeviations` and `makeAdjustments` with two simple loops (Row Scale -> Column Scale).

---

## 3. The "Hybrid Seed" Challenge

The one area where standard IPF differs from our current logic is **Recipient Preferences**.

*   **Current Logic**: Recipient preferences explicitly pull allocation away from low-preference sources via the Deviation metric ($D_{recipient}$).
*   **Standard IPF**: If Seed = Provider Priorities, **Recipient Preferences are ignored**. IPF only ensures the *Total Amount* ($N_r$) is correct. It doesn't care *who* fills the bucket, as long as it respects the Provider's ratios.

**To maintain the "Pull" behavior in an IPF world, we must encode Recipient Preferences into the Seed.**

### 3.1 The Biproportional Seed

We would execute IPF on a **Joint Seed**:

$$ Seed_{pr} = \text{ProviderPriority}(p \to r) \times \text{RecipientPreference}(r \to p)^\gamma $$

*   If $\gamma = 0$: Pure Asymmetric (Provider Dictates, Recipient Caps).
*   If $\gamma = 1$: Fully Symmetric (Mutual Agreement).
*   If $\gamma \approx 0.5$: Asymmetric with Recipient Influence.

### 3.2 Solving "Hidden Demand"

IPF preserves zeros. ($0 \times anything = 0$).
*   **Problem**: If Provider initially has 0 priority for Recipient, but Recipient really needs them (and Provider has surplus), standard IPF won't allocate.
*   **Solution**: The Seed must be constructed with "Potential".
    *   $Seed_{pr} = \text{BasePriority} + \epsilon$
    *   Or, use the Symmetric Seed ($\sqrt{P \times R}$) as the base, which allows Recipient demand to "wake up" zero-priority providers if $\epsilon$ is used.

---

## 4. Alignment with Protocol Intentions

Revisiting the goals from `protocol/docs/priority.md`:

| Goal | Can IPF Support It? | How? |
| :--- | :--- | :--- |
| **Provider Priorities** | ✅ Yes | Encoded directly in the Seed Matrix. |
| **Recipient Preferences** | ✅ Yes | Encoded as a weight ($\gamma$) in the Seed Matrix. |
| **Displacement** | ✅ Yes | Natural consequence of competitive scaling. If $P_1$ has higher seed value than $P_2$ for $Rec$, and $Rec$ is full, $Rec$'s scaling factor will accommodate $P_1$ more than $P_2$. |
| **Hidden Demand** | ✅ Yes | Requires initializing Seed with "Potential" (non-zero $\epsilon$ for compatible matches) so scaling can amplify it if needed. |
| **Proportional Fairness** | ✅ Yes | IPF is mathematically defined to minimize divergence from the target proportions (KL Divergence). |
| **Pareto Efficiency** | ✅ Yes | Converges to a state where no flow can be moved without violating a constraint or worsening the odds-ratio match. |

---

## 5. Latency and Performance Analysis

How does "IPF Asymmetric" compare to "Standard Asymmetric" under latency?

### 5.1 Network Latency (The Constraint Data)
Both approaches operate on the Provider's **Local View** of the network:
*   Capacity: Known locally (fresh).
*   Recipient Need ($N_r$): Known via last gossip/signal (potentially stale).
*   Recipient Preference ($\gamma$): Known via last gossip/signal (potentially stale).

**Conclusion**: Since they both use the same input data, they have **identical** network latency characteristics. Both enable "Optimistic Allocation" even if Recipient data is stale.

### 5.2 Computational Latency (The Calculation)
*   **Standard Asymmetric (Deviations)**: Uses a heuristic gradient descent.
    *   *Pros*: Can be tweaked to exit early.
    *   *Cons*: May oscillate or require many small steps to stabilize if `alpha` is poorly tuned.
*   **IPF**: Uses matrix scaling (linear algebra).
    *   *Pros*: Very fast convergence ($O(N^2)$ per iteration). Usually stabilizes in <10 iterations for typical cases.
    *   *Cons*: Iterative by nature (can't just do "one pass").

**Verdict**: IPF is likely **faster and more predictable** computationally because it avoids the parameter tuning and potential oscillation of the deviation-based gradient descent.

### 5.3 Stale Data Robustness
If Recipient Need ($N_r$) is stale (e.g., Recipient actually needs 5, but Provider thinks 10):
*   **Standard**: Will allocate up to 10 (subject to deviation pressure). Provider acts on stale info.
*   **IPF**: Will allocate up to 10 scaling exactly to that margin. Provider acts on stale info.

Both fail essentially the same way: The Provider generates a valid allocation *for the state they believe exists*. IPF might be *slightly* "cleaner" because it won't leave small fractional overflows that the heuristic might miss.

---

## 6. Implementation Strategy

To integrate Biproportional IPF into `allocation-local.ts`:

1.  **Construct Seed**:
    Create a matrix $S$ where $S_{pr}$ combines Provider Priority and (optionally) Recipient Preference. To stay true to "Asymmetric", we might weight Provider Priority heavily.
2.  **Run IPF Loop**:
    ```typescript
    let matrix = clone(S);
    while (maxDiff > epsilon) {
       // 1. Scale Rows to Capacity
       for (const p of providers) {
          const rowSum = sum(matrix[p]);
          const scale = p.capacity / rowSum;
          matrix[p] *= scale;
       }
       // 2. Scale Columns to Need
       for (const r of recipients) {
          const colSum = sum(matrix[:, r]);
          const scale = r.need / colSum;
          // Crucial: Don't scale UP if need is unmet (shortage valid), only scale DOWN
          if (scale < 1.0) matrix[:, r] *= scale;
       }
    }
    ```
3.  **Use Result**: This matrix replaces the entire Phase 1 + Phase 2 logic (or just Phase 2 refinement).

## 7. Conclusion

**Yes, the Asymmetric version would benefit.**
It would replace the heuristic "deviational optimization" with a robust, convergent algorithm. The key design decision becomes **"How to construct the Seed?"** rather than "How to tweak the adjustment coefficients?".
