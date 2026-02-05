
Ledger
Fireproof’s cryptographic causal consistency ensures each update contains the hash of the state it was based on. This causal consistency is also maintained for merges. The data structures ensure that changes are recorded alongside the ledger snapshot at the time of the update, so the diff can be fully reconstructed, giving a lightweight local-first version of blockchain guarantees, without costly byzantine agreement protocols.

Merges are deterministic, so each participant will end up with the same result. The Merkle CRDTs and prolly tree indexes Fireproof uses are optimized to minimize write amplification while ensuring all peers resolve events to the same representation.

Fireproof’s content-addressed blockstore ties each event to a unique CID, making updates idempotent and compressing duplicates. You can start small with local data alone, then add sync and finality as your application grows, all while maintaining a complete chain of evidence for every state transition.

Finality can be enforced by requiring that no changes older than a known ancestor can be accepted. This can be accomplished at the application layer – the Fireproof team is ready to help deploy advanced use cases.

Transactions with preconditions are only supported in an optional centralized mode and must be synced via a single writer so it can enforce invariants. This enables the administrator to reject invalid updates, offering more granular policy control, for instance, minimum balance requirements and double entry bookkeeping. The cost is borne here by the embedded application side, which must be able to handle rollback errors when merges are invalid. Ledgers can be configured independently so workloads that are mostly offline can interact with centralized resources when necessary.

Auditability can be enhanced by requiring all updates to be signed by device-resident keys. Fireproof’s causal consistency can extend to signing principals at the edge, making the ledger even more robust against tampering. On the roadmap, functional validation allows for field-level verification and update control. Join our community to talk about how rules can be enforced in distributed applications.