
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { Node, aggregateUp, aggregateDown, Extractors, Reducers } from "../implementation/aggregation";

describe("Generic Aggregation Logic", () => {

    // Mock Data Graph
    // GroupA has Capacity 100
    // Alice is member of GroupA
    // Bob is member of GroupA

    const nodes: Node[] = [
        {
            id: "group-a",
            type: "Group",
            capacity: 100, // Generic attribute
            tags: ["engineering"]
        },
        {
            id: "alice",
            memberOf: new Set(["group-a"]),
            skills: ["coding"]
        },
        {
            id: "bob",
            memberOf: new Set(["group-a"]),
            skills: ["testing"]
        }
    ];

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const getNode = (id: string) => nodeMap.get(id);
    const getAllNodes = () => nodes;

    it("Upward Aggregation: Inheriting Attribute", () => {
        // Alice aggregates 'capacity' from parents
        const totalCapacity = aggregateUp(
            nodeMap.get("alice")!,
            getNode,
            Extractors.relations("memberOf"), // Topology
            (n) => n.capacity as number, // Extractor
            Reducers.sum,
            0
        );

        expect(totalCapacity).toBe(100);
    });

    it("Downward Aggregation: Collecting Child Attributes", () => {
        // GroupA aggregates 'skills' from children
        const allSkills = aggregateDown(
            nodeMap.get("group-a")!,
            getAllNodes,
            Extractors.relations("memberOf"), // Topology (look for children who have this parent in memberOf)
            (n) => n.skills as string[],
            Reducers.concat,
            [] as string[]
        );

        expect(allSkills).toContain("coding");
        expect(allSkills).toContain("testing");
        expect(allSkills.length).toBe(2);
    });

    it("Complex Reducer: Union of Tags", () => {
        // Bob inherits tags from parents
        const tags = aggregateUp(
            nodeMap.get("bob")!,
            getNode,
            Extractors.relations("memberOf"),
            (n) => n.tags as string[],
            Reducers.union,
            new Set<string>()
        );

        expect(tags.has("engineering")).toBe(true);
    });
    it("Zod Schema Extraction", () => {
        // Define strict schema for a "Certified Node"
        const certifiedSchema = z.object({
            id: z.string(),
            certificationLevel: z.number().min(1)
        });

        const certifiedNode: Node = {
            id: "expert",
            certificationLevel: 5,
            otherJunk: "ignored"
        };

        const uncertifiedNode: Node = {
            id: "novice",
            certificationLevel: 0 // Too low
        };

        const extractor = Extractors.schema(certifiedSchema);

        expect(extractor(certifiedNode)).toEqual({ id: "expert", certificationLevel: 5 });
        expect(extractor(uncertifiedNode)).toBeUndefined();
    });
});

