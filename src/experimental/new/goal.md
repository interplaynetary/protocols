does this approach reach optimal provider/recipient-priority-aligned multi-provider universal need-satisfaction with provider priorities?

Ok i am imagining a simpler solution:
Each participant expresses their general-prioritization distribution (100%) where  others are attributed a share of this distribution
1. For Provider Slot, find compatible Recipient Slots, and derive renormalized provider priority shares among compatible recipient slots
2. For Recipient Slot, find compatible Provider Slots, and derive renormalized provider priority shares among compatible provider slots
3. Providers allocate to recipient slots proportional to their slot-specific prioritization. This is base-distribution
3.a somehow provider expands or retracts into/from satisfying recipient need, 
If undershot/overshot -> expand/retract based on share of provision relative to Recipient's slot prioritization.
4. If surplus (for redistribute proportionally) 

this is rough draft but the goal is to converge to reach optimal provider/recipient-priority-aligned multi-provider universal need-satisfaction respecting provider priorities and 

Perhaps as a bi-level optimization approach?

Intuition
bi-level consensus ADMM with max being provider priority proportions and min being recipient priority proportions

We are not trying to maximize for universal need satisfaction so much as we want to know that it will converge on such a result but our main constraints are the bi-level priority proportions?

"I'm willing to give Alice up to 10% of my tomatoes if she needs them AND if no one else needs them more according to my priorities"

