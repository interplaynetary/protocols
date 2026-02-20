import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./specs/vf/vf.json', 'utf8'));
const graph = data['@graph'];

const classes = graph.filter((n: any) => n['@type'] === 'owl:Class' && !n['owl:unionOf']);
const unionDomains = graph.filter((n: any) => n['@type'] === 'owl:Class' && n['owl:unionOf']);
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

const jsonSchema: any = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $defs: {}
};

classes.forEach((c: any) => {
  let className = c['@id'].replace('vf:', '');
  if (className === 'https://w3id.org/valueflows/ont/vf') return;
  const props = classProperties.get(c['@id']) || [];

  const schemaProps: any = {
    id: { type: "string" }
  };

  props.forEach(p => {
    const pName = p['@id'].replace('vf:', '');
    let typeDef: any = { type: "string" };
    
    const range = p['rdfs:range'];
    if (range && range['@id']) {
      const typeUri = range['@id'];
      if (typeUri.includes('xsd:string')) typeDef = { type: "string" };
      else if (typeUri.includes('xsd:dateTime')) typeDef = { type: "string", format: "date-time" };
      else if (typeUri.includes('xsd:float') || typeUri.includes('xsd:decimal') || typeUri.includes('xsd:integer')) typeDef = { type: "number" };
      else if (typeUri.includes('xsd:boolean')) typeDef = { type: "boolean" };
      else if (typeUri.includes('vf:')) {
        const refTypes = resolveDomains({ '@id': typeUri });
        if (refTypes.length > 0) {
          // It can be either a reference string (ID) or the object
          const refs = refTypes.map(r => ({
            $ref: `#/` + `$defs/${r.replace('vf:', '')}`
          }));
          typeDef = {
            anyOf: [
              { type: "string" },
              ...refs
            ]
          };
        } else {
           // Fallback if class not found
           typeDef = { type: "string" };
        }
      }
    }
    schemaProps[pName] = typeDef;
  });
  
  jsonSchema.$defs[className] = {
    type: "object",
    properties: schemaProps
  };
});

fs.writeFileSync('./specs/vf/vf-jsonschema.json', JSON.stringify(jsonSchema, null, 2));
console.log('Successfully generated JSON Schema at ./specs/vf/vf-jsonschema.json');

const dynamicallyGeneratedTS = `import { z } from 'zod';
import vfJsonSchema from '../../specs/vf/vf-jsonschema.json';

// Export all schemas, built dynamically using z.fromJSONSchema
export const schemas = Object.fromEntries(
  Object.entries(vfJsonSchema.$defs).map(([name, schema]) => [
    name, 
    // Typescript might complain if Zod does not natively support the exact JSON import, so we any-cast it for z.fromJSONSchema
    z.fromJSONSchema ? z.fromJSONSchema(schema as any) : z.object({}) 
  ])
);
`;

fs.writeFileSync('./lexicons/vf-dynamic-zod.ts', dynamicallyGeneratedTS);
console.log('Successfully generated Dynamic Zod typescript at ./lexicons/vf-dynamic-zod.ts');
