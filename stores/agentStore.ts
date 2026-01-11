
import { create } from 'zustand';
import { Agent, AgentProposal } from '../schemas/agent.schema';

interface AgentStore {
  activeAgents: Agent[];
  proposals: AgentProposal[];
  toggleAgent: (id: string) => void;
  addProposal: (proposal: AgentProposal) => void;
  resolveProposal: (id: string, status: "approved" | "rejected") => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  activeAgents: [
    { id: '1', name: 'Academic Monitor', type: 'Academic', status: 'Active', frequency: 'daily', description: 'Tracks latest journals and flags contradictions.', tier: 'Researcher' },
    { id: '2', name: 'Market Intel', type: 'Market', status: 'Idle', frequency: 'manual', description: 'Competitor analysis and trend signal detection.', tier: 'Researcher' },
    { id: '3', name: 'Knowledge Synth', type: 'Synthesizer', status: 'Active', frequency: 'daily', description: 'Connects ideas across vaults and builds links.', tier: 'Strategist' },
    { id: '4', name: 'Devil Advocate', type: 'Advocate', status: 'Idle', frequency: 'manual', description: 'Challenges assumptions and triggers debates.', tier: 'Strategist' },
    { id: '5', name: 'Briefing Node', type: 'Briefing', status: 'Scanning', frequency: 'daily', description: 'Auto-updates audio briefings when vault changes.', tier: 'Researcher' },
    { id: '6', name: 'Red-Team Scout', type: 'Scout', status: 'Idle', frequency: 'daily', description: 'Background falsification and drift detection.', tier: 'Strategist' },
  ],
  proposals: [],
  toggleAgent: (id) => set((state) => ({
    activeAgents: state.activeAgents.map(a => a.id === id ? { ...a, status: a.status === 'Idle' ? 'Active' : 'Idle' } : a)
  })),
  addProposal: (proposal) => set((state) => ({
    proposals: [proposal, ...state.proposals]
  })),
  resolveProposal: (id, status) => set((state) => ({
    proposals: state.proposals.map(p => p.id === id ? { ...p, status } : p)
  }))
}));
