/**
 * Core Protocol Collective
 * Pure collective membership and recognition logic
 */

export * from './schemas.js';
export * from './collective-recognition.js';

// Selectively export from collective-membership to avoid conflicts with schemas
export {
	shouldUpdateCapacityMembership,
	updateCapacityMembership
} from './collective-membership.js';

