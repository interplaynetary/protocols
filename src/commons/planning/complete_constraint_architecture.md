# Complete Constraint Architecture: The Elegant Solution
> "Constraints compose. Validators specialize. Resolution flows."

## Design Philosophy

Instead of adding ad-hoc features for each scenario, we design **layers** that compose:

1. **Base Layer**: Field constraints (`path`, `op`, `value`)
2. **Time Layer**: Temporal validity
3. **State Layer**: Cumulative tracking
4. **Graph Layer**: Cross-VC and topology validation
5. **Policy Layer**: Aggregation and consensus

Each layer is **independent** but **composable**.

## 1. The Unified Constraint Schema

```typescript
type BaseConstraint = {
    type: "field";
    path: string[];
    op: "eq" | "lt" | "gt" | "regex" | "in";
    value: any;
};

type TemporalConstraint = {
    type: "temporal";
    validFrom?: string;      // ISO timestamp
    validUntil?: string;     // ISO timestamp
    windowHours?: number;    // "Only business hours"
};

type CumulativeConstraint = {
    type: "cumulative";
    scope: string;           // "daily" | "total"
    aggregation: "sum" | "count";
    path: string[];          // What to sum/count
    limit: number;
};

type CrossVCConstraint = {
    type: "cross_vc";
    requires: "cosigner" | "quorum";
    minCount?: number;       // For quorum
    issuerPattern?: string;  // Who must cosign
};

type GraphConstraint = {
    type: "graph";
    pathRequires?: string[]; // Must pass through these DIDs
    pathExcludes?: string[]; // Must NOT pass through these
};

type Constraint = 
    | BaseConstraint 
    | TemporalConstraint 
    | CumulativeConstraint 
    | CrossVCConstraint 
    | GraphConstraint;

interface TrustClaim {
    scope: string;
    trusts: string[];
    constraints: Constraint[];
}
```

## 2. The Resolution Pipeline (Elegant Flow)

Instead of monolithic validation, we have **phases**:

```typescript
async function resolveTrustedGraph(
    rootDid: string,
    scope: string,
    allVCs: VC[],
    evaluationTime: Date = new Date()
): Promise<Graph> {
    
    // Phase 1: Build Raw Graph (unchanged)
    const rawNodes = await processVCsToNodes(allVCs);
    const dirtyGraph = new Graph(rawNodes);
    
    // Phase 2: Discover Trust Paths
    const trustPaths = discoverTrustPaths(dirtyGraph, rootDid, scope);
    // Result: Map<TargetDID, { path: DID[], constraints: Constraint[] }>
    
    // Phase 3: Validate Each VC (Multi-phase)
    const validVCs: VC[] = [];
    
    for (const vc of allVCs) {
        const issuerPath = trustPaths.get(vc.issuer);
        if (!issuerPath) continue; // Not trusted at all
        
        const isValid = await validateVC(
            vc, 
            issuerPath.constraints, 
            evaluationTime,
            allVCs, // For cross-VC checks
            issuerPath.path // For graph checks
        );
        
        if (isValid) validVCs.push(vc);
    }
    
    // Phase 4: Resolve & Build Clean Graph
    const cleanNodes = await processVCsToNodes(validVCs);
    return new Graph(cleanNodes);
}
```

## 3. Specialized Validators (Composable)

Each constraint type has a **pure validator function**:

```typescript
// 1. Field Validator (Simple)
function validateFieldConstraint(
    vc: VC, 
    constraint: BaseConstraint
): boolean {
    const value = getPath(vc, constraint.path);
    return evaluateOp(value, constraint.op, constraint.value);
}

// 2. Temporal Validator (Context-aware)
function validateTemporalConstraint(
    vc: VC,
    constraint: TemporalConstraint,
    evaluationTime: Date
): boolean {
    const issuedAt = new Date(vc.issuanceDate);
    
    if (constraint.validFrom && evaluationTime < new Date(constraint.validFrom)) {
        return false;
    }
    
    if (constraint.validUntil && evaluationTime > new Date(constraint.validUntil)) {
        return false;
    }
    
    if (constraint.windowHours) {
        const hour = evaluationTime.getHours();
        return hour >= 9 && hour < 17; // Business hours example
    }
    
    return true;
}

// 3. Cumulative Validator (Stateful)
class CumulativeValidator {
    private state = new Map<string, number>();
    
    validate(
        vc: VC,
        constraint: CumulativeConstraint,
        issuer: string
    ): boolean {
        const key = `${issuer}:${constraint.scope}`;
        const current = this.state.get(key) ?? 0;
        
        const value = getPath(vc, constraint.path);
        const newTotal = constraint.aggregation === "sum" 
            ? current + value 
            : current + 1;
        
        if (newTotal > constraint.limit) {
            return false;
        }
        
        this.state.set(key, newTotal);
        return true;
    }
}

// 4. Cross-VC Validator (Pool-aware)
function validateCrossVCConstraint(
    vc: VC,
    constraint: CrossVCConstraint,
    allVCs: VC[]
): boolean {
    if (constraint.requires === "cosigner") {
        const subjectId = vc.credentialSubject.id;
        const cosigners = allVCs.filter(v => 
            v.credentialSubject.id === subjectId &&
            v.issuer.match(constraint.issuerPattern!)
        );
        return cosigners.length > 0;
    }
    
    if (constraint.requires === "quorum") {
        const subjectId = vc.credentialSubject.id;
        const claims = allVCs.filter(v => 
            v.credentialSubject.id === subjectId
        );
        return claims.length >= constraint.minCount!;
    }
    
    return false;
}

// 5. Graph Validator (Topology-aware)
function validateGraphConstraint(
    vc: VC,
    constraint: GraphConstraint,
    trustPath: string[]
): boolean {
    if (constraint.pathRequires) {
        const hasAll = constraint.pathRequires.every(did => 
            trustPath.includes(did)
        );
        if (!hasAll) return false;
    }
    
    if (constraint.pathExcludes) {
        const hasAny = constraint.pathExcludes.some(did =>
            trustPath.includes(did)
        );
        if (hasAny) return false;
    }
    
    return true;
}
```

## 4. The Master Validator (Composition)

```typescript
async function validateVC(
    vc: VC,
    constraints: Constraint[],
    evaluationTime: Date,
    allVCs: VC[],
    trustPath: string[]
): Promise<boolean> {
    
    for (const constraint of constraints) {
        let isValid = false;
        
        switch (constraint.type) {
            case "field":
                isValid = validateFieldConstraint(vc, constraint);
                break;
            case "temporal":
                isValid = validateTemporalConstraint(vc, constraint, evaluationTime);
                break;
            case "cumulative":
                isValid = cumulativeValidator.validate(vc, constraint, vc.issuer);
                break;
            case "cross_vc":
                isValid = validateCrossVCConstraint(vc, constraint, allVCs);
                break;
            case "graph":
                isValid = validateGraphConstraint(vc, constraint, trustPath);
                break;
        }
        
        if (!isValid) return false; // All constraints must pass (AND logic)
    }
    
    return true;
}
```

## 5. Example: Complex Trust Delegation

```typescript
// Root trusts Alice for Finance, but with limits
const rootToAlice: TrustClaim = {
    scope: "finance",
    trusts: ["did:alice"],
    constraints: [
        { type: "field", path: ["credentialSubject", "amount"], op: "lt", value: 10000 },
        { type: "temporal", validUntil: "2025-12-31T23:59:59Z" },
        { type: "cumulative", scope: "daily", aggregation: "sum", path: ["credentialSubject", "amount"], limit: 50000 }
    ]
};

// Alice trusts Bob, but even more restricted
const aliceToBob: TrustClaim = {
    scope: "finance",
    trusts: ["did:bob"],
    constraints: [
        { type: "field", path: ["credentialSubject", "amount"], op: "lt", value: 500 },
        { type: "cross_vc", requires: "cosigner", issuerPattern: "did:alice" }
    ]
};
```

**Result**: Bob can only sign expenses < $500, AND Alice must also sign them, AND their combined daily total < $50K, AND only valid until end of 2025.

## 6. Why This is Elegant

1. **Separation of Concerns**: Each validator does ONE thing
2. **No Special Cases**: Adding new constraint types doesn't break existing ones
3. **Composability**: Constraints accumulate down trust chains naturally
4. **Testability**: Each validator is a pure function (except cumulative)
5. **Extensibility**: Add new constraint types by:
   - Defining the schema
   - Writing the validator
   - Adding to the switch statement

## 7. Implementation Roadmap

1. **Stage 1**: Implement base field constraints (already designed)
2. **Stage 2**: Add temporal constraints (low complexity)
3. **Stage 3**: Add cumulative validator (stateful, but isolated)
4. **Stage 4**: Add cross-VC validator (requires full pool access)
5. **Stage 5**: Add graph validator (requires trust path exposure)

Each stage is **independently deployable** and **backward compatible**.
