import {
    TreeStoreSchema,
    EntityStateSchema,
    NetworkStateSchema,
} from '../schemas';
import type { TreeStore } from '../schemas/tree';
import type { EntityState } from '../schemas/entity';
import type { NetworkState } from '../schemas/network';

// ═══════════════════════════════════════════════════════════════════════
// JSON SERIALIZATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Export tree to JSON string
 */
export function serializeTree(tree: TreeStore): string {
    // Validate before serializing
    const validated = TreeStoreSchema.parse(tree);
    return JSON.stringify(validated, null, 2);
}

/**
 * Import tree from JSON string
 */
export function deserializeTree(json: string): TreeStore {
    const parsed = JSON.parse(json);
    return TreeStoreSchema.parse(parsed);
}

/**
 * Export entity state to JSON string
 */
export function serializeEntityState(entity: EntityState): string {
    const validated = EntityStateSchema.parse(entity);
    return JSON.stringify(validated, null, 2);
}

/**
 * Import entity state from JSON string
 */
export function deserializeEntityState(json: string): EntityState {
    const parsed = JSON.parse(json);
    return EntityStateSchema.parse(parsed);
}

/**
 * Export network state to JSON string
 */
export function serializeNetworkState(network: NetworkState): string {
    const validated = NetworkStateSchema.parse(network);
    return JSON.stringify(validated, null, 2);
}

/**
 * Import network state from JSON string
 */
export function deserializeNetworkState(json: string): NetworkState {
    const parsed = JSON.parse(json);
    return NetworkStateSchema.parse(parsed);
}

// ═══════════════════════════════════════════════════════════════════════
// SAFE SERIALIZATION (with error handling)
// ═══════════════════════════════════════════════════════════════════════

export interface SerializationResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Safely deserialize tree with error handling
 */
export function safeDeserializeTree(json: string): SerializationResult<TreeStore> {
    try {
        const tree = deserializeTree(json);
        return { success: true, data: tree };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Safely deserialize entity with error handling
 */
export function safeDeserializeEntity(
    json: string
): SerializationResult<EntityState> {
    try {
        const entity = deserializeEntityState(json);
        return { success: true, data: entity };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Safely deserialize network with error handling
 */
export function safeDeserializeNetwork(
    json: string
): SerializationResult<NetworkState> {
    try {
        const network = deserializeNetworkState(json);
        return { success: true, data: network };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
