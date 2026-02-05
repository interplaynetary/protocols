useFireproof
The useFireproof hook provides access to Fireproof's React hooks and ledger instance. You'll use it to get the useLiveQuery and useDocument hooks configured for your application.

The hook accepts either a ledger name as a string, or a ledger instance. This allows you to configure a custom ledger name (instead of the default "useFireproof"), or pass an existing ledger instance. You can also see configuration examples in the Create React App bundler workaround.

The hook is also useful for distributing Fireproof's React hooks throughout your app using React Context.

Basic Example
import { useFireproof } from 'use-fireproof';

function MyComponent() {
  const { 
    database, 
    useLiveQuery, 
    useDocument 
  } = useFireproof(
    "ledger-name" | databaseInstance
  );

  return (<div>
    {/* ... your UI here ... */}
    </div>)
}

The return value looks like { useLiveQuery, useDocument, database } where the database is the Fireproof instance that you can interact with using put and get, or via your indexes. The useLiveQuery and useDocument functions are configured versions of the top-level hooks and are the recommended API to update your React app in real-time.

Use Live Query
You can configure useLiveQuery with a ledger name by instantiating the useFireproof hook directly. Here's an example:

import { useFireproof } from 'use-fireproof';

export default TodoList = () => {
  const { database, useLiveQuery } = useFireproof("my-todo-app")
  const todos = useLiveQuery('date').docs
  ...

Use Document
You can configure useDocument with a ledger name instantiating the useFireproof hook directly. Here's an example:

import { useFireproof } from 'use-fireproof';

export default TodoList = () => {
  const { useDocument } = useFireproof("my-todo-app")
  const [todo, setTodo, saveTodo] = useDocument({title: 'New Todo'})
  ...


Ledger subscription
Changes made via remote sync peers, or other members of your cloud replica group will appear automatically if you use the useLiveQuery and useDocument APIs. This make writing collaborative workgroup software, and multiplayer games super easy. If you want to manage subscriptions to the ledger yourself, you can use the database.subscribe function. This is useful if you want to manage your own state, or if you want to use the database API directly instead of the hooks.

Here is an example that uses direct database APIs instead of document and query hooks. You might see this in more complex applications that want to manage low-level details.

import { useFireproof } from 'use-fireproof';

function MyComponent() {
  const { ready, database } = useFireproof("ledger-name");

  // set a default empty document
  const [doc, setDoc] = useState({});

  // run the loader on first mount
  useEffect(() => {
    const getDataFn = async () => {
      setDoc(await database.get('my-doc-id'));
    };
    getDataFn();
    return database.subscribe(getDataFn);
  }, [database]);

  // a function to change the value of the document
  const updateFn = async () => {
    await database.put({ _id: 'my-doc-id', hello: 'world', updated_at: new Date() });
  };

  // render the document with a click handler to update it
  return <pre onclick={updateFn}>{JSON.stringify(doc)}</pre>;
}


This results in a tiny application that updates the document when you click it.