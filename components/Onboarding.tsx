import React, { useState, useEffect } from 'react';
import { Hexagon, BrainCircuit, Search, ShieldCheck, ArrowRight, Loader2, Sparkles, Fingerprint, Key } from 'lucide-react';
import { CognitiveProfile } from '../types';
import { useAppStore } from '../stores/appStore';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPaidKey, setHasPaidKey] = useState(false);
  const { setCognitiveProfile } = useAppStore();

  const [profile, setProfile] = useState<CognitiveProfile>({
    reasoningPriority: 'evidence',
    uncertaintyTolerance: 'medium',
    domainFocus: [],
  });

  useEffect(() => {
    const checkKey = async () => {
      const win = window as any;
      if (win.aistudio?.hasSelectedApiKey) {
        const selected = await win.aistudio.hasSelectedApiKey();
        setHasPaidKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const win = window as any;
    if (win.aistudio?.openSelectKey) {
      await win.aistudio.openSelectKey();
      setHasPaidKey(true);
      // Proceed to next step automatically after selection attempt
      setStep(2);
    }
  };

  const reasoningOptions = [
    { id: 'evidence', label: 'Evidence over Authority', desc: 'Prioritize empirical data.' },
    { id: 'consensus', label: 'Consensus over Novelty', desc: 'Favor established academic agreement.' },
    { id: 'novelty', label: 'Novelty over Consensus', desc: 'Seek emerging patterns and outliers.' },
    { id: 'skeptical', label: 'Strict Skepticism', desc: 'Assume claims are weak until proven.' },
  ];

  const uncertaintyOptions = [
    { id: 'low', label: 'Minimize', desc: 'Preferred clear, concise conclusions.' },
    { id: 'medium', label: 'Balance', desc: 'Balance clarity with necessary nuance.' },
    { id: 'high', label: 'Preserve', desc: 'Explicitly preserve all contradictions.' },
  ];

  const domains = ['History', 'Science', 'Technology', 'Philosophy', 'Strategy', 'Speculative'];

  const handleToggleDomain = (domain: string) => {
    setProfile(prev => ({
      ...prev,
      domainFocus: prev.domainFocus.includes(domain)
        ? prev.domainFocus.filter(d => d !== domain)
        : [...prev.domainFocus, domain].slice(0, 3)
    }));
  };

  const handleCalibration = () => {
    setIsProcessing(true);
    setCognitiveProfile(profile);
    
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6 md:p-12 overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="scanline"></div>
      </div>

      <div className="relative w-full max-w-4xl glass-3d border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-2xl flex flex-col items-center text-center space-y-10 animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[95vh] custom-scrollbar">
        
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 w-full py-10">
            <div className="flex justify-center">
              <Hexagon className="w-24 h-24 text-red-600 animate-float" strokeWidth={1} />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black orbitron uppercase leading-none tracking-tighter">
                AETHEL<span className="text-red-600 text-glow-red">GARD</span>
              </h1>
              <p className="text-zinc-500 orbitron text-xs tracking-widest uppercase">Initializing Neural Architecture</p>
            </div>
            
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button 
                onClick={() => setStep(2)} 
                className="px-12 py-5 bg-zinc-100 text-black rounded-2xl orbitron font-black text-xs tracking-[0.3em] uppercase hover:bg-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4"
              >
                <Fingerprint className="w-5 h-5" />
                Quick Start
              </button>
              
              <button 
                onClick={handleSelectKey}
                className={`px-12 py-5 rounded-2xl orbitron font-black text-xs tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 border ${hasPaidKey ? 'border-green-600/50 bg-green-600/10 text-green-500' : 'border-red-600/30 bg-red-600/10 text-red-500 hover:bg-red-600/20'}`}
              >
                <Key className="w-5 h-5" />
                {hasPaidKey ? 'PAID KEY LINKED' : 'LINK PAID KEY'}
              </button>
              
              {!hasPaidKey && (
                <p className="text-[8px] orbitron text-zinc-600 uppercase font-bold">
                  Highly recommended for high-volume research. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-red-900 underline">Billing Info</a>
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 w-full animate-in fade-in slide-in-from-right-4 text-left">
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-4xl font-black orbitron uppercase tracking-tighter">Calibrate Reasoning</h2>
              <p className="text-zinc-500 orbitron text-[9px] tracking-[0.3em] uppercase max-w-md mx-auto leading-relaxed">Aethelgard doesn’t just answer — it evaluates, challenges, and synthesizes.</p>
            </div>

            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="space-y-4">
                <label className="orbitron text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <BrainCircuit className="w-3 h-3 text-red-500" /> Conflict Priority:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reasoningOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setProfile(p => ({ ...p, reasoningPriority: opt.id as any }))}
                      className={`p-4 glass-3d text-left border transition-all ${profile.reasoningPriority === opt.id ? 'border-red-600/60 bg-red-600/5 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-white/5 hover:border-white/20'}`}
                    >
                      <div className={`orbitron text-[9px] font-black uppercase ${profile.reasoningPriority === opt.id ? 'text-red-500' : 'text-zinc-100'}`}>{opt.label}</div>
                      <div className="text-[8px] text-zinc-600 uppercase mt-1 leading-tight">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="orbitron text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-red-500" /> Uncertainty Handling:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {uncertaintyOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setProfile(p => ({ ...p, uncertaintyTolerance: opt.id as any }))}
                      className={`py-4 px-2 glass-3d border orbitron text-[8px] font-black uppercase rounded-xl transition-all flex flex-col items-center text-center gap-1 ${profile.uncertaintyTolerance === opt.id ? 'border-red-600/60 bg-red-600/5 text-red-500 shadow-lg' : 'border-white/5 text-zinc-600 hover:text-zinc-300'}`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-[6px] opacity-60 leading-none">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="orbitron text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <Search className="w-3 h-3 text-red-500" /> Domain Focus (Max 3)
                </label>
                <div className="flex flex-wrap gap-2">
                  {domains.map(d => (
                    <button
                      key={d}
                      onClick={() => handleToggleDomain(d)}
                      className={`px-4 py-2 rounded-full orbitron text-[8px] font-black uppercase border transition-all ${profile.domainFocus.includes(d) ? 'bg-zinc-100 text-black border-zinc-100' : 'border-white/10 text-zinc-600 hover:border-zinc-500'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => setStep(3)} 
                  disabled={profile.domainFocus.length === 0}
                  className="w-full py-5 bg-zinc-100 text-black rounded-2xl orbitron font-black text-xs tracking-[0.4em] uppercase hover:bg-white transition-all shadow-2xl active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3"
                >
                  Confirm Calibration <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 w-full animate-in fade-in slide-in-from-right-4">
             <div className="space-y-4">
              <h2 className="text-3xl font-black orbitron uppercase tracking-tighter text-glow-red">Neural Sync</h2>
              <p className="text-zinc-500 orbitron text-[10px] tracking-widest uppercase">Propagating matrix parameters...</p>
            </div>
            
            <div className="glass-3d p-8 max-w-xl mx-auto border-red-600/20 shadow-[0_0_50px_rgba(220,38,38,0.05)] text-left space-y-4">
               <div className="flex gap-6 items-center">
                 <div className="flex-1 orbitron text-zinc-300 text-sm uppercase tracking-tight leading-relaxed">
                   {isProcessing ? "Calibrating reasoning parameters..." : "System ready for deployment."}
                 </div>
                 <div className={`p-5 rounded-2xl transition-all duration-500 ${isProcessing ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] text-white' : 'bg-red-600/10 text-red-500'}`}>
                   {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                 </div>
               </div>
            </div>
            
            {!isProcessing && (
              <button onClick={handleCalibration} className="px-12 py-5 bg-red-600 text-white rounded-2xl orbitron font-black text-xs tracking-[0.3em] uppercase hover:bg-red-500 transition-all shadow-xl">
                Finalize Calibration
              </button>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 w-full">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600/30 blur-3xl animate-pulse rounded-full"></div>
                <Hexagon className="w-24 h-24 text-red-600 relative z-10" />
              </div>
            </div>
            <div className="space-y-4 text-center">
              <h1 className="text-4xl md:text-5xl font-black orbitron uppercase tracking-tighter leading-none">
                Neural Handshake <span className="text-red-600 text-glow-red">Success</span>
              </h1>
              <p className="text-zinc-500 orbitron text-xs tracking-widest uppercase max-w-sm mx-auto leading-relaxed">
                Aethelgard reasoning engine is now online. {hasPaidKey ? "Paid API link confirmed." : "Standard API link active."}
              </p>
            </div>
            <button onClick={onComplete} className="px-16 py-6 bg-red-600 text-white rounded-2xl orbitron font-black text-xs tracking-[0.4em] uppercase hover:bg-red-500 transition-all shadow-2xl active:scale-95 border border-white/20">
              Enter The Core
            </button>
          </div>
        )}

        <div className="absolute bottom-8 flex gap-4">
          {[1,2,3,4].map(s => (
            <div key={s} className={`w-3 h-1 rounded-full transition-all duration-500 ${step === s ? 'bg-red-600 w-12 shadow-[0_0_8px_rgba(220,38,38,0.8)]' : 'bg-zinc-800'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;