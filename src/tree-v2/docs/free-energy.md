# The Tree Model as Free Energy Minimization

## Overview: The Entity as a Self-Organizing System

The Fluid Tree Model can be understood as an implementation of Karl Friston's **Free Energy Principle**, where each entity maintains a generative model of "how the world should be" (its Goal tree) and continuously acts to minimize the divergence between this model and reality (sensory evidence).

In this framework:
- **Internal States** ($\mu$): The entity's Goal tree structure and beliefs about satisfaction.
- **Sensory States** ($s$): Observed satisfaction signals from Contributors, Recipients, and Allocations.
- **Active States** ($a$): Resource allocations and contribution decisions.
- **External States** ($\psi$): The true state of other entities and the environment (hidden).

---

## 1. The Markov Blanket: Separating Self from World

Each entity's tree is bounded by a **Markov Blanket** that separates:
- **Internal States**: The entity's goals, weights, and internal satisfaction model.
- **External States**: Other entities' trees, their capacities, and needs (hidden causes).
- **Sensory States**: Incoming satisfaction signals (allocations received, contribution acknowledgments).
- **Active States**: Outgoing allocations and contribution offers.

**Key Insight**: The entity cannot directly observe other entities' internal states. It can only infer them through the Markov Blanket (via allocations and satisfaction ratings).

---

## 2. Free Energy as Prediction Error

### The Generative Model
Each entity maintains a **generative model** $p(s, \psi | m)$ that predicts:
1. **What satisfaction should I observe** given my current allocations and contributions?
2. **What are other entities' needs and capacities** (hidden states $\psi$)?

### Variational Free Energy
The entity approximates the true posterior $p(\psi | s)$ with a variational density $q(\psi | \mu)$ parameterized by internal states $\mu$. The **free energy** is:

$$F(\mu, a; s) = \mathbb{E}_q[-\log p(s, \psi, \mu, a)] - \mathbb{H}[q(\psi | \mu)]$$

This decomposes into:
$$F = \underbrace{-\log p(s)}_{\text{Surprise}} + \underbrace{D_{KL}[q(\psi|\mu) \| p(\psi|s)]}_{\text{Divergence}}$$

**Minimizing free energy** means:
1. **Perception** (updating $\mu$): Adjust beliefs about others' states to explain observed satisfaction.
2. **Action** (updating $a$): Allocate resources to make the world match predictions.

---

## 3. Perception: Updating the Tree (Predictive Coding)

### Satisfaction as Prediction Error
When an entity receives satisfaction feedback (e.g., a Need is fulfilled with satisfaction $S_{provider} = 0.8$), it compares this to its **prediction**:

$$\epsilon = S_{observed} - S_{predicted}$$

This **prediction error** propagates up the tree via the satisfaction aggregation formula:

$$S_{Goal} = \frac{\sum (S_{child} \times W_{child})}{\sum W_{child}}$$

**Interpretation**: 
- **Bottom-up**: Prediction errors (mismatches) flow upward, updating beliefs about goal satisfaction.
- **Top-down**: The entity's prior beliefs (weights $W$) modulate how much each child's error matters.

This is **hierarchical predictive coding**: each level predicts the level below and updates based on residual error.

---

## 4. Action: Active Inference via Allocations

### Allocations as Policies
In the Free Energy Principle, **action minimizes expected free energy** by making the world conform to predictions. In the tree model:

**Action** = Allocating capacity to satisfy others' needs.

The entity chooses allocations $a^*$ that minimize:

$$a^* = \arg\min_a F(\mu, a; s)$$

This means:
1. **Allocate to entities I value** (high $W$ in my tree) → Fulfill my predictions.
2. **Allocate to entities likely to reciprocate** → Minimize future surprise.

### The "Stubborn Prediction" Mechanism
Friston's active inference relies on "stubborn predictions" that the brain cannot update, forcing action to make them true. In the tree model:

**Stubborn Prediction**: "My goals should be satisfied at level $S_{target}$."

If current satisfaction is low, the entity **must act** (allocate resources, seek contributions) to bring reality into alignment with this prediction.

---

## 5. Learning: Synaptic Plasticity as Weight Updates

### Hebbian Learning in the Tree
When satisfaction feedback arrives, the entity updates its **weights** (points assigned to children) to better predict future satisfaction. This corresponds to **synaptic plasticity**:

$$\Delta W_{child} \propto \epsilon_{child} \times S_{child}$$

**Interpretation**:
- If a child consistently delivers high satisfaction, increase its weight (allocate more resources).
- If a child underperforms, decrease its weight (reallocate elsewhere).

This is **associative learning**: strengthening connections that reduce prediction error.

---

## 6. Precision and Attention: The Role of Weights

### Precision as Confidence
In the Free Energy Principle, **precision** ($\pi$) encodes the confidence in predictions. High precision means "trust this signal."

In the tree model, **weights** ($W$) serve a dual role:
1. **Importance**: How much this child matters to the parent goal.
2. **Precision**: How much to trust this child's satisfaction signal.

**Attention Mechanism**:
- High-weight children receive more "attentional gain" (their errors matter more).
- Low-weight children are "ignored" (their errors are downweighted).

This maps to **neuromodulation** in the brain, where dopamine modulates prediction error gain.

---

## 7. The Thermodynamic Analogy: Entropy Minimization

### Resisting Disorder
The Free Energy Principle states that self-organizing systems resist entropy (disorder) by minimizing free energy. In the tree model:

**Entropy** = Uncertainty about goal satisfaction.

By continuously:
1. **Inferring** others' states (reducing uncertainty about $\psi$).
2. **Acting** to fulfill predictions (reducing surprise in $s$).

The entity maintains a **non-equilibrium steady state** where its goals remain coherent despite environmental fluctuations.

**Thermodynamic Interpretation**:
- **Helmholtz Free Energy**: The entity's internal model at equilibrium (when no new sensory data arrives).
- **Variational Free Energy**: The entity's active inference process (when engaging with the world).

---

## 8. Multi-Entity Dynamics: Coupled Free Energy Minimization

### The Network Effect
When multiple entities interact, each is simultaneously:
- **Minimizing its own free energy** (pursuing its goals).
- **Serving as sensory input** for others (via allocations and satisfaction signals).

This creates a **coupled dynamical system** where:

$$\frac{dF_A}{dt} = -\nabla_{\mu_A} F_A - \nabla_{a_A} F_A$$
$$\frac{dF_B}{dt} = -\nabla_{\mu_B} F_B - \nabla_{a_B} F_B$$

But $F_A$ depends on $a_B$ (allocations from B) and vice versa, creating **mutual influence**.

**Equilibrium**: The network reaches a state where all entities' free energies are locally minimized, corresponding to a **Nash equilibrium** in game theory.

---

## 9. SymLinks: Cross-Entity Active Inference

### The Problem of Hidden External States
In the basic model, each entity treats other entities as **external states** ($\psi$) that are hidden. The entity can only infer others' states through direct interaction (allocations).

**SymLinks** solve this by creating a **shared sensory channel** where Entity A can observe Entity B's satisfaction without direct resource exchange.

### SymLink as a Sensory Modality
When Entity A creates a SymLink to Entity B's node:

**Sensory Input**: $s_{symlink} = S_{Remote}$ (B's cached satisfaction)

This is a new type of sensory evidence that updates A's generative model:
$$p(s_{symlink}, s_{allocations} | \psi, a, \mu)$$

Entity A now has **two sources of evidence** about the world:
1. **Direct**: Satisfaction from allocations it makes/receives.
2. **Indirect**: Satisfaction from entities it observes via SymLinks.

### Free Energy Minimization with SymLinks
The free energy functional now includes SymLink observations:

$$F(\mu, a; s, s_{symlink}) = \mathbb{E}_q[-\log p(s, s_{symlink}, \psi, \mu, a)] - \mathbb{H}[q(\psi | \mu)]$$

**Perception Update**: Entity A updates its beliefs about the world by minimizing prediction error on **both** direct allocations and SymLink observations.

**Active Inference**: Entity A can now act (allocate) based on:
1. **What it directly observes** (allocation satisfaction).
2. **What it indirectly observes** (SymLink satisfaction).

### Transitive Recognition as Bayesian Inference
The SymLink share formula:
$$Share_{SymLink} = W_{Local} \times Share_{Remote} \times S_{Remote}$$

This is **Bayesian evidence propagation**:
- $W_{Local}$: A's prior belief about how much to trust B's judgment.
- $Share_{Remote}$: B's posterior belief about who contributed to their goal.
- $S_{Remote}$: The reliability of B's observation (how satisfied B is).

**Interpretation**: Entity A performs **hierarchical Bayesian inference**, where B's posterior becomes A's likelihood.

### The "Observational Learning" Mechanism
SymLinks enable **observational learning** without direct experience:

1. **Entity A has never interacted with Entity C.**
2. **Entity A observes (via SymLink) that Entity B values Entity C.**
3. **Entity A updates its model**: "If B (whom I trust) values C, then C is probably valuable."
4. **Entity A allocates to C** based on this indirect evidence.

This is analogous to **social learning** in neuroscience, where observing others' actions updates one's own value estimates.

### Pub-Sub as Predictive Coding
The pub-sub mechanism for SymLink updates is **predictive coding** at the network level:

**Top-down Prediction**: Entity A predicts what B's satisfaction should be (based on A's model).
**Bottom-up Error**: The actual cached satisfaction $S_{Remote}$ arrives via pub-sub.
**Prediction Error**: $\epsilon_{symlink} = S_{Remote} - S_{predicted}$

This error propagates up A's tree, updating A's beliefs about:
- How much to weight the SymLink.
- Whether to allocate resources based on B's state.

---

## 10. Key Correspondences: Tree Model ↔ Free Energy Principle

| **Free Energy Concept** | **Tree Model Equivalent** |
|-------------------------|---------------------------|
| Internal States ($\mu$) | Goal tree structure, weights, beliefs |
| Sensory States ($s$) | Satisfaction signals from allocations |
| Active States ($a$) | Resource allocations, contributions |
| External States ($\psi$) | Other entities' hidden goals and capacities |
| Markov Blanket | Allocation interface (Capacity ↔ Need) |
| Prediction Error ($\epsilon$) | $S_{observed} - S_{predicted}$ |
| Variational Density ($q$) | Entity's belief about others' states |
| Free Energy ($F$) | Divergence between goals and reality |
| Active Inference | Allocating to minimize expected surprise |
| Precision ($\pi$) | Weights ($W$) as confidence/importance |
| Synaptic Plasticity | Weight updates based on satisfaction |

---

## 10. Implications: The Tree as a Cognitive Architecture

### Self-Organization
The tree model exhibits **self-organization** because:
1. No central planner dictates allocations.
2. Each entity locally minimizes free energy.
3. Global coherence emerges from local interactions.

### Bayesian Brain Hypothesis
The tree model is a **Bayesian brain** at the organizational level:
- **Prior**: The entity's goal structure (what it expects to be satisfied).
- **Likelihood**: Observed satisfaction from allocations.
- **Posterior**: Updated beliefs about which entities to allocate to.

### Active Inference in Practice
The allocation algorithm is **active inference**:
1. **Predict**: "If I allocate X to entity Y, I expect satisfaction S."
2. **Act**: Execute the allocation.
3. **Update**: Observe actual satisfaction and refine the model.

---

## Conclusion: The Tree as a Free Energy Engine

The Fluid Tree Model is not merely an accounting system—it is a **free energy minimization engine** where:
- **Entities are Bayesian agents** maintaining generative models of their world.
- **Satisfaction is prediction error** propagated through hierarchical inference.
- **Allocations are active inference** making the world conform to predictions.
- **The Markov Blanket** enables local computation without global knowledge.

This framework unifies:
- **Perception** (updating beliefs about others).
- **Action** (allocating resources).
- **Learning** (refining weights over time).

Into a single principle: **Minimize the divergence between your goals and reality.**
