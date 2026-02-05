useDocument
The useDocument hook is the recommended way to manage document state in React applications. It provides automatic persistence, real-time updates, and handles document merging for collaborative applications.

Basic Usage
Import useDocument from the return value of useFireproof:

import { useFireproof } from 'use-fireproof';

function App() {
  const { useDocument } = useFireproof("my-app");
  const { doc, merge, save, reset } = useDocument({ 
    text: "Initial text",
    timestamp: Date.now()
  });

  return (
    <div>
      <input 
        value={doc.text} 
        onChange={e => merge({ text: e.target.value })} 
      />
      <button onClick={save}>Save</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

Return Values
The useDocument hook returns an object with:

doc: The current document state
merge: Function to update specific fields while preserving others
save: Persist changes to the local ledger (and sync if enabled)
reset: Return to the initial document state
Working with Documents
Auto-generated IDs
For new documents, omit the _id field and Fireproof will generate one when you call save:

const { doc, merge, save, reset } = useDocument({
  text: "New document",
  timestamp: Date.now()
});

Explicit IDs
Use explicit IDs when working with real-world resources like user profiles:

const { doc, merge, save } = useDocument({
  _id: `user-profile:${userId}`,
  name: "",
  email: "",
  createdAt: Date.now()
});

Why Use merge?
The merge function is preferred over a full document setter because it:

Only updates specified fields
Preserves other fields
Reduces conflicts in collaborative scenarios
Example of partial updates:

function UserProfile() {
  const { useDocument } = useFireproof("my-app");
  const { doc, merge, save } = useDocument({
    _id: "user:123",
    name: "",
    email: "",
    preferences: {
      theme: "light",
      notifications: true
    }
  });

  return (
    <form>
      <input
        value={doc.name}
        onChange={e => merge({ name: e.target.value })}
      />
      {/* Only updates theme, preserves other preferences */}
      <button
        onClick={() => merge({ 
          preferences: { 
            ...doc.preferences, 
            theme: "dark" 
          }
        })}
      >
        Toggle Theme
      </button>
      <button onClick={save}>Save All Changes</button>
    </form>
  );
}

Best Practices
Document Granularity: Create one document per logical entity or user action

// Good: One document per todo item
const { doc, merge, save } = useDocument({
  text: "",
  completed: false,
  createdAt: Date.now()
});

Real-time Updates: Use with useLiveQuery for reactive UIs

function TodoList() {
  const { useDocument, useLiveQuery } = useFireproof("todo-app");
  const { doc, merge, save } = useDocument({ text: "", completed: false });
  const results = useLiveQuery("createdAt", { descending: true });

  return (
    <div>
      <input value={doc.text} onChange={e => merge({ text: e.target.value })} />
      <button onClick={save}>Add Todo</button>
      <ul>
        {results.docs.map(todo => <li key={todo._id}>{todo.text}</li>)}
      </ul>
    </div>
  );
}


Form Handling: Use merge for form inputs and save for submission

function ContactForm() {
  const { useDocument } = useFireproof("contacts");
  const { doc, merge, save, reset } = useDocument({
    name: "",
    email: "",
    message: ""
  });

  return (
    <form onSubmit={e => {
      e.preventDefault();
      save();
      reset();
    }}>
      <input
        value={doc.name}
        onChange={e => merge({ name: e.target.value })}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

For more examples and patterns, see the Fireproof LLM Code Generation Guidelines.

You can also subscribe directly to ledger updates, and automatically redraw when necessary. When sync is enabled you'll have both parties updating the same ledger in real-time. Here's an example of a simple shared text area (in real life you'd probably want to use an operational transform library like Yjs or Automerge for shared text areas, which both work great with Fireproof).

Acquire useDocument as the return value of useFireproof. Here's an example. This example creates a new document with a _id based on the customerId prop, and initializes the document with a name, company, and startedAt timestamp.

import { useFireproof } from 'use-fireproof';

const CustomerProfile = ({ customerId }) => {
  const { useDocument } = useFireproof("my-todo-app")
  const { doc, merge, save } = useDocument({
    _id: `${customerId}-profile`,
    name: "",
    company: "", 
    startedAt: Date.now()
  });
  return (
    <div>
      <form>
        Name:
        <input
          type="text"
          value={doc.name}
          onChange={(e) => merge({ name: e.target.value })}
        />
        Company:
        <input
          type="text"
          value={doc.company}
          onChange={(e) => setDoc({ company: e.target.value })}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            save();
          }}
        >
          Save
        </button>
      </form>
      <p>Started at: {doc.startedAt}</p>
      <pre>{JSON.stringify(doc, null, 2)}</pre>
    </div>
  );
};

Complete Example
Here's a complete example showing a collaborative note-taking application that demonstrates the key features of useDocument:

import { useFireproof } from 'use-fireproof';

function NotesApp() {
  const { useDocument, useLiveQuery } = useFireproof("notes-app");
  
  // Current note being edited
  const { doc: currentNote, merge, save, reset } = useDocument({
    title: "",
    content: "",
    tags: [],
    createdAt: Date.now()
  });

  // Query for existing notes
  const results = useLiveQuery("createdAt", { 
    descending: true,
    limit: 10 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    save();
    reset();
  };

  const addTag = (tag) => {
    merge({
      tags: [...currentNote.tags, tag]
    });
  };

  return (
    <div className="notes-app">
      {/* Create new note */}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Note title"
          value={currentNote.title}
          onChange={e => merge({ title: e.target.value })}
        />
        <textarea
          placeholder="Note content"
          value={currentNote.content}
          onChange={e => merge({ content: e.target.value })}
        />
        <input
          placeholder="Add tag"
          onKeyPress={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(e.target.value);
              e.target.value = '';
            }
          }}
        />
        <div className="tags">
          {currentNote.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <button type="submit">Save Note</button>
        <button type="button" onClick={reset}>Clear</button>
      </form>

      {/* Display existing notes */}
      <div className="notes-list">
        <h2>Recent Notes</h2>
        {results.docs.map(note => (
          <div key={note._id} className="note-card">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <div className="tags">
              {note.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <div className="note-meta">
              Created: {new Date(note.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotesApp;


This example demonstrates:

Using useDocument for form state management
Real-time queries with useLiveQuery
Handling complex nested updates with merge
Form submission and reset patterns
Working with arrays (tags)
Displaying timestamps
Auto-generated IDs for new notes
The application automatically persists changes, supports real-time updates across multiple users (when sync is enabled), and provides a clean way to manage document state in React.

