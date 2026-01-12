import { describe, it, expect } from 'vitest';
import {
    EntityIdSchema,
    NodeIdSchema,
    RefIdSchema,
    SatisfactionSchema,
    PointsSchema,
    QuantitySchema,
    WeightSchema,
    NodeTypeSchema,
    ContributorSchema,
} from '../../schemas/primitives';

describe('Primitives Schema', () => {
    describe('EntityIdSchema', () => {
        it('should validate valid entity ID', () => {
            expect(() => EntityIdSchema.parse('entity_123')).not.toThrow();
        });

        it('should reject empty string', () => {
            expect(() => EntityIdSchema.parse('')).toThrow();
        });
    });

    describe('SatisfactionSchema', () => {
        it('should validate 0.0', () => {
            expect(SatisfactionSchema.parse(0)).toBe(0);
        });

        it('should validate 1.0', () => {
            expect(SatisfactionSchema.parse(1)).toBe(1);
        });

        it('should validate 0.5', () => {
            expect(SatisfactionSchema.parse(0.5)).toBe(0.5);
        });

        it('should reject negative values', () => {
            expect(() => SatisfactionSchema.parse(-0.1)).toThrow();
        });

        it('should reject values > 1', () => {
            expect(() => SatisfactionSchema.parse(1.1)).toThrow();
        });
    });

    describe('PointsSchema', () => {
        it('should validate positive integers', () => {
            expect(PointsSchema.parse(100)).toBe(100);
        });

        it('should reject zero', () => {
            expect(() => PointsSchema.parse(0)).toThrow();
        });

        it('should reject negative numbers', () => {
            expect(() => PointsSchema.parse(-5)).toThrow();
        });

        it('should reject decimals', () => {
            expect(() => PointsSchema.parse(5.5)).toThrow();
        });
    });

    describe('WeightSchema', () => {
        it('should validate 0.0', () => {
            expect(WeightSchema.parse(0)).toBe(0);
        });

        it('should validate 1.0', () => {
            expect(WeightSchema.parse(1)).toBe(1);
        });

        it('should reject negative values', () => {
            expect(() => WeightSchema.parse(-0.1)).toThrow();
        });

        it('should reject values > 1', () => {
            expect(() => WeightSchema.parse(1.1)).toThrow();
        });
    });

    describe('NodeTypeSchema', () => {
        it('should validate all node types', () => {
            expect(() => NodeTypeSchema.parse('Root')).not.toThrow();
            expect(() => NodeTypeSchema.parse('Goal')).not.toThrow();
            expect(() => NodeTypeSchema.parse('CapacitySlot')).not.toThrow();
            expect(() => NodeTypeSchema.parse('ContributionNode')).not.toThrow();
            expect(() => NodeTypeSchema.parse('NeedSlot')).not.toThrow();
            expect(() => NodeTypeSchema.parse('SymLink')).not.toThrow();
        });

        it('should reject invalid node type', () => {
            expect(() => NodeTypeSchema.parse('InvalidType')).toThrow();
        });
    });

    describe('ContributorSchema', () => {
        it('should validate valid contributor', () => {
            const contributor = {
                id: 'entity_1',
                points: 50,
            };
            expect(() => ContributorSchema.parse(contributor)).not.toThrow();
        });

        it('should reject contributor without id', () => {
            expect(() => ContributorSchema.parse({ points: 50 })).toThrow();
        });

        it('should reject contributor without points', () => {
            expect(() => ContributorSchema.parse({ id: 'entity_1' })).toThrow();
        });
    });
});
