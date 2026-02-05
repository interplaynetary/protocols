import { fireproof, type Database } from '@fireproof/core'
// import { connect } from '@fireproof/connect'
// Usage of s3free was unstable. Switching to PartyKit (WebRTC) as per Architecture Primary recommendation.
import { connect } from '@fireproof/partykit'

// ═══════════════════════════════════════════════════════════════════════
// DATABASE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════

export interface ConnectionOptions {
    primary?: boolean
}

/**
 * Initialize a Fireproof database by name
 */
export function createDatabase(name: string): Database {
    return fireproof(name)
}

/**
 * Connect database to the network for sync
 */
export function connectDatabase(
    db: Database,
    topic: string,
    options: ConnectionOptions = {}
): any {
    // Debugging: Log the DB instance to see why connect fails
    // console.log('[connectDatabase] Attempting to connect DB:', { dbExists: !!db })

    // Fireproof Connect API expects { blockstore }
    // Core v0.24.7 DatabaseImpl hides blockstore at db.ledger.crdt.blockstore
    // We must extract it to satisfy the connector.
    let connectionArg = db as any

    // Check if we need to dig for blockstore
    if (!connectionArg.blockstore && connectionArg.ledger?.crdt?.blockstore) {
        console.log('[connectDatabase] Extracting blockstore from deep property')
        const bs = connectionArg.ledger.crdt.blockstore

        // DEBUG: Inspect blockstore and loader
        console.log('[connectDatabase] Blockstore keys:', Object.keys(bs))
        if (bs.loader) {
            console.log('[connectDatabase] Loader keys:', Object.keys(bs.loader))
            console.log('[connectDatabase] Loader ready type:', typeof bs.loader.ready)
        } else {
            console.log('[connectDatabase] Loader matches?', !!bs.loader)
        }

        // Compatibility Shim: @fireproof/connect expects loader.ready to be a Promise property
        // But @fireproof/core v0.24.x implements it as a function ready().
        // We wrap the loader to fix this.
        if (bs.loader && typeof bs.loader.ready === 'function') {
            const originalLoader = bs.loader
            const loaderProxy = new Proxy(originalLoader, {
                get(target, prop, receiver) {
                    if (prop === 'ready') {
                        // Return the promise result of calling the function
                        return target.ready()
                    }
                    return Reflect.get(target, prop, receiver)
                }
            })
            // Create a blockstore shadow with the proxied loader
            const bsShadow = Object.create(bs)
            bsShadow.loader = loaderProxy
            connectionArg = { blockstore: bsShadow }
            console.log('[connectDatabase] Applied loader.ready shim')
        } else {
            connectionArg = { blockstore: bs }
        }
    }

    // Use PartyKit for WebRTC P2P Sync (Signaling)
    const partyKitHost = 'https://fireproof.partykit.dev' // Default public party
    return connect.partykit(connectionArg, partyKitHost)
}

// ═══════════════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Store a document
 */
export async function put<T extends { _id?: string }>(
    db: Database,
    doc: T
): Promise<{ id: string }> {
    return await db.put(doc)
}

/**
 * Retrieve a document by ID
 */
export async function get<T>(
    db: Database,
    id: string
): Promise<T | null> {
    try {
        return await db.get(id) as T
    } catch (err: any) {
        if (err.message && err.message.includes('Not found')) {
            return null
        }
        throw err
    }
}

/**
 * Query documents using map/reduce or index
 */
export async function query<T>(
    db: Database,
    indexName: string,
    options: any = {}
): Promise<{ rows: { key: any, value: any, doc?: T }[] }> {
    return await db.query(indexName, options)
}

/**
 * Subscribe to database changes
 */
export function subscribe<T>(
    db: Database,
    callback: (changes: any[]) => void
): () => void {
    // Fireproof requires the second argument 'true' to send the actual document updates.
    // Otherwise it sends an empty array as a "something changed" notification.
    return db.subscribe(callback, true)
}

/**
 * Live Query - subscribes to query results
 */
export function liveQuery<T>(
    db: Database,
    indexName: string,
    options: any = {},
    callback: (results: { rows: { key: any, value: any, doc?: T }[] }) => void
): () => void {
    // Initial query
    query<T>(db, indexName, options).then(callback)

    // Subscribe to changes
    const unsubscribe = subscribe(db, async () => {
        const results = await query<T>(db, indexName, options)
        callback(results)
    })

    return unsubscribe
}

// ═══════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════

export interface FoundationDatabases {
    tree: Database
    vcs: Database
    revocations: Database
    allocations: Database
}

/**
 * Initialize all standard databases for a given DID
 */
export function initializeDatabases(rootDID: string): FoundationDatabases {
    const suffix = rootDID.replace(/:/g, '-').slice(-8)

    return {
        tree: createDatabase(`tree-${suffix}`),
        vcs: createDatabase(`vcs-${suffix}`),
        revocations: createDatabase(`revocations-${suffix}`),
        allocations: createDatabase(`allocations-${suffix}`)
    }
}
