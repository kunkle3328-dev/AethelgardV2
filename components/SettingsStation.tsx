
import React from 'react';
import { 
  Sliders, 
  BrainCircuit, 
  MessageSquare, 
  Headphones, 
  Sun, 
  Wind, 
  Music,
  Waves,
  Zap,
  Mic2,
  ShieldCheck,
  Type,
  FastForward,
  PlayCircle
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { 
  VoiceTone, 
  VoicePace, 
  VerbosityLevel, 
  ResponseStyle,
  VoiceWarmth
} from '../types';

const SettingsStation: React.FC = () => {
  const { 
    voiceProfile, setVoiceProfile,
    backchannelEnabled, setBackchannelEnabled,
    conciergeMode, setConciergeMode,
    voiceConfig, setVoiceConfig
  } = useAppStore();

  const toneOptions: { id: VoiceTone; label: string; icon: any; desc: string }[] = [
    { id: 'conversational', label: 'Conversational', icon: MessageSquare, desc: 'Balanced & human' },
    { id: 'analytical', label: 'Analytical', icon: BrainCircuit, desc: 'Precise & factual' },
    { id: 'calm', label: 'Calm', icon: Wind, desc: 'Steady & relaxed' },
    { id: 'direct', label: 'Direct', icon: Zap, desc: 'Efficient & sharp' }
  ];

  const paceOptions: { id: VoicePace; label: string; icon: any }[] = [
    { id: 'slow', label: 'Slow', icon: Waves },
    { id: 'normal', label: 'Normal', icon: PlayCircle },
    { id: 'fast', label: 'Fast', icon: FastForward }
  ];

  const verbosityOptions: { id: VerbosityLevel; label: string; desc: string }[] = [
    { id: 'brief', label: 'Brief', desc: '1-2 sentences' },
    { id: 'balanced', label: 'Balanced', desc: 'Standard context' },
    { id: 'detailed', label: 'Detailed', desc: 'Deep-dive mode' }
  ];

  const warmthOptions: { id: VoiceWarmth; label: string; icon: any }[] = [
    { id: 'cool', label: 'Cool', icon: Wind },
    { id: 'natural', label: 'Natural', icon: Sun },
    { id: 'warm', label: 'Warm', icon: Waves }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10 animate-in fade-in duration-700 pb-24 px-4 md:px-0">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-5xl font-black orbitron uppercase tracking-tighter">VOICE <span className="text-zinc-700">MATRIX</span></h1>
          <p className="text-zinc-500 orbitron text-[10px] tracking-widest uppercase mt-2">Neural Interface & Audio Stabilization</p>
        </div>
        <div className="p-3 glass-3d-red rounded-xl">
           <Sliders className="w-5 h-5 text-red-500" />
        </div>
      </div>

      <div className="space-y-12">
        {/* Voice Tone */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Music className="w-5 h-5 text-red-600" />
            <h2 className="orbitron text-[10px] font-black uppercase tracking-[0.3em]">Voice Tone</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {toneOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setVoiceConfig({ tone: opt.id })}
                className={`p-6 glass-3d border text-left transition-all relative overflow-hidden group ${voiceConfig.tone === opt.id ? 'border-red-600/50 bg-red-600/5' : 'border-white/5 hover:border-white/20'}`}
              >
                <div className={`mb-3 transition-colors ${voiceConfig.tone === opt.id ? 'text-red-500' : 'text-zinc-600'}`}>
                  <opt.icon className="w-6 h-6" />
                </div>
                <h3 className={`orbitron text-[10px] font-black uppercase mb-1 ${voiceConfig.tone === opt.id ? 'text-red-500' : 'text-zinc-100'}`}>{opt.label}</h3>
                <p className="text-[8px] text-zinc-600 uppercase leading-tight font-bold">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Pace & Verbosity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Wind className="w-5 h-5 text-red-600" />
              <h2 className="orbitron text-[10px] font-black uppercase tracking-[0.3em]">Speaking Pace</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {paceOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setVoiceConfig({ pace: opt.id })}
                  className={`p-4 glass-3d border flex flex-col items-center gap-2 transition-all ${voiceConfig.pace === opt.id ? 'border-red-600/50 bg-red-600/10 text-white' : 'border-white/5 text-zinc-600'}`}
                >
                  <opt.icon className="w-4 h-4" />
                  <span className="orbitron text-[8px] font-black uppercase tracking-tighter">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Type className="w-5 h-5 text-red-600" />
              <h2 className="orbitron text-[10px] font-black uppercase tracking-[0.3em]">Verbosity</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {verbosityOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setVoiceConfig({ verbosity: opt.id })}
                  className={`p-4 glass-3d border text-center transition-all flex flex-col justify-center gap-1 ${voiceConfig.verbosity === opt.id ? 'border-red-600/50 bg-red-600/10 text-white' : 'border-white/5 text-zinc-600'}`}
                >
                  <span className="orbitron text-[8px] font-black uppercase block">{opt.label}</span>
                  <span className="text-[6px] uppercase opacity-60 leading-tight font-bold">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Response Style Toggle */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Sliders className="w-5 h-5 text-red-600" />
            <h2 className="orbitron text-[10px] font-black uppercase tracking-[0.3em]">Delivery Logic</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button 
                onClick={() => setVoiceConfig({ responseStyle: 'thoughtful' })}
                className={`p-6 glass-3d border text-left transition-all relative overflow-hidden flex items-center gap-6 ${voiceConfig.responseStyle === 'thoughtful' ? 'border-red-600/50 bg-red-600/5' : 'border-white/5 opacity-60'}`}
              >
                <div className={`p-4 rounded-xl ${voiceConfig.responseStyle === 'thoughtful' ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-600'}`}>
                  <Waves className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="orbitron text-xs font-black uppercase text-zinc-100">Thoughtful Pauses</h3>
                  <p className="text-[8px] orbitron text-zinc-600 font-bold uppercase mt-1">Simulates internal processing</p>
                </div>
              </button>

              <button 
                onClick={() => setVoiceConfig({ responseStyle: 'straightforward' })}
                className={`p-6 glass-3d border text-left transition-all relative overflow-hidden flex items-center gap-6 ${voiceConfig.responseStyle === 'straightforward' ? 'border-red-600/50 bg-red-600/5' : 'border-white/5 opacity-60'}`}
              >
                <div className={`p-4 rounded-xl ${voiceConfig.responseStyle === 'straightforward' ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-600'}`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="orbitron text-xs font-black uppercase text-zinc-100">Straightforward</h3>
                  <p className="text-[8px] orbitron text-zinc-600 font-bold uppercase mt-1">Direct delivery without hesitation</p>
                </div>
              </button>
          </div>
        </div>

        {/* Secondary Stabilization Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-3d p-6 border-white/5 space-y-4">
             <div className="flex items-center gap-2 text-zinc-400">
                <Mic2 className="w-4 h-4 text-red-600" />
                <h3 className="orbitron text-[10px] font-black uppercase tracking-widest">Acoustic Guard</h3>
             </div>
             <div className="flex gap-2">
              {warmthOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setVoiceConfig({ warmth: opt.id })}
                  className={`flex-1 p-3 glass-3d border flex flex-col items-center gap-1 transition-all ${voiceConfig.warmth === opt.id ? 'border-red-600/50 bg-red-600/10 text-white' : 'border-white/5 text-zinc-600'}`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  <span className="orbitron text-[8px] font-black uppercase">{opt.label}</span>
                </button>
              ))}
            </div>
             <p className="text-[7px] orbitron text-zinc-600 font-bold uppercase tracking-tight pt-2 border-t border-white/5">Auto-Correction: High-Pass @ 80Hz Active</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => setBackchannelEnabled(!backchannelEnabled)}
              className={`p-6 w-full glass-3d border text-left transition-all flex items-center justify-between group ${backchannelEnabled ? 'border-red-600/40 bg-red-600/5' : 'border-white/5 opacity-60'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${backchannelEnabled ? 'bg-red-600/20 text-red-500' : 'bg-white/5 text-zinc-500'}`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="orbitron text-xs font-black uppercase text-zinc-100">Backchannel</h3>
                  <p className="text-[8px] orbitron text-zinc-600 font-bold uppercase mt-1">Human conversational cues</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${backchannelEnabled ? 'bg-red-600' : 'bg-zinc-800'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${backchannelEnabled ? 'left-6' : 'left-1'}`}></div>
              </div>
            </button>

            <button 
              onClick={() => setConciergeMode(!conciergeMode)}
              className={`p-6 w-full glass-3d border text-left transition-all flex items-center justify-between group ${conciergeMode ? 'border-red-600/40 bg-red-600/5' : 'border-white/5 opacity-60'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${conciergeMode ? 'bg-red-600/20 text-red-500' : 'bg-white/5 text-zinc-500'}`}>
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="orbitron text-xs font-black uppercase text-zinc-100">Concierge Flow</h3>
                  <p className="text-[8px] orbitron text-zinc-600 font-bold uppercase mt-1">Zero-citation fluid logic</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${conciergeMode ? 'bg-red-600' : 'bg-zinc-800'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${conciergeMode ? 'left-6' : 'left-1'}`}></div>
              </div>
            </button>
          </div>
        </div>

        <div className="p-8 glass-3d border-red-600/20 bg-red-600/[0.02] flex items-center gap-6 rounded-[2.5rem]">
           <div className="p-4 bg-red-600 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)]">
             <ShieldCheck className="w-6 h-6 text-white" />
           </div>
           <div>
             <h4 className="orbitron text-xs font-black text-zinc-100 uppercase tracking-widest">Neural Voice Calibration</h4>
             <p className="text-[10px] text-zinc-500 uppercase mt-1 leading-relaxed font-bold">
               Aethelgard now dynamically adjusts cadence and phrasing based on your Matrix settings. 
               The "Thoughtful" response style uses specific AI hesitations to mimic deep research synthesis.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsStation;