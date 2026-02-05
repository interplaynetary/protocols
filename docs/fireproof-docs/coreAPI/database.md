Database
Fireproof database operations include creating, reading, updating, and deleting documents, as well as querying and indexing.

Read about creating and configuring a database, and APIs for interacting with data. If you are writing a React application, you will probably want to use the React Hooks instead. These APIs are for advanced use cases or server-side code.

See the basics page for a super quick start about the raw database API

Creating a Database
fireproof("database-name")

Opens a database with the given name, safe to call repeatedly.

import { fireproof } from 'use-fireproof'

const database = fireproof('my-database')

Most of the time you will create a database using fireproof("my-database"). The database name is optional, and if you don't provide one, the database will operate in-memory only. This is useful for testing, or for creating a database that you don't want to persist.

The fireproof method will load the database config from the correct storage location, and will create the database if it doesn't exist. You can also load with config:

Database Config
fireproof("database-name", configObject)

You can call fireproof with a config object. Pass { public: true } to bypass encryption. This is useful for creating a database that you want to share with other users.

const database = fireproof('my-database', { public: true })

If you want to manage your own database config, you can call Fireproof.fromConfig("my-database", configObject) method instead, where configObject has the necessary fields. See Database Headers for more information about managing your own config. Please contribute pull requests to move local storage configuration here instead of in the build.

Document APIs
Read more about the document API. Create, read, update, delete with

Query and Index APIs
Fireproof allows you to create flexible indexes on any document field. You can then query the index to find documents that match your query. Read more about the query and index API.

All Docs
allDocs()
You can query all documents in a database using the database.allDocs() method. This will return an array of all documents in the database.

const docs = await database.allDocs()

Subscribing to Changes
You can register a callback to be notified when a document changes. This is useful for updating your UI in real-time.

subscribe()
Subscriptions are attached using the database.subscribe((changes) => {...}) method, which returns a callback for unsubscribing, compatible with React's useEffect hook.

Here is an example of how the useDocument hook uses subscriptions to update the UI:

useEffect(
  <React.EffectCallback>(() =>
    database.subscribe((changes: { key: string; id: string }[]) => {
      if (changes.find((c) => c.key === id)) {
        refreshDoc();
      }
    })),
  [id, refreshDoc],
);


Querying Changes
changes()
You can also query the database for changes since the last time you asked. This is useful for updating external indexes and is used internally by Fireproof for syncing data between ledgers. To get the recent changes, call database.changes(). This will return an array of changes since the last time you called changes(). The changes are returned in the order they were made.

const changes = await database.changes()
// changes.rows is an array of changes
// changes.clock is the high water mark
const didPut = await database.put({ foo: 'bar' })

const newChange = await database.changes(changes.clock)
// newChange.rows will contain only the new change

You can see an example of how this is used in the external indexer documentation.