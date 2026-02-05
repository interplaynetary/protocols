import { initializeFoundation } from '../../src/foundation/index'
import { subscribe, put, connectDatabase } from '../../src/foundation/storage/database'
import { connectLibp2p } from '../../src/foundation/network/sync'

// UI Elements
const statusEl = document.getElementById('status')!
const identityEl = document.getElementById('identity')!
const messagesEl = document.getElementById('messages')!
const form = document.getElementById('chat-form') as HTMLFormElement
const input = document.getElementById('msg-input') as HTMLInputElement
const debugEl = document.getElementById('debug-log')!

// State
const messages = new Set<string>()

function log(msg: string, data?: any) {
    console.log(msg, data || '')
    const div = document.createElement('div')
    div.innerText = `> ${msg} ${data ? JSON.stringify(data).substring(0, 100) : ''}`
    debugEl.appendChild(div)
    debugEl.scrollTop = debugEl.scrollHeight
}

async function main() {
    log('Starting Browser Node...')

    // 1. Initialize Foundation (Browser Mode)
    // We use a fixed DB name so tabs can sync if using same storage, 
    // or trusted peer sync if using different storage but same topic.
    // For this demo, let's use a shared topic database name.
    const dbName = 'playnet-browser-demo-v1'

    // 0. Shared Identity / Room Logic
    const params = new URLSearchParams(window.location.search)
    let roomSeedHex = params.get('room')

    if (!roomSeedHex) {
        // Generate random 32 bytes
        const seedBytes = new Uint8Array(32)
        crypto.getRandomValues(seedBytes)
        roomSeedHex = Array.from(seedBytes).map(b => b.toString(16).padStart(2, '0')).join('')

        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('room', roomSeedHex)
        window.history.pushState({}, '', newUrl.toString())
        log('Generated new private room', roomSeedHex.substring(0, 8))
    } else {
        log('Joining existing room', roomSeedHex.substring(0, 8))
    }

    const seed = new Uint8Array(roomSeedHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))

    // Use fixed DB name, but unique Identity derived from seed
    // const dbName = 'playnet-browser-demo-v1' // Already defined above

    // Pass seed to initializeFoundation
    const node = await initializeFoundation(dbName, {}, seed)
    log('Foundation initialized', { did: node.identity.did })

    // 4. Manually Wire up P2P Sync (Validation of Architecture)
    // We dial the local P2P node (running on 9001) to bootstrap the mesh
    const BOOTSTRAP_MULTIADDR = '/ip4/127.0.0.1/tcp/9001/ws'

    try {
        log('Dialing Bootstrap Node...', BOOTSTRAP_MULTIADDR)
        await node.network.dial(BOOTSTRAP_MULTIADDR)
        log('✅ Connected to P2P Mesh')
    } catch (err) {
        log('⚠️ Failed to dial bootstrap (is `npm run p2p-a` running?)')
    }

    // Activate the bridge
    const { connectLibp2p } from '../../src/foundation/network/sync'
    await connectLibp2p(node.db, node.network, dbName)
    log('P2P Data Bridge Active')

    // Explicitly connect to sync (Optional: keep Fireproof's own sync if needed, but we rely on bridge now)
    // log('Connecting to sync network...')
    // connectDatabase(node.db, dbName)

    // 2. Update UI
    statusEl.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-green-500"></span> 
        <span class="text-green-400">Node Active</span>
    `
    identityEl.innerHTML = `
        <div class="mb-2">ID: <span class="text-blue-300" title="${node.identity.did}">${node.identity.did.substring(0, 12)}...</span></div>
        <div class="text-xs bg-gray-800 p-2 rounded border border-gray-700">
            <div class="text-gray-400 mb-1">🔗 Invite Link (Share to Sync):</div>
            <input readonly value="${window.location.href}" 
                   class="w-full bg-black text-white px-2 py-1 rounded text-xs focus:ring-1 focus:ring-blue-500 cursor-pointer"
                   onclick="this.select(); navigator.clipboard.writeText(this.value); alert('Copied!')">
        </div>
        <div class="text-xs text-gray-500 mt-1">DB: ${dbName}</div>
    `

    messagesEl.innerHTML = '' // Clear loading msg

    // 3. Subscribe to Changes
    log('Subscribing to database changes...')
    subscribe(node.db, (changes) => {
        log('DB Update received', { count: changes.length })
        changes.forEach(c => {
            // Fireproof returns the document directly in the changes array
            // So 'c' IS the document (with _id property)
            const doc = c
            if (doc && doc.type === 'message' && doc.text) {
                if (!messages.has(doc._id)) {
                    messages.add(doc._id)
                    renderMessage(doc, node.identity.did)
                    log('Rendered message', doc._id)
                }
            }
        })
    })

    // 4. Handle Input
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const text = input.value
        if (!text.trim()) return

        input.value = ''

        try {
            log('Sending message...', text)
            const res = await put(node.db, {
                type: 'message',
                text,
                sender: node.identity.did,
                timestamp: new Date().toISOString()
            })
            log('Message saved', res.id)
        } catch (err: any) {
            console.error('Failed to send:', err)
            log('ERROR sending message', err.message)
            alert('Error sending message')
        }
    })
}

function renderMessage(msg: any, myDid: string) {
    const isMe = msg.sender === myDid
    const el = document.createElement('div')
    el.className = `flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`

    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    el.innerHTML = `
        <div class="max-w-[85%] ${isMe ? 'bg-blue-600' : 'bg-gray-700'} rounded-2xl px-4 py-2 shadow-sm relative group">
            <div class="text-[10px] opacity-75 mb-1 font-mono flex gap-2 justify-between">
                <span>${msg.sender.substring(0, 8)}</span>
                <span>${time}</span>
            </div>
            <div class="break-words text-sm md:text-base">${escapeHtml(msg.text)}</div>
        </div>
    `

    messagesEl.appendChild(el)
    messagesEl.scrollTop = messagesEl.scrollHeight
}

function escapeHtml(text: string) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Add simple animation styles
const style = document.createElement('style')
style.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
        animation: fadeInUp 0.3s ease-out forwards;
    }
`
document.head.appendChild(style)

main().catch(err => {
    console.error(err)
    statusEl.textContent = 'Critial Error: ' + err.message
    statusEl.className = 'text-red-500'
})
