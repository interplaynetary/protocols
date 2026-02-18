/**
 * gen-expanded-lexicons.ts
 *
 * Reads lexicons-inlined/openassociation/*.json (24 files) and produces
 * lexicons-expanded/openassociation/*.json with three expansions:
 *
 *  1. measure.hasUnit (at-uri → Unit record)
 *        → replaced with unitLabel: string + unitSymbol: string (embedded inline)
 *
 *  2. action (at-uri → Action record)
 *        → replaced with string knownValues enum (fixed vocabulary)
 *
 *  3. resourceConformsTo / conformsTo (at-uri → ResourceSpecification record)
 *        → replaced with { name: string, uri: at-uri } embedded object
 *
 * Schemas affected:
 *   measure.hasUnit  → claim, commitment, economicEvent, economicResource,
 *                      intent, recipeFlow, recipeProcess (7)
 *   action enum      → commitment, economicEvent, intent, claim, recipeFlow (5)
 *   resourceConformsTo → commitment, economicEvent, intent, claim, recipeFlow,
 *                        economicResource (6)
 *
 * Usage: bun scripts/gen-expanded-lexicons.ts
 */

import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const INPUT_DIR = path.resolve(import.meta.dir, "../lexicons-inlined/openassociation");
const OUTPUT_DIR = path.resolve(import.meta.dir, "../lexicons-expanded/openassociation");

// Schemas that become fully redundant once their data is inlined elsewhere
const DROP_SCHEMAS = new Set(["action", "unit"]);

// Fields that carry a reference to a Unit record (at-uri → { unitLabel, unitSymbol })
const UNIT_REF_FIELDS = new Set([
  "unitOfEffort",
  "defaultUnitOfEffort",
  "defaultUnitOfResource",
]);

// Fixed action vocabulary extracted from action.json
const ACTION_KNOWN_VALUES = [
  "accept",
  "cite",
  "combine",
  "consume",
  "copy",
  "deliverService",
  "dropoff",
  "lower",
  "modify",
  "move",
  "pickup",
  "produce",
  "raise",
  "separate",
  "transfer",
  "transferAllRights",
  "transferCustody",
  "use",
  "work",
];

// Field names that carry a resourceConformsTo-style link → ResourceSpecification
const RESOURCE_CONFORMS_FIELDS = new Set(["resourceConformsTo", "conformsTo"]);

/** Replace measure.hasUnit with unitLabel + unitSymbol. Returns true if changed. */
function expandMeasureDef(measureDef: Record<string, unknown>): boolean {
  const props = measureDef.properties as Record<string, unknown> | undefined;
  if (!props || !("hasUnit" in props)) return false;

  delete props.hasUnit;
  props.unitLabel = {
    type: "string",
    description: "The display label of the unit of measure (e.g. 'kilogram', 'hour').",
  };
  props.unitSymbol = {
    type: "string",
    description: "The display symbol of the unit of measure (e.g. 'kg', 'h').",
  };
  return true;
}

/**
 * Walk a properties map and apply the action / resourceConformsTo expansions.
 * Returns a list of change descriptions.
 */
function expandProperties(
  props: Record<string, unknown>,
  changes: string[]
): void {
  for (const [name, rawDef] of Object.entries(props)) {
    if (!rawDef || typeof rawDef !== "object") continue;
    const def = rawDef as Record<string, unknown>;

    // 1. action at-uri → enum
    if (name === "action" && def.type === "string" && def.format === "at-uri") {
      props[name] = {
        type: "string",
        description:
          def.description ?? "The kind of action this flow represents.",
        knownValues: ACTION_KNOWN_VALUES,
      };
      changes.push("action→enum");
      continue;
    }

    // 2. unit at-uri fields → embedded { unitLabel, unitSymbol }
    if (UNIT_REF_FIELDS.has(name) && def.type === "string" && def.format === "at-uri") {
      props[name] = {
        type: "object",
        description: def.description ?? "The unit of measure.",
        properties: {
          unitLabel: {
            type: "string",
            description: "The display label of the unit (e.g. 'kilogram', 'hour').",
          },
          unitSymbol: {
            type: "string",
            description: "The display symbol of the unit (e.g. 'kg', 'h').",
          },
        },
      };
      changes.push(`${name}→{unitLabel,unitSymbol}`);
      continue;
    }

    // 3. resourceConformsTo / conformsTo at-uri → embedded { name, uri }
    if (
      RESOURCE_CONFORMS_FIELDS.has(name) &&
      def.type === "string" &&
      def.format === "at-uri"
    ) {
      props[name] = {
        type: "object",
        description:
          def.description ??
          "The resource specification this resource or flow conforms to.",
        properties: {
          name: {
            type: "string",
            description: "Display name of the resource specification.",
          },
          uri: {
            type: "string",
            format: "at-uri",
            description: "AT-URI link to the ResourceSpecification record.",
          },
        },
      };
      changes.push(`${name}→object`);
      continue;
    }

    // Recurse into nested objects (e.g. union defs)
    if (def.type === "object" && def.properties) {
      expandProperties(def.properties as Record<string, unknown>, changes);
    }
  }
}

/** Apply all expansions to a lexicon in place. Returns change list. */
function expandLexicon(lexicon: Record<string, unknown>): string[] {
  const changes: string[] = [];
  const defs = lexicon.defs as Record<string, unknown> | undefined;
  if (!defs) return changes;

  // Expand measure def
  if (defs.measure) {
    if (expandMeasureDef(defs.measure as Record<string, unknown>)) {
      changes.push("measure.hasUnit→unitLabel+unitSymbol");
    }
  }

  // Expand all other defs
  for (const [defName, rawDef] of Object.entries(defs)) {
    if (defName === "measure") continue;
    const def = rawDef as Record<string, unknown>;

    // Record type
    if (def.type === "record") {
      const record = def.record as Record<string, unknown> | undefined;
      if (record?.properties) {
        expandProperties(record.properties as Record<string, unknown>, changes);
      }
    }
    // Object type
    if (def.type === "object" && def.properties) {
      expandProperties(def.properties as Record<string, unknown>, changes);
    }
  }

  return changes;
}

async function main() {
  const entries = await readdir(INPUT_DIR);
  const jsonFiles = entries.filter((f) => f.endsWith(".json")).sort();

  await mkdir(OUTPUT_DIR, { recursive: true });

  let totalChanges = 0;
  let dropped = 0;

  for (const file of jsonFiles) {
    const name = file.replace(".json", "");

    if (DROP_SCHEMAS.has(name)) {
      console.log(`  [dropped]  ${file} — fully inlined into dependents`);
      dropped++;
      continue;
    }

    const inputPath = path.join(INPUT_DIR, file);
    const lexicon = await Bun.file(inputPath).json();

    const changes = expandLexicon(lexicon);
    totalChanges += changes.length;

    const outputPath = path.join(OUTPUT_DIR, file);
    await Bun.write(outputPath, JSON.stringify(lexicon, null, 2) + "\n");

    if (changes.length > 0) {
      console.log(`  [expanded] ${file}`);
      for (const c of changes) console.log(`             • ${c}`);
    } else {
      console.log(`  [clean]    ${file}`);
    }
  }

  const emitted = jsonFiles.length - dropped;
  console.log(`\nSummary:`);
  console.log(`  Input:   ${jsonFiles.length} files`);
  console.log(`  Dropped: ${dropped} (action, unit — fully inlined)`);
  console.log(`  Output:  ${emitted} files`);
  console.log(`  Changes: ${totalChanges} field expansions`);
  console.log(`  Path:    ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
