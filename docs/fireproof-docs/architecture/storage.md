
Storage
Fireproof stores each data file as an encrypted container that begins with a pointer to the root blocks of the Merkle CRDT. These pointers reference the entire ledger history, allowing each file to include the complete set of content-addressed blocks that define its state. Because every block is immutable and linked by quantum-resistant hash references, the entire structure is self-verifying. When a data file is loaded, it is first decrypted, then an in-memory index of the contained blocks is built. Any subsequent block access involves verifying the block’s hash to ensure integrity, whether reads come from a file, a remote gateway, or memory.

File updates are treated as opaque by the metadata endpoint. Rather than parsing the data itself, the metadata layer only stores references of the form:

interface CRDTEntry {
  data: string;
  parents: string[];
  cid: string;
}

This means the client asserts which file supersedes which prior versions. When clients see multiple concurrent files, they load them in parallel and deterministically merge them using Fireproof’s internal CRDT. The storage engine can be adapted to support any other IPLD-based applications. All participants end up with the same final state, even when updates happen offline or across different backends.

To handle ongoing edits, Fireproof maintains a log of links to the latest cryptographic diffs making up the current data set to facilitate concurrent loading. By default, each 100 updates triggers a compaction routine that produces a new, smaller file containing the latest state, while pruning older file references from the active sync set. Remotes typically refrain from pruning to accommodate older clients that may still need legacy files. Multi-level compaction is under development to ensure the process remains efficient in large datasets, preventing compaction overhead from growing unbounded.

Fireproof's persistence model leverages Content Identifiers (CIDs) to bind object names to data content. This binding provides strong data integrity guarantees and enables efficient transactions through implicit deduplication and immutable caching on reads. To fulfill our promise of encrypted data storage that can be safely distributed across public infrastructure, we extend the traditional CID model with an additional encryption layer.

While the CID (object name) is generated from the unencrypted content, the stored data object itself is encrypted. This approach intentionally breaks from conventional content-addressable storage systems where content must be verifiable directly against the object name CID through hash algorithms. While this means Fireproof cannot integrate directly with systems like IPFS without disabling encryption, we prioritize the security guarantee of always-encrypted data. To maintain content integrity verification for encrypted objects, each encrypted block includes a header containing the initialization vector (IV) for the encryption algorithm and a key reference. These headers enable Fireproof to handle encryption during data access and synchronization.

The sync process can re-encrypt data for specific sync partners while maintaining referential integrity - the object retains its original CID despite being encrypted with different keys. For third-party synchronization, key material distribution becomes essential to enable partners to verify the CID-content relationship. While we plan to implement the double-ratchet protocol for secure key exchange, the current cloud implementation supports manual key sharing and assumes a non-public metadata distribution with a simple key gossip protocol. This means sync partners in the current implementation can see each other's public keys, a limitation that will be addressed in future security enhancements.
