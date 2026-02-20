import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./specs/vf/vf.json', 'utf8'));
const graph = data['@graph'];

const classes = graph.filter((n: any) => n['@type'] === 'owl:Class' && !n['owl:unionOf']);
const unionDomains = graph.filter((n: any) => n['@type'] === 'owl:Class' && n['owl:unionOf']);
// Collect all properties
const properties = graph.filter((n: any) => n['@type'] === 'owl:ObjectProperty' || n['@type'] === 'owl:DatatypeProperty');

const classProperties = new Map<string, any[]>();
classes.forEach((c: any) => classProperties.set(c['@id'], []));

function resolveDomains(domainObj: any): string[] {
  if (!domainObj) return [];
  const id = domainObj['@id'];
  if (id) {
    const unionMatch = unionDomains.find((u: any) => u['@id'] === id);
    if (unionMatch) {
      if (Array.isArray(unionMatch['owl:unionOf']['@list'])) {
        return unionMatch['owl:unionOf']['@list'].map((l: any) => l['@id']);
      }
      return [unionMatch['owl:unionOf']['@id']];
    }
    return [id];
  }
  return [];
}

properties.forEach((prop: any) => {
  const domains = resolveDomains(prop['rdfs:domain']);
  domains.forEach(d => {
    if (classProperties.has(d)) {
      classProperties.get(d)!.push(prop);
    }
  });
});

let interfacesCode = `import { z } from 'zod';\n\n`;
let schemasCode = `\n// --- Zod Schemas ---\n\n`;

const validClassNames = new Set(classes.map((c: any) => c['@id'].replace('vf:', '')));

classes.forEach((c: any) => {
  let className = c['@id'].replace('vf:', '');
  if (className === 'https://w3id.org/valueflows/ont/vf') return; // The ontology itself might not be removed
  const props = classProperties.get(c['@id']) || [];

  interfacesCode += `export interface ${className} {\n`;
  interfacesCode += `  id?: string;\n`;

  schemasCode += `export const ${className}Schema: z.ZodType<${className}> = z.lazy(() => z.object({\n`;
  schemasCode += `  id: z.string().url().optional(),\n`;

  props.forEach(p => {
    const pName = p['@id'].replace('vf:', '');
    let zType = 'z.string()';
    let tsType = 'string';
    
    const range = p['rdfs:range'];
    if (range && range['@id']) {
      const typeUri = range['@id'];
      if (typeUri.includes('xsd:string')) {
        zType = 'z.string()';
        tsType = 'string';
      } else if (typeUri.includes('xsd:dateTime')) {
        zType = 'z.string().datetime()';
        tsType = 'string';
      } else if (typeUri.includes('xsd:float') || typeUri.includes('xsd:decimal') || typeUri.includes('xsd:integer')) {
        zType = 'z.number()';
        tsType = 'number';
      } else if (typeUri.includes('xsd:boolean')) {
        zType = 'z.boolean()';
        tsType = 'boolean';
      } else if (typeUri.includes('vf:')) {
        const refTypes = resolveDomains({ '@id': typeUri })
          .map(r => r.replace('vf:', ''))
          .filter(r => validClassNames.has(r));

        if (refTypes.length > 0) {
          const zLazyTypes = refTypes.map(cn => `z.lazy(() => ${cn}Schema)`);
          
          if (refTypes.length > 1) {
            zType = `z.union([z.string(), ${zLazyTypes.join(', ')}])`;
            tsType = `string | ` + refTypes.join(' | ');
          } else {
            zType = `z.union([z.string(), ${zLazyTypes[0]}])`;
            tsType = `string | ${refTypes[0]}`;
          }
        }
      }
    }
    
    interfacesCode += `  ${pName}?: ${tsType};\n`;
    schemasCode += `  ${pName}: ${zType}.optional(),\n`;
  });
  
  interfacesCode += `}\n\n`;
  schemasCode += `}));\n\n`;
});

const generatedCode = interfacesCode + schemasCode;

// Write to a relevant directory
if (!fs.existsSync('./lexicons')) {
  fs.mkdirSync('./lexicons');
}
fs.writeFileSync('./lexicons/vf-schemas.ts', generatedCode);
console.log('Successfully generated complete recursive Zod schemas at ./lexicons/vf-schemas.ts');
