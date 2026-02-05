import type { Libp2p } from 'libp2p'
import type { Database } from '@fireproof/core'
import { subscribeTopic, publishToTopic } from './p2p'

// Simple interface for what we send over the wire
interface SyncMessage {
    type: 'put'
    doc: any
    // In a real implementation we would send Merkle clock heads first
    // and only request needed blocks (CAR files). 
    // For this prototype, we just flood the full doc on every update.
}

/**
 * Connect Fireproof DB to Libp2p GossipSub
 * @param db Fireproof Database instance
 * @param node Libp2p Node instance
 * @param topic Shared topic string (e.g. database name)
 */
export async function connectLibp2p(
    db: Database,
    node: Libp2p,
    topic: string
) {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // 1. Listen for Network Updates -> Apply to DB
    await subscribeTopic(node, topic, async (msg) => {
        try {
            const str = decoder.decode(msg.data)
            const payload = JSON.parse(str) as SyncMessage

            // Ignore our own messages if they loop back 
            // (Libp2p usually filters emitSelf unless configured otherwise, 
            // but Fireproof might re-emit locally)

            if (payload && payload.type === 'put' && payload.doc) {
                // Apply remote update
                // console.log('[P2P Sync] Received Update', payload.doc._id)
                await db.put(payload.doc)
            }
        } catch (err) {
            console.error('[P2P Sync] Failed to process message', err)
        }
    })

    // 2. Listen for Local DB Updates -> Publish to Network
    // Pass true to get the full doc changes
    db.subscribe((changes: any[]) => {
        changes.forEach(async (change) => {
            // "change" is the doc itself in the Fireproof subscribe callback
            const doc = change

            const message: SyncMessage = {
                type: 'put',
                doc: doc
            }

            try {
                const data = encoder.encode(JSON.stringify(message))
                await publishToTopic(node, topic, data)
                // console.log('[P2P Sync] Broadcasted Update', doc._id)
            } catch (err) {
                console.error('[P2P Sync] Failed to broadcast', err)
            }
        })
    }, true)

    console.log(`[P2P Sync] Bridge active on topic: ${topic}`)
}
