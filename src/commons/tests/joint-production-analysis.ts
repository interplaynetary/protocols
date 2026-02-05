
/**
 * Joint Production Logic Analysis
 * 
 * This script simulates two economic models to answer the user's question:
 * "Is splitting labor time across joint outputs logical?"
 * 
 * Scenario:
 * - 1 Worker works 10 hours.
 * - Produces: 100kg Wheat AND 200kg Straw.
 * - Consumption: 
 *   - Baker uses 100kg Wheat to make Bread (2h labor).
 *   - Farmer uses 200kg Straw to make Bedding (1h labor).
 * 
 * We track "Total Embodied Labor" in the final products vs "Actual Social Labor Performed".
 */

function runSimulation() {
    console.log("=== JOINT PRODUCTION SIMULATION ===\n");
    console.log("Initial State:");
    console.log("- Labor Performed: 10 hours (Harvesting)");
    console.log("------------------------------------------");

    // MODEL A: NO SPLITTING (Current Implementation)
    // Both outputs inherit the FULL cost because they both "required" the 10h.
    console.log("\n[Model A] No Splitting (Marginal Cost View)");

    const wheatEmbodied_A = 10; // "It took 10h to get this wheat"
    const strawEmbodied_A = 10; // "It took 10h to get this straw"

    console.log(`- Wheat Value: ${wheatEmbodied_A}h`);
    console.log(`- Straw Value: ${strawEmbodied_A}h`);
    console.log(`- Total Value Created: ${wheatEmbodied_A + strawEmbodied_A}h`);
    console.log(`- Labor Tokens Earned by Worker: 10h`);
    console.log(`- FAILURE: Total Value (20h) > Labor Tokens (10h)`);
    console.log(`  -> Result: Deflation/Crisis. There are 20h worth of goods but only 10h of purchasing power.`);

    // MODEL B: SPLITTING (Accounting View)
    // We split the 10h based on some key (e.g., Utility/Price).
    // Let's say Wheat is 80% of utility, Straw is 20%.
    console.log("\n[Model B] Allocation Splitting (Conservation View)");

    const splitKey = 0.8;
    const wheatEmbodied_B = 10 * splitKey;       // 8h
    const strawEmbodied_B = 10 * (1 - splitKey); // 2h

    console.log(`- Wheat Value: ${wheatEmbodied_B}h (80% allocation)`);
    console.log(`- Straw Value: ${strawEmbodied_B}h (20% allocation)`);
    console.log(`- Total Value Created: ${wheatEmbodied_B + strawEmbodied_B}h`);
    console.log(`- Labor Tokens Earned by Worker: 10h`);
    console.log(`- SUCCESS: Total Value (10h) == Labor Tokens (10h)`);
    console.log(`  -> Result: Stability. Every hour worked creates exactly one hour of claim on goods.`);

    // DOWNSTREAM CONSEQUENCES
    console.log("\n[Downstream Impact]");
    const breadLabor = 2;
    const beddingLabor = 1;

    const breadValue_A = wheatEmbodied_A + breadLabor; // 10 + 2 = 12
    const beddingValue_A = strawEmbodied_A + beddingLabor; // 10 + 1 = 11

    const breadValue_B = wheatEmbodied_B + breadLabor; // 8 + 2 = 10
    const beddingValue_B = strawEmbodied_B + beddingLabor; // 2 + 1 = 3

    console.log(`Model A Final Costs: Bread=${breadValue_A}h, Bedding=${beddingValue_A}h. Total Society Cost = 23h.`);
    console.log(`Model B Final Costs: Bread=${breadValue_B}h, Bedding=${beddingValue_B}h. Total Society Cost = 13h.`);
    console.log(`Actual Labor Performed: 10h (Harvest) + 2h (Bake) + 1h (Bedding) = 13h.`);

    console.log("\nCONCLUSION:");
    if ((breadValue_B + beddingValue_B) === 13) {
        console.log("✅ Model B (Splitting) matches the Actual Labor Performed (13h).");
        console.log("❌ Model A (No Splitting) hallucinates 10 extra hours of value.");
    }
}

runSimulation();
