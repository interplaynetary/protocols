/**
 * ValueFlows Standard Actions Seed Data
 * 
 * These are the pre-defined action verbs from the ValueFlows specification.
 * @see https://valueflo.ws/introduction/flows.html#actions
 */

import { actions, type Action } from './schema'

export const VALUEFLOWS_ACTIONS: Omit<Action, 'createdAt' | 'updatedAt'>[] = [
  // Transfer actions
  {
    id: 'transfer',
    label: 'transfer',
    resourceEffect: 'decrementIncrement',
    onhandEffect: 'decrementIncrement',
    inputOutput: 'notApplicable',
    pairsWith: 'notApplicable',
  },
  {
    id: 'transfer-all-rights',
    label: 'transfer-all-rights',
    resourceEffect: 'decrementIncrement',
    onhandEffect: 'noEffect',
    inputOutput: 'notApplicable',
    pairsWith: 'notApplicable',
  },
  {
    id: 'transfer-custody',
    label: 'transfer-custody',
    resourceEffect: 'noEffect',
    onhandEffect: 'decrementIncrement',
    inputOutput: 'notApplicable',
    pairsWith: 'notApplicable',
  },
  {
    id: 'move',
    label: 'move',
    resourceEffect: 'noEffect',
    onhandEffect: 'decrementIncrement',
    inputOutput: 'notApplicable',
    pairsWith: 'notApplicable',
  },
  
  // Production actions
  {
    id: 'produce',
    label: 'produce',
    resourceEffect: 'increment',
    onhandEffect: 'increment',
    inputOutput: 'output',
    pairsWith: 'notApplicable',
  },
  {
    id: 'consume',
    label: 'consume',
    resourceEffect: 'decrement',
    onhandEffect: 'decrement',
    inputOutput: 'input',
    pairsWith: 'notApplicable',
  },
  {
    id: 'use',
    label: 'use',
    resourceEffect: 'noEffect',
    onhandEffect: 'noEffect',
    inputOutput: 'input',
    pairsWith: 'notApplicable',
  },
  {
    id: 'work',
    label: 'work',
    resourceEffect: 'noEffect',
    onhandEffect: 'noEffect',
    inputOutput: 'input',
    pairsWith: 'notApplicable',
  },
  {
    id: 'cite',
    label: 'cite',
    resourceEffect: 'noEffect',
    onhandEffect: 'noEffect',
    inputOutput: 'input',
    pairsWith: 'notApplicable',
  },
  
  // Modification actions
  {
    id: 'modify',
    label: 'modify',
    resourceEffect: 'noEffect',
    onhandEffect: 'noEffect',
    inputOutput: 'output',
    pairsWith: 'accept',
  },
  {
    id: 'accept',
    label: 'accept',
    resourceEffect: 'noEffect',
    onhandEffect: 'noEffect',
    inputOutput: 'input',
    pairsWith: 'modify',
  },
  
  // Delivery/Pickup actions
  {
    id: 'deliverService',
    label: 'deliver-service',
    resourceEffect: 'noEffect',
    onhandEffect: 'noEffect',
    inputOutput: 'output',
    pairsWith: 'notApplicable',
  },
  {
    id: 'pickup',
    label: 'pickup',
    resourceEffect: 'noEffect',
    onhandEffect: 'increment',
    inputOutput: 'notApplicable',
    pairsWith: 'dropoff',
  },
  {
    id: 'dropoff',
    label: 'dropoff',
    resourceEffect: 'noEffect',
    onhandEffect: 'decrement',
    inputOutput: 'notApplicable',
    pairsWith: 'pickup',
  },
  
  // Inventory adjustment actions
  {
    id: 'raise',
    label: 'raise',
    resourceEffect: 'increment',
    onhandEffect: 'noEffect',
    inputOutput: 'notApplicable',
    pairsWith: 'notApplicable',
  },
  {
    id: 'lower',
    label: 'lower',
    resourceEffect: 'decrement',
    onhandEffect: 'noEffect',
    inputOutput: 'notApplicable',
    pairsWith: 'notApplicable',
  },
  
  // Pass/Fail actions (for quality control)
  {
    id: 'pass',
    label: 'pass',
    resourceEffect: 'noEffect',
    onhandEffect: 'noEffect',
    inputOutput: 'notApplicable',
    pairsWith: 'notApplicable',
  },
  {
    id: 'fail',
    label: 'fail',
    resourceEffect: 'noEffect',
    onhandEffect: 'noEffect',
    inputOutput: 'notApplicable',
    pairsWith: 'notApplicable',
  },
]

/**
 * Seed the actions table with ValueFlows standard actions
 */
export async function seedActions(db: any) {
  console.log('Seeding ValueFlows actions...')
  
  for (const action of VALUEFLOWS_ACTIONS) {
    await db.insert(actions).values(action).onConflictDoNothing()
  }
  
  console.log(`✓ Seeded ${VALUEFLOWS_ACTIONS.length} ValueFlows actions`)
}
