
export type AgentFrequency = "manual" | "daily" | "weekly";

export interface AgentProposal {
  id: string;
  agentId: string;
  title: string;
  action: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

export interface Agent {
  id: string;
  name: string;
  // Included 'Scout' in the type union to fix type errors in AgentStation.tsx and ensure consistency across the agent subsystem.
  type: 'Academic' | 'Market' | 'Synthesizer' | 'Advocate' | 'Briefing' | 'Scout';
  status: 'Active' | 'Idle' | 'Scanning';
  frequency: AgentFrequency;
  lastRun?: number;
  description: string;
  tier: 'Explorer' | 'Researcher' | 'Strategist' | 'Architect';
}
