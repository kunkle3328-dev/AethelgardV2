
import React, { useState } from 'react';
import { Zap, History, Database, ArrowUpRight, ShieldCheck, Activity, Box, BrainCircuit, Search, Loader2, Sparkles, AlertCircle, Timer, TrendingUp, Radar, Bell, X } from 'lucide-react';
import { AppView, KnowledgeSynthesis, ScoutUpdate } from '../types';
import { VaultEntry } from '../schemas/vault.schema';
import { knowledgeSynthService } from '../services/knowledgeSynthService';
import { useAppStore } from '../stores/appStore';

interface DashboardProps {
  vault: VaultEntry[];
  setActiveView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ vault, setActiveView }) => {
  const { scoutUpdates, markScoutUpdateRead, clearScoutUpdates } = useAppStore();
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthReport, setSynthReport] = useState<KnowledgeSynthesis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recentItems = [...vault].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  const unreadScoutUpdates = scoutUpdates.filter(u => !u.read);

  const handleRunSynth = async () => {
    if (vault.length === 0) return;
    setIsSynthesizing(true);
    setError(null);
    try {
      const result = await knowledgeSynthService.runGlobalSynth(vault);
      setSynthReport(result);
    } catch (e) {
      setError("Neural convergence failed. Check matrix link.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-12 animate-in fade-in slide-in-from-top-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 md:gap-8">
        <div className="space-y-2 md:space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-0.5 w-6 bg-red-600"></div>
            <span className="orbitron text-[7px] md:text-[9px] text-red-500 font-black tracking-[0.4em] uppercase">SYSTEM: ONLINE</span>
          </div>
          <h1 className="text-2xl md:text-6xl font-black orbitron tracking-tighter leading-tight uppercase">
            AETHEL<span className="text-zinc-700">GARD</span> <span className="text-red-600 text-glow-red">CORE</span>
          </h1>
          <p className="text-zinc-500 font-medium max-w-xl text-[10px] md:text-base tracking-wide leading-relaxed uppercase">
            Intelligence Synthesis Hub. Neural archives active.
          </p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none glass-3d p-3 md:p-6 rounded-2xl border border-white/5 text-center">
                <div className="text-[6px] md:text-[7px] orbitron font-black text-zinc-600 mb-1 tracking-widest uppercase">Encryption</div>
                <div className="text-xs md:text-xl orbitron font-black text-zinc-100">AES-256</div>
            </div>
            <div className="flex-1 lg:flex-none glass-3d-red p-3 md:p-6 rounded-2xl text-center">
                <div className="text-[6px] md:text-[7px] orbitron font-black text-red-500 mb-1 tracking-widest uppercase">Tier</div>
                <div className="text-xs md:text-xl orbitron font-black text-white">STRATEGIST</div>
            </div>
        </div>
      </div>

      {unreadScoutUpdates.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Radar className="w-4 h-4 text-red-600 animate-pulse" />
              <h2 className="orbitron text-[10px] font-black uppercase tracking-[0.4em]">Adversarial Drift Notifications</h2>
            </div>
            <button onClick={clearScoutUpdates} className="text-[8px] orbitron text-zinc-600 hover:text-white uppercase tracking-widest">Clear All</button>
          </div>
          <div className="space-y-2">
            {unreadScoutUpdates.map(u => (
              <div key={u.id} className="glass-3d p-4 md:p-6 border-red-600/30 bg-red-600/[0.03] rounded-2xl flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg bg-red-600/20 text-red-500 ${u.priority === 'high' ? 'animate-pulse' : ''}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="orbitron text-[10px] font-black text-white uppercase truncate">New Study Challenges "{u.title}"</h4>
                    <p className="text-[8px] orbitron text-zinc-500 uppercase mt-1 leading-relaxed line-clamp-1">{u.findings}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => markScoutUpdateRead(u.id)}
                     className="px-4 py-2 bg-red-600 text-white rounded-lg orbitron text-[8px] font-black uppercase hover:bg-red-500 transition-all"
                   >
                     Acknowledge
                   </button>
                   <button onClick={() => markScoutUpdateRead(u.id)} className="p-2 text-zinc-600 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Synthesis Trigger Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-red-600" />
              <h2 className="orbitron text-[10px] font-black uppercase tracking-widest">Neural Convergence</h2>
           </div>
           <button 
             onClick={handleRunSynth} 
             disabled={isSynthesizing || vault.length === 0}
             className="text-[8px] orbitron font-black text-zinc-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-30"
           >
             {isSynthesizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
             {isSynthesizing ? 'Converging...' : 'Run Global Synth'}
           </button>
        </div>

        {isSynthesizing ? (
          <div className="glass-3d p-12 border-red-600/20 bg-red-600/[0.02] rounded-[2rem] flex flex-col items-center justify-center gap-6 animate-pulse">
            <div className="relative">
              <BrainCircuit className="w-16 h-16 text-red-600" />
              <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full"></div>
            </div>
            <p className="orbitron text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] text-center">Discovering the Golden Thread across {vault.length} nodes...</p>
          </div>
        ) : synthReport ? (
          <div className="glass-3d p-8 md:p-10 border-red-600/40 bg-red-600/[0.03] rounded-[2.5rem] relative overflow-hidden animate-in zoom-in-95 duration-700">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <BrainCircuit className="w-32 h-32" />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                   <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="orbitron text-sm font-black text-zinc-100 uppercase tracking-tighter">Neural Convergence Report</h3>
                  <p className="text-[7px] orbitron text-zinc-500 font-bold uppercase tracking-widest mt-1">Matrix v3.1 // {new Date(synthReport.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex flex-col items-end">
                    <span className="orbitron text-[7px] font-black text-zinc-600 uppercase">Trend</span>
                    <span className="orbitron text-[9px] font-black text-red-500 uppercase flex items-center gap-1">
                       <TrendingUp className="w-3 h-3" /> {synthReport.temporal.trend}
                    </span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="orbitron text-[7px] font-black text-zinc-600 uppercase">Volatility</span>
                    <span className="orbitron text-[9px] font-black text-zinc-500 uppercase">
                       {Math.round(synthReport.temporal.volatility * 100)}%
                    </span>
                 </div>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap selection:bg-red-600/30">
               {synthReport.text.split('\n').map((line, i) => (
                 <p key={i} className="mb-4 last:mb-0">
                   {line.includes('**') ? 
                     line.split(/(\*\*.*?\*\*)/g).map((part, j) => part.startsWith('**') ? <strong key={j} className="text-red-500 font-black">{part.slice(2, -2)}</strong> : part)
                     : line
                   }
                 </p>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
               <div className="space-y-2">
                  <h4 className="orbitron text-[8px] font-black text-zinc-500 uppercase flex items-center gap-2">
                    <Box className="w-3 h-3" /> Emergent Clusters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {synthReport.clusters.map((c, i) => (
                      <span key={i} className="text-[7px] orbitron font-black text-zinc-300 uppercase bg-white/5 px-2 py-1 rounded-md border border-white/5">
                        {c.label || 'Idea Node'}
                      </span>
                    ))}
                  </div>
               </div>
               <div className="space-y-2">
                  <h4 className="orbitron text-[8px] font-black text-zinc-500 uppercase flex items-center gap-2">
                    <History className="w-3 h-3" /> Temporal Metrics
                  </h4>
                  <div className="text-[7px] orbitron text-zinc-400 font-bold uppercase tracking-tight">
                    Velocity: {synthReport.temporal.velocity.toFixed(2)} nodes/day // Node Count: {vault.length}
                  </div>
               </div>
            </div>
          </div>
        ) : error ? (
          <div className="glass-3d p-8 border-red-600/40 bg-red-600/5 rounded-[2rem] flex items-center gap-4 animate-in shake">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="orbitron text-[10px] font-black text-red-500 uppercase tracking-widest">Synthesis Failure</p>
              <p className="text-[8px] orbitron text-zinc-600 font-bold uppercase tracking-tight">{error}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {[
          { icon: Search, label: 'SCAN', desc: 'Active Research', view: AppView.RESEARCH, color: 'text-zinc-100' },
          { icon: Database, label: 'ARCHIVE', desc: 'Neural Vault', view: AppView.VAULT, color: 'text-zinc-500' },
          { icon: BrainCircuit, label: 'DEBATE', desc: 'Neural Synthesis', view: AppView.DEBATE, color: 'text-red-600' },
          { icon: Box, label: 'KITS', desc: 'Expansion Units', view: AppView.KITS, color: 'text-zinc-600' },
        ].map((action, i) => (
          <button
            key={i}
            onClick={() => setActiveView(action.view)}
            className="group glass-3d p-4 md:p-6 rounded-[1.5rem] border border-white/5 hover:border-red-600/30 transition-all duration-500 text-left space-y-2 md:space-y-4 flex flex-col relative overflow-hidden active:scale-95"
          >
            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl bg-black border border-white/5 flex items-center justify-center transition-all ${action.color}`}>
              <action.icon className="w-4 h-4 md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="orbitron font-black text-[9px] md:text-xs text-zinc-100 group-hover:text-red-600 transition-colors tracking-widest uppercase">{action.label}</h3>
              <p className="text-[7px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-tighter truncate">{action.desc}</p>
            </div>
            <div className="absolute top-4 right-4 text-zinc-800 group-hover:text-red-600 transition-colors">
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
           <div className="glass-3d rounded-[1.75rem] border border-white/5 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 className="orbitron text-[9px] md:text-[10px] font-black flex items-center gap-2 tracking-[0.2em] uppercase">
                  <History className="w-3.5 h-3.5 text-red-600" />
                  Intelligence Stream
                </h2>
                <button onClick={() => setActiveView(AppView.VAULT)} className="text-[7px] orbitron font-bold text-zinc-600 hover:text-red-500 uppercase tracking-widest">Archive</button>
              </div>
              <div className="p-4 md:p-8 space-y-3">
                {recentItems.length === 0 ? (
                    <div className="py-12 opacity-20 text-center orbitron text-[8px] uppercase tracking-widest">Stream Depleted</div>
                ) : (
                    recentItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 md:p-4 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all cursor-pointer group" onClick={() => setActiveView(AppView.VAULT)}>
                            <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-lg bg-black border border-white/5 flex items-center justify-center text-red-500 orbitron text-xs font-black group-hover:border-red-600/30">
                                {item.summary[0]?.toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black orbitron text-[9px] md:text-xs text-zinc-100 truncate group-hover:text-red-500 uppercase">{item.summary}</h4>
                                <p className="text-[8px] text-zinc-600 truncate uppercase mt-0.5">{item.content.substring(0, 80)}...</p>
                            </div>
                        </div>
                    ))
                )}
              </div>
           </div>
        </div>

        <div className="space-y-4 md:space-y-6">
           <div className="glass-3d-red rounded-[1.75rem] p-6 space-y-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <ShieldCheck className="w-20 h-20" />
              </div>
              <div className="space-y-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                     <Zap className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="orbitron text-lg font-black uppercase">Strategist</h3>
              </div>
              <div className="space-y-2">
                 {[
                   'Unlimited Neural Scans',
                   'Multi-Speaker Debates',
                   'Live Concierge Uplink'
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                      <span className="text-[8px] orbitron font-bold text-red-100/80 uppercase tracking-tight">{feat}</span>
                   </div>
                 ))}
              </div>
              <button className="w-full py-3 bg-black/40 border border-white/5 rounded-xl orbitron text-[8px] font-black text-white hover:bg-white hover:text-black transition-all uppercase tracking-widest">
                  Terminal Locked
              </button>
           </div>
           
           <div className="glass-3d p-6 rounded-[1.5rem] border border-white/5 text-center">
              <h4 className="orbitron text-[8px] text-zinc-600 font-black mb-3 uppercase tracking-widest">Neural Load</h4>
              <div className="flex justify-center mb-4">
                 <div className="w-12 h-12 rounded-full border-4 border-zinc-900 border-t-red-600 animate-spin-slow"></div>
              </div>
              <div className="text-sm md:text-lg orbitron font-black text-zinc-100">{vault.length > 5 ? 82 : 34}% <span className="text-[8px] text-zinc-600 uppercase font-medium">Capacity</span></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
