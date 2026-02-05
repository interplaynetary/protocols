Querying Data
Fireproof provides a powerful querying API that allows you to search and retrieve data quickly. This is done using the ledger.query(mapFn, params) method. The mapFn is a synchronous function that defines the mapping of your data, and params is an optional object that can be used to specify query parameters.

Here's an example of querying data from a ledger that stores todos on multiple lists:

// Querying all lists
const allLists = await ledger.query('type', { key: 'list'})

// Querying all todos from a specific list
const todosByList = await ledger.query(
  doc => {
    if (doc.type === 'todo' && doc.listId) return doc.listId
  },
  { key: listId }
)

In this example, we define two queries: allLists and todosByList. The allLists query retrieves all documents with a type property of 'list', while the todosByList query retrieves all documents with a type property of 'todo' and a listId property, for a specific list.

One of the advantages of using the ledger.query(mapFn, params) method is the ability to normalize your data for querying. This allows you to handle data variety and schema drift by normalizing any data to the desired query. For example, you could normalize data to lowercase or remove special characters before querying.

With the ability to define custom queries for any JSON data, you can handle data of any variety, making Fireproof an ideal solution for applications with complex data requirements.

Fireproof runs queries locally, making data processing faster than traditional cloud databases. You can query data with a variety of parameters, including range.

Below are some examples of how to use parameters in your queries:

// Querying all todos from a list within a specific date range
const todosByDate = await ledger.query(
  doc => {
    if (doc.type === 'todo' && doc.listId && doc.date) return [doc.listId, doc.date]
  },
  {
    range: [
      [listId, startDate],
      [listId, endDate]
    ]
  }
)


In this example, todosByDate queries for all todos belonging to a specific list and within a specific date range. Here, startDate and endDate can be used to specify the beginning and end of the range.

Valid paramaters you can use are:

{
    descending: boolean;
    limit: number;
    includeDocs: boolean;
    range: [IndexKey, IndexKey];
    key: DocFragment;
    keys: DocFragment[];
    prefix: DocFragment | [DocFragment];
}

External Indexers
Fireproof is designed to make indexing in external indexers efficient and seamless. Each ledger tracks it's change history and provides a feed of changes since any clock. If you don't provide a clock, you'll get all changes. Each change includes it's clock, so if you keep track of a high water mark, you can safely restart your indexing process and know you aren't missing any updates.

For single-user workloads it can often be enough to index the local dataset on page load, and use your index in memory. For larger data use-cases you probably want to use an indexer than remember everything it has added, and incrementally add new items as changes occur.

The technique here can also be used with vector indexers to manage LLM queries.

Flexsearch for fulltext indexing
Fireproof ships with a flexsearch integration. The included withFlexsearch function is a utility that allows you to add full-text search capabilities to your Fireproof ledger using the Flexsearch library. This function takes in a Fireproof ledger object and returns an object with a single method: search.

const { Index } = flexsearch

/**
 * Returns an object containing a search function that allows searching a Fireproof ledger with * Flexsearch.
 * @param {Object} ledger - The Fireproof ledger object to add search functionality to.
 * @param {Object} [flexsearchOptions={}] - Optional Flexsearch options object.
 * @returns {Object} An object containing a single search function.
 **/
function withFlexsearch(ledger, flexsearchOptions = {}) {
  const index = new Index(flexsearchOptions)
  let clock = null
  const search = async (query, options) => {
    const changes = await ledger.changes(clock)
    clock = changes.clock
    for (let i = 0; i < changes.rows.length; i++) {
      const { key, value } = changes.rows[i]
      await index.add(key, value.message)
    }
    return index.search(query, options)
  }
  return { search }
}


To use the withFlexsearch function, you should call it with a Fireproof ledger object as the first argument. An optional second argument can be passed as an object to configure Flexsearch.

const flexed = withFlexsearch(ledger, {
  encode: 'icase',
  tokenize: 'full'
})

The returned object flexed will contain a single method, search. This method can be used to search for documents in the ledger that contain a given query string.

const results = await flexed.search('red')

The search method takes two arguments: the query string and an optional options object. The options object can be used to configure the search algorithm.

How it works
The withFlexsearch function creates a Flexsearch index object and keeps it updated with changes to the Fireproof ledger. It does this by listening to changes in the ledger and adding or removing documents from the index as needed.

The search method simply searches the Flexsearch index for documents that match the given query string. Because the index is always up-to-date with the ledger, searches are fast and accurate.

Connection to GraphQL or Vector index
The technique used in withFlexsearch for adding search functionality to a Fireproof ledger could also be used for connecting to a GraphQL query index. Instead of using Flexsearch to index the data, you would use a GraphQL query index such as Elasticsearch or Apollo Studio.

To implement this, you would need to create a new function, similar to withFlexsearch, that listens to changes in the Fireproof ledger and updates the GraphQL index accordingly. This function could be called withGraphQL.

Similar to withFlexsearch, withGraphQL would take a Fireproof ledger object as its first argument and an optional configuration object as its second argument. The returned object would contain a single method, query, which could be used to perform GraphQL queries on the indexed data.

To ensure that the GraphQL index is always up-to-date with the Fireproof ledger, you would need to listen to changes in the ledger and update the index with any new data. This can be done by copying the changes code from withFlexsearch. Once the data has been indexed, you can use GraphQL to query it. Because the index is always up-to-date with the Fireproof ledger, you can be sure that your queries will return accurate results.

