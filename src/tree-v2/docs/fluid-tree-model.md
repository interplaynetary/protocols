# Fluid Tree Model (V3)

**Status:** Draft Architecture
**Concept:** Value-Based Termination
**Key Shift:** Moving from rigid hierarchy to a grammar of intent and realization.

---

## 1. Core Philosophy: Identity as the Terminal of Value

The "Fluid Tree Model" relaxes the strict structural constraints of V2 in favor of a semantic rule: **The tree structure ends (terminates) when value touches an Identity.**

The tree is no longer a rigid skeleton of `Root -> Goal -> Capacity -> Need`. Instead, it is a recursive fractal of **Intent** (Goals) that resolves into **Realization** (Action/Gratitude) whenever a Contributor involved.

### The "Value Atom"
A node is "Terminal" if it represents a direct interaction with an Identity (an Entity):
1.  **Action (Contribution):** "I did this."
2.  **Gratitude (Reception):** "I used this."
3.  **Fulfilment (Provision):** "I satisfied this need."

---

## 2. The Grammar (Production Rules)

The valid structure of the tree is defined by these production rules.

**Legend:**
*   `→` : Can contain / leads to
*   `|` : Or
*   `[TERMINAL]` : The branch ends here.

### Phase 1: Intent & Structure (The "Goal" Layer)
A `Goal` is a container of intent. It can be satisfied by sub-intent, direct action, or resource management.

*   `Goal` → `Goal` (Sub-goals / Recursion)
*   `Goal` → `ContributionNode` (Explicit decomposed actions)
*   `Goal` → `CapacitySlot` (Provisioning resources for this goal)
*   `Goal` → `NeedSlot` (Direct demand required by this goal)
*   `Goal` → `ContributorList` **[TERMINAL]** (Direct team/contribution to this goal)

### Phase 2: Action & Verification (The "Contribution" Layer)
Formerly "ContributionNode". Represents a concrete reified action.

*   `ContributionNode` → `ContributorList` **[TERMINAL]** (Who performed the action)

### Phase 3: Resources & Flow (The "Slots" Layer)
Handling the physics of resource exchange.

#### Capacity (Supply)
*   `CapacitySlot` → `NeedSlot` (Specific structural demands filling this capacity)
*   `CapacitySlot` → `AllocationList` **[TERMINAL]** (Gratitude: People "contributing" by utilizing the capacity)

#### Need (Demand)
*   `NeedSlot` → `AllocationList` **[TERMINAL]** (Providers satisfying this need)

### Phase 4: Cross-Entity Recognition (The "SymLink" Layer)
Symbolic links enable recognizing external contributions without duplicating entire tree structures.

#### SymLink (Cross-Entity Reference)
*   `SymLink` → **[TERMINAL]** (Points to another entity's tree/subtree/node)
    *   **Link Types:**
        *   `tree`: Link to entire entity tree (Root)
        *   `subtree`: Link to a specific Goal subtree
        *   `node`: Link to a specific node (Goal, Capacity, Need, or ContributionNode)
    *   **Properties:**
        *   Read-only access to remote satisfaction
        *   Cached satisfaction data via pub-sub
        *   Local weight assignment (how much you value this link)

---

## 3. Mathematical Model

### Satisfaction Equations ($S \in [0.0, 1.0]$)

Satisfaction ($S$) is the universal signal propagated up the tree.

**1. Goal Node (Weighted Aggregation)**
$$S_{Goal} = \frac{\sum (S_{child} \times W_{child})}{\sum W_{child}}$$
Where $W$ is the local weight (points) assigned to the child. This is identical for `Goal` and structural `Capacity` nodes.

**2. Contribution Node (Manual/Verified)**
$$S_{Contrib} = \text{Verified \% Complete}$$
Usually manually attested (0.0 - 1.0) or derived from external verifiers.

**3. Capacity Node (Gratitude/Utilization)**
Two modes of satisfaction:
*   *Structural:* Weighted average of Child Needs (if used as specific slots).
*   *Terminal (Flow):* Utilization rate or Gratitude score.
$$S_{Capacity} = \frac{\text{Allocated Quantity}}{\text{Available Quantity}}$$
*Concept:* A capacity is "satisfied" when it is fully utilized by recipients.

**4. Need Node (Fulfilment)**
$$S_{Need} = \frac{\sum (Q_{Allocated} \times S_{Provider})}{\text{Declared Quantity}}$$
Where $S_{Provider}$ is the satisfaction rating of the allocation.

**5. SymLink Node (Remote Satisfaction)**
$$S_{SymLink} = S_{Remote}$$
Where $S_{Remote}$ is the cached satisfaction value from the linked entity's node, obtained via pub-sub subscription.

*Concept:* A SymLink's satisfaction is determined entirely by the remote entity's satisfaction with the linked node.

### Traversal & Attribution (Shares)

How credit flows from Terminals back to the Root.

**1. The "Contributor" Share (Action)**
For direct action (Goal/ContributionNode):
$$Share_{Entity} = \frac{Points_{Entity}}{\sum Points_{Total}} \times W_{Node} \times S_{Node}$$

**2. The "Recipient" Share (Gratitude)**
For capacity utilization:
$$Share_{Recipient} = \frac{Quantity_{Received}}{\text{Total Capacity}} \times W_{Node} \times S_{Node}$$
*Interpretation:* The Recipient is credited with enabling the capacity to be useful.

**3. The "SymLink" Share (Indirect Recognition)**
For cross-entity recognition via symbolic links:
$$Share_{SymLink} = W_{Local} \times Share_{Remote} \times S_{Remote}$$
Where:
- $W_{Local}$ = Local weight assigned to the SymLink in your tree
- $Share_{Remote}$ = The remote entity's share attribution to the contributor
- $S_{Remote}$ = The remote entity's satisfaction with the linked node

*Interpretation:* You transitively recognize contributors valued by entities you value. If you value NASA's education program (high $W_{Local}$), and NASA values Entity B (high $Share_{Remote}$), then you implicitly value Entity B.
