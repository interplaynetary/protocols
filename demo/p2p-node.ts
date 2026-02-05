import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { streamSSE } from 'hono/streaming'
import { html } from 'hono/html'
import { generateKeypair } from '../src/foundation/identity/keys'
import type { Keypair } from '../src/foundation/identity/keys'
import { createDatabase, put, liveQuery, subscribe } from '../src/foundation/storage/database'
import { initializeFoundation } from '../src/foundation/index'
import type { FoundationContext } from '../src/foundation/index'
import type { Database } from '@fireproof/core'

/**
 * P2P Demo Node
 * Runs a standalone foundation node with:
 * - Specific P2P Port
 * - Specific HTTP Port (UI)
 * - Specific Database (Isolated)
 */

const port = parseInt(process.env.PORT || '3000')
const p2pPort = parseInt(process.env.P2P_PORT || '0')
const dbName = process.env.DB_NAME || `demo-node-${port}`
const peerAddr = process.env.PEER_ADDR // Address of another peer to dial

console.log(`🚀 Starting P2P Node on PORT=${port}, P2P=${p2pPort}, DB=${dbName}`)

// Initialize Foundation
const foundation = await initializeFoundation(dbName, {
    listenAddresses: [`/ip4/0.0.0.0/tcp/${p2pPort}/ws`],
    bootstrapPeers: peerAddr ? [peerAddr] : []
})

// Wire up the manual P2P Bridge
import { connectLibp2p } from '../src/foundation/network/sync'
await connectLibp2p(foundation.db, foundation.network, dbName)

// Store foundation globally for this process
const node: FoundationContext = foundation

// If a peer address was provided, explicitly connect to it
if (peerAddr) {
    try {
        console.log(`Attempting to dial bootstrap peer: ${peerAddr}`)
        await node.network.dial(peerAddr)
        console.log('✅ Connected to bootstrap peer')
    } catch (e) {
        console.error('❌ Failed to dial bootstrap peer:', e)
    }
}

const app = new Hono()

// Shared UI State (per node)
const messages: any[] = []

// Subscribe to local DB updates (which come from P2P sync too!)
subscribe(node.db, (changes) => {
    console.log(`[${port}] DB Update received:`, changes.length, 'changes')
    changes.forEach(c => {
        if (c.doc && c.doc.type === 'message') {
            // Dedup
            if (!messages.find(m => m._id === c.doc._id)) {
                messages.push(c.doc)
                messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
            }
        }
    })
})

app.get('/', (c) => {
    const p2pAddrs = node.network.getMultiaddrs().map(ma => ma.toString())
    const peers = node.network.getPeers().map(p => p.toString())

    return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Node ${port} | Playnet P2P</title>
      <script src="https://unpkg.com/htmx.org@1.9.10"></script>
      <script src="https://unpkg.com/htmx.org@1.9.10/dist/ext/sse.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-950 text-gray-200 font-mono p-4">
      <div class="max-w-4xl mx-auto border border-gray-800 rounded bg-gray-900 p-4">
        
        <!-- Node Status Header -->
        <div class="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
          <div>
            <h1 class="text-xl font-bold text-green-400">Node running on :${port}</h1>
            <div class="text-xs text-gray-500 mt-1">DB: ${dbName}</div>
            <div class="text-xs text-gray-500">DID: ${node.identity.did.substring(0, 24)}...</div>
          </div>
          <div class="text-right text-xs">
            <div class="text-purple-400 font-bold">P2P Addresses:</div>
            ${p2pAddrs.map(a => `<div>${a}</div>`).join('')}
          </div>
        </div>

        <!-- Connection Info -->
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-black/50 p-3 rounded">
                <h3 class="text-sm font-bold text-blue-400 mb-2">Connected Peers (${peers.length})</h3>
                <div class="text-xs h-24 overflow-y-auto">
                    ${peers.length === 0 ? '<div class="text-gray-600">No peers connected</div>' : peers.map(p => `<div>${p}</div>`).join('')}
                </div>
            </div>
            <div class="bg-black/50 p-3 rounded">
                 <h3 class="text-sm font-bold text-orange-400 mb-2">Sync Status</h3>
                 <div class="text-xs text-gray-400">
                    <div>Fireproof Storage Active</div>
                    <div>GossipSub Enabled</div>
                 </div>
            </div>
        </div>

        <!-- Chat / Sync Demo -->
        <div class="border border-gray-800 rounded bg-black/20">
            <div class="p-3 bg-gray-800/50 border-b border-gray-800 flex justify-between">
                <span class="font-bold">Encrypted P2P Chat</span>
                <span class="text-xs text-green-600 flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Sync
                </span>
            </div>
            
            <div hx-ext="sse" sse-connect="/api/stream" sse-swap="message" hx-swap="beforeend" hx-on:htmx:sse-message="this.scrollTop = this.scrollHeight" class="h-64 overflow-y-auto p-4 space-y-2">
                 <!-- Messages appear here -->
            </div>

            <div class="p-3 border-t border-gray-800">
                <form hx-post="/api/send" hx-swap="none" hx-on:htmx:after-request="this.reset()">
                    <div class="flex gap-2">
                        <input name="text" type="text" placeholder="Broadcast message..." class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500">
                        <button type="submit" class="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-500">Send</button>
                    </div>
                </form>
            </div>
        </div>

      </div>
    </body>
    </html>
    `)
})

app.get('/api/stream', (c) => {
    return streamSSE(c, async (stream) => {
        // Send existing messages
        const initialHtml = messages.map(renderMessage).join('')
        await stream.writeSSE({ event: 'message', data: initialHtml || '<div class="text-gray-600 text-center text-xs">No messages yet</div>' })

        // Poll for changes (simple implementation for SSE stream)
        let lastCount = messages.length
        while (true) {
            if (messages.length > lastCount) {
                const newMessages = messages.slice(lastCount).map(renderMessage).join('')
                await stream.writeSSE({ event: 'message', data: newMessages })
                lastCount = messages.length
            }
            await new Promise(r => setTimeout(r, 200))
        }
    })
})

function renderMessage(msg: any) {
    const isMe = msg.sender === node.identity.did
    return `
        <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
            <div class="${isMe ? 'bg-blue-900/50 border-blue-800' : 'bg-gray-800 border-gray-700'} border px-3 py-2 rounded text-sm max-w-[80%]">
                <div class="text-[10px] text-gray-500 mb-1 font-mono">${msg.sender.substring(0, 8)}...</div>
                <div>${msg.text}</div>
            </div>
        </div>
    `
}

app.post('/api/send', async (c) => {
    const body = await c.req.parseBody()
    const text = body['text'] as string

    if (text) {
        await put(node.db, {
            type: 'message',
            text,
            sender: node.identity.did,
            timestamp: new Date().toISOString()
        })
    }
    return c.text('ok', 200)
})

serve({
    fetch: app.fetch,
    port
}, (info) => {
    console.log(`Server listening on http://localhost:${info.port}`)
})
