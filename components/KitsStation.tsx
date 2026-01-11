
import React, { useState } from 'react';
import { Cpu, Zap, Eye, Mic, ShieldCheck, Download, CheckCircle2, AlertCircle, X, Search, Play, Loader2, Check } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { MatrixSettings } from '../types';

const KITS_LIST = [
  { id: 'semantic-pro', name: 'SEMANTIC PRO', version: 'v2.4', desc: 'Advanced vector-based retrieval for high-precision vault searches.', icon: Zap, color: 'text-red-500', load: 12 },
  { id: 'vision-relay', name: 'VISION RELAY', version: 'v1.1', desc: 'Optical intelligence module for processing image-based nodes.', icon: Eye, color: 'text-zinc-100', load: 18 },
  { id: 'audio-synth', name: 'AUDIO SYNTH', version: 'v0.9-beta', desc: 'Neural text-to-speech for high-fidelity research briefing playback.', icon: Mic, color: 'text-zinc-400', load: 15 },
];

const MATRIX_ITEMS: { id: keyof MatrixSettings; name: string; size: string; desc: string }[] = [
  { id: 'gpuAcceleration', name: 'GPU ACCELERATION', size: '2.4 GB', desc: 'Speeds up large summaries by processing them with high-fidelity clusters.' },
  { id: 'graphDbV5', name: 'GRAPH DB V5', size: '480 MB', desc: 'Enables deeper conceptual mapping between vault nodes.' },
  { id: 'nlpOverride', name: 'NLP OVERRIDE', size: '1.2 GB', desc: 'Enables precise academic terminology and deeper cross-disciplinary reasoning.' },
];

const KitsStation: React.FC = () => {
  const { installedKits, toggleKit, matrixSettings, toggleMatrixSetting } = useAppStore();
  const [showMatrix, setShowMatrix] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setDownloading(id);
    setTimeout(() => {
      toggleMatrixSetting(id as keyof MatrixSettings);
      setDownloading(null);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black orbitron uppercase">EXPANSION <span className="text-zinc-700">KITS</span></h1>
          <p className="text-zinc-500 font-light max-w-xl text-sm tracking-wide">Enhance Aethelgard core intelligence with modular neural expansions.</p>
        </div>
        <button onClick={() => setShowMatrix(true)} className="px-8 py-4 glass-3d-red text-red-500 orbitron text-[10px] font-black tracking-widest hover:scale-105 transition-all">OPEN MATRIX REGISTRY</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {KITS_LIST.map((kit) => {
          const isInstalled = installedKits.includes(kit.id);
          const Icon = kit.icon;
          return (
            <div key={kit.id} className={`glass-3d p-8 space-y-6 flex flex-col transition-all duration-500 ${isInstalled ? 'border-red-600/30 shadow-[0_8px_32px_rgba(220,38,38,0.1)]' : ''}`}>
              <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center ${kit.color}`}><Icon className="w-8 h-8" strokeWidth={1.5} /></div>
                {isInstalled && <span className="text-[7px] orbitron text-red-500 font-black tracking-widest flex items-center gap-1 uppercase bg-red-600/10 px-2 py-1 rounded-full"><Check className="w-3 h-3" /> LINKED</span>}
              </div>
              <div className="flex-1">
                <h3 className="orbitron text-lg font-black text-zinc-100 uppercase">{kit.name}</h3>
                <p className="text-zinc-500 text-[10px] leading-relaxed mt-2 uppercase font-medium">{kit.desc}</p>
              </div>
              <button 
                onClick={() => toggleKit(kit.id)}
                className={`w-full py-4 rounded-xl orbitron text-[9px] font-black tracking-widest transition-all ${isInstalled ? 'bg-zinc-900 text-zinc-500' : 'bg-red-600 text-white shadow-xl hover:bg-red-500'}`}
              >
                {isInstalled ? 'DISCONNECT' : 'INITIALIZE'}
              </button>
            </div>
          );
        })}
      </div>

      {showMatrix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowMatrix(false)}></div>
          <div className="relative w-full max-w-2xl glass-3d border border-white/10 p-10 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="orbitron text-2xl font-black text-zinc-100 uppercase">Neural Matrix</h2>
                <p className="orbitron text-[9px] text-zinc-600 font-black uppercase mt-1">Registry Handshake Active // Core V3.1</p>
              </div>
              <button onClick={() => setShowMatrix(false)} className="p-3 glass-3d rounded-full hover:bg-red-600 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              {MATRIX_ITEMS.map((m) => {
                const isInstalled = matrixSettings[m.id];
                const isDown = downloading === m.id;
                return (
                  <div key={m.id} className={`flex items-center justify-between p-6 glass-3d border transition-all ${isInstalled ? 'border-red-600/40 bg-red-600/[0.03] shadow-[0_0_20px_rgba(220,38,38,0.05)]' : 'border-white/5'}`}>
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="orbitron text-xs font-black text-zinc-100 uppercase">{m.name}</h4>
                        <span className="text-[7px] orbitron text-zinc-700 font-black uppercase">{m.size}</span>
                      </div>
                      <p className="text-[10px] text-zinc-600 uppercase leading-tight">{m.desc}</p>
                    </div>
                    <button 
                      onClick={() => !isDown && toggleMatrixSetting(m.id)} 
                      disabled={isDown}
                      className={`p-4 rounded-xl transition-all min-w-[56px] flex items-center justify-center ${isInstalled ? 'bg-red-600/20 text-red-500 border border-red-600/30' : isDown ? 'bg-zinc-800 animate-pulse' : 'bg-white/5 hover:bg-red-600 hover:text-white border border-white/5'}`}
                    >
                      {isDown ? <Loader2 className="w-5 h-5 animate-spin" /> : isInstalled ? <CheckCircle2 className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center gap-3">
               <ShieldCheck className="w-4 h-4 text-zinc-700" />
               <p className="text-[8px] orbitron text-zinc-600 font-black uppercase tracking-widest">Expansion status: {Object.values(matrixSettings).filter(v => v).length}/{MATRIX_ITEMS.length} modules active.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitsStation;
