Working with Files
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

Fireproof will take care of encoding the file to UnixFS, encrypting it, and replicating with your chosen storage backend. Files are synced outside the main database, so they replicate on-demand and then are made available offline via the database. By default the files are encrypted, so they are safe to store in untrusted storage.

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