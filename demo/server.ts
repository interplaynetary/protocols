import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { streamSSE } from 'hono/streaming'
import { html } from 'hono/html'
import { generateKeypair } from '../src/foundation/identity/keys'
import { createDatabase, put, liveQuery } from '../src/foundation/storage/database'
import type { Database } from '@fireproof/core'

const app = new Hono()

// ═══════════════════════════════════════════════════════════════════════
// SHARED STATE (The "Room")
// ═══════════════════════════════════════════════════════════════════════
// We use a single shared database to simulate a P2P room where sync has happened.
// In a real P2P scenario, each user would have their own DB and sync over network.
// For this single-process server demo, we share the DB instance but distinct User Identities.
console.log('Initializing Shared Room...')
const roomDB = createDatabase('demo-chat-room')

interface Message {
  _id: string
  type: 'message'
  text: string
  senderDid: string
  timestamp: string
}

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

// In-memory session store for demo purposes (don't do this in prod)
const sessions = new Map<string, { did: string, color: string }>()

function getUser(c: any) {
  const sessionId = getCookie(c, 'session_id')
  if (sessionId && sessions.has(sessionId)) {
    return sessions.get(sessionId)!
  }
  return null
}

async function createUser(c: any) {
  const kp = await generateKeypair()
  const sessionId = Math.random().toString(36).substring(2)
  const color = '#' + Math.floor(Math.random() * 16777215).toString(16)

  sessions.set(sessionId, { did: kp.did, color })
  setCookie(c, 'session_id', sessionId)
  return sessions.get(sessionId)!
}

// ═══════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════

app.get('/', async (c) => {
  let user = getUser(c)
  if (!user) user = await createUser(c)

  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Playnet Protocol Demo</title>
      <script src="https://unpkg.com/htmx.org@1.9.10"></script>
      <script src="https://unpkg.com/htmx.org@1.9.10/dist/ext/sse.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-gray-100 font-sans min-h-screen flex flex-col items-center p-4">
      
      <div class="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <!-- Header -->
        <div class="bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Playnet Foundation</h1>
            <div class="flex items-center gap-2 mt-2">
              <span class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
              <span class="text-xs text-gray-400 font-mono">NODE CONNECTED</span>
            </div>
          </div>
          <div class="text-right">
             <div class="text-xs text-gray-400 uppercase tracking-widest mb-1">Your Identity</div>
             <div class="font-mono text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded border border-blue-500/30" title="${user.did}">
               ${user.did.substring(0, 16)}...
             </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div hx-ext="sse" sse-connect="/api/stream" class="h-[500px] flex flex-col">
          
          <!-- Messages Stream -->
          <div id="chat-messages" 
               class="flex-1 overflow-y-auto p-4 space-y-4" 
               sse-swap="message"
               hx-swap="beforeend"
               hx-on:htmx:sse-message="this.scrollTop = this.scrollHeight">
               <!-- Messages will appear here via SSE -->
               <div class="text-center text-gray-600 text-sm py-10">Connecting to secure stream...</div>
          </div>

          <!-- Input Area -->
          <div class="p-4 bg-gray-900 border-t border-gray-700">
            <form hx-post="/api/sendMessage" hx-swap="none" hx-on:htmx:after-request="this.reset()">
              <div class="flex gap-2">
                <input type="text" name="text" 
                       class="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                       placeholder="Type a secure message..." 
                       autocomplete="off"
                       autofocus>
                <button type="submit" 
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                  <span>Send</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      <div class="mt-8 text-gray-500 text-xs text-center max-w-lg">
        <p class="mb-2"><strong>How it works:</strong> Each browser session generates a unique cryptographic <code>did:key</code>. Messages are stored in an encrypted Fireproof database (Foundation Storage Layer) and streamed in real-time via Server-Sent Events.</p>
        <p>Open this page in a <strong>Incognito Window</strong> or another browser to simulate a second peer!</p>
      </div>

    </body>
    </html>
  `)
})

app.get('/api/stream', async (c) => {
  return streamSSE(c, async (stream) => {
    // Send initial batch directly (simplification for demo)
    // Real implementation would use liveQuery fully.

    // Subscribe to DB changes
    const unsub = liveQuery(roomDB, 'type', {}, (res) => {
      // Filter for messages and sort by time
      const messages = res.rows
        .map(r => r.doc as Message)
        .filter(d => d?.type === 'message')
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))

      // Determine current user DID for styling
      const user = getUser(c)
      const myDid = user ? user.did : ''

      // Render the full list (or just append in a smarter way)
      // For simplicity, we re-render the list HTML.
      const htmlContent = messages.map(msg => {
        const isMe = msg.senderDid === myDid
        const shortDid = msg.senderDid.substring(8, 16)
        return `
          <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[80%] ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} rounded-2xl px-4 py-2 shadow-sm relative group">
              <div class="text-[10px] opacity-50 mb-1 font-mono flex gap-2">
                 <span>${shortDid}</span>
                 <span>${new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <p>${msg.text}</p>
            </div>
          </div>
        `
      }).join('')

      stream.writeSSE({
        event: 'message',
        data: htmlContent
      })
    })

    // Keep connection open
    while (true) {
      await new Promise(r => setTimeout(r, 1000))
    }

    // Cleanup would go here if we could detect close easily in this loop
  })
})

app.post('/api/sendMessage', async (c) => {
  const user = getUser(c)
  if (!user) return c.text('Unauthorized', 401)

  const body = await c.req.parseBody()
  const text = body['text'] as string

  if (text && text.trim().length > 0) {
    await put(roomDB, {
      type: 'message',
      text: text,
      senderDid: user.did,
      timestamp: new Date().toISOString()
    })
  }

  return c.text('Sent', 200)
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
