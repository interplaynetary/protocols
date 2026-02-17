#!/usr/bin/env bun
import { join, dirname, basename, relative } from "path";
import { mkdirSync, existsSync } from "fs";
import { Glob } from "bun";

const ROOT = join(import.meta.dir, "..");
const LEXICONS_DIR = join(ROOT, "lexicons");
const DOCS_DIR = join(ROOT, "docs", "lexicons");

interface Lexicon {
  lexicon: number;
  id: string;
  defs: Record<string, any>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pluralize(name: string): string {
  if (name.endsWith("s") || name.endsWith("sh") || name.endsWith("ch") || name.endsWith("x") || name.endsWith("z")) {
    return name + "es";
  }
  return name + "s";
}

function getQueryNameForRecord(recordId: string): string {
  const parts = recordId.split(".");
  const name = parts.pop()!;
  const plural = pluralize(name);
  return [...parts, `list${capitalize(plural)}`].join(".");
}

// ─── Markdown Generation ─────────────────────────────────────────────────────

function renderSchema(schema: any, indent = ""): string {
  if (!schema) return "";
  let md = "";

  if (schema.type === "record") {
    md += `${indent}- **Type**: \`record\`\n`;
    if (schema.description) md += `${indent}- **Description**: ${schema.description}\n`;
    md += renderSchema(schema.record, indent);
  } else if (schema.type === "query" || schema.type === "procedure") {
    md += `${indent}- **Type**: \`${schema.type}\`\n`;
    if (schema.description) md += `${indent}- **Description**: ${schema.description}\n`;
    if (schema.parameters) {
      md += `${indent}- **Parameters**:\n`;
      md += renderSchema(schema.parameters, indent + "  ");
    }
    if (schema.output) {
      md += `${indent}- **Output** (${schema.output.encoding}):\n`;
      md += renderSchema(schema.output.schema, indent + "  ");
    }
  } else if (schema.type === "object" || schema.type === "params") {
    if (schema.properties) {
      for (const [prop, details] of Object.entries(schema.properties as Record<string, any>)) {
        const required = schema.required?.includes(prop) ? " (Required)" : "";
        md += `${indent}- \`${prop}\`${required}: ${details.type}${details.format ? ` (${details.format})` : ""}\n`;
        if (details.description) md += `${indent}  - ${details.description}\n`;
        if (details.knownValues) {
          md += `${indent}  - **Known Values**: ${details.knownValues.map((v: any) => `\`${v}\``).join(", ")}\n`;
        }
        if (details.type === "array" && details.items) {
          md += `${indent}  - **Items**:\n`;
          md += renderSchema(details.items, indent + "    ");
        }
      }
    }
  } else if (schema.type === "array") {
     md += `${indent}- **Type**: \`array\`\n`;
     if (schema.items) {
       md += `${indent}- **Items**:\n`;
       md += renderSchema(schema.items, indent + "  ");
     }
  } else {
    md += `${indent}- **Type**: \`${schema.type}\`\n`;
    if (schema.description) md += `${indent}- **Description**: ${schema.description}\n`;
  }

  return md;
}

function generateMarkdown(id: string, lexicons: Lexicon[]): string {
  let md = `# ${id}\n\n`;

  for (const lex of lexicons) {
    for (const [defName, def] of Object.entries(lex.defs)) {
      const anchor = defName === "main" ? "" : ` (${defName})`;
      md += `## ${def.type === "record" || def.type === "query" ? capitalize(def.type) : capitalize(defName)}${anchor}\n\n`;
      if (defName === "main") {
        md += `**ID**: \`${lex.id}\`\n\n`;
      }
      md += renderSchema(def);
      md += "\n---\n\n";
    }
  }

  return md;
}

// ─── Main Logic ─────────────────────────────────────────────────────────────

async function main() {
  const glob = new Glob("**/*.json");
  const lexiconMap = new Map<string, Lexicon>();
  const allFiles: string[] = [];

  // Cleanup
  if (existsSync(DOCS_DIR)) {
    const rm = new Glob("**/*");
    for (const file of rm.scanSync(DOCS_DIR)) {
      // Bun.file(join(DOCS_DIR, file)).delete(); // delete is not on Bun.file
    }
    // Simple way to clean up
    require("child_process").execSync(`rm -rf ${DOCS_DIR}/*`);
  }

  mkdirSync(DOCS_DIR, { recursive: true });

  for await (const file of glob.scan(LEXICONS_DIR)) {
    allFiles.push(file);
    try {
      const content = await Bun.file(join(LEXICONS_DIR, file)).json();
      lexiconMap.set(content.id, content);
    } catch (e) {
      console.error(`Error parsing ${file}:`, e);
    }
  }

  const processedIds = new Set<string>();
  const records = Array.from(lexiconMap.values()).filter(l => l.defs.main?.type === "record");
  const others = Array.from(lexiconMap.values()).filter(l => l.defs.main?.type !== "record");

  // First pass: Process records and their associated queries
  for (const lexicon of records) {
    if (processedIds.has(lexicon.id)) continue;

    const queryId = getQueryNameForRecord(lexicon.id);
    const relatedLexicons: Lexicon[] = [lexicon];
    processedIds.add(lexicon.id);

    if (lexiconMap.has(queryId)) {
      relatedLexicons.push(lexiconMap.get(queryId)!);
      processedIds.add(queryId);
    }

    // Determine output path based on the primary lexicon ID
    const parts = lexicon.id.split(".");
    const outDir = join(DOCS_DIR, ...parts.slice(0, -1));
    const outName = parts.pop()! + ".md";
    const outPath = join(outDir, outName);

    mkdirSync(outDir, { recursive: true });
    
    const markdown = generateMarkdown(lexicon.id, relatedLexicons);
    await Bun.write(outPath, markdown);
    console.log(`Generated: ${relative(ROOT, outPath)}`);
  }

  // Second pass: Process everything else as standalone
  for (const lexicon of others) {
    if (processedIds.has(lexicon.id)) continue;

    const parts = lexicon.id.split(".");
    const outDir = join(DOCS_DIR, ...parts.slice(0, -1));
    const outName = parts.pop()! + ".md";
    const outPath = join(outDir, outName);

    mkdirSync(outDir, { recursive: true });

    const markdown = generateMarkdown(lexicon.id, [lexicon]);
    await Bun.write(outPath, markdown);
    console.log(`Generated (Standalone): ${relative(ROOT, outPath)}`);
    processedIds.add(lexicon.id);
  }
}

main().catch(console.error);

/*
claude "Please read the files in docs/lexicons and enhance them with more descriptive text context based on the ValueFlows spec. Focus on making them user-friendly."
*/