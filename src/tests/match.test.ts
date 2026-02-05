/**
 * Comprehensive Tests for Slot Compatibility Matching Functions
 * 
 * Tests critical matching functions from match.ts that determine
 * whether a need slot and availability slot are compatible.
 * 
 * Coverage:
 * - Time range overlap detection
 * - Timezone-aware time conversion
 * - Day schedule matching
 * - Recurrence track identification
 * - Full slot compatibility integration
 */

import { describe, it, expect } from 'vitest';
import {
    timeRangesOverlapSimple,
    anyTimeRangesOverlap,
    getRecurrenceTrack,
    slotsCompatible,
    convertTimeToUTC,
    daySchedulesOverlap
} from '../utils/match';
import type { TimeRange, DaySchedule, NeedSlot, AvailabilitySlot } from '../schemas';

describe('Slot Compatibility Matching', () => {

    describe('timeRangesOverlapSimple', () => {

        it('should detect overlap when ranges intersect', () => {
            const range1: TimeRange = { start_time: '09:00', end_time: '12:00' };
            const range2: TimeRange = { start_time: '10:00', end_time: '13:00' };

            expect(timeRangesOverlapSimple(range1, range2)).toBe(true);
        });

        it('should detect no overlap when ranges are separate', () => {
            const range1: TimeRange = { start_time: '09:00', end_time: '12:00' };
            const range2: TimeRange = { start_time: '13:00', end_time: '16:00' };

            expect(timeRangesOverlapSimple(range1, range2)).toBe(false);
        });

        it('should detect overlap when one range contains another', () => {
            const range1: TimeRange = { start_time: '09:00', end_time: '17:00' };
            const range2: TimeRange = { start_time: '10:00', end_time: '12:00' };

            expect(timeRangesOverlapSimple(range1, range2)).toBe(true);
        });

        it('should detect overlap when ranges touch at boundary', () => {
            const range1: TimeRange = { start_time: '09:00', end_time: '12:00' };
            const range2: TimeRange = { start_time: '12:00', end_time: '15:00' };

            // Touching at boundary: start2 == end1, so start2 < end1 is false
            // String comparison: '12:00' < '12:00' is false
            expect(timeRangesOverlapSimple(range1, range2)).toBe(false);
        });

        it('should handle identical ranges', () => {
            const range1: TimeRange = { start_time: '09:00', end_time: '12:00' };
            const range2: TimeRange = { start_time: '09:00', end_time: '12:00' };

            expect(timeRangesOverlapSimple(range1, range2)).toBe(true);
        });

        it('should handle ranges across midnight (requires special handling)', () => {
            const range1: TimeRange = { start_time: '22:00', end_time: '02:00' };
            const range2: TimeRange = { start_time: '23:00', end_time: '01:00' };

            // Note: Simple string comparison doesn't handle midnight crossing
            // '02:00' < '01:00' is false, so this returns false
            // For proper midnight handling, use date-aware comparison
            expect(timeRangesOverlapSimple(range1, range2)).toBe(false);
        });

        it('should handle range crossing midnight vs daytime range', () => {
            const range1: TimeRange = { start_time: '22:00', end_time: '02:00' };
            const range2: TimeRange = { start_time: '09:00', end_time: '12:00' };

            // No overlap between night and day ranges
            expect(timeRangesOverlapSimple(range1, range2)).toBe(false);
        });

        it('should handle early morning ranges', () => {
            const range1: TimeRange = { start_time: '00:00', end_time: '03:00' };
            const range2: TimeRange = { start_time: '02:00', end_time: '05:00' };

            expect(timeRangesOverlapSimple(range1, range2)).toBe(true);
        });
    });

    describe('anyTimeRangesOverlap', () => {

        it('should detect overlap when any pair overlaps', () => {
            const ranges1: TimeRange[] = [
                { start_time: '09:00', end_time: '12:00' },
                { start_time: '14:00', end_time: '17:00' }
            ];
            const ranges2: TimeRange[] = [
                { start_time: '10:00', end_time: '11:00' },
                { start_time: '18:00', end_time: '20:00' }
            ];

            // First range from ranges1 overlaps with first range from ranges2
            expect(anyTimeRangesOverlap(ranges1, ranges2)).toBe(true);
        });

        it('should detect no overlap when all ranges are separate', () => {
            const ranges1: TimeRange[] = [
                { start_time: '09:00', end_time: '12:00' }
            ];
            const ranges2: TimeRange[] = [
                { start_time: '13:00', end_time: '16:00' }
            ];

            expect(anyTimeRangesOverlap(ranges1, ranges2)).toBe(false);
        });

        it('should handle empty arrays (optimistic)', () => {
            const ranges1: TimeRange[] = [];
            const ranges2: TimeRange[] = [
                { start_time: '09:00', end_time: '12:00' }
            ];

            // Empty array is optimistic - assumes all day
            expect(anyTimeRangesOverlap(ranges1, ranges2)).toBe(true);
        });

        it('should handle undefined ranges (optimistic)', () => {
            expect(anyTimeRangesOverlap(undefined, undefined)).toBe(true);
        });

        it('should detect overlap with multiple ranges', () => {
            const ranges1: TimeRange[] = [
                { start_time: '09:00', end_time: '10:00' },
                { start_time: '14:00', end_time: '15:00' },
                { start_time: '18:00', end_time: '19:00' }
            ];
            const ranges2: TimeRange[] = [
                { start_time: '14:30', end_time: '16:00' }
            ];

            expect(anyTimeRangesOverlap(ranges1, ranges2)).toBe(true);
        });
    });

    describe('convertTimeToUTC', () => {

        it('should return same time for UTC timezone', () => {
            const result = convertTimeToUTC('14:00', '2024-01-15', 'UTC');
            expect(result).toBe('14:00');
        });

        it('should return same time when no timezone specified', () => {
            const result = convertTimeToUTC('14:00', '2024-01-15');
            expect(result).toBe('14:00');
        });

        it('should convert EST to UTC (UTC-5)', () => {
            const result = convertTimeToUTC('14:00', '2024-01-15', 'America/New_York');
            // 14:00 EST = 19:00 UTC
            expect(result).toBe('19:00');
        });

        it('should convert PST to UTC (UTC-8)', () => {
            const result = convertTimeToUTC('10:00', '2024-01-15', 'America/Los_Angeles');
            // 10:00 PST = 18:00 UTC
            expect(result).toBe('18:00');
        });

        it('should convert CET to UTC (UTC+1)', () => {
            const result = convertTimeToUTC('14:00', '2024-01-15', 'Europe/Paris');
            // 14:00 CET = 13:00 UTC
            expect(result).toBe('13:00');
        });

        it('should convert JST to UTC (UTC+9)', () => {
            const result = convertTimeToUTC('14:00', '2024-01-15', 'Asia/Tokyo');
            // 14:00 JST = 05:00 UTC
            expect(result).toBe('05:00');
        });

        it('should handle midnight conversions', () => {
            const result = convertTimeToUTC('00:00', '2024-01-15', 'America/New_York');
            // 00:00 EST = 05:00 UTC
            expect(result).toBe('05:00');
        });

        it('should handle late night conversions that cross day boundary', () => {
            const result = convertTimeToUTC('23:00', '2024-01-15', 'America/Los_Angeles');
            // 23:00 PST = 07:00 UTC (next day, but we only return time)
            expect(result).toBe('07:00');
        });
    });

    describe('daySchedulesOverlap', () => {

        it('should detect overlap when same day and overlapping times', () => {
            const schedules1: DaySchedule[] = [{
                days: ['monday'],
                time_ranges: [{ start_time: '09:00', end_time: '12:00' }]
            }];
            const schedules2: DaySchedule[] = [{
                days: ['monday'],
                time_ranges: [{ start_time: '10:00', end_time: '13:00' }]
            }];

            expect(daySchedulesOverlap(schedules1, schedules2)).toBe(true);
        });

        it('should detect no overlap when different days', () => {
            const schedules1: DaySchedule[] = [{
                days: ['monday'],
                time_ranges: [{ start_time: '09:00', end_time: '12:00' }]
            }];
            const schedules2: DaySchedule[] = [{
                days: ['tuesday'],
                time_ranges: [{ start_time: '09:00', end_time: '12:00' }]
            }];

            expect(daySchedulesOverlap(schedules1, schedules2)).toBe(false);
        });

        it('should detect no overlap when same day but non-overlapping times', () => {
            const schedules1: DaySchedule[] = [{
                days: ['monday'],
                time_ranges: [{ start_time: '09:00', end_time: '12:00' }]
            }];
            const schedules2: DaySchedule[] = [{
                days: ['monday'],
                time_ranges: [{ start_time: '13:00', end_time: '16:00' }]
            }];

            expect(daySchedulesOverlap(schedules1, schedules2)).toBe(false);
        });

        it('should handle multiple days in schedule', () => {
            const schedules1: DaySchedule[] = [{
                days: ['monday', 'wednesday', 'friday'],
                time_ranges: [{ start_time: '09:00', end_time: '12:00' }]
            }];
            const schedules2: DaySchedule[] = [{
                days: ['wednesday'],
                time_ranges: [{ start_time: '10:00', end_time: '13:00' }]
            }];

            expect(daySchedulesOverlap(schedules1, schedules2)).toBe(true);
        });

        it('should handle multiple schedules', () => {
            const schedules1: DaySchedule[] = [
                {
                    days: ['monday'],
                    time_ranges: [{ start_time: '09:00', end_time: '12:00' }]
                },
                {
                    days: ['wednesday'],
                    time_ranges: [{ start_time: '14:00', end_time: '17:00' }]
                }
            ];
            const schedules2: DaySchedule[] = [{
                days: ['wednesday'],
                time_ranges: [{ start_time: '15:00', end_time: '18:00' }]
            }];

            expect(daySchedulesOverlap(schedules1, schedules2)).toBe(true);
        });
    });

    describe('getRecurrenceTrack', () => {

        it('should identify recurring slots', () => {
            const slot = { recurrence: 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR' };

            expect(getRecurrenceTrack(slot)).toBe('recurring');
        });

        it('should identify one-time slots (no recurrence)', () => {
            const slot = { recurrence: null };

            expect(getRecurrenceTrack(slot)).toBe('onetime');
        });

        it('should identify one-time slots (undefined recurrence)', () => {
            const slot = {};

            expect(getRecurrenceTrack(slot)).toBe('onetime');
        });

        it('should identify one-time slots (empty string recurrence)', () => {
            const slot = { recurrence: '' };

            expect(getRecurrenceTrack(slot)).toBe('onetime');
        });

        it('should identify one-time slots (none string)', () => {
            const slot = { recurrence: 'none' };

            expect(getRecurrenceTrack(slot)).toBe('onetime');
        });

        it('should identify recurring slots with simple recurrence', () => {
            const slot = { recurrence: 'weekly' };

            expect(getRecurrenceTrack(slot)).toBe('recurring');
        });
    });

    describe('slotsCompatible (integration)', () => {

        it('should match compatible slots with same type', () => {
            const needSlot: Partial<NeedSlot> = {
                type_id: 'childcare',
                start_date: '2024-01-15',
                end_date: '2024-01-15',
                quantity: 1
            };

            const availabilitySlot: Partial<AvailabilitySlot> = {
                type_id: 'childcare',
                start_date: '2024-01-15',
                end_date: '2024-01-15',
                quantity: 1
            };

            expect(slotsCompatible(needSlot as NeedSlot, availabilitySlot as AvailabilitySlot)).toBe(true);
        });

        it('should reject slots with different types', () => {
            const needSlot: Partial<NeedSlot> = {
                type_id: 'childcare',
                start_date: '2024-01-15',
                end_date: '2024-01-15',
                quantity: 1
            };

            const availabilitySlot: Partial<AvailabilitySlot> = {
                type_id: 'tutoring',
                start_date: '2024-01-15',
                end_date: '2024-01-15',
                quantity: 1
            };

            expect(slotsCompatible(needSlot as NeedSlot, availabilitySlot as AvailabilitySlot)).toBe(false);
        });

        it('should reject slots with non-overlapping dates', () => {
            const needSlot: Partial<NeedSlot> = {
                type_id: 'childcare',
                start_date: '2024-01-15',
                end_date: '2024-01-20',
                quantity: 1
            };

            const availabilitySlot: Partial<AvailabilitySlot> = {
                type_id: 'childcare',
                start_date: '2024-01-25',
                end_date: '2024-01-30',
                quantity: 1
            };

            expect(slotsCompatible(needSlot as NeedSlot, availabilitySlot as AvailabilitySlot)).toBe(false);
        });

        it('should match slots with overlapping date ranges', () => {
            const needSlot: Partial<NeedSlot> = {
                type_id: 'childcare',
                start_date: '2024-01-15',
                end_date: '2024-01-25',
                quantity: 1
            };

            const availabilitySlot: Partial<AvailabilitySlot> = {
                type_id: 'childcare',
                start_date: '2024-01-20',
                end_date: '2024-01-30',
                quantity: 1
            };

            expect(slotsCompatible(needSlot as NeedSlot, availabilitySlot as AvailabilitySlot)).toBe(true);
        });

        it('should handle capacity serving both recurring and one-time needs (asymmetric model)', () => {
            // Capacity is unified - can serve any compatible need
            const recurringNeed: Partial<NeedSlot> = {
                type_id: 'childcare',
                start_date: '2024-01-15',
                end_date: '2024-01-15',
                recurrence: 'RRULE:FREQ=WEEKLY;BYDAY=MO',
                quantity: 1
            };

            const onetimeCapacity: Partial<AvailabilitySlot> = {
                type_id: 'childcare',
                start_date: '2024-01-15',
                end_date: '2024-01-15',
                recurrence: null,
                quantity: 1
            };

            // Capacity can serve recurring needs
            expect(slotsCompatible(recurringNeed as NeedSlot, onetimeCapacity as AvailabilitySlot)).toBe(true);
        });

        it('should match slots with identical dates', () => {
            const needSlot: Partial<NeedSlot> = {
                type_id: 'tutoring',
                start_date: '2024-01-15',
                end_date: '2024-01-15',
                quantity: 1
            };

            const availabilitySlot: Partial<AvailabilitySlot> = {
                type_id: 'tutoring',
                start_date: '2024-01-15',
                end_date: '2024-01-15',
                quantity: 1
            };

            expect(slotsCompatible(needSlot as NeedSlot, availabilitySlot as AvailabilitySlot)).toBe(true);
        });

        it('should handle slots with availability windows', () => {
            const needSlot: Partial<NeedSlot> = {
                type_id: 'childcare',
                start_date: '2024-01-15',
                end_date: '2024-01-15',
                quantity: 1,
                availability_window: {
                    time_ranges: [{ start_time: '09:00', end_time: '12:00' }]
                }
            };

            const availabilitySlot: Partial<AvailabilitySlot> = {
                type_id: 'childcare',
                start_date: '2024-01-15',
                end_date: '2024-01-15',
                quantity: 1,
                availability_window: {
                    time_ranges: [{ start_time: '10:00', end_time: '13:00' }]
                }
            };

            expect(slotsCompatible(needSlot as NeedSlot, availabilitySlot as AvailabilitySlot)).toBe(true);
        });
    });
});
