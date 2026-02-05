ok # Scoped Trust Architecture
> "Trust is a graph, not a list."

## 1. The Problem
We have a pile of VCs. Some are facts ("Alice is a Developer"), some are meta-facts ("Bob is reliable regarding Developer assessments").
We want to solve: **Who do I listen to?**

If "I" (The Observer) trust Bob, and Bob trusts Charlie, and Charlie says "Alice is a Dev", do I believe it?
The answer depends on **Scope**. I might trust Bob for *Engineering* but not for *Finance*.

## 2. Generic Model of Recognition

We treat "Recognition" as just another relationship in the graph, but it operates on a **Meta-Level**.

### The Objects
1.  **Fact Claim**: A standard VC.
    *   *Issuer*: Alice
    *   *Subject*: Bob
    *   *Claim*: `memberOf: "urn:group:engineering"`
2.  **Trust Claim (Recognition)**: A VC granting authority.
    *   *Issuer*: Root (Me)
    *   *Subject*: Alice
    *   *Claim*: `trustedFor: "urn:scope:engineering"`

### The Algorithm: Two-Pass Resolution

To resolve the "World State" for a specific Scope (e.g., `Engineering`):

#### Pass 1: Build the Web of Trust (WoT)
We need to find the set of **Valid Issuers**.
1.  Start with **Root** (My DID).
2.  Traverse edges of type `trustedFor: "urn:scope:engineering"` (or `*`).
3.  Accumulate all reachable DIDs.
    *   *Constraint*: Path length limit? (Degrees of separation).
    *   *Constraint*: Logic? (e.g. 2 signatures required).

*Generic Implementation*: Use `Graph.aggregateDown` (or Up, depending on direction) to find all "Trusted Agents".

#### Pass 2: Filter & Resolve Facts
1.  Take all raw Fact VCs.
2.  **Filter**: Keep VC if:
    *   `vc.issuer` is in `TrustedSet`.
    *   AND `vc` content matches the `TrustFilters` (e.g. only contains `memberOf`).
3.  **Resolve**: Apply LWW / Merge.

## 3. Implementation Strategy

### A. The "Trust Scope" Extractor
We define a generic Extractor that defines what "Trust" looks like in the data.

```typescript
// Define what a Trust Claim looks like in a Node
const TrustExtractor = (scope: string) => (node: Node) => {
    // Return list of DIDs this node trusts for this scope
    return node[`trusts_${scope}`] as Set<string>; 
}
```

### B. The Resolver Function
We wrap our existing `processVCsToNodes` with a Trust Kernel.

```typescript
async function resolveTrustedGraph(
    rootDid: string,
    scoping: string,
    allVCs: VC[]
): Promise<Graph> {
    
    // 1. Ingest ALL VCs into a raw, dirty graph
    // (We accept everything temporarily to find the trust chains)
    const rawNodes = await processVCsToNodes(allVCs); // LWW logic applies here too!
    const dirtyGraph = new Graph(rawNodes);

    // 2. Compute Trusted Set (Traversal)
    const trustedIssuers = new Set([rootDid]);
    
    // Traverse: From Root -> Find who they trust -> Repeat
    // This is a simple BFS/DFS on the dirty graph
    const queue = [rootDid];
    const visited = new Set([rootDid]);

    while(queue.length > 0) {
        const current = queue.shift();
        const node = dirtyGraph.get(current);
        if(!node) continue;

        // Who does this node trust? (Generic Extractor)
        const delegates = extractTrust(node, scoping); 
        
        for (const delegate of delegates) {
            if (!visited.has(delegate)) {
                visited.add(delegate);
                trustedIssuers.add(delegate);
                queue.push(delegate);
            }
        }
    }

    // 3. Re-Process with Filter
    // Now we run the bridge again, but we strictly IGNORE VCs from untrusted issuers
    const trustedVCs = allVCs.filter(vc => trustedIssuers.has(vc.issuer));
    
    const cleanNodes = await processVCsToNodes(trustedVCs);
    return new Graph(cleanNodes);
}
```

## 4. Why this is Robust
1.  **Self-Hosting**: The Trust Rules are VCs themselves. To change the system, you perform an action (Issue a Trust VC).
2.  **Scope Isolation**: Trusting Alice for `Engineering` doesn't let her wreck the `Finance` graph.
3.  **Dynamic**: If I revoke trust in Bob (Issue a new LWW VC saying "Trust: None"), the next resolution recalculates the path, breaks the chain, and Bob's facts disappear from my view.
