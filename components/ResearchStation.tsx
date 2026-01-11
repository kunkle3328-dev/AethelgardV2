
import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Save, 
  Sparkles, 
  CheckCircle2,
  Globe,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Globe2,
  Newspaper,
  BookOpen,
  Calendar,
  WifiOff,
  AlertCircle,
  Timer,
  Zap
} from 'lucide-react';
import { researchService } from '../services/researchService';
import { ResearchResult, ResearchMode, FreshnessLevel } from '../types';
import { useVault } from '../hooks/useVault';
import { useAppStore } from '../stores/appStore';

const formatContent = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return <div key={i} className="h-4" />;
    
    // Custom bolding for intelligence headers
    if (trimmedLine.startsWith('###') || (trimmedLine.toUpperCase() === trimmedLine && trimmedLine.length > 5)) {
        return <h3 key={i} className="orbitron text-red-500 font-black text-xs md:text-sm mt-6 mb-2 tracking-widest uppercase">{trimmedLine.replace(/#/g, '')}</h3>;
    }

    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={i} className="mb-4 last:mb-0 leading-[1.8] text-zinc-300 text-sm md:text-base">
        {parts.map((part, j) => part.startsWith('**') && part.endsWith('**') ? <strong key={j} className="text-red-500 font-black">{part.slice(2, -2)}</strong> : part)}
      </p>
    );
  });
};

const ResearchStation: React.FC = () => {
  const { items, saveResearch } = useVault();
  const { cognitiveProfile, researchMode, setResearchMode, freshnessLevel, setFreshnessLevel, conciergeQuery, setConciergeQuery } = useAppStore();
  const [query, setQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [report, setReport] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const performResearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsResearching(true);
    setError(null);
    setReport(null);
    setSaveSuccess(false);
    
    try {
      const result = await researchService.performScan(searchQuery, items, cognitiveProfile, 'quick');
      if (result.sources.length === 0 && !result.text) {
        setError("NO_DATA");
      } else {
        setReport(result);
      }
    } catch (err) { 
      setError("LINK_FAILURE");
    } finally { 
      setIsResearching(false); 
    }
  };

  const handleResearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    performResearch(query);
  };

  useEffect(() => {
    if (conciergeQuery) {
      setQuery(conciergeQuery);
      performResearch(conciergeQuery);
      setConciergeQuery('');
    }
  }, [conciergeQuery]);

  const handleSave = async () => {
    if (!report || (!report.text && report.sources.length === 0)) return;
    try {
      const saveText = report.text || `SOURCE RECORD: ${report.sources.map(s => s.title).join(', ')}`;
      const res = await saveResearch(query, saveText, report.sources);
      if (res) setSaveSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-24 px-2">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
           <div className="px-4 py-1.5 rounded-full flex items-center gap-2 border glass-3d border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
              <span className="orbitron text-[9px] font-black tracking-widest uppercase text-zinc-500">
                {isResearching ? 'SCANNING NEURAL FIELD...' : 'INTELLIGENCE ENGINE READY'}
              </span>
           </div>
        </div>
        <h1 className="text-3xl md:text-6xl font-black orbitron uppercase leading-none tracking-tighter">
          NEURAL <span className="text-red-600 text-glow-red">SCAN</span>
        </h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <form onSubmit={handleResearchSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-2 p-2 glass-3d rounded-2xl md:rounded-full border-white/5 shadow-2xl relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search parameters..."
              className="flex-1 bg-transparent px-6 py-4 orbitron text-base md:text-lg focus:outline-none placeholder:text-zinc-800"
            />
            <button type="submit" disabled={isResearching} className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-full font-black orbitron text-[10px] tracking-widest flex items-center gap-3 uppercase transition-all active:scale-95 disabled:opacity-50">
              {isResearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isResearching ? 'SCANNING' : 'INITIATE'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="glass-3d p-4 border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-zinc-500">
                   <Globe className="w-3 h-3" />
                   <span className="orbitron text-[8px] font-black uppercase">Source Mode</span>
                </div>
                <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
                   {[
                     { id: 'web', icon: Globe2 },
                     { id: 'news', icon: Newspaper },
                     { id: 'academic', icon: BookOpen }
                   ].map(m => (
                     <button
                       key={m.id}
                       type="button"
                       onClick={() => setResearchMode(m.id as ResearchMode)}
                       className={`p-2 rounded-md transition-all ${researchMode === m.id ? 'bg-red-600 text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
                     >
                       <m.icon className="w-4 h-4" />
                     </button>
                   ))}
                </div>
             </div>

             <div className="glass-3d p-4 border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-zinc-500">
                   <Calendar className="w-3 h-3" />
                   <span className="orbitron text-[8px] font-black uppercase">Pacing</span>
                </div>
                <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
                   {(['latest', 'recent', 'balanced', 'historical'] as FreshnessLevel[]).map(f => (
                     <button
                       key={f}
                       type="button"
                       onClick={() => setFreshnessLevel(f)}
                       className={`px-3 py-1 rounded-md orbitron text-[7px] font-black uppercase transition-all ${freshnessLevel === f ? 'bg-red-600 text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
                     >
                       {f}
                     </button>
                   ))}
                </div>
             </div>
          </div>
        </form>
      </div>

      {isResearching && (
        <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-pulse">
           <div className="relative">
             <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
             <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full"></div>
           </div>
           <p className="orbitron text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 text-center">
             Generating Intelligence Report... <br/>
             <span className="opacity-50">Syncing Live Nodes with Archive Vault</span>
           </p>
        </div>
      )}

      {error && !isResearching && (
        <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95">
           {error === "NO_DATA" ? <WifiOff className="w-16 h-16 text-zinc-800" /> : <AlertCircle className="w-16 h-16 text-red-900" />}
           <div className="text-center space-y-2">
             <p className="orbitron text-xs font-black uppercase tracking-widest text-zinc-300">
               {error === "NO_DATA" ? 'No Intelligence Found' : 'Neural Link Failure'}
             </p>
             <p className="orbitron text-[8px] font-bold uppercase tracking-widest text-zinc-700">
               {error === "NO_DATA" ? 'The neural web returned no grounded data for this query.' : 'The scan relay was interrupted. Re-initialize and retry.'}
             </p>
           </div>
        </div>
      )}

      {report && !isResearching && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in zoom-in-95 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-3d p-6 md:p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden">
               <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-8">
                  <div className="max-w-[70%]">
                    <h2 className="text-xl md:text-3xl orbitron font-black text-white uppercase tracking-tighter truncate">{report.query}</h2>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[7px] orbitron font-black text-zinc-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1">
                         <Globe className="w-2.5 h-2.5" /> Live Intel
                       </span>
                       <span className="text-[7px] orbitron font-black text-red-900 uppercase tracking-widest flex items-center gap-1">
                         <Timer className="w-2.5 h-2.5" /> Temporal Sync
                       </span>
                    </div>
                  </div>
                  <button onClick={handleSave} disabled={saveSuccess} className={`flex items-center gap-2 px-6 py-3 rounded-xl orbitron text-[10px] font-black uppercase transition-all ${saveSuccess ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-zinc-100 hover:bg-white text-black'}`}>
                    {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saveSuccess ? 'ARCHIVED' : 'VAULT INTEL'}
                  </button>
               </div>

               <div className="min-h-[150px] selection:bg-red-600/30">
                  {report.text ? formatContent(report.text) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-60 space-y-4">
                       <Database className="w-12 h-12 text-red-600" />
                       <p className="orbitron text-[10px] font-black uppercase tracking-widest text-center">Report generation pending... review raw nodes.</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="glass-3d p-6 border-red-600/20 bg-red-600/5 flex items-center gap-6 rounded-[2rem]">
               <div className="p-3 bg-red-600 rounded-xl shadow-lg">
                 <ShieldCheck className="w-6 h-6 text-white" />
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] orbitron font-black text-red-500 uppercase tracking-widest">Temporal Intelligence Protocol</p>
                 <p className="text-[9px] orbitron font-bold text-zinc-400 uppercase tracking-tight leading-relaxed">
                    Aethelgard has synchronized this report with your existing research graph. 
                    New findings are highlighted against the known narrative.
                 </p>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-3d p-6 md:p-8 rounded-[2rem] border-white/5 space-y-6">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 text-red-500">
                    <Database className="w-4 h-4" />
                    <h3 className="orbitron text-[10px] font-black uppercase tracking-widest">Grounding Nodes</h3>
                  </div>
                  <span className="text-[9px] orbitron text-zinc-600 font-bold">{report.sources.length} NODES</span>
               </div>

               <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                  {report.sources.map((source, i) => (
                    <div key={i} className="group glass-3d border-white/5 rounded-2xl hover:border-red-600/30 transition-all hover:bg-white/[0.02] p-4 relative overflow-hidden">
                      {i < 3 && (
                        <div className="absolute top-0 right-0 p-1.5">
                           <Zap className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                        </div>
                      )}
                      <div className="flex justify-between items-start gap-2 mb-2">
                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="orbitron text-[10px] font-black text-zinc-100 uppercase group-hover:text-red-500 transition-colors line-clamp-1 flex-1">
                            {source.title}
                          </a>
                          <ArrowUpRight className="w-3 h-3 text-zinc-700 group-hover:text-red-500 shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[6px] orbitron font-black text-zinc-600 uppercase bg-black/40 px-1.5 py-0.5 rounded">NEW</span>
                         <span className="text-[6px] orbitron font-black text-zinc-700 uppercase">{new URL(source.uri).hostname.replace('www.', '')}</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-relaxed line-clamp-2 uppercase italic">{source.snippet}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchStation;
