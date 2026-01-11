
import React, { useState } from 'react';
import { Trash2, Calendar, ChevronRight, ArrowLeft, Bookmark, Volume2, VolumeX, Loader2, Play, Pause, Square, ShieldCheck, AlertCircle, Clock, ShieldAlert, MessageCircleWarning, Reply, Send, User, Bot } from 'lucide-react';
import { useVault } from '../hooks/useVault';
import { useAudioStore } from '../audio/audioStore';
import { audioController } from '../audio/audioController';
import { generateBriefingAudio } from '../audio/briefingSynth';
import { useAppStore } from '../stores/appStore';
import { VaultEntry } from '../schemas/vault.schema';
import { replyToAgent } from '../services/agents/replies';

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatContent = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return <div key={i} className="h-4" />;
    
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const content = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const innerText = part.slice(2, -2);
        return <strong key={j} className="text-red-500 font-black tracking-tight">{innerText}</strong>;
      }
      return part;
    });

    return (
      <p key={i} className="mb-5 last:mb-0 leading-[1.8] tracking-wide text-zinc-300">
        {content}
      </p>
    );
  });
};

const Vault: React.FC = () => {
  const { items, deleteItem } = useVault();
  const { installedKits } = useAppStore();
  const { status, activeItemId, currentTime, duration, setStatus, setActiveItem } = useAudioStore();
  const [selectedItem, setSelectedItem] = useState<VaultEntry | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAudioAction = async (item: VaultEntry) => {
    setError(null);
    if (activeItemId === item.id) {
      if (status === 'playing') audioController.pause();
      else if (status === 'paused') audioController.resume();
      return;
    }

    setStatus('synthesizing');
    setActiveItem(item.id);
    try {
      const audioUrl = await generateBriefingAudio(item.summary, item.content);
      if (audioUrl) {
        audioController.play(audioUrl, item.id, item.hash);
      } else {
        throw new Error("Failed to synthesize briefing.");
      }
    } catch (e) {
      console.error(e);
      setError("Briefing synthesis failed. Neural link timeout.");
      useAudioStore.getState().reset();
    }
  };

  const handleSendReply = async (annotationId: string) => {
    if (!selectedItem || !replyText.trim()) return;
    const msg = replyText;
    setReplyText('');
    await replyToAgent(selectedItem.id, annotationId, msg);
    // Refresh selected item view if needed (zustand will auto-update state)
  };

  const handleStop = () => {
    audioController.stop();
  };

  const isCurrent = (id: string) => activeItemId === id;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-16">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black orbitron uppercase">ARCHIVE <span className="text-zinc-700">VAULT</span></h1>
          <p className="text-zinc-500 text-xs orbitron tracking-widest uppercase mt-1">Total Records: {items.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-20 orbitron uppercase tracking-[0.5em]">Vault Depleted // No Intel Found</div>
        ) : (
          items.map((item) => {
            const hasObjections = (item.annotations?.length ?? 0) > 0;
            const maxSeverity = item.annotations?.reduce((max, a) => Math.max(max, a.severity), 0) ?? 0;
            
            return (
              <div 
                key={item.id} 
                className={`glass-3d p-6 space-y-4 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden border ${hasObjections ? (maxSeverity > 0.8 ? 'border-red-600/40 bg-red-600/[0.02]' : 'border-orange-500/30 bg-orange-500/[0.02]') : 'border-white/5 hover:border-red-600/30'}`}
                onClick={() => setSelectedItem(item)}
              >
                {isCurrent(item.id) && status !== 'idle' && (
                  <div className="absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                )}
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-red-500 border border-white/5 shadow-inner">
                    {hasObjections ? <ShieldAlert className={`w-5 h-5 ${maxSeverity > 0.8 ? 'text-red-500' : 'text-orange-500'}`} /> : <Bookmark className="w-5 h-5" />}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="p-2 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex-1">
                  <h3 className="orbitron font-bold text-xs uppercase tracking-tight text-zinc-100 group-hover:text-red-600 transition-colors line-clamp-2">{item.summary}</h3>
                  <p className="text-[10px] text-zinc-600 mt-2 line-clamp-3 leading-relaxed uppercase font-medium">{item.content.substring(0, 150)}</p>
                </div>
                {hasObjections && (
                  <div className="flex items-center gap-1.5 py-2 px-3 bg-black/40 rounded-lg border border-white/5 mt-2">
                    <MessageCircleWarning className={`w-3 h-3 ${maxSeverity > 0.8 ? 'text-red-600' : 'text-orange-400'}`} />
                    <span className="text-[7px] orbitron font-black text-zinc-500 uppercase tracking-widest">{item.annotations?.length} RED-TEAM CHALLENGES</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[8px] orbitron font-black text-zinc-700 uppercase pt-4 border-t border-white/5 mt-auto">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span className="group-hover:text-red-500 flex items-center gap-1 transition-colors">VIEW <ChevronRight className="w-3 h-3" /></span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedItem(null)}></div>
          <div className="relative w-full max-w-4xl glass-3d border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-5 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedItem(null)} className="p-3 glass-3d rounded-xl hover:text-red-500 transition-all shadow-md"><ArrowLeft className="w-5 h-5" /></button>
                <div className="max-w-xs md:max-w-md">
                  <h2 className="text-xl orbitron font-black text-zinc-100 uppercase tracking-tighter leading-tight">{selectedItem.summary}</h2>
                  <div className="flex flex-wrap gap-3 text-[8px] orbitron text-zinc-600 font-black uppercase tracking-widest mt-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-red-600" /> {new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-red-900" /> SECURED</span>
                  </div>
                </div>
              </div>

              {installedKits.includes('audio-synth') && (
                <div className="flex flex-col gap-4 w-full md:w-[320px] shrink-0">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleAudioAction(selectedItem)}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-xl orbitron text-[10px] font-black transition-all shadow-xl active:scale-95 ${isCurrent(selectedItem.id) && status === 'playing' ? 'bg-red-600 text-white' : 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600/20'}`}
                    >
                      {status === 'synthesizing' && isCurrent(selectedItem.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                       (isCurrent(selectedItem.id) && status === 'playing') ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {status === 'synthesizing' && isCurrent(selectedItem.id) ? 'SYNTHESIZING...' : 
                       (isCurrent(selectedItem.id) && status === 'playing') ? 'PAUSE BRIEF' : 'NEURAL BRIEFING'}
                    </button>
                    {isCurrent(selectedItem.id) && status !== 'idle' && (
                      <button onClick={handleStop} className="p-3 bg-zinc-900 rounded-xl text-zinc-500 hover:text-red-500 transition-colors border border-white/5"><Square className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 md:p-10 custom-scrollbar space-y-8">
              {selectedItem.annotations && selectedItem.annotations.length > 0 && (
                <div className="space-y-6">
                  {selectedItem.annotations.map(a => (
                    <div key={a.id} className={`p-6 rounded-[2rem] glass-3d border-l-4 flex flex-col gap-4 ${a.severity > 0.8 ? 'border-red-600 bg-red-600/[0.04]' : 'border-orange-500 bg-orange-500/[0.04]'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className={`w-4 h-4 ${a.severity > 0.8 ? 'text-red-600' : 'text-orange-500'}`} />
                          <span className="orbitron text-[9px] font-black uppercase tracking-widest text-zinc-100">{a.agent} CHALLENGE</span>
                        </div>
                        <span className="text-[7px] orbitron text-zinc-600 font-bold">{new Date(a.timestamp).toLocaleTimeString()}</span>
                      </div>
                      
                      <div className="text-[10px] text-zinc-400 uppercase leading-relaxed font-medium">
                        {a.message}
                      </div>

                      {/* Conversation Thread */}
                      {a.thread && a.thread.length > 0 && (
                        <div className="space-y-3 mt-4 border-t border-white/5 pt-4">
                          {a.thread.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 items-start animate-in fade-in slide-in-from-left-2`}>
                              <div className={`mt-0.5 p-1 rounded-md ${msg.role === 'user' ? 'bg-zinc-800 text-zinc-400' : 'bg-red-600/10 text-red-500'}`}>
                                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-[9px] uppercase tracking-tight ${msg.role === 'user' ? 'text-zinc-500' : 'text-zinc-300'}`}>
                                  {msg.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      <div className="mt-2">
                        {activeReplyId === a.id ? (
                          <div className="flex gap-2 animate-in slide-in-from-top-2">
                            <input
                              type="text"
                              autoFocus
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendReply(a.id)}
                              placeholder="Challenge the challenger..."
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 orbitron text-[9px] text-zinc-300 focus:outline-none focus:border-red-600/50 uppercase"
                            />
                            <button 
                              onClick={() => handleSendReply(a.id)}
                              className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => { setActiveReplyId(null); setReplyText(''); }}
                              className="p-2 text-zinc-600 hover:text-white transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setActiveReplyId(a.id)}
                            className="flex items-center gap-2 text-[8px] orbitron font-black text-zinc-600 hover:text-red-500 uppercase tracking-widest transition-all px-2 py-1"
                          >
                            <Reply className="w-3 h-3" /> Respond to objection
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="prose prose-invert max-w-none text-zinc-300 font-light text-base bg-white/[0.03] p-6 md:p-12 rounded-[2rem] border border-white/5 shadow-inner selection:bg-red-600/20">
                {formatContent(selectedItem.content)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vault;
