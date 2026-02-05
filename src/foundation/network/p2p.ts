import { createLibp2p, type Libp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
// import { webrtc } from '@libp2p/webrtc'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@libp2p/yamux'
import { gossipsub } from '@libp2p/gossipsub'
import { bootstrap } from '@libp2p/bootstrap'
import { kadDHT } from '@libp2p/kad-dht'
import type { PeerId } from '@libp2p/interface'
import { identify } from '@libp2p/identify'
import { ping } from '@libp2p/ping'

export interface P2PConfig {
    peerId?: PeerId
    bootstrapPeers?: string[]
    listenAddresses?: string[]
}

export async function createNode(config: P2PConfig = {}): Promise<Libp2p> {
    const isBrowser = typeof window !== 'undefined'
    const options: any = {
        addresses: {
            listen: config.listenAddresses || (isBrowser ? [] : ['/ip4/0.0.0.0/tcp/0/ws'])
        },
        transports: [
            webSockets()
        ],
        connectionEncryption: [noise()],
        streamMuxers: [yamux()],
        peerDiscovery: [
            // Bootstrap nodes (if any)
            config.bootstrapPeers && config.bootstrapPeers.length > 0
                ? bootstrap({ list: config.bootstrapPeers })
                : undefined
        ].filter(Boolean),
        services: {
            pubsub: gossipsub({
                allowPublishToZeroTopicPeers: true, // Fixed type error from before
                emitSelf: true
            }),
            dht: kadDHT({
                clientMode: true
            }),
            identify: identify(),
            ping: ping()
        }
    }

    if (config.peerId) {
        options.peerId = config.peerId
    }

    return await createLibp2p(options)
}

/**
 * Connect to a peer by multiaddr
 */
export async function connectToPeer(node: Libp2p, multiaddr: string): Promise<void> {
    await node.dial(multiaddr)
}

/**
 * Subscribe to a pubsub topic
 */
export async function subscribeTopic(
    node: Libp2p,
    topic: string,
    handler: (msg: any) => void
): Promise<void> {
    node.services.pubsub.addEventListener('message', (evt: any) => {
        if (evt.detail.topic === topic) {
            handler(evt.detail)
        }
    })

    node.services.pubsub.subscribe(topic)
}

/**
 * Publish message to topic
 */
export async function publishToTopic(
    node: Libp2p,
    topic: string,
    data: Uint8Array
): Promise<void> {
    await node.services.pubsub.publish(topic, data)
}
