import type { TreeStore } from '../schemas/tree';
import type { SymLinkCache } from '../schemas/symlinks';
import type { ShareMap } from '../schemas/entity';
import type { EntityId, Weight } from '../schemas/primitives';
import { getNode, getDerivedState } from '../tree/navigation';
import { traverseBFS } from '../tree/traversal';

// ═══════════════════════════════════════════════════════════════════════
// SHARE OF GENERAL SATISFACTION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Calculate ShareOfGeneralSatisfaction for a specific contributor
 */
export function calculateShareOfGeneralSatisfaction(
    tree: TreeStore,
    cache: SymLinkCache,
    contributor_id: EntityId
): Weight {
    let totalShare = 0;

    // Traverse tree to find all contribution nodes
    traverseBFS(tree, tree.root_ref_id, (ref, node) => {
        const state = tree.derived_state[node.id];
        if (!state) return;

        // Terminal nodes with ShareMap (direct contribution)
        if (node.share_map && Object.keys(node.share_map).length > 0) {
            const contributorShare = node.share_map[contributor_id];
            if (contributorShare) {
                const totalPoints = Object.values(node.share_map).reduce((sum, p) => sum + p, 0);
                const shareOfNode = contributorShare / totalPoints;
                const nodeShare = shareOfNode * state.weight * state.satisfaction;
                totalShare += nodeShare;
            }
        }

        if (node.type === 'SymLink' && node.symlink_target) {
            // Indirect recognition via symbolic link
            const cached = cache.remote_satisfaction[node.id];
            if (cached && cached.contributor_shares[contributor_id]) {
                const localWeight = state.weight;
                const remoteShare = cached.contributor_shares[contributor_id];
                const remoteSatisfaction = cached.satisfaction;

                const symlinkShare = localWeight * remoteShare * remoteSatisfaction;
                totalShare += symlinkShare;
            }
        }
    });

    return totalShare;
}

/**
 * Calculate share map for all contributors
 */
export function calculateShareMap(
    tree: TreeStore,
    cache: SymLinkCache
): ShareMap {
    const shareMap: ShareMap = {};
    const contributors = new Set<EntityId>();

    // Collect all contributors from ShareMaps
    traverseBFS(tree, tree.root_ref_id, (ref, node) => {
        // Direct contributors via ShareMap
        if (node.share_map) {
            for (const contributorId of Object.keys(node.share_map)) {
                contributors.add(contributorId);
            }
        }

        if (node.type === 'SymLink') {
            const cached = cache.remote_satisfaction[node.id];
            if (cached) {
                for (const contributorId of Object.keys(cached.contributor_shares)) {
                    contributors.add(contributorId);
                }
            }
        }
    });

    // Calculate share for each contributor
    for (const contributorId of Array.from(contributors)) {
        shareMap[contributorId] = calculateShareOfGeneralSatisfaction(
            tree,
            cache,
            contributorId
        );
    }

    // Normalize to sum to 1.0
    const total = Object.values(shareMap).reduce((sum, share) => sum + share, 0);
    if (total > 0) {
        for (const contributorId in shareMap) {
            shareMap[contributorId] /= total;
        }
    }

    return shareMap;
}

/**
 * Get top contributors by share
 */
export function getTopContributors(
    shareMap: ShareMap,
    limit: number = 10
): Array<{ id: EntityId; share: Weight }> {
    return Object.entries(shareMap)
        .map(([id, share]) => ({ id, share }))
        .sort((a, b) => b.share - a.share)
        .slice(0, limit);
}
