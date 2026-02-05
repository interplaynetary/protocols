
/**
 * Labor Certificate & Distribution Tests
 * 
 * Verifies the "Double Role of Labor Time" theory from notes.md:
 * 1. Apportionment of time (Planning)
 * 2. Measure of individual share (Distribution)
 * 
 * Specifically tests the "Gotha Program" logic:
 * Total Social Product - Deductions (D1-D6) = Distributable Means of Subsistence
 * Sum(Individual Certificates) MUST EQUAL Value(Distributable Subsistence)
 */

import { describe, it, expect } from "vitest";

// ============================================================================
// MOCK DATA STRUCTURES
// ============================================================================

interface PeriodData {
    periodId: string;
    totalSocialLaborTime: number; // e.g., 1000h

    // Deductions (D1-D6)
    deductions: {
        d1_replacement: number;  // Production inputs used up
        d2_expansion: number;    // Investment in new capacity
        d3_reserves: number;     // Insurance/Risk buffer
        d4_admin: number;        // Organizing social labor
        d5_common: number;       // Healthcare, Education, Parks
        d6_support: number;      // Support for unable to work
    };

    // Workers
    workers: Array<{
        id: string;
        hoursWorked: number;
    }>;
}

// ============================================================================
// LOGIC (To be moved to src/analysis/distribution.ts later)
// ============================================================================

interface DistributionResult {
    totalProductValue: number;
    totalDeductions: number;
    deductionRate: number;
    distributableValue: number;
    certificates: Map<string, number>; // WorkerID -> CertificateHours
    solvencyCheck: boolean; // Does Sum(Certs) == DistributableValue?
}

function calculateDistribution(data: PeriodData): DistributionResult {
    // 1. Total Value Created
    const totalValue = data.totalSocialLaborTime;

    // 2. Calculate Deductions
    const d = data.deductions;
    const totalDeductions =
        d.d1_replacement +
        d.d2_expansion +
        d.d3_reserves +
        d.d4_admin +
        d.d5_common +
        d.d6_support;

    // 3. Deduction Rate (The "Tax")
    const deductionRate = totalDeductions / totalValue;

    // 4. Distributable Value (The Consumption Fund)
    const distributableValue = totalValue - totalDeductions;

    // 5. Issue Certificates
    const certificates = new Map<string, number>();
    let totalCertificatesIssued = 0;

    for (const worker of data.workers) {
        // Method: "The same amount of labor which he has given to society in one form, 
        // he receives back in another." (Marx)
        // BUT "after the deductions have been made".

        // Net Certificate = Gross Hours * (1 - DeductionRate)
        const netHours = worker.hoursWorked * (1 - deductionRate);
        certificates.set(worker.id, netHours);
        totalCertificatesIssued += netHours;
    }

    // 6. Solvency Check: Can the certificates buy all the consumption goods?
    // We expect floating point variance, so use closeTo logic
    const tolerance = 0.00001;
    const isSolvent = Math.abs(totalCertificatesIssued - distributableValue) < tolerance;

    return {
        totalProductValue: totalValue,
        totalDeductions,
        deductionRate,
        distributableValue,
        certificates,
        solvencyCheck: isSolvent
    };
}

// ============================================================================
// TESTS
// ============================================================================

describe("Labor Certificate Distribution", () => {

    it("conserves value: Sum(Certificates) == Total Product - Deductions", () => {
        const period: PeriodData = {
            periodId: "2024-MARCH",
            totalSocialLaborTime: 1000,
            deductions: {
                d1_replacement: 200, // 20%
                d2_expansion: 100,   // 10%
                d3_reserves: 50,     // 5%
                d4_admin: 10,        // 1%
                d5_common: 100,      // 10%
                d6_support: 40       // 4%
            },
            workers: [
                { id: "A", hoursWorked: 100 },
                { id: "B", hoursWorked: 500 },
                { id: "C", hoursWorked: 400 }
            ]
        };
        // Total Worked: 1000h
        // Total Deductions: 500h (50%)
        // Distributable: 500h

        const result = calculateDistribution(period);

        console.log("Deduction Rate:", result.deductionRate);
        console.log("Distributable Value:", result.distributableValue);

        expect(result.deductionRate).toBe(0.5); // 500/1000
        expect(result.distributableValue).toBe(500);

        // Worker A (100h) -> Should get 50h certificate
        expect(result.certificates.get("A")).toBe(50);

        // Worker B (500h) -> Should get 250h certificate
        expect(result.certificates.get("B")).toBe(250);

        // Solvency Check
        expect(result.solvencyCheck).toBe(true);
    });

    it("handles zero deductions (theoretical pure liquidity)", () => {
        const period: PeriodData = {
            periodId: "PURE_MODEL",
            totalSocialLaborTime: 100,
            deductions: {
                d1_replacement: 0, d2_expansion: 0, d3_reserves: 0,
                d4_admin: 0, d5_common: 0, d6_support: 0
            },
            workers: [{ id: "A", hoursWorked: 100 }]
        };

        const result = calculateDistribution(period);

        expect(result.deductionRate).toBe(0);
        expect(result.distributableValue).toBe(100);
        expect(result.certificates.get("A")).toBe(100);
        expect(result.solvencyCheck).toBe(true);
    });

    it("handles high social investment (90% deduction)", () => {
        const period: PeriodData = {
            periodId: "RAPID_INDUSTRIALIZATION",
            totalSocialLaborTime: 1000,
            deductions: {
                d1_replacement: 100,
                d2_expansion: 800, // Massive investment
                d3_reserves: 0, d4_admin: 0, d5_common: 0, d6_support: 0
            },
            workers: [{ id: "A", hoursWorked: 1000 }]
        };

        const result = calculateDistribution(period);

        expect(result.deductionRate).toBe(0.9);
        expect(result.distributableValue).toBe(100); // Only 100h left for consumption
        expect(result.certificates.get("A")).toBeCloseTo(100); // Worker gets 10% of their time back
        expect(result.solvencyCheck).toBe(true);
    });

});
