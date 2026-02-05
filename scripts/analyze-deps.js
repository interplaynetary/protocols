#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';

const srcDir = process.argv[2] || 'src';
const allFiles = [];

// Recursively find all .ts files
function findTsFiles(dir) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            findTsFiles(fullPath);
        } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
            allFiles.push(fullPath);
        }
    }
}

findTsFiles(srcDir);

// Build dependency graph
const importedBy = new Map(); // file -> Set of files that import it
const imports = new Map(); // file -> Set of files it imports

for (const file of allFiles) {
    imports.set(file, new Set());
}

for (const file of allFiles) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
        // Match import/export from statements
        const match = line.match(/(?:import|export).*from\s+['"]([^'"]+)['"]/);
        if (match) {
            let importPath = match[1];

            // Skip external packages
            if (!importPath.startsWith('.')) continue;

            // Remove .js extension if present
            importPath = importPath.replace(/\.js$/, '');

            // Resolve relative path
            const fileDir = dirname(file);
            let resolvedPath = join(fileDir, importPath);

            // Try adding .ts extension
            if (!resolvedPath.endsWith('.ts')) {
                resolvedPath += '.ts';
            }

            // Normalize path
            resolvedPath = resolvedPath.replace(/\\/g, '/');

            if (allFiles.includes(resolvedPath)) {
                imports.get(file).add(resolvedPath);

                if (!importedBy.has(resolvedPath)) {
                    importedBy.set(resolvedPath, new Set());
                }
                importedBy.get(resolvedPath).add(file);
            }
        }
    }
}

// Find files that are never imported
const neverImported = [];
const testFiles = allFiles.filter(f => f.includes('.test.ts'));
const nonTestFiles = allFiles.filter(f => !f.includes('.test.ts') && !f.includes('__tests__'));

for (const file of nonTestFiles) {
    const importers = importedBy.get(file);
    if (!importers || importers.size === 0) {
        // Check if it's an entry point
        const isEntryPoint = file.endsWith('/index.ts') ||
            file === 'src/index.ts' ||
            file === 'src/schemas.ts' ||
            file === 'src/allocation.ts' ||
            file === 'src/distribution.ts' ||
            file === 'src/tree.ts' ||
            file === 'src/itc.ts' ||
            file === 'src/config.ts';

        if (!isEntryPoint) {
            neverImported.push(file);
        }
    }
}

// Output results
console.log('=== DEPENDENCY ANALYSIS ===\n');
console.log(`Total files: ${allFiles.length}`);
console.log(`Test files: ${testFiles.length}`);
console.log(`Non-test files: ${nonTestFiles.length}`);
console.log(`\nFiles never imported (excluding entry points): ${neverImported.length}\n`);

if (neverImported.length > 0) {
    console.log('POTENTIALLY UNUSED FILES:');
    for (const file of neverImported.sort()) {
        console.log(`  - ${file}`);
    }
    console.log('');
}

// Show import counts for all files
console.log('\n=== IMPORT STATISTICS ===\n');
const fileStats = nonTestFiles.map(file => ({
    file,
    importedBy: importedBy.get(file)?.size || 0,
    imports: imports.get(file)?.size || 0
})).sort((a, b) => a.importedBy - b.importedBy);

console.log('Files sorted by number of importers (least to most):');
for (const stat of fileStats) {
    const relativePath = relative(srcDir, stat.file);
    console.log(`  ${stat.importedBy.toString().padStart(3)} importers | ${stat.imports.toString().padStart(2)} imports | ${relativePath}`);
}

// Show detailed dependency tree for specific files
console.log('\n=== DETAILED DEPENDENCIES ===\n');
for (const file of neverImported.slice(0, 10)) {
    const relativePath = relative(srcDir, file);
    console.log(`\n${relativePath}:`);
    const deps = imports.get(file);
    if (deps && deps.size > 0) {
        console.log('  Imports:');
        for (const dep of deps) {
            console.log(`    - ${relative(srcDir, dep)}`);
        }
    } else {
        console.log('  (no imports)');
    }
}
