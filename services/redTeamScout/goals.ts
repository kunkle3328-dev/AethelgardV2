
import { ScoutMemory, ScoutGoal } from "../../types";

export function deriveScoutGoals(memory: ScoutMemory): ScoutGoal[] {
  const goals: ScoutGoal[] = [];

  // Goal 1: Deepen unresolved threads
  memory.unresolvedThreads.forEach(id => {
    goals.push({
      focus: `Resolve investigation for node ${id}`,
      priority: 'high'
    });
  });

  // Goal 2: Track interests
  memory.interests.forEach(interest => {
    goals.push({
      focus: `Monitor regulatory and research shifts in ${interest}`,
      priority: 'medium'
    });
  });

  return goals;
}
