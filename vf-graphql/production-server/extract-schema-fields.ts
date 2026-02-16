#!/usr/bin/env bun

/**
 * Ultra-Rigorous Schema Field Extractor
 * 
 * Extracts ALL types and fields from GraphQL schema files
 * for comprehensive verification against implementation.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface Field {
  name: string;
  type: string;
  isArray: boolean;
  isRequired: boolean;
  description?: string;
}

interface TypeDef {
  name: string;
  kind: 'type' | 'input' | 'interface' | 'enum' | 'union' | 'scalar';
  fields: Field[];
  description?: string;
}

function extractTypes(content: string, filename: string): TypeDef[] {
  const types: TypeDef[] = [];
  const lines = content.split('\n');
  
  let currentType: TypeDef | null = null;
  let currentDescription = '';
  let inBlockComment = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Handle block comments
    if (line.startsWith('"""')) {
      if (inBlockComment) {
        inBlockComment = false;
        currentDescription = '';
      } else {
        inBlockComment = true;
      }
      continue;
    }
    
    if (inBlockComment) {
      currentDescription += line + ' ';
      continue;
    }
    
    // Handle line comments
    if (line.startsWith('#')) {
      continue;
    }
    
    // Detect type definitions
    const typeMatch = line.match(/^(type|input|interface|enum|union|scalar)\s+(\w+)/);
    if (typeMatch) {
      // Save previous type
      if (currentType) {
        types.push(currentType);
      }
      
      const [, kind, name] = typeMatch;
      currentType = {
        name,
        kind: kind as any,
        fields: [],
        description: currentDescription.trim() || undefined
      };
      currentDescription = '';
      continue;
    }
    
    // Detect fields within types
    if (currentType && line.includes(':') && !line.startsWith('}')) {
      const fieldMatch = line.match(/^\s*(\w+)(\([^)]*\))?:\s*(\[?)([^!\]]+)(!?)(\]?)(!?)/);
      if (fieldMatch) {
        const [, name, , openBracket, type, innerRequired, closeBracket, outerRequired] = fieldMatch;
        currentType.fields.push({
          name,
          type: type.trim(),
          isArray: !!openBracket,
          isRequired: !!outerRequired || !!innerRequired
        });
      }
    }
    
    // End of type definition
    if (line === '}' && currentType) {
      types.push(currentType);
      currentType = null;
    }
  }
  
  // Save last type
  if (currentType) {
    types.push(currentType);
  }
  
  return types;
}

function getAllSchemaFiles(dir: string): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    const items = readdirSync(currentDir);
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.gql')) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files.sort();
}

// Main execution
const schemasDir = '/home/ruzgar/Programs/rea/atREA/vf-graphql/lib/schemas';
const allFiles = getAllSchemaFiles(schemasDir);

console.log(`Found ${allFiles.length} schema files\n`);

const allTypes: Map<string, { file: string; def: TypeDef }> = new Map();

for (const file of allFiles) {
  const content = readFileSync(file, 'utf-8');
  const types = extractTypes(content, file);
  
  for (const type of types) {
    const existing = allTypes.get(type.name);
    if (existing && type.kind === 'type') {
      // Merge fields from bridging files
      for (const field of type.fields) {
        if (!existing.def.fields.find(f => f.name === field.name)) {
          existing.def.fields.push(field);
        }
      }
    } else {
      allTypes.set(type.name, { file, def: type });
    }
  }
}

// Output results
console.log('='.repeat(80));
console.log('ALL TYPES AND FIELDS EXTRACTED');
console.log('='.repeat(80));
console.log();

const typesByKind = new Map<string, TypeDef[]>();
for (const { def } of allTypes.values()) {
  const kind = def.kind;
  if (!typesByKind.has(kind)) {
    typesByKind.set(kind, []);
  }
  typesByKind.get(kind)!.push(def);
}

for (const [kind, types] of Array.from(typesByKind.entries()).sort()) {
  console.log(`\n## ${kind.toUpperCase()}S (${types.length})\n`);
  
  for (const type of types.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`### ${type.name}`);
    if (type.fields.length > 0) {
      for (const field of type.fields.sort((a, b) => a.name.localeCompare(b.name))) {
        const arrayMarker = field.isArray ? '[]' : '';
        const requiredMarker = field.isRequired ? '!' : '';
        console.log(`  - ${field.name}: ${field.type}${arrayMarker}${requiredMarker}`);
      }
    }
    console.log();
  }
}

console.log('\n' + '='.repeat(80));
console.log(`TOTAL: ${allTypes.size} types across ${allFiles.length} files`);
console.log('='.repeat(80));
