# Communal Production: Labor-Time Accounting

## Capacity and Labor-Time Fundamentals

also something ive been thinking about recently, is how the capacity slots, since they do indeed specify how much quantity is available over how much time

**→ capacity = quantity / time**
**→ capacity rate = quantity per time unit**

brings in the concept of labor-time needed to produce a quantity

**→ labor-time per unit = total labor time / quantity produced**
**→ quantity produced = total labor time / labor-time per unit**
**→ productivity = quantity produced / labor time**

and then this allows us to understand for this *specific* kind of labor, how much time *on average* does it take to produce *definite quantities*

**→ average labor time for type τ = Σ(labor time for τ) / Σ(quantity of τ produced)**
**→ average productivity for type τ = Σ(quantity of τ produced) / Σ(labor time for τ)**
**→ share of total labor time for type τ = Σ(labor time for τ) / Σ(all labor time)**

its worth noting that that is EXACTLY what marx mentioned was essential for communist accounting

---

## **Key Insight: General vs Isolated Labor-Time**

(although interestingly, since availability is window) the labor-time is not looked at as isolated towards the production as one output, but as general? overlapping with all other kinds of production, and finding average time-window for general)

**Capacity Slot (General/Overlapping) Labor-Time:**
```
availability window W = time period where labor capacity exists
W is GENERAL - not pre-committed to any specific type τ

For multiple production types τ₁, τ₂, ..., τₙ:
  same window W can potentially serve ANY τᵢ
  actual allocation = f(W ∩ need windows for all types)
  
→ labor is GENERAL from the outset (becomes particular only through allocation)
```

**General/Overlapping:** `availability window W` can overlap with needs for `τ₁, τ₂, ..., τₙ` simultaneously
- The SAME time window is available for multiple types

**Finding Average Time-Window (General):**
```
For type τ across all providers:
  average availability window = ∩(all provider windows offering τ)
  
This is the GENERAL time-window where type τ can be produced,
averaged across all who can provide it.

overlapping availability windows that COULD serve τ
```

**Formalization:**
```
Let W_i = availability window of provider i
Let N_τ = set of need windows for type τ

General labor-time for type τ = ⋃(W_i ∩ N_τ for all i)
  → Union of all overlapping windows where τ COULD be produced
```
