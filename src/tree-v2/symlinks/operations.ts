import type { TreeStore } from '../schemas/tree';
import type { SymLinkNode } from '../schemas/nodes';
import type { EntityId, NodeId, RefId, Points } from '../schemas/primitives';
import { createNodeAndReference } from '../tree/mutation';
import { getAllNodes } from '../tree/traversal';
import { now } from '../tree/utils';

// ═══════════════════════════════════════════════════════════════════════
// SYMLINK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create a symbolic link to another entity's node
 */
export function createSymLink(
    tree: TreeStore,
    params: {
        name: string;
        parent_ref_id: RefId;
        points: Points;
        target_entity_id: EntityId;
        target_node_id: NodeId;
        link_type: 'tree' | 'subtree' | 'node';
    }
): { tree: TreeStore; symlink_id: NodeId; ref_id: RefId } {
    const timestamp = now();

    const symlinkNode: Omit<SymLinkNode, 'id' | 'created_at' | 'updated_at'> = {
        type: 'SymLink',
        name: params.name,
        points: params.points,
        symlink_target: {
            entity_id: params.target_entity_id,
            node_id: params.target_node_id,
            link_type: params.link_type,
        },
        default_child_ids: [], // SymLinks have no local children
    };

    const { tree: updatedTree, node_id, ref_id } = createNodeAndReference(
        tree,
        symlinkNode,
        params.parent_ref_id
    );

    return {
        tree: updatedTree,
        symlink_id: node_id,
        ref_id,
    };
}

/**
 * Get all symlinks in a tree
 */
export function getAllSymLinks(tree: TreeStore): SymLinkNode[] {
    return getAllNodes(tree).filter(
        (node): node is SymLinkNode => node.type === 'SymLink'
    );
}

/**
 * Find symlinks targeting a specific entity
 */
export function findSymLinksByEntity(
    tree: TreeStore,
    target_entity_id: EntityId
): SymLinkNode[] {
    return getAllSymLinks(tree).filter(
        symlink => symlink.symlink_target.entity_id === target_entity_id
    );
}

/**
 * Find symlinks targeting a specific node
 */
export function findSymLinksByNode(
    tree: TreeStore,
    target_entity_id: EntityId,
    target_node_id: NodeId
): SymLinkNode[] {
    return getAllSymLinks(tree).filter(
        symlink =>
            symlink.symlink_target.entity_id === target_entity_id &&
            symlink.symlink_target.node_id === target_node_id
    );
}
