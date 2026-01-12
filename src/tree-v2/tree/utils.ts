import { nanoid } from 'nanoid';
import type { NodeId, RefId } from '../schemas/primitives';

// ═══════════════════════════════════════════════════════════════════════
// ID GENERATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Generate a unique node ID
 */
export function generateNodeId(): NodeId {
    return `node_${nanoid(12)}`;
}

/**
 * Generate a unique reference ID
 */
export function generateRefId(): RefId {
    return `ref_${nanoid(12)}`;
}

/**
 * Generate a unique allocation ID (UUID v4)
 */
export function generateAllocationId(): string {
    return crypto.randomUUID();
}

/**
 * Generate tree version identifier
 */
export function generateTreeVersion(): string {
    return `v_${Date.now()}_${nanoid(8)}`;
}

// ═══════════════════════════════════════════════════════════════════════
// TIMESTAMP HELPERS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Get current timestamp in milliseconds
 */
export function now(): number {
    return Date.now();
}
