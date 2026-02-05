Sharing and Sync
Fireproof's verifiable CRDTs make it ideal for multi-user applications involving mission-critical data. Because Fireproof's clocks are multi-device aware, and each operation corresponds to a snapshot that is archived by default, user collaboration is as simple and safe as sharing a link. This article will help you transform any app that uses Fireproof into a multi-user experience.

Modular Connectors
Fireproof works with any cloud storage provider. Because encryption keys are managed separately from the data, you aren't giving control of your data to 3rd parties, you are just using the cloud as a place to store opaque bytes. Content addressing makes this fast and secure, so it doesn't matter much which cloud provider you choose. Fireproof ledger metadata consists of a pointer to the latest immutable ledger commit (CAR file) and its encryption key. Assuming your CAR data files are accessible you can keep Fireproof metadata in your existing authenticated session management, cloud provider, or pub/sub system.

Fireproof provides a variety of connectors, including web3.storage — a web-first bridge to the IPFS ecosystem. This connector Fireproof is configured to work with user-owned storage accounts using UCAN, so application developers can ship without having to worry about the business implications of managing user data. Hiding these implementation details from your users is easy, either by using our S3 adapter instead, or delegating your users the ability to write to your app's web3.storage account.

Built-in Sharing 👥
We know that getting data between your users is the second thing you'll want to do after you have a working app experience. Fireproof APIs allow you to connect ledgers among multiple users with just a few lines of code by forwarding simple tokens. Read on for an example.

PartyKit
The PartyKit adapter assumes you are deploying via the partykit command-line tool. Jump to the PartyKit connector docs installation instructions. Here is a summary:

First, install the connector:

npm install @fireproof/partykit

Next, configure your project:

{
  "name": "my-app-name",
  "main": "src/partykit/server.ts",
  "parties": {
    "fireproof": "node_modules/@fireproof/partykit/src/server.ts"
  }
}


If you haven't added PartyKit to your app, run the PartyKit CLI:

npx partykit init

Finally, connect to the party in your client code:

import { useFireproof } from 'use-fireproof'
import { connect } from '@fireproof/partykit'

const { ledger } = useFireproof('my-app-ledger-name')
const connection = connect.partykit(ledger, process.env.PUBLIC_PARTYKIT_HOST!)


The end result is that your app will sync data with all users connected to the party. Perfect for collaboration, or for sharing data between a user's devices. Take a look at the full instructions in the PartyKit connector docs.

IPFS
Assuming you already have a working app with data in Fireproof, you can connect your users to the cloud with just a few lines of code.

First, import the Fireproof library:

import { fireproof } from 'use-fireproof'
import { connect } from '@fireproof/ipfs'

Next, initialize a Fireproof ledger instance with the name 'myLedgerName':

const ledger = fireproof('myLedgerName')

Then, connect to the ledger:

const cx = connect.ipfs(ledger)

Once the connection is ready, you can check if the user is already authorized:

cx.ready.then(() => {
  if (cx.authorized) {
    // Hide the email input field
  }
})

If the user is not authorized, get the email from user input and authorize the user:

else {
  cx.authorize(email)
}

The call to cx.authorize(email) will send the user a validation email from web3.storage. Once they click the link, they will be able to read and write to the cloud. Logging into the app from another device is as simple as entering the same email address. Fireproof automatically syncs a copy of the ledger to the new device. Connected devices continue to sync.

In the repo, there is a full plain JavaScript application that utilizes connect as well as the sharing features described below. You can try a running copy of it here.

Note: Device Authorization
The IPFS connector uses self-sovereign keys, generated and held by non-extractable keypair APIs in the browser. This means that the user's private signing key is never exposed to the server, and the server can't impersonate the user. The downside is that the user must be online to authorize new devices. In practice, users will need to have more than one logged-in device open at the same time to transfer initial credentials. After that, the devices can operate independently.

Share with Friends
The below flow is meant as a bare-bones illustration of the moving parts involved. If you want to make the experience invisible to users, you can exchange these tokens in the background via your app server (if you have one.) If you don't plan to run a server, you can also streamline the user experience compared to the below description, at the expense of a little more complexity in your handshake code, as described in the linked issue.

Say you used Fireproof's file-sharing support to build an encrypted photo gallery, and now you want to invite friends to upload. Once all the parties are authorized, sharing is as simple as:

const myShareToken = await cx.shareToken()

The shareToken is a long DID key that looks something like this: did:key:z4MXj1wBzi9jUstyPWCrgoqyPVcZgGUPU51VmPmChhgAQ8wNqddQ3kWJ763SABec1ddBFQjk5BB7Vf1aHAkrQVpZpFqPXbechbi4STuXmmTFB4R7tRAWFeCWoHoEfn4yGvyCc7PZvTDtn9jD8mHANv3yGNvHHR1zgfHYLXsjzHyKjDpxumjPWP8uy3Sh7T2qNCsW2R2uxYHaSqRZFQ3U651EaUgf5EJNfGWRAtdXKBXJ2tPj3agEwd1UQUJHpjrfxg5wccQJ4HmNJBFrMt4CXZ8tzxkzYRc1Zx6EM6GurghidZEccKHVpKbiUFPai76CsB951vQT1GkC4DSxhDDHA4mYgCAaPnVhWzcrEqmvbt4a9ydg5jAxQ

It's probably best to think of it as an ugly user handle or contact ID. It corresponds to the user's current device public key. By communicating it to people you want to collaborate with, you give them the opportunity to share ledgers with you.

On the ledger owner's device, they can initiate sharing by calling:

const inviteLinkCid = await cx.shareWith(myShareToken)

The resulting CID looks something like this: bafkreifzpfmjjmkrqwtzazzj46l6m4sa4umhyd5fv7hvjauyz2eftcvbda -- this material is safe to publish because it can only be utilized by someone who has the private key the share token corresponds with. Send this inviteLinkCid to the person who's share token you used to initiate the share. They can then call:

const { ledger, connection } = await cx.joinShared(inviteLinkCid)


Now you can query your shared ledger as usual, only results will be synced with the other participants, enabling interactive collaboration.

Open a snapshot
Once you are connected, you can open a snapshot of the ledger by calling ledger.openDashboard() which will open a new window with a read-only view of the ledger. This is useful for debugging, or for sharing a read-only view of the ledger with a friend.

S3 Storage
Read about configuring Fireproof to use S3 here.

Limitations
These are not inherent limits to the software, just things that haven't been implemented yet.

Safari multi-device authorization. This is something with the delegation handling, looks fixable.
Faster handshakes. Fireproof uses w3clock as the source of truth for merging multi-user writes. It doesn't currently support websockets, but since it uses Cloudflare durable objects, this is addable. In the short term we are using polling, which works but is not thrilling.
We can use the current (not fast) channel for WebRTC signaling, and use WebRTC data-channel upgrade to near real-time sync, even without any changes to w3clock, so that is on the roadmap. Your app will get much faster with only a module upgrade on your part.

Next Steps
Please build an app, follow the instructions above to connect it for sharing, and tell us about it on our Discord! Here are some app ideas to get started.

Video Demo
You can see a video demo to accompany these docs here.