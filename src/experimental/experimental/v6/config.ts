/**
 * Free Association Protocol v6 - Configuration
 * 
 * Tunable parameters for v6 satisfaction-based learning
 */

/**
 * v6 Configuration Parameters
 */
export const V6_CONFIG = {
    /**
     * Oscillation Detection
     */
    oscillation: {
        // Damping factor when oscillation detected (0.0-1.0)
        damping_factor: 0.7,

        // Threshold for detecting significant need change (20%)
        change_threshold: 0.2,

        // Number of historical points to track
        history_length: 10
    },

    /**
     * Offering Policy Defaults
     */
    offering: {
        // Default commitment rate (100% of allocation)
        default_commitment_rate: 1.0,

        // Auto-publish offers by default
        default_auto_publish: false
    },

    /**
     * Acceptance Policy Defaults
     */
    acceptance: {
        // Default strategy (manual review)
        default_strategy: 'manual' as const,

        // Auto-accept by default
        default_auto_accept: false
    },

    /**
     * Satisfaction Bounds
     */
    satisfaction: {
        // Minimum satisfaction rating
        min: 0.0,

        // Maximum satisfaction rating
        max: 1.0,

        // Default satisfaction (neutral, no data yet)
        default: 0.5
    },

    /**
     * Learning Parameters
     */
    learning: {
        // Minimum number of ratings before using satisfaction data
        min_ratings_threshold: 1,

        // Weight for new satisfaction data vs historical (0.0-1.0)
        // Higher = more responsive to recent data
        learning_rate: 0.3
    }
} as const;

export type V6Config = typeof V6_CONFIG;
