/**
 * Free Association Protocol - Core
 * 
 * Priority aligned capacity distribution protocol.
 * Pure, framework-agnostic implementation.
 * 
 * For subpath imports, use:
 * - @playnet/free-association/schemas
 * - @playnet/free-association/allocation
 * - @playnet/free-association/tree
 * - @playnet/free-association/itc
 * etc.
 */

// Core exports (main entry point)
// Distributed IPF Allocation Protocol
export {
	updateProviderState,
	generateFlowProposals,
	updateRecipientState,
	type DistributedIPFState,
	type FlowProposal
} from './allocation.js';

export { calculateCollectiveRecognitionDistribution } from './distribution.js';
export { mutualFulfillment } from './tree.js';
export type { Commitment, NeedSlot, AvailabilitySlot, Node } from './schemas.js';

// ITC (Interval Tree Clocks) for causality tracking
export {
	seed as itcSeed,
	event as itcEvent,
	fork as itcFork,
	join as itcJoin,
	peek as itcPeek,
	leq as itcLeq,
	equals as itcEquals,
	type Stamp as ITCStamp,
	type Id as ITCId,
	type Event as ITCEvent
} from './itc.js';
