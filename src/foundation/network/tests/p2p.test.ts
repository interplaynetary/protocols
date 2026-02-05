import { describe, it, expect, afterEach } from 'vitest'
import { createNode, connectToPeer, publishToTopic, subscribeTopic } from '../p2p'
import type { Libp2p } from 'libp2p'

describe('Network - P2P', () => {
    let nodes: Libp2p[] = []

    afterEach(async () => {
        // Cleanup nodes
        await Promise.all(nodes.map(n => n.stop()))
        nodes = []
    })

    it('should create a libp2p node', async () => {
        const node = await createNode()
        nodes.push(node)

        expect(node).toBeDefined()
        expect(node.peerId).toBeDefined()

        // Note: libp2p nodes created via createLibp2p are started by default implicitly
        expect(node.status).toBe('started')

        await node.stop()
        expect(node.status).toBe('stopped')

        await node.start()
        expect(node.status).toBe('started')
    })

    it('should support pubsub', async () => {
        const node = await createNode()
        nodes.push(node)
        await node.start()

        const topic = 'test-topic'
        const payload = new TextEncoder().encode('hello')

        const received = new Promise<void>((resolve) => {
            subscribeTopic(node, topic, (msg) => {
                const text = new TextDecoder().decode(msg.data)
                if (text === 'hello') {
                    resolve()
                }
            })
        })

        // Wait a bit for subscription to propagate locally
        await new Promise(r => setTimeout(r, 100))

        // Publish
        await publishToTopic(node, topic, payload)

        await received
    })
})
