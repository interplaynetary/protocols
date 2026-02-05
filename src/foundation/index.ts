// ═══════════════════════════════════════════════════════════════════════
// FOUNDATION LAYER PUBLIC API
// ═══════════════════════════════════════════════════════════════════════

// Identity
import * as Identity from './identity/keys'
export { Identity }
export * as Devices from './identity/devices'

// Storage
export * as Storage from './storage/database'
export * as Encryption from './storage/encryption'

// Network
export * as Network from './network/index'

// Credentials
export * as Credentials from './credentials/index'

// Unified Foundation Interface
import { generateKeypair, type Keypair } from './identity/keys'
import { createDatabase, type Database } from './storage/database'
import { createNode, type Libp2p } from './network/p2p'

export interface FoundationContext {
    identity: Keypair
    db: Database
    network: Libp2p
}

import type { P2PConfig } from './network/p2p'

/**
 * Initialize the full Foundation Layer stack
 */
export async function initializeFoundation(name: string = 'default', p2pConfig: P2PConfig = {}, seed?: Uint8Array): Promise<FoundationContext> {
    // 1. Identity
    // If seed is provided, use it (Demo Mode). Otherwise generate new.
    let identity: Keypair
    if (seed) {
        // We need to import recoverKeypair which we just added to keys.ts
        // Since we are exporting * as Identity, we can access it there or import explicitly.
        // Let's rely on the updated import.
        identity = await Identity.recoverKeypair(seed)
    } else {
        identity = await Identity.generateKeypair()
    }

    // 2. Storage
    const db = createDatabase(name)

    // 3. Network
    const network = await createNode({
        peerId: undefined, // Let libp2p generate one based on identity if needed? 
        ...p2pConfig
    })

    return {
        identity,
        db,
        network
    }
}
