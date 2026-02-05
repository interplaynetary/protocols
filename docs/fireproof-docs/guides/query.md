
Querying Data in Fireproof
Fireproof provides a powerful querying API that allows you to search and retrieve data quickly. This is done using the database.query method and its sibling database.useLiveQuery for subscribing to latest results in a React component.

Basic Query Types
Simple Key Queries
The simplest way to query is by passing a string key name:

// Get all documents with a specific key
const results = await database.query('type')

Live Editor
const Setup = () => {

    const { useLiveQuery, database } = useFireproof("ship");

    const seed = async () => {
        await Promise.all([
            {role: "sailor", task: "Coil halyards", times: 3},
            {role: "sailor", task: "Pump bilge", times: 2},
            {role: "sailor", task: "Scrub deck", times: 3},
            {role: "sailor", task: "Daydream of shore", times: 9},
            {role: "cook", task: "Boil coffee", times: 1},
            {role: "cook", task: "Stir porridge", times: 2},
            {role: "navigator", task: "Take sights", times: 2},
            {role: "navigator", task: "Check compass", times: 6},
            {role: "navigator", task: "Wind clocks", times: 1},
            {role: "navigator", task: "Argue with captain", times: 0},
            {role: "mate", task: "Look for key to rum", times: 5},
            {role: "captain", task: "Argue with navigator", times: 3},
            {role: "captain", task: "Lock up rum", times: 1}
        ].map((todo, i) => {
            database.put({
                _id: i+1,
                completed: false,
                ...todo
            })
        }));
    }

    const { rows } = useLiveQuery('task');

    return <>
        <p>{ rows.length } tasks in database</p>
        <button onClick={seed}>Seed database</button>
    </>
}

render(<Setup/>)
Result
0 tasks in database

Seed database
info
By using Fireproof in these examples, the data in these examples will stick around in your browser.

Basic Queries
The simplest way to use database.query is to pass the string name of a key you're interested in. We also have some convienient options we can pass in if, say, we want to sort the tasks alphabetically.

Live Editor
const Alphabetical = () => {
    const { useLiveQuery, database } = useFireproof("ship");
    const { rows } = useLiveQuery('task', { descending: false });
    return <em>
        { rows.map((row) => row.doc.task).join(', ') }
    </em>
}

render(<Alphabetical/>)
Result
For doing more than just sorting and retrieving documents, query and useLiveQuery can be told how to filter, transform, or otherwise map your documents into a more query result.

For that, we have to pass in a mapFn. The mapFn is a synchronous function that defines the mapping of your data, and params is an optional object that can be used to specify query parameters.

Here's an example of querying data from a database that stores todos on multiple lists:

// Querying all lists
const allLists = await database.query('type', { key: 'list'})

// Querying all todos from a specific list
const todosByList = await database.query(
  doc => {
    if (doc.type === 'todo' && doc.listId) return doc.listId
  },
  { key: listId }
)

In this example, we define two queries: allLists and todosByList. The allLists query retrieves all documents with a type property of 'list', while the todosByList query retrieves all documents with a type property of 'todo' and a listId property, for a specific list.

One of the advantages of using the database.query(mapFn, params) method is the ability to normalize your data for querying. This allows you to handle data variety and schema drift by normalizing any data to the desired query. For example, you could normalize data to lowercase or remove special characters before querying.

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

Map Function Queries
For more complex queries, you can use a map function that defines how to index and filter your data:

const mapFn = (doc, emit) => {
  if (doc.type === 'todo') {
    emit(doc.listId, doc)
  }
}

const results = await database.query(mapFn)

The mapFn receives each document and can emit key-value pairs to build the index. The emit function takes two parameters:

key: The index key to store (can be a string, number, or array)
value: The value to store (typically the document or a subset of it)
Query Parameters
The query API accepts several parameters to control the results:

const params = {
  descending: boolean,    // Sort in descending order
  limit: number,         // Maximum number of results
  includeDocs: boolean,  // Include full documents in results
  range: [start, end],   // Query within a key range
  key: value,            // Query for exact key match
  keys: [value1, value2], // Query for multiple exact keys
  prefix: value          // Query for keys with prefix
}

Range Queries
Query documents within a specific range:

// Get todos between dates
const results = await database.query(
  doc => doc.type === 'todo' && [doc.listId, doc.date],
  {
    range: [
      [listId, startDate],
      [listId, endDate]
    ]
  }
)

Prefix Queries
Query documents with keys that share a common prefix:

// Get all todos from a specific list
const results = await database.query(
  doc => doc.type === 'todo' && [doc.listId, doc._id],
  {
    prefix: [listId]
  }
)

Advanced Query Patterns
Compound Keys
Use arrays as keys to create compound indexes:

// Index by category and date
const results = await database.query(
  doc => [doc.category, doc.date, doc._id],
  { descending: true }
)

Filtering and Transformation
The map function can filter and transform data before indexing:

const results = await database.query(
  doc => {
    if (doc.type === 'todo' && !doc.archived) {
      // Transform the document before indexing
      emit(doc._id, {
        id: doc._id,
        text: doc.text,
        completed: doc.completed
      })
    }
  }
)

Pagination
Use limit and the last key from previous results to implement pagination:

async function getPage(lastKey = null) {
  const results = await database.query(
    'type',
    {
      limit: 10,
      startkey: lastKey,
      descending: true
    }
  )
  return results
}