#!/usr/bin/env bun
// Derives and generates HappyView-compatible query and procedure lexicons from record lexicons.
//
// Core insight: every reference property (at-uri, did) on a record type naturally becomes a
// filter parameter on that record's list query. This algorithmically produces all "inverse
// queries" from the VF query naming spec.
//
// Example derivation:
//   EconomicEvent has `provider` (did) and `inputOf` (at-uri)
//   → listEconomicEvents gets `provider` and `inputOf` filter params
//   → VF spec's Agent.economicEventsAsProvider = listEconomicEvents?provider=<did>
//   → VF spec's Process.economicEvents (input) = listEconomicEvents?inputOf=<at-uri>
//
// Three derivable filter patterns:
//   1. Reference filters (at-uri, did) → covers ALL VF inverse queries
//   2. Enum/knownValues filters → covers filtered queries (offers, requests)
//   3. Boolean filters → covers state queries (finished)
//
// Not auto-generated (require hand-crafted logic):
//   - Multi-hop traversals (involvedAgents, trace/track)
//   - Negation queries (unplannedEconomicEvents)
//   - Aggregations (plan.startDate)
//   - Reciprocal queries (reciprocalEvents)
//
// Per record, generates:
//   list${PluralName}.json  — query  (GET  /xrpc/{nsid}) with derived filter params
//   create${Name}.json      — procedure (POST /xrpc/{nsid}) for create + update
//
// Usage:
//   bun scripts/lex-query-lex-gen.ts
//   bun scripts/lex-query-lex-gen.ts --dry-run
//   bun scripts/lex-query-lex-gen.ts --input "lexicons-expanded/openassociation/*.json"
//   bun scripts/lex-query-lex-gen.ts --output lexicons/openassociation

import { join } from "path";
import { mkdirSync } from "fs";
import { Glob } from "bun";

// ─── types ──────────────────────────────────────────────────────────────────

interface LexProp {
  type: string;
  format?: string;
  ref?: string;
  description?: string;
  knownValues?: string[];
  items?: LexProp;
}

interface RecordLexicon {
  lexicon: number;
  id: string;
  defs: {
    main: {
      type: string;
      description?: string;
      key: string;
      record: {
        type: "object";
        required?: string[];
        properties: Record<string, LexProp>;
      };
    };
  };
}

interface FilterParam {
  name: string;
  type: "string" | "boolean";
  format?: string;
  description: string;
  arrayContains?: boolean;
}

// ─── setup ──────────────────────────────────────────────────────────────────

const ROOT = join(import.meta.dir, "..");
const DRY_RUN = Bun.argv.includes("--dry-run");

function getArg(name: string): string | null {
  const idx = Bun.argv.indexOf(name);
  return idx !== -1 && idx + 1 < Bun.argv.length ? Bun.argv[idx + 1] : null;
}

const INPUT_GLOB = getArg("--input") ?? "lexicons/openassociation/*.json";
const OUTPUT_DIR = getArg("--output") ?? "lexicons/openassociation";

// ─── load record lexicons ────────────────────────────────────────────────────

async function loadRecordLexicons(): Promise<RecordLexicon[]> {
  const lexicons: RecordLexicon[] = [];
  const glob = new Glob(INPUT_GLOB);
  for await (const filePath of glob.scan(ROOT)) {
    const data = await Bun.file(join(ROOT, filePath)).json();
    if (data.defs?.main?.type === "record") {
      lexicons.push(data as RecordLexicon);
    }
  }
  return lexicons.sort((a, b) => a.id.localeCompare(b.id));
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function pluralize(name: string): string {
  if (name.endsWith("s") || name.endsWith("sh") || name.endsWith("ch") || name.endsWith("x") || name.endsWith("z")) {
    return name + "es";
  }
  return name + "s";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function nsidGroup(nsid: string): string {
  return nsid.split(".").slice(0, -1).join(".");
}

function nsidName(nsid: string): string {
  return nsid.split(".").pop() ?? "";
}

function outputPath(filename: string): string {
  return join(ROOT, OUTPUT_DIR, filename);
}

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

// ─── derive filter parameters from record properties ──────────────────────────

function deriveFilters(properties: Record<string, LexProp>): FilterParam[] {
  const filters: FilterParam[] = [];

  for (const [name, prop] of Object.entries(properties)) {
    if (prop.type === "string" && prop.format === "at-uri") {
      filters.push({
        name,
        type: "string",
        format: "at-uri",
        description: `Filter by ${name} (AT-URI of referenced record).`,
      });
    } else if (prop.type === "string" && prop.format === "did") {
      filters.push({
        name,
        type: "string",
        format: "did",
        description: `Filter by ${name} (DID of referenced agent).`,
      });
    } else if (prop.type === "array" && prop.items?.type === "string" && prop.items.format === "at-uri") {
      filters.push({
        name,
        type: "string",
        format: "at-uri",
        description: `Filter where ${name} array contains this AT-URI.`,
        arrayContains: true,
      });
    } else if (prop.type === "array" && prop.items?.type === "string" && prop.items.format === "did") {
      filters.push({
        name,
        type: "string",
        format: "did",
        description: `Filter where ${name} array contains this DID.`,
        arrayContains: true,
      });
    } else if (prop.type === "string" && prop.knownValues && prop.knownValues.length > 0) {
      filters.push({
        name,
        type: "string",
        description: `Filter by ${name} value.`,
      });
    } else if (prop.type === "boolean") {
      filters.push({
        name,
        type: "boolean",
        description: `Filter by ${name}.`,
      });
    }
  }

  return filters;
}

// ─── build list query lexicon ─────────────────────────────────────────────────

function buildListQuery(record: RecordLexicon): { filename: string; lexicon: object } {
  const group = nsidGroup(record.id);
  const name = nsidName(record.id);
  const plural = pluralize(name);
  const queryNsid = `${group}.list${capitalize(plural)}`;

  const filters = deriveFilters(record.defs.main.record.properties);

  const paramProps: Record<string, any> = {
    uri: {
      type: "string",
      format: "at-uri",
      description: "Fetch a single record by AT-URI. Other filters are ignored when set.",
    },
  };

  for (const f of filters) {
    const param: Record<string, any> = { type: f.type, description: f.description };
    if (f.format) param.format = f.format;
    paramProps[f.name] = param;
  }

  paramProps.limit = {
    type: "integer",
    minimum: 1,
    maximum: 100,
    default: 50,
    description: "Maximum number of records to return.",
  };
  paramProps.cursor = {
    type: "string",
    description: "Pagination cursor from a previous response.",
  };

  const filterNames = filters.map((f) => f.name);
  const description = filterNames.length > 0
    ? `List ${plural}. Filterable by: ${filterNames.join(", ")}.`
    : `List ${plural}.`;

  return {
    filename: `list${capitalize(plural)}.json`,
    lexicon: {
      lexicon: 1,
      id: queryNsid,
      defs: {
        main: {
          type: "query",
          description,
          parameters: {
            type: "params",
            properties: paramProps,
          },
          output: {
            encoding: "application/json",
          },
        },
      },
    },
  };
}

// ─── build create/update procedure lexicon ────────────────────────────────────

function buildCreateProcedure(record: RecordLexicon): { filename: string; lexicon: object } {
  const group = nsidGroup(record.id);
  const name = nsidName(record.id);
  const procNsid = `${group}.create${capitalize(name)}`;

  return {
    filename: `create${capitalize(name)}.json`,
    lexicon: {
      lexicon: 1,
      id: procNsid,
      defs: {
        main: {
          type: "procedure",
          description: `Create or update ${article(name)} ${name} record. Include \`uri\` in the body to update an existing record.`,
          input: {
            encoding: "application/json",
          },
          output: {
            encoding: "application/json",
          },
        },
      },
    },
  };
}

// ─── main ─────────────────────────────────────────────────────────────────────

const records = await loadRecordLexicons();

console.log("╔══════════════════════════════════════════════════════════════════╗");
console.log("║          HAPPYVIEW QUERY + PROCEDURE LEXICON DERIVATION          ║");
console.log("╚══════════════════════════════════════════════════════════════════╝\n");
console.log(`  Source: ${INPUT_GLOB}`);
console.log(`  Target: ${OUTPUT_DIR}\n`);

if (!DRY_RUN) {
  mkdirSync(join(ROOT, OUTPUT_DIR), { recursive: true });
}

let totalQueries = 0;
let totalProcedures = 0;
let totalFilters = 0;

for (const record of records) {
  const filters = deriveFilters(record.defs.main.record.properties);
  const { filename: queryFile, lexicon: query } = buildListQuery(record);
  const { filename: procFile, lexicon: proc } = buildCreateProcedure(record);

  const queryNsid = (query as any).id;
  const procNsid = (proc as any).id;

  console.log(`  ${record.id}`);
  console.log(`    → ${queryNsid} (query)`);
  if (filters.length > 0) {
    for (const f of filters) {
      const tag = f.format ?? (f.type === "boolean" ? "bool" : "enum");
      const note = f.arrayContains ? " [contains]" : "";
      console.log(`       ${f.name} (${tag})${note}`);
    }
  }
  console.log(`    → ${procNsid} (procedure)`);

  if (!DRY_RUN) {
    await Bun.write(outputPath(queryFile), JSON.stringify(query, null, 2) + "\n");
    await Bun.write(outputPath(procFile), JSON.stringify(proc, null, 2) + "\n");
  }

  totalQueries++;
  totalProcedures++;
  totalFilters += filters.length;
}

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`  Records processed: ${records.length}`);
console.log(`  Queries generated: ${totalQueries}`);
console.log(`  Procedures generated: ${totalProcedures}`);
console.log(`  Total filter params: ${totalFilters}`);
console.log(`  Mode: ${DRY_RUN ? "dry run (no files written)" : "files written to " + OUTPUT_DIR}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
