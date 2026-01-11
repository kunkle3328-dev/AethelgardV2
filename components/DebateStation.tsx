
import React, { useState } from 'react';
import { Mic2, Play, Pause, Square, Loader2, Users, Sparkles, BrainCircuit, MessageSquare, Clock, AlertCircle, ZapOff, Gavel, BookOpen, ShieldOff } from 'lucide-react';
import { generateSyntheticDebate } from '../audio/debateSynth';
import { audioController } from '../audio/audioController';
import { useAudioStore } from '../audio/audioStore';
import { DebateParticipant, DevilMode } from '../types';
import { DebateTurn } from '../schemas/debate.schema';

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const DebateStation: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<DevilMode>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [debateLog, setDebateLog] = useState<DebateTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { status, activeItemId, currentTime, duration } = useAudioStore();

  const personas = [
    { id: '1', name: 'Analyst', role: 'optimist', persona: 'Pragmatic, data-driven researcher', voice: 'Kore' as const, prompt: 'Focus on feasibility and immediate gains.' },
    { id: '2', name: 'Skeptic', role: 'skeptic', persona: 'Philosophical, critical deep-thinker', voice: 'Puck' as const, prompt: 'Question assumptions and long-term ethical debt.' },
  ];

  const handleStartDebate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setDebateLog([]);
    setError(null);
    try {
      const url = await generateSyntheticDebate(`${mode.toUpperCase()} DEBATE: ${topic}`, personas[0], personas[1]);
      if (url) {
        audioController.play(url, 'debate-main');
        setDebateLog([
          { personaId: '1', name: 'Analyst', content: `Applying ${mode} standards to ${topic}...`, timestamp: Date.now() },
          { personaId: '2', name: 'Skeptic', content: `Acknowledged. Scanning for logical fractures under ${mode} protocol.`, timestamp: Date.now() + 1000 }
        ]);
      }
    } catch (e: any) {
      console.error(e);
      setError("Debate engine at capacity or link unstable.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePlayback = () => {
    if (status === 'playing') audioController.pause();
    else if (status === 'paused') audioController.resume();
  };

  const isCurrent = activeItemId === 'debate-main';
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-in fade-in duration-700 pb-24">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black orbitron uppercase tracking-tighter">
          ADVERSARIAL <span className="text-red-600">DEBATE</span>
        </h1>
        <p className="text-zinc-500 orbitron text-[10px] tracking-widest uppercase">Structured Pressure-Testing & Synthesis</p>
      </div>

      <div className="glass-3d p-8 space-y-8 rounded-[2rem] relative overflow-hidden">
        {isCurrent && status !== 'idle' && (
          <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900/50">
            <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>
        )}

        <div className="flex gap-4 items-center justify-center pt-4">
          <div className="flex gap-4">
             {[
               { id: 'standard', icon: BrainCircuit, label: 'Neural' },
               { id: 'legal', icon: Gavel, label: 'Legal' },
               { id: 'academic', icon: BookOpen, label: 'Academic' },
               { id: 'steelman', icon: ShieldOff, label: 'Steel-Man' }
             ].map(m => (
               <button
                 key={m.id}
                 onClick={() => setMode(m.id as DevilMode)}
                 className={`flex flex-col items-center gap-2 p-4 rounded-2xl glass-3d border transition-all ${mode === m.id ? 'border-red-600/60 bg-red-600/10 text-red-500' : 'border-white/5 text-zinc-600 hover:text-zinc-300'}`}
               >
                 <m.icon className="w-5 h-5" />
                 <span className="orbitron text-[8px] font-black uppercase tracking-widest">{m.label}</span>
               </button>
             ))}
          </div>
        </div>

        <div className="space-y-6 max-w-2xl mx-auto text-center">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={`Input ${mode} debate parameters...`}
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 orbitron text-center text-lg focus:outline-none focus:border-red-600/50 transition-all resize-none h-32 selection:bg-red-600/30 placeholder:text-zinc-800"
          />
          
          <div className="flex flex-col gap-6">
            <div className="flex justify-center gap-4">
               <button 
                 onClick={handleStartDebate}
                 disabled={isGenerating || (isCurrent && status === 'playing')}
                 className="bg-red-600 hover:bg-red-500 text-white px-12 py-4 rounded-xl font-black orbitron text-[10px] tracking-[0.2em] uppercase transition-all shadow-2xl flex items-center gap-2 disabled:opacity-50 active:scale-95"
               >
                 {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                 {isGenerating ? 'SYNCING PERSONAS...' : 'INITIALIZE ARGUMENT'}
               </button>

               {isCurrent && status !== 'idle' && (
                 <div className="flex gap-2">
                   <button onClick={handleTogglePlayback} className="p-4 glass-3d border border-red-600/20 text-red-500 hover:bg-red-600/10 rounded-xl transition-all">
                     {status === 'playing' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                   </button>
                   <button onClick={() => audioController.stop()} className="p-4 bg-zinc-900 rounded-xl text-zinc-500 hover:text-red-500 border border-white/5">
                     <Square className="w-5 h-5" />
                   </button>
                 </div>
               )}
            </div>

            {error && (
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="orbitron text-[9px] font-black uppercase text-left">{error}</span>
              </div>
            )}

            {isCurrent && status !== 'idle' && (
              <div className="max-w-md mx-auto w-full space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center text-[10px] orbitron font-black text-zinc-500 uppercase px-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-red-600" />
                    <span>{formatTime(currentTime)}</span>
                  </div>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="relative group/seek">
                  <input 
                    type="range" min="0" max={duration || 0} step="0.1" value={currentTime} 
                    onChange={(e) => audioController.seek(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {debateLog.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2 px-2">
            <MessageSquare className="w-4 h-4 text-red-600" />
            <span className="orbitron text-[9px] font-black text-zinc-500 uppercase tracking-widest">{mode.toUpperCase()} STREAM</span>
          </div>
          {debateLog.map((turn, i) => (
            <div key={i} className={`p-6 glass-3d border-l-4 transition-all duration-500 ${turn.personaId === '1' ? 'border-red-600 bg-red-600/[0.02]' : 'border-zinc-700 bg-zinc-900/[0.2]'} hover:border-white/20`}>
              <div className="orbitron text-[8px] font-black mb-1 uppercase tracking-tighter flex justify-between">
                <span className={turn.personaId === '1' ? 'text-red-500' : 'text-zinc-400'}>{turn.name}</span>
                <span className="text-zinc-700">{new Date(turn.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed uppercase">{turn.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebateStation;
