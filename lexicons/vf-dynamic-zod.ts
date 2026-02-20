import { z } from 'zod';
import vfJsonSchema from '../../specs/vf/vf-jsonschema.json';

// Export all schemas, built dynamically using z.fromJSONSchema
export const schemas = Object.fromEntries(
  Object.entries(vfJsonSchema.$defs).map(([name, schema]) => [
    name, 
    // Typescript might complain if Zod does not natively support the exact JSON import, so we any-cast it for z.fromJSONSchema
    z.fromJSONSchema ? z.fromJSONSchema(schema as any) : z.object({}) 
  ])
);
