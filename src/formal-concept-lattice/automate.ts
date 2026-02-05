import { z } from 'zod';

// ============================================================================
// SCHEMAS
// ============================================================================

const AttributeSchema = z.string();
const ObjectSchema = z.string();

const FormalContextSchema = z.object({
    objects: z.array(ObjectSchema),
    attributes: z.array(AttributeSchema),
    incidence: z.array(z.array(z.boolean())), // objects x attributes
});

const ConceptSchema = z.object({
    extent: z.array(ObjectSchema), // Set A
    intent: z.array(AttributeSchema), // Set B
});

const Vector2DSchema = z.object({
    x: z.number(),
    y: z.number(),
});

const VectorIntSchema = z.array(z.number().int());

const LayerAssignmentSchema = z.record(z.string(), z.number().int());

const DiagramSchema = z.object({
    concepts: z.array(ConceptSchema),
    positions: z.array(Vector2DSchema),
    ordering: z.array(z.array(z.number())), // adjacency for Hasse diagram
    objectiveVector: z.array(z.number()),
});

// ============================================================================
// TYPES
// ============================================================================

type FormalContext = z.infer<typeof FormalContextSchema>;
type Concept = z.infer<typeof ConceptSchema>;
type Vector2D = z.infer<typeof Vector2DSchema>;
type Diagram = z.infer<typeof DiagramSchema>;

// ============================================================================
// FORMAL CONCEPT ANALYSIS (Section 2)
// ============================================================================

class FCA {
    constructor(private context: FormalContext) { }

    // Derivation operator A' (Equation 2)
    deriveExtent(objects: string[]): string[] {
        const attrs = this.context.attributes.filter((_, attrIdx) => {
            return objects.every((obj) => {
                const objIdx = this.context.objects.indexOf(obj);
                return this.context.incidence[objIdx][attrIdx];
            });
        });
        return attrs;
    }

    // Derivation operator B' (Equation 3)
    deriveIntent(attributes: string[]): string[] {
        const objs = this.context.objects.filter((_, objIdx) => {
            return attributes.every((attr) => {
                const attrIdx = this.context.attributes.indexOf(attr);
                return this.context.incidence[objIdx][attrIdx];
            });
        });
        return objs;
    }

    // Check if (A, B) is a valid concept (Equation 1)
    isConcept(extent: string[], intent: string[]): boolean {
        const derivedIntent = this.deriveExtent(extent);
        const derivedExtent = this.deriveIntent(intent);
        return (
            this.setsEqual(derivedIntent, intent) &&
            this.setsEqual(derivedExtent, extent)
        );
    }

    // Generate all concepts using Next Closure algorithm
    generateConcepts(): Concept[] {
        const concepts: Concept[] = [];
        const attributes = this.context.attributes;

        // Start with empty intent
        let currentIntent: string[] = [];

        while (true) {
            // Compute closure
            const extent = this.deriveIntent(currentIntent);
            const intent = this.deriveExtent(extent);

            concepts.push({ extent, intent });

            // Find next intent in lexicographic order
            const next = this.nextClosure(intent, attributes);
            if (!next) break;
            currentIntent = next;
        }

        return concepts;
    }

    // Next Closure algorithm helper
    private nextClosure(intent: string[], attributes: string[]): string[] | null {
        for (let i = attributes.length - 1; i >= 0; i--) {
            const attr = attributes[i];

            if (intent.includes(attr)) {
                // Remove this attribute and all following
                const newIntent = intent.filter((a) =>
                    attributes.indexOf(a) < i
                );

                // Try adding earlier attributes
                const closure = this.deriveExtent(this.deriveIntent([...newIntent, attr]));

                // Check if valid next
                const isValid = closure.every((a) => {
                    const idx = attributes.indexOf(a);
                    return idx >= i || newIntent.includes(a);
                });

                if (isValid && !newIntent.includes(attr)) {
                    return this.deriveExtent(this.deriveIntent([...newIntent, attr]));
                }
            } else {
                // Try adding this attribute
                const newIntent = [...intent.filter((a) =>
                    attributes.indexOf(a) < i
                ), attr];
                const closure = this.deriveExtent(this.deriveIntent(newIntent));

                // Check if valid
                const isValid = closure.every((a) => {
                    const idx = attributes.indexOf(a);
                    return idx >= i || intent.includes(a) && attributes.indexOf(a) < i;
                });

                if (isValid) {
                    return closure;
                }
            }
        }

        return null;
    }

    private setsEqual(a: string[], b: string[]): boolean {
        return a.length === b.length && a.every((x) => b.includes(x));
    }
}

// ============================================================================
// LAYER ASSIGNMENT (Section 4 & 5)
// ============================================================================

class LayerAssignment {
    // Longest path layering
    static longestPath(concepts: Concept[], ordering: number[][]): Map<number, number> {
        const layers = new Map<number, number>();
        const n = concepts.length;

        // Find bottom element (most general)
        const bottom = concepts.findIndex(c => c.intent.length === 0);
        layers.set(bottom, 0);

        // Topological sort and assign layers
        const visited = new Set<number>();
        const queue = [bottom];

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (visited.has(current)) continue;
            visited.add(current);

            const currentLayer = layers.get(current) || 0;

            // Find children (more specific concepts)
            for (let i = 0; i < n; i++) {
                if (ordering[current][i]) {
                    const childLayer = layers.get(i) || 0;
                    layers.set(i, Math.max(childLayer, currentLayer + 1));
                    queue.push(i);
                }
            }
        }

        return layers;
    }
}

// ============================================================================
// ADDITIVE DIAGRAM (Section 3 & 5)
// ============================================================================

class AdditiveLayout {
    // Compute horizontal position using additive vectors (Equation 4)
    static computePosition(
        intent: string[],
        attributes: string[],
        vectors: number[]
    ): number {
        let pos = 0;
        for (let i = 0; i < attributes.length; i++) {
            if (intent.includes(attributes[i])) {
                pos += vectors[i];
            }
        }
        return pos;
    }

    // Check if diagram is satisfactory (no overlaps, no edge crossings)
    static isSatisfactory(
        concepts: Concept[],
        attributes: string[],
        vectors: number[],
        layers: Map<number, number>
    ): boolean {
        const positions = new Map<number, { x: number; y: number }>();

        // Compute all positions
        for (let i = 0; i < concepts.length; i++) {
            const x = this.computePosition(concepts[i].intent, attributes, vectors);
            const y = layers.get(i) || 0;
            positions.set(i, { x, y });
        }

        // Check for overlaps in same layer
        const layerGroups = new Map<number, number[]>();
        for (let i = 0; i < concepts.length; i++) {
            const y = positions.get(i)!.y;
            if (!layerGroups.has(y)) layerGroups.set(y, []);
            layerGroups.get(y)!.push(i);
        }

        for (const group of layerGroups.values()) {
            const xCoords = group.map(i => positions.get(i)!.x);
            if (new Set(xCoords).size !== xCoords.length) {
                return false; // Overlapping concepts in same layer
            }
        }

        return true;
    }
}

// ============================================================================
// OBJECTIVE FUNCTIONS (Section 5)
// ============================================================================

class ObjectiveFunctions {
    // 1. Symmetry: count symmetric sibling pairs
    static symmetry(
        concepts: Concept[],
        positions: Vector2D[],
        ordering: number[][]
    ): number {
        let count = 0;
        const n = concepts.length;

        for (let parent = 0; parent < n; parent++) {
            const children: number[] = [];
            for (let i = 0; i < n; i++) {
                if (ordering[parent][i]) children.push(i);
            }

            // Check pairs of children
            for (let i = 0; i < children.length; i++) {
                for (let j = i + 1; j < children.length; j++) {
                    const c1 = children[i];
                    const c2 = children[j];

                    if (positions[c1].y === positions[c2].y) {
                        const parentX = positions[parent].x;
                        const dist1 = Math.abs(positions[c1].x - parentX);
                        const dist2 = Math.abs(positions[c2].x - parentX);

                        if (Math.abs(dist1 - dist2) < 0.01) count++;
                    }
                }
            }
        }

        return count;
    }

    // 2. Minimize distinct edge vectors
    static minimizeLines(positions: Vector2D[], ordering: number[][]): number {
        const vectors = new Set<string>();
        const n = positions.length;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (ordering[i][j]) {
                    const dx = positions[j].x - positions[i].x;
                    const dy = positions[j].y - positions[i].y;
                    vectors.add(`${dx},${dy}`);
                }
            }
        }

        return -vectors.size; // Negative because we want to maximize
    }

    // 3. Maximize aligned chains
    static maximizeChains(positions: Vector2D[], ordering: number[][]): number {
        let count = 0;
        const n = positions.length;

        for (let gp = 0; gp < n; gp++) {
            for (let p = 0; p < n; p++) {
                if (!ordering[gp][p]) continue;

                for (let c = 0; c < n; c++) {
                    if (!ordering[p][c]) continue;

                    const v1x = positions[p].x - positions[gp].x;
                    const v1y = positions[p].y - positions[gp].y;
                    const v2x = positions[c].x - positions[p].x;
                    const v2y = positions[c].y - positions[p].y;

                    if (Math.abs(v1x - v2x) < 0.01 && Math.abs(v1y - v2y) < 0.01) {
                        count++;
                    }
                }
            }
        }

        return count;
    }

    static computeObjectiveVector(
        concepts: Concept[],
        positions: Vector2D[],
        ordering: number[][]
    ): number[] {
        return [
            this.symmetry(concepts, positions, ordering),
            this.minimizeLines(positions, ordering),
            this.maximizeChains(positions, ordering),
        ];
    }
}

// ============================================================================
// BACKTRACKING SEARCH (Section 5.1)
// ============================================================================

class HybridLayoutSearch {
    private readonly MIN_VEC = -10;
    private readonly MAX_VEC = 10;
    private readonly MAX_DIAGRAMS = 1000;

    constructor(
        private concepts: Concept[],
        private attributes: string[],
        private ordering: number[][],
        private layers: Map<number, number>
    ) { }

    // Main search function (Figure 4)
    search(): Diagram[] {
        const k = this.attributes.length;
        const diagrams: Diagram[] = [];
        let tested = 0;

        const search = (i: number, vectors: number[]): void => {
            if (tested >= this.MAX_DIAGRAMS) return;

            if (i === k) {
                // Complete vector found
                if (AdditiveLayout.isSatisfactory(this.concepts, this.attributes, vectors, this.layers)) {
                    const positions = this.computePositions(vectors);
                    const objective = ObjectiveFunctions.computeObjectiveVector(
                        this.concepts,
                        positions,
                        this.ordering
                    );
                    diagrams.push({
                        concepts: this.concepts,
                        positions,
                        ordering: this.ordering,
                        objectiveVector: objective,
                    });
                }
                tested++;
                return;
            }

            // Try all values for current attribute
            for (let v = this.MIN_VEC; v <= this.MAX_VEC; v++) {
                vectors[i] = v;
                search(i + 1, vectors);
                if (tested >= this.MAX_DIAGRAMS) return;
            }
        };

        search(0, new Array(k).fill(0));

        return this.filterBestDiagrams(diagrams);
    }

    private computePositions(vectors: number[]): Vector2D[] {
        return this.concepts.map((concept, idx) => ({
            x: AdditiveLayout.computePosition(concept.intent, this.attributes, vectors),
            y: this.layers.get(idx) || 0,
        }));
    }

    // Filter diagrams using partial order on objective vectors
    private filterBestDiagrams(diagrams: Diagram[]): Diagram[] {
        if (diagrams.length === 0) return [];

        const pareto: Diagram[] = [];

        for (const d of diagrams) {
            let dominated = false;

            for (const p of pareto) {
                if (this.dominates(p.objectiveVector, d.objectiveVector)) {
                    dominated = true;
                    break;
                }
            }

            if (!dominated) {
                // Remove any diagrams that this one dominates
                const newPareto = pareto.filter(
                    p => !this.dominates(d.objectiveVector, p.objectiveVector)
                );
                newPareto.push(d);
                pareto.length = 0;
                pareto.push(...newPareto);
            }
        }

        return pareto;
    }

    private dominates(a: number[], b: number[]): boolean {
        return a.every((val, i) => val >= b[i]) && a.some((val, i) => val > b[i]);
    }
}

// ============================================================================
// MAIN API
// ============================================================================

export class ConceptLatticeLayout {
    static createContext(
        objects: string[],
        attributes: string[],
        incidence: boolean[][]
    ): FormalContext {
        return FormalContextSchema.parse({ objects, attributes, incidence });
    }

    static analyzeAndLayout(context: FormalContext): Diagram[] {
        // 1. Generate concepts
        const fca = new FCA(context);
        const concepts = fca.generateConcepts();

        // 2. Build ordering (Hasse diagram)
        const ordering = this.buildOrdering(concepts);

        // 3. Assign layers
        const layers = LayerAssignment.longestPath(concepts, ordering);

        // 4. Search for optimal layout
        const search = new HybridLayoutSearch(
            concepts,
            context.attributes,
            ordering,
            layers
        );

        return search.search();
    }

    private static buildOrdering(concepts: Concept[]): number[][] {
        const n = concepts.length;
        const ordering: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i === j) continue;

                // i < j if intent[j] ⊆ intent[i] (more specific)
                const iIsParent = concepts[j].intent.every(attr =>
                    concepts[i].intent.includes(attr)
                );

                if (iIsParent && concepts[i].intent.length < concepts[j].intent.length) {
                    ordering[i][j] = 1;
                }
            }
        }

        return ordering;
    }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

// Example from Figure 1
const exampleContext = ConceptLatticeLayout.createContext(
    ['leech', 'bream', 'frog', 'dog', 'weed', 'reed', 'bean', 'maize'],
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    [
        [1, 1, 0, 0, 0, 0, 1, 0, 0], // leech
        [1, 1, 0, 0, 0, 0, 1, 1, 0], // bream
        [1, 1, 1, 0, 0, 0, 1, 1, 0], // frog
        [1, 0, 1, 0, 0, 0, 1, 1, 1], // dog
        [1, 1, 0, 1, 0, 1, 0, 0, 0], // weed
        [1, 1, 1, 1, 0, 1, 0, 0, 0], // reed
        [1, 0, 1, 1, 1, 0, 0, 0, 0], // bean
        [1, 0, 1, 1, 0, 1, 0, 0, 0], // maize
    ]
);

const diagrams = ConceptLatticeLayout.analyzeAndLayout(exampleContext);

console.log(`Found ${diagrams.length} optimal diagram(s)`);
console.log('First diagram objective vector:', diagrams[0]?.objectiveVector);