import { z } from 'zod';

/**
 * Commons Schema
 * 
 * Defines the core entity types and attributes for the protocol.
 * Based on the specification in commons.md
 */

// Base types
export const IdSchema = z.string().describe('Set -> Operations -> Set of Entities');
export const TypeSchema = IdSchema;
export const QuantitySchema = z.number().int().nonnegative().describe('Natural number');

// Attribute can be either a Method or a Value
// Using discriminated union for type safety
export const AttributeMethodSchema = z.object({
    kind: z.literal('method'),
    value: z.function().args(z.any()).returns(z.any()),
});

export const AttributeValueSchema = z.object({
    kind: z.literal('value'),
    value: z.any(),
});

export const AttributeSchema = z.discriminatedUnion('kind', [
    AttributeMethodSchema,
    AttributeValueSchema,
]);

// Allocation attributes
export const AllocationAttributesSchema = z.object({
    members: z.array(IdSchema).describe('Set of Ids'),
    quantity: QuantitySchema,
    location: IdSchema,
    time: IdSchema,
});

// Allocation entity
// Represents: Set of Entities -> Operations (filter normalize filter) -> Set of Entities with Attribute Methods/Values
export const AllocationSchema = z.object({
    distribution: z.string().describe('Distribution identifier'),
    attributes: AllocationAttributesSchema,
    entities: z.array(z.any()).describe('Set of Entities'),
});

// Entity base schema
export const EntitySchema = z.object({
    id: IdSchema,
    type: TypeSchema,
    attributes: z.record(z.string(), AttributeSchema).optional(),
});

// Export types
export type Id = z.infer<typeof IdSchema>;
export type Type = z.infer<typeof TypeSchema>;
export type Quantity = z.infer<typeof QuantitySchema>;
export type Attribute = z.infer<typeof AttributeSchema>;
export type AttributeMethod = z.infer<typeof AttributeMethodSchema>;
export type AttributeValue = z.infer<typeof AttributeValueSchema>;
export type AllocationAttributes = z.infer<typeof AllocationAttributesSchema>;
export type Allocation = z.infer<typeof AllocationSchema>;
export type Entity = z.infer<typeof EntitySchema>;
