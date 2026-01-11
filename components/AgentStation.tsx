
import React, { useState } from 'react';
import { Zap, Activity, Cpu, ShieldCheck, BrainCircuit, Search, Bell, Power, MessageSquare, Check, X as XIcon, Loader2, Scale, Sparkles, Radar } from 'lucide-react';
import { useAgentStore } from '../stores/agentStore';
import { Agent } from '../schemas/agent.schema';
import { agentService } from '../services/agentService';
import { useVaultStore } from '../stores/vaultStore';
import { runRedTeamScout } from '../services/redTeamScout';

const AgentStation: React.FC = () => {
  const { activeAgents, toggleAgent, proposals, resolveProposal, addProposal } = useAgentStore();
  const { items } = useVaultStore();
  const [isRunning, setIsRunning] = useState<string | null>(null);

  const handleRunAgent = async (agent: Agent) => {
    setIsRunning(agent.id);
    try {
      if (agent.type === 'Advocate') {
        const proposal = await agentService.runSkeptic(items);
        addProposal(proposal);
      } else if (agent.type === 'Synthesizer') {
        const proposal = await agentService.runSynthesizer(items);
        addProposal(proposal);
      } else if (agent.type === 'Academic') {
        const proposal = await agentService.runAcademicMonitor(items);
        addProposal(proposal);
      } else if (agent.type === 'Scout') {
        await runRedTeamScout();
      }
    } catch (e) {
      console.error(`Agent ${agent.name} failed:`, e);
    } finally {
      setIsRunning(null);
    }
  };

  const getIcon = (type: Agent['type']) => {
    switch (type) {
      case 'Academic': return Search;
      case 'Market': return Activity;
      case 'Synthesizer': return BrainCircuit;
      case 'Advocate': return Scale;
      case 'Briefing': return Bell;
      case 'Scout': return Radar;
      default: return Cpu;
    }
  };

  const pendingProposals = proposals.filter(p => p.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black orbitron uppercase tracking-tighter">NEURAL <span className="text-zinc-700">AGENTS</span></h1>
          <p className="text-zinc-500 font-light max-w-xl text-[10px] orbitron tracking-widest mt-2 uppercase italic">Autonomous background intelligence performing persistent multi-source analysis.</p>
        </div>
        <div className="px-6 py-3 glass-3d text-zinc-400 orbitron text-[10px] font-black tracking-widest uppercase border border-red-600/20">
          Neural Load: {Math.min(100, activeAgents.filter(a => a.status === 'Active').length * 20 + (pendingProposals.length * 5))}% // Optimal
        </div>
      </div>

      {pendingProposals.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-600" />
            <h2 className="orbitron text-[10px] font-black uppercase tracking-[0.4em]">Pending Autonomous Proposals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingProposals.map(p => (
              <div key={p.id} className="p-8 glass-3d border-red-600/40 bg-red-600/5 flex flex-col gap-4 rounded-[2rem]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[7px] orbitron font-black text-red-500 uppercase tracking-widest bg-red-600/10 px-2 py-0.5 rounded-full mb-2 inline-block">{p.action}</span>
                    <h4 className="orbitron text-xs font-black text-zinc-100 uppercase tracking-tight">{p.title}</h4>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-300 leading-relaxed uppercase whitespace-pre-wrap font-medium tracking-wide max-h-48 overflow-y-auto custom-scrollbar">
                   {p.content}
                </div>
                <div className="flex gap-2 pt-4 border-t border-white/5">
                  <button onClick={() => resolveProposal(p.id, 'approved')} className="flex-1 bg-zinc-100 text-black py-3 rounded-xl orbitron text-[8px] font-black uppercase hover:bg-white transition-all flex items-center justify-center gap-2">
                    <Check className="w-3.5 h-3.5" /> Approve Intel
                  </button>
                  <button onClick={() => resolveProposal(p.id, 'rejected')} className="flex-1 bg-black/40 text-zinc-500 py-3 rounded-xl orbitron text-[8px] font-black uppercase hover:text-red-500 transition-all flex items-center justify-center gap-2 border border-white/5">
                    <XIcon className="w-3.5 h-3.5" /> Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeAgents.map((agent) => {
          const Icon = getIcon(agent.type);
          const isActive = agent.status !== 'Idle';
          const loading = isRunning === agent.id;
          const isAdvocate = agent.type === 'Advocate';
          const isSynthesizer = agent.type === 'Synthesizer';
          const isMonitor = agent.type === 'Academic';
          const isScout = agent.type === 'Scout';

          return (
            <div key={agent.id} className={`glass-3d p-8 space-y-6 flex flex-col transition-all duration-500 border-l-4 rounded-[2rem] ${isActive ? (isAdvocate ? 'border-orange-500/50 bg-orange-500/[0.01]' : isSynthesizer ? 'border-red-600 bg-red-600/[0.01]' : isScout ? 'border-red-500 bg-red-500/[0.01]' : 'border-zinc-500 bg-zinc-500/[0.01]') : 'border-zinc-800 opacity-60'}`}>
              <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center ${isActive ? (isAdvocate ? 'text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : isSynthesizer ? 'text-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : isMonitor ? 'text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : isScout ? 'text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-zinc-100') : 'text-zinc-700'}`}>
                  {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Icon className="w-7 h-7" strokeWidth={1.5} />}
                </div>
                <div className="text-right">
                  <div className={`text-[8px] orbitron font-black uppercase ${isActive ? (isAdvocate ? 'text-orange-500' : isSynthesizer ? 'text-red-500' : isScout ? 'text-red-500' : 'text-zinc-100') : 'text-zinc-700'}`}>{agent.status}</div>
                  <div className="text-[7px] orbitron text-zinc-800 font-black mt-0.5 uppercase">{agent.frequency}</div>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="orbitron text-lg font-black text-zinc-100 uppercase tracking-tighter">{agent.name}</h3>
                <p className={`text-zinc-500 text-[10px] leading-relaxed mt-2 uppercase font-medium ${isAdvocate || isSynthesizer || isScout ? 'italic' : ''}`}>
                  {agent.description}
                </p>
              </div>

              <div className="space-y-4">
                {isActive && (
                   <button 
                     onClick={() => handleRunAgent(agent)}
                     disabled={loading}
                     className={`w-full py-3 rounded-xl orbitron text-[8px] font-black uppercase tracking-widest transition-all ${isAdvocate ? 'bg-orange-600/5 hover:bg-orange-600/10 border border-orange-600/20 text-orange-500' : isSynthesizer ? 'bg-red-600/5 hover:bg-red-600/10 border border-red-600/20 text-red-500' : isScout ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200'}`}
                   >
                     {loading ? 'PROCESSING...' : isAdvocate ? 'INVOKE CAUTION' : isSynthesizer ? 'INVOKE SYNTHESIS' : isScout ? 'SCAN FOR DRIFT' : isMonitor ? 'SYNC TEMPORAL PULSE' : 'RUN AGENT'}
                   </button>
                )}
                <button 
                  onClick={() => toggleAgent(agent.id)}
                  className={`w-full py-4 rounded-xl orbitron text-[9px] font-black tracking-[0.2em] transition-all flex items-center justify-center gap-2 uppercase ${isActive ? (isAdvocate ? 'bg-orange-600/10 text-orange-500 border border-orange-600/20' : isSynthesizer ? 'bg-red-600/10 text-red-500 border border-red-600/20 shadow-lg' : isScout ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/10 text-zinc-100 border border-white/20') : 'bg-white/5 text-zinc-600 hover:text-zinc-400'}`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {isActive ? 'Terminate Node' : 'Initialize Node'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentStation;
