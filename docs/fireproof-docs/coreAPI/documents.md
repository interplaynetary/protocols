
Documents
Fireproof uses JSON documents to store data. Documents are stored in a single database, and each document has a unique ID. Documents can be read, written, and deleted. Validation functions can prevent unwanted changes from being written to the database.

Document read and write
Fireproof uses a simple API for reading and writing documents. You can read a document by its ID, and write a document by passing it to the put function. The put function returns an ok response with the document's ID and clock.

Read with get()
await database.get("my-doc-id")

This returns a document with an _id field that matches the ID you passed in. If the document doesn't exist, it throws an error.

const theDocument = await database.get("my-doc-id")
// { _id: "my-doc-id", hello: "world" }

Create with put()
Creating and reading a document, where Fireproof generates a random ID:

const ok = await database.put({ hello: "world" })
// { id, clock }
const theDocument = await database.get(ok.id)
// { _id: ok.id, hello : "world" }

If you don't specify an _id in your document body, Fireproof will generate one for you. That is what is returned as ok.id above.

Update with put()
You can put to the same id over and over again, like this:

theDocument.hello = "again"
const putResponse3 = await database.put(theDocument)
theDocument.hello = "universe"
const putResponse4 = await database.put(theDocument)

If multiple users are working this way, whoever writes last wins, overwriting the other changes. (Coming soon: multi-version concurrency control to provide more options.)

Store files put({_files : ...})
If you add an upload <input> to your html like this:

<input accept="image/*" title="save to Fireproof" type="file" id="files" multiple>


And an event handler:

function handleFiles() {
  const fileList = this.files;
  const doc = {
    type: "files",
    _files: {}
  }
  for (const file of fileList) {
    // assign the File object to the document
    // under doc._files["myname.jpeg"]
    doc._files[file.name] = file
  }
  const ok = database.put(doc);
}

const fileInput = document.getElementById("files");
fileInput.addEventListener("change", handleFiles, false);

Fireproof will take care of encoding it to UnixFS, encrypting it, and replicating with your chosen storage backend. Files are synced outside the main database, so they replicate on-demand and then are made available offline via the database. By default the files are encrypted, so they are safe to store in untrusted storage.

Load file data
Uploaded files are available as a File object, which you can access by calling the file() method on the file metadata.

await doc._files["myname.jpeg"].file()

The document looks like:

{
  _id: "my-doc",
  _files: {
    "myname.jpeg": {
      type: "image/jpeg",
      size: 12345,
      file: () => Promise<File>
    }
  }
}

In the example below, note how we use await to get the file from the promise, and also that we've wrapped each file in an async function so the images can load in parallel. The user of revokeObjectURL is important to avoid memory leaks. Here is a React component that handles this.

const doc = await database.get(ok.id)

// adjust this for your app
const li = document
            .querySelector('ul')
            .appendChild(document.createElement('li'))

for (const file of Object.keys(doc._files)) {
  (async () => {
    const meta = doc._files[file]
    if (meta.file && /image/.test(meta.type)) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(await meta.file());
      img.height = 100;
      img.onload = () => {
        URL.revokeObjectURL(img.src);
      };
      li.appendChild(img);
    }
  })();
}

Read more about Files on the web at MDN. And follow along with feature developement.

Public Files
The public files API looks just like above, except you save to doc._publicFiles instead of doc._files and the files are not encrypted. This is useful for storing files that you want to share with the world, like images for your website. In addition to the car, cid, and size properties, public files also have a url property that you can use to access the file directly from the web3.storage content delivery network.

The feature is designed to support systems like self-publishing blogs, which can write their own markdown to html output, reference assets, etc. The default encrpyted _files interface is better suited to social media sharing, field data collection, and other controlled access data sharing.

The public file feature is only available on the IPFS connector.

Multi-version concurrency control (MVCC) (available in alpha, coming soon in beta)
If you want to prevent that scenario, you can enable multi-version concurrency control, which will require that writers prove they are updating from the latest version, or else the write fails. This can give them a chance to reload from the source and incorporate their changes before writing, instead of doing it later as a conflict merge.

The put response includes an id which is unique for the document in the database, and a clock which represents the current snapshot of the database. You can also request that Fireproof inline the clock with the document by passing the { mvcc: true } option:

const theDocumentV4 = await database.get(putResponse.id, { mvcc: true })
// theDocumentV4._clock === putResponse4.clock


If the clock is inline in the document it will protect against writing with stale data. Here's what happens if another update comes in before the document loaded with { mvcc: true }:

theDocument.hello = "friends"
const putResponse5 = await database.put(theDocument)
// now theDocumentV4, which has _clock, is out of date
const putResponse5 = await database.put(theDocumentV4)
// throws new Error('MVCC conflict, document is changed, please reload the document and try again.')


In this way you can protect against users being surprised by accidental data overwrites.