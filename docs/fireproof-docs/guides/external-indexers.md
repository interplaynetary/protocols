External Indexers
Fireproof is designed to make indexing in external indexers efficient and seamless. Each database tracks it's change history and provides a feed of changes since any clock. If you don't provide a clock, you'll get all changes. Each change includes it's clock, so if you keep track of a high water mark, you can safely restart your indexing process and know you aren't missing any updates.

For single-user workloads it can often be enough to index the local dataset on page load, and use your index in memory. For larger data use-cases you probably want to use an indexer than remember everything it has added, and incrementally add new items as changes occur.

The technique here can also be used with vector indexers to manage LLM queries.

Flexsearch for fulltext indexing
There's a full text JavaScript search library called Flexsearch that works by building and maintaining an index. For large datasets, searching this index is much more performant than scanning through all your documents.

To integrate Flexsearch, we'll write a withFlexsearch function that takes a Fireproof database and returns an object with a single method: search.

import { Index } from "flexsearch";

/**
 * Returns an object containing a search function that allows searching a Fireproof database with Flexsearch.
 * @param {Object} database - The Fireproof database to add search functionality to.
 * @param {Object} [flexsearchOptions={}] - Optional Flexsearch options object.
 * @returns {Object} An object containing a single search function.
 **/
function withFlexsearch(database, flexsearchOptions = {}) {
  const index = new Index(flexsearchOptions)
  let clock = null
  const search = async (query, options) => {
    const changes = await database.changes(clock)
    clock = changes.clock
    for (let i = 0; i < changes.rows.length; i++) {
      const { key, value } = changes.rows[i]
      await index.add(key, value.message)
    }
    return index.search(query, options)
  }
  return { search }
}


To use the withFlexsearch function, you should call it with a Fireproof database as the first argument. An optional second argument can be passed as an object to configure Flexsearch.

const flexed = withFlexsearch(database, {
  encode: 'icase',
  tokenize: 'full'
})

The returned object flexed will contain a single method, search. This method can be used to search for documents in the database that contain a given query string.

const results = await flexed.search('red')

The search method takes two arguments: the query string and an optional options object. The options object can be used to configure the search algorithm.

How it works
The withFlexsearch function creates a Flexsearch index object and keeps it updated with changes to the Fireproof ledger. It does this by listening to changes in the database and adding or removing documents from the index as needed.

The search method simply searches the Flexsearch index for documents that match the given query string. Because the index is always up-to-date with the database, searches are fast and accurate.

Connection to GraphQL or Vector index
The technique used in withFlexsearch for adding search functionality to a Fireproof database could also be used for connecting to a GraphQL query index. Instead of using Flexsearch to index the data, you would use a GraphQL query index such as Elasticsearch or Apollo Studio.

To implement this, you would need to create a new function, similar to withFlexsearch, that listens to changes in the Fireproof database and updates the GraphQL index accordingly. This function could be called withGraphQL.

Similar to withFlexsearch, withGraphQL would take a Fireproof database as its first argument and an optional configuration object as its second argument. The returned object would contain a single method, query, which could be used to perform GraphQL queries on the indexed data.

To ensure that the GraphQL index is always up-to-date with the Fireproof database, you would need to listen to changes in the datbase and update the index with any new data. This can be done by copying the changes code from withFlexsearch. Once the data has been indexed, you can use GraphQL to query it. Because the index is always up-to-date with the Fireproof database, you can be sure that your queries will return accurate results.