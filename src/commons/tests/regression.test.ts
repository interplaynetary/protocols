
import { describe, it, expect } from "vitest";
import { computeWorkTypeIntensity, Operation } from "../implementation/commons";

describe("Statistical Intensity Analysis (Linear Regression)", () => {
    it("Correctly identifies intensity factors from mixed work patterns", () => {
        // Scenario:
        // Week 1: Worker A does 10h Gardening (Low Intensity) + 0h Mining
        // Week 2: Worker A does 0h Gardening + 10h Mining (High Intensity)
        // Week 3: Worker A does 5h Gardening + 5h Mining

        // Assume:
        // Gardening Intensity = 1.0 (Basic) -> 10h needs 10h reproduction
        // Mining Intensity = 2.0 (Heavy) -> 10h needs 20h reproduction

        const timestamp1 = new Date("2024-01-01"); // Week 1
        const timestamp2 = new Date("2024-01-08"); // Week 2
        const timestamp3 = new Date("2024-01-15"); // Week 3

        const operations: Operation[] = [
            // Week 1: 10h Garden
            {
                id: "OP1", timestamp: timestamp1, totalSocialTime: 10,
                inputsProducts: [],
                inputsLabor: [{ individualId: "A", hours: 10, workType: "gardening" }],
                effects: []
            },
            // Week 2: 10h Mining
            {
                id: "OP2", timestamp: timestamp2, totalSocialTime: 10,
                inputsProducts: [],
                inputsLabor: [{ individualId: "A", hours: 10, workType: "mining" }],
                effects: []
            },
            // Week 3: 5h Garden (Scale variance to fix singularity with intercept)
            {
                id: "OP3", timestamp: timestamp3, totalSocialTime: 5,
                inputsProducts: [],
                inputsLabor: [{ individualId: "A", hours: 5, workType: "gardening" }],
                effects: []
            },
            // Week 4: 5h Garden + 5h Mining
            {
                id: "OP4", timestamp: new Date("2024-01-22"), totalSocialTime: 10,
                inputsProducts: [],
                inputsLabor: [
                    { individualId: "A", hours: 5, workType: "gardening" },
                    { individualId: "A", hours: 5, workType: "mining" }
                ],
                effects: []
            }
        ];

        const reproductionOperations: Operation[] = [
            // Week 1: Consumed 10 units (intensity 1.0 * 10h)
            {
                id: "REP1", timestamp: timestamp1, totalSocialTime: 10,
                description: "Week 1 Food",
                inputsProducts: [], inputsLabor: [{ individualId: "A", hours: 0 }],
                effects: []
            } as any,
            // Week 2: Consumed 20 units (intensity 2.0 * 10h)
            {
                id: "REP2", timestamp: timestamp2, totalSocialTime: 20,
                description: "Week 2 Food",
                inputsProducts: [], inputsLabor: [{ individualId: "A", hours: 0 }],
                effects: []
            } as any,
            // Week 3: Consumed 5 units (1.0*5 = 5)
            {
                id: "REP3", timestamp: timestamp3, totalSocialTime: 5,
                description: "Week 3 Food",
                inputsProducts: [], inputsLabor: [{ individualId: "A", hours: 0 }],
                effects: []
            } as any,
            // Week 4: Consumed 15 units (1.0*5 + 2.0*5 = 15)
            {
                id: "REP4", timestamp: new Date("2024-01-22"), totalSocialTime: 15,
                description: "Week 4 Food",
                inputsProducts: [], inputsLabor: [{ individualId: "A", hours: 0 }],
                effects: []
            } as any
        ];

        const intensities = computeWorkTypeIntensity(operations, reproductionOperations);

        console.log("Computed Intensities:", intensities);

        // Allow small floating point error
        expect(intensities["gardening"]).toBeCloseTo(1.0, 1);
        expect(intensities["mining"]).toBeCloseTo(2.0, 1);
    });
});
