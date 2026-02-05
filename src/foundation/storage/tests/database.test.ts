import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    createDatabase,
    initializeDatabases,
    put,
    get,
    subscribe,
    liveQuery
} from '../database'
import { fireproof } from '@fireproof/core'

describe('Storage - Database', () => {
    describe('Initialization', () => {
        it('should initialize standard databases for a DID', () => {
            const did = 'did:key:z6Mk...'
            const dbs = initializeDatabases(did)

            expect(dbs.tree).toBeDefined()
            expect(dbs.vcs).toBeDefined()
            expect(dbs.revocations).toBeDefined()
            expect(dbs.allocations).toBeDefined()
        })
    })

    describe('CRUD Operations', () => {
        let db: any

        beforeEach(() => {
            db = createDatabase(`test-db-${Math.random()}`)
        })

        it('should put and get a document', async () => {
            const doc = { _id: 'doc1', hello: 'world' }
            const res = await put(db, doc)

            expect(res.id).toBe('doc1')

            const retrieved = await get(db, 'doc1')
            expect(retrieved).toEqual(expect.objectContaining(doc))
        })

        it('should return null for non-existent document', async () => {
            const res = await get(db, 'non-existent')
            expect(res).toBeNull()
        })

        it('should update a document', async () => {
            const doc = { _id: 'doc1', count: 1 }
            await put(db, doc)

            const doc2 = { _id: 'doc1', count: 2 }
            await put(db, doc2)

            const retrieved = await get(db, 'doc1')
            expect(retrieved).toEqual(expect.objectContaining({ count: 2 }))
        })
    })

    describe('Subscription', () => {
        it.skip('should trigger callback on changes', async () => {
            const db = createDatabase(`test-sub-${Math.random()}`)
            const received: any[] = []

            const unsub = subscribe(db, (docs) => {
                received.push(...docs)
            })

            await put(db, { _id: 'sub-1', type: 'test' })

            // Wait for subscription to fire (it's async)
            await new Promise(resolve => setTimeout(resolve, 1000))

            expect(received.length).toBeGreaterThan(0)
            expect(received[0]._id).toBe('sub-1')

            unsub()
        })

        it('should update live query results', async () => {
            const db = createDatabase(`test-live-${Math.random()}`)

            // We'll track results
            let results: any[] = []

            // Create a promise that resolves when we get expected results
            const queryUpdated = new Promise<void>((resolve) => {
                const unsubscribe = liveQuery(db, 'type', {}, (res) => {
                    results = res.rows.map(r => r.doc)
                    if (results.length === 1 && results[0].type === 'todo') {
                        unsubscribe()
                        resolve()
                    }
                })
            })

            // Add a document that matches the query
            await put(db, { _id: 'todo1', type: 'todo', text: 'live' })

            // Wait for query update
            await queryUpdated

            expect(results.length).toBe(1)
            expect(results[0].text).toBe('live')
        })
    })
})
