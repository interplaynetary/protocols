# Planning V2: Simplified Operation-Based Model

This directory contains the simplified planning model where:

## Core Principles

1. **Everything is an operation** - No artificial distinction between "production" and "consumption"
2. **Two real constraints** - D1 (replacement) + D3 (insurance)
3. **Priority-based scheduling** - Operations scheduled by social importance, not category
4. **Cascading insurance** - Every scheduled operation is automatically insured

## What Changed

### Old Model (planning/)
- 6 separate deduction categories (D1-D6)
- Complex allocation across buckets
- Pre-categorization required

### New Model (planning-v2/)
- 2 constraints: D1 (replace depreciation) + D3 (insure it)
- Unified operation scheduling by priority
- Tags for analysis, not for allocation logic

## Files

- `allocation-planning.md` - Complete planning system documentation
- (More files to be added as we develop the implementation)

## Comparison

**Same Stock-Book** - No changes to how operations are recorded

**Different Planning** - How we decide which operations to schedule

**Same Result** - Resources allocated to maximize need satisfaction while minimizing necessary time

The difference is conceptual clarity and implementation simplicity.
