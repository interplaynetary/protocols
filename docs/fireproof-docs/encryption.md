
Encryption
Fireproof encryption operates at the block level. The process is end-to-end, meaning that data is encrypted as soon as it's written and remains encrypted until it's explicitly decrypted for reading, ensuring that the data is always secure during transit and at rest. The encryption is symmetric, meaning the same shared secret key is used for both encryption and decryption of data. Encryption keys are shared over the ledger's metadata endpoint, which is where applications can manage access control.

The encryption process itself employs the Advanced Encryption Standard (AES) in Galois/Counter Mode (GCM), a widely used encryption algorithm known for its security and efficiency. Fireproof uses a 256-bit key for encryption. This encryption process is applied at the block level, making each block of data a discrete unit of encryption. In the context of ledgers, this encryption scheme is often explained using the concept of "proofs" or "Merkle proofs". These proofs describe the state of the ledger as a list of blocks with a root node. This root node, through a series of cryptographic hashes, effectively fingerprints the entire ledger state. As such, any query against the ledger can be verified as authentic and unaltered by comparing its associated Merkle proof with the current root of the ledger. This further enhances the integrity and security of data in Fireproof.

Configuring encryption
By default, Fireproof employs 256-bit AES-GCM encryption for all persistent ledgers. Persistence and encryption are activated by setting a ledger name using the fireproof('ledger-name') function. This not only provides data persistence but also enables robust encryption for enhanced data security.

While encryption is a vital aspect of data security, there may be instances, particularly during testing or development, or for content-delivery workloads, where you might want to disable it. For such cases, Fireproof allows disabling encryption via the configuration option { public: true }. Simply set this to disable encryption. This functionality also allows you to create unencrypted ledger files for publishing.

Key management is an integral part of the encryption process. By default, Fireproof stores this key material in the browser's localStorage, ensuring it is readily available for encryption and decryption processes. However, it's crucial to remember that any process that needs to read the encrypted data must have access to this key material. Therefore, you must securely share the key with any reader process. Please handle this key with utmost care to maintain the integrity and confidentiality of your data.

How encryption works
The path that cleartext data takes to become encrypted in Fireproof involves a series of steps, starting from blocksToEncryptedCarBlock() function and ending in a ready-to-save CAR file. Here are the steps in detail:

Starting with blocksToEncryptedCarBlock() Function: This function takes as input the CID of the root block in the block store, the blocks of data that need to be encrypted, and the key material for encryption.
Conversion of Key Material: The key material, passed in as a hex string, is converted into a Buffer using Buffer.from(keyMaterial, 'hex'), which forms the encryption key.
Creation of CID List: Next, a list of CIDs (Content Identifiers) is created from the blocks of data that need to be encrypted. This list is used to keep track of which blocks are being encrypted.
Encryption of Blocks: For each block in the list of blocks, the encrypt generator function is called. This function takes the list of CIDs, a get function to retrieve the block associated with a CID, the encryption key, a hash function, a chunker, a cache, and the root CID as input.
Atomic Encryption of Each Block: Inside the encrypt function, each block is atomically encrypted. This means that each block is encrypted individually, with the links inside each block pointing to the unencrypted block addresses. This is done by the codec.encrypt() function, which performs the actual encryption using the AES-GCM algorithm.
Creation of Unencrypted Graph: After all blocks are encrypted, an unencrypted graph is created. This graph links to all the encrypted blocks, ordered by block address. This is achieved by the create() function from the prolly-trees/cid-set module, which creates a new CID set from the list of CIDs of the encrypted blocks.
Creation of Encrypted Root Block: A final unencrypted block is created that links to the unencrypted graph and a reference to the CID of the encrypted root block of the original graph. This is done using the encode function from the multiformats/block module. This block is the "encrypted root" block.
Yielding Encrypted Blocks and Root: All encrypted blocks, the unencrypted graph, and the encrypted root block are then yielded by the encrypt generator function.
Aggregating Encrypted Blocks: The blocksToEncryptedCarBlock function collects all the yielded blocks and stores them in the encryptedBlocks array. It also keeps track of the last block yielded, which is the encrypted root block.
Converting to CAR Format: Finally, the blocksToCarBlock function is called with the CID of the encrypted root block and the encryptedBlocks array as arguments. This function constructs a CAR (Content-Addressable Archives) file, which is a portable format for storing IPLD (InterPlanetary Linked Data) data. This is done by writing the root CIDs and the blocks into a buffer using a CAR block writer.
Completing the Encryption Process: The blocksToEncryptedCarBlock function then returns the CAR file containing the encrypted blocks. This CAR file is ready to be saved to disk, pinned in IPFS, or stored in Filecoin or S3.
So, to sum up, the cleartext data starts as a set of blocks in a block store, gets atomically encrypted block by block with an unencrypted graph linking all encrypted blocks, and finally gets packaged into a CAR file with a single root CID, ready to be saved or transferred. This encrypted CAR file represents the entire encrypted ledger state and cannot be read or queried until the entire file is decrypted back into a block store.

Advanced key management patterns
Fireproof supports a range of advanced key management patterns designed to enhance security and flexibility. Each ledger commit in Fireproof is written as its own Content Addressable Archive (CAR) file. While these files share the same encryption key by default, it's possible to configure each to use an independent key, offering the ability to track keys in a separate system or utilize them ephemerally.

One advanced pattern involves the use of User-Controlled Authorization Networks (UCANs). In this scheme, you can create a UCAN document establishing a verifiable link between a Fireproof commit, the writer's UCAN Decentralized Identifier (DID), and the key material. The writer encrypts the diff's key with the public keys of each reader, allowing each reader to independently decrypt the one-time key material and ingest the Fireproof commit blocks. This approach securely shares data with a large group of readers, and any compromised keys will only affect the associated blocks.

By default, each Fireproof installation maintains its key locally, and data synchronization occurs over an encrypted channel with authenticated parties. This design balances the capability to share data securely while avoiding unnecessary key sharing.

Another pattern involves sharing the key with a server-side rendering agent. In this case, transactions are encrypted on the client side and replicated to the cloud as encrypted data. The server doesn't persist the key; instead, the client provides the key with each query. As a result, the server can access the ledger for the duration of the request or session. This approach requires trust in the server, but as the client can always roll back changes, the server can't cause permanent damage.

Enjoy
We hope this guide has helped you understand how Fireproof handles encryption and key management. If you have any questions or feedback, please reach out to us.

There was a block of data plain,
Into cipher it was lain.
With AES-GCM's hold,
Its secret was told,
In a CAR v2 index to remain.