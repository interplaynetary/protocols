#!/usr/bin/env bun
/**
 * Generates trait-group zip files for bisecting GraphQL upload issues.
 *
 * Each group isolates one structural trait present in the lexicons so you can
 * upload them one-by-one and find which trait triggers the server error.
 *
 * Trait taxonomy (derived from analysing all 25 lexicons):
 *
 *   T1  knownValues           — string fields with a closed/open value list
 *   T2  defs-only             — lexicon file with no "main" def (shared types)
 *   T3  type:ref              — property that embeds another def via $ref
 *   T4  format:did            — scalar DID string (agent reference)
 *   T5  format:datetime       — ISO-8601 datetime string
 *   T6  format:uri            — bare URI string (not at-uri)
 *   T7  array[at-uri]         — array whose items are at-uri strings
 *   T8  array[did]            — array whose items are DID strings
 *   T9  array[uri]            — array whose items are bare URI strings
 *   T10 array[string]         — plain string arrays (classifiedAs / tags)
 *   T11 required              — record has a required field list
 *   T12 boolean               — boolean properties
 *   T13 integer               — integer properties (only inside defs#measure)
 */

import { mkdirSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dir, "..");
const LEX  = "lexicons/openassociation";
const OUT  = join(ROOT, "trait-groups");

mkdirSync(OUT, { recursive: true });

// ── helpers ───────────────────────────────────────────────────────────────────

function p(rel: string) { return join(ROOT, LEX, rel); }

// ── group definitions ─────────────────────────────────────────────────────────
// Each entry: [group-name, description, ...files-relative-to-lexicons/openassociation]
// Files are listed verbosely so the trait(s) each adds are obvious.

const groups: [string, string, string[]][] = [

  // ── Group 1: baseline ────────────────────────────────────────────────────────
  // action.json alone is confirmed working.  Add defs.json to give the server
  // the shared Measure type definition.
  // Traits: T1(knownValues), T11(required), T2(defs-only)
  [
    "01-baseline",
    "T1:knownValues  T11:required  T2:defs-only (action + defs)",
    [
      "knowledge/action.json",
      "defs.json",
    ],
  ],

  // ── Group 2: plain records ───────────────────────────────────────────────────
  // Only basic string / boolean / format:uri fields, no refs / did / datetime /
  // arrays-of-at-uri.
  // Adds over baseline: T6(format:uri), maxGraphemes, no-required records.
  [
    "02-plain-records",
    "T6:format:uri  plain strings  maxGraphemes  (no refs/did/datetime)",
    [
      "knowledge/action.json",
      "defs.json",
      "knowledge/spatialThing.json",         // plain strings only
      "knowledge/processSpecification.json", // format:uri + maxGraphemes
      "knowledge/unit.json",                 // format:uri + T10:array[string] + T11:required
    ],
  ],

  // ── Group 3: refs to defs#measure ────────────────────────────────────────────
  // Introduces type:ref properties that point to defs#measure.
  // T3:ref  (requires defs.json to resolve)
  [
    "03-refs-measure",
    "T3:type:ref → defs#measure  (recipeFlow, recipeProcess)",
    [
      "defs.json",
      "knowledge/action.json",
      "knowledge/unit.json",
      "knowledge/recipeFlow.json",     // T3:ref, T11:required, at-uri scalar
      "knowledge/recipeProcess.json",  // T3:ref, T7:array[at-uri], T10:array[string]
    ],
  ],

  // ── Group 4: scalar DID ───────────────────────────────────────────────────────
  // Introduces format:did as a scalar property.  No arrays of DID yet.
  // T4:format:did
  [
    "04-did-scalar",
    "T4:format:did scalar  (person, org, ecologicalAgent)",
    [
      "knowledge/action.json",
      "observation/person.json",          // at-uri + format:uri + T4:did(primaryLocation is at-uri)
      "observation/organization.json",    // same shape
      "observation/ecologicalAgent.json", // same + T10:array[string]
    ],
  ],

  // ── Group 5: datetime ────────────────────────────────────────────────────────
  // Introduces format:datetime.  batchLotRecord is the simplest case (1 field).
  // T5:format:datetime
  [
    "05-datetime",
    "T5:format:datetime  (batchLotRecord simplest, then plan+agreementBundle)",
    [
      "knowledge/action.json",
      "observation/batchLotRecord.json", // 1 datetime field, nothing else exotic
      "planning/plan.json",              // datetime + T7:array[at-uri]
      "planning/agreementBundle.json",   // datetime + T7:array[at-uri]
    ],
  ],

  // ── Group 6: array[at-uri] ───────────────────────────────────────────────────
  // Introduces type:array whose items have format:at-uri.
  // T7:array[at-uri]
  [
    "06-array-aturi",
    "T7:type:array items.format:at-uri  (recipe, recipeExchange, agreementBundle)",
    [
      "knowledge/action.json",
      "knowledge/recipe.json",           // primaryOutput(at-uri) + recipeIncludes(array)
      "knowledge/recipeExchange.json",   // two arrays of at-uri, nothing else
      "planning/agreementBundle.json",   // datetime + bundles array
    ],
  ],

  // ── Group 7: array[did] ───────────────────────────────────────────────────────
  // Introduces type:array whose items have format:did.
  // T8:array[did]
  [
    "07-array-did",
    "T8:type:array items.format:did  (proposal.proposedTo, proposalList.proposedTo)",
    [
      "knowledge/action.json",
      "planning/proposal.json",     // proposedTo:array[did] + datetime + knownValues + T7
      "planning/proposalList.json", // proposedTo:array[did] + datetime + T7
    ],
  ],

  // ── Group 8: array[uri] ───────────────────────────────────────────────────────
  // Introduces type:array whose items have format:uri (image lists).
  // T9:array[uri]
  [
    "08-array-uri",
    "T9:type:array items.format:uri  (resourceSpecification.imageList)",
    [
      "knowledge/action.json",
      "knowledge/resourceSpecification.json", // imageList:array[uri] + T10 + T6 + booleans
    ],
  ],

  // ── Group 9: boolean ─────────────────────────────────────────────────────────
  // Isolates boolean properties (mediumOfExchange, substitutable, finished, unitBased).
  // T12:boolean
  [
    "09-booleans",
    "T12:boolean  (resourceSpecification, process, proposal)",
    [
      "knowledge/action.json",
      "knowledge/resourceSpecification.json", // mediumOfExchange, substitutable
      "planning/process.json",                // finished
      "planning/proposal.json",               // unitBased
    ],
  ],

  // ── Group 10: extra knownValues ──────────────────────────────────────────────
  // Tests knownValues on a non-action record (proposal.purpose).
  // T1:knownValues on a record other than action
  [
    "10-knownvalues-non-action",
    "T1:knownValues on non-action record  (proposal.purpose)",
    [
      "knowledge/action.json",
      "planning/proposal.json", // purpose: knownValues:["offer","request"]
    ],
  ],

  // ── Group 11: all knowledge ───────────────────────────────────────────────────
  [
    "11-all-knowledge",
    "All knowledge/ files + defs.json",
    [
      "defs.json",
      "knowledge/action.json",
      "knowledge/spatialThing.json",
      "knowledge/processSpecification.json",
      "knowledge/unit.json",
      "knowledge/resourceSpecification.json",
      "knowledge/recipe.json",
      "knowledge/recipeProcess.json",
      "knowledge/recipeFlow.json",
      "knowledge/recipeExchange.json",
    ],
  ],

  // ── Group 12: all planning ────────────────────────────────────────────────────
  [
    "12-all-planning",
    "All planning/ files + action.json + defs.json",
    [
      "defs.json",
      "knowledge/action.json",
      "planning/plan.json",
      "planning/intent.json",
      "planning/proposal.json",
      "planning/proposalList.json",
      "planning/commitment.json",
      "planning/agreement.json",
      "planning/agreementBundle.json",
      "planning/claim.json",
      "planning/process.json",
    ],
  ],

  // ── Group 13: all observation ─────────────────────────────────────────────────
  [
    "13-all-observation",
    "All observation/ files + action.json + defs.json",
    [
      "defs.json",
      "knowledge/action.json",
      "knowledge/unit.json",
      "observation/person.json",
      "observation/organization.json",
      "observation/ecologicalAgent.json",
      "observation/economicResource.json",
      "observation/economicEvent.json",
      "observation/batchLotRecord.json",
    ],
  ],

  // ── Group 14: full ────────────────────────────────────────────────────────────
  [
    "14-full",
    "All 25 lexicons — the full set that currently fails",
    [
      "defs.json",
      "knowledge/action.json",
      "knowledge/spatialThing.json",
      "knowledge/processSpecification.json",
      "knowledge/unit.json",
      "knowledge/resourceSpecification.json",
      "knowledge/recipe.json",
      "knowledge/recipeProcess.json",
      "knowledge/recipeFlow.json",
      "knowledge/recipeExchange.json",
      "planning/plan.json",
      "planning/intent.json",
      "planning/proposal.json",
      "planning/proposalList.json",
      "planning/commitment.json",
      "planning/agreement.json",
      "planning/agreementBundle.json",
      "planning/claim.json",
      "planning/process.json",
      "observation/person.json",
      "observation/organization.json",
      "observation/ecologicalAgent.json",
      "observation/economicResource.json",
      "observation/economicEvent.json",
      "observation/batchLotRecord.json",
    ],
  ],
];

// ── generate zips ─────────────────────────────────────────────────────────────

console.log(`\nGenerating ${groups.length} trait-group zip files → ${OUT}\n`);

let ok = 0;
let fail = 0;

for (const [name, desc, files] of groups) {
  const zipPath = join(OUT, `${name}.zip`);
  const absPaths = files.map((f) => p(f));

  // verify all source files exist before zipping
  const missing = absPaths.filter((fp) => !Bun.file(fp).size);
  if (missing.length) {
    console.error(`✗ ${name}: missing files:\n  ${missing.join("\n  ")}`);
    fail++;
    continue;
  }

  const result = await Bun.$`zip -j ${zipPath} ${absPaths}`.quiet().nothrow();
  if (result.exitCode !== 0) {
    console.error(`✗ ${name}: zip failed\n${result.stderr.toString()}`);
    fail++;
    continue;
  }

  console.log(`✓ ${name}.zip  (${files.length} files)`);
  console.log(`    ${desc}`);
  ok++;
}

console.log(`\n${ok} created, ${fail} failed.`);
console.log(`\nTrait legend:`);
console.log(`  T1  knownValues`);
console.log(`  T2  defs-only (no main def)`);
console.log(`  T3  type:ref → defs#measure`);
console.log(`  T4  format:did scalar`);
console.log(`  T5  format:datetime`);
console.log(`  T6  format:uri (bare URI)`);
console.log(`  T7  type:array items.format:at-uri`);
console.log(`  T8  type:array items.format:did`);
console.log(`  T9  type:array items.format:uri`);
console.log(`  T10 type:array items.type:string (plain)`);
console.log(`  T11 required field list`);
console.log(`  T12 boolean`);
console.log(`  T13 integer (inside defs#measure only)`);
