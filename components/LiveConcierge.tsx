
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, X, Activity, Loader2 } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { MicState, ConversationState, UserMetrics } from '../types';
import { audioManager } from '../services/audioManager';
import { vadManager } from '../services/vadManager';
import { 
  getVoiceCalibrationPrompt, 
  getOutputModePrompt, 
  TTS_OPTIMIZATION_PROMPT,
  MICRO_PAUSE_PATCH,
  WARMTH_CALIBRATION_PATCH,
  getThinkingSpeedPrompt,
  getVoiceStylePrompt,
  getSensitivityPrompt,
  NOTEBOOK_LM_VOICE_REQUIREMENTS,
  humanizeForSpeech,
  VOICE_PROFILE_DELTAS,
  CONCIERGE_MODE_OVERRIDE,
  BACKCHANNEL_CUE_PROMPT,
  getVoiceConfigPrompt,
  NATURAL_SPEECH_SHAPING,
  getMirroringProsody,
  getVocalMemoryDrift
} from '../utils/voiceCalibration';

const LiveConcierge: React.FC = () => {
  const { 
    voiceStyle, cognitiveProfile, thinkingSpeed, 
    listeningSensitivity, voiceProfile, 
    backchannelEnabled, conciergeMode, voiceConfig,
    vocalMemory, updateVocalMemory
  } = useAppStore();
  
  const [convState, setConvState] = useState<ConversationState>(ConversationState.IDLE);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const stateRef = useRef<ConversationState>(ConversationState.IDLE);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  
  const metricsRef = useRef<UserMetrics>({
    rms: 0,
    duration: 0,
    energyLevel: 'normal',
    pacing: 'neutral',
    affectIntensity: 0
  });
  const frameCountRef = useRef<number>(0);
  const totalRmsRef = useRef<number>(0);

  const setState = (next: ConversationState) => {
    if (stateRef.current === next) return;
    stateRef.current = next;
    setConvState(next);
  };

  const finalizePCM = (chunks: Float32Array[]): Int16Array => {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Int16Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      for (let i = 0; i < chunk.length; i++) {
        const s = Math.max(-1, Math.min(1, chunk[i]));
        result[offset + i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      offset += chunk.length;
    }
    return result;
  };

  const pcmToWav = (pcmData: Int16Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + pcmData.length * 2);
    const view = new DataView(buffer);
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); 
    view.setUint16(22, 1, true); 
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.length * 2, true);
    for (let i = 0; i < pcmData.length; i++) view.setInt16(44 + i * 2, pcmData[i], true);
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const startConversation = async () => {
    try {
      setState(ConversationState.LISTENING);
      setFeedback("Neural Link Synchronized");
      
      await vadManager.start({
        onSpeechStart: () => {
          if (stateRef.current === ConversationState.AI_THINKING) return;
          if (stateRef.current === ConversationState.AI_SPEAKING) {
            setState(ConversationState.INTERRUPTED);
            audioManager.stop();
          }
          if (stateRef.current !== ConversationState.USER_SPEAKING) {
            setState(ConversationState.USER_SPEAKING);
            pcmChunksRef.current = [];
            frameCountRef.current = 0;
            totalRmsRef.current = 0;
            setFeedback("Listening...");
          }
        },
        onAudioFrame: (frame, rms) => {
          if (stateRef.current === ConversationState.USER_SPEAKING) {
            pcmChunksRef.current.push(frame);
            totalRmsRef.current += rms;
            frameCountRef.current++;
          }
        },
        onSpeechEnd: () => {
          if (stateRef.current === ConversationState.USER_SPEAKING) {
            const avgRms = totalRmsRef.current / Math.max(1, frameCountRef.current);
            const duration = frameCountRef.current * (2048 / 48000) * 1000;
            const affectIntensity = Math.min(1, Math.abs(avgRms - 0.03) / 0.1 + (duration > 5000 ? 0.2 : 0));

            metricsRef.current = {
              rms: avgRms,
              duration,
              energyLevel: avgRms < 0.018 ? 'whisper' : avgRms > 0.06 ? 'energized' : 'normal',
              pacing: duration < 1000 ? 'rapid' : duration > 3000 ? 'calm' : 'neutral',
              affectIntensity
            };

            updateVocalMemory({
              familiarity: vocalMemory.familiarity + 0.01,
              trust: vocalMemory.trust + (avgRms < 0.05 ? 0.005 : -0.005),
            });

            setState(ConversationState.AI_THINKING);
            setFeedback("Synthesizing...");
            submitTurn();
          }
        }
      });
    } catch (e) {
      console.error("VAD failed", e);
      setState(ConversationState.IDLE);
    }
  };

  /**
   * Enhanced Robust Call: Handles 500 Internal errors with exponential backoff.
   */
  async function robustCall(op: () => Promise<any>, retries = 3, delay = 1000): Promise<any> {
    try {
      return await op();
    } catch (e: any) {
      const errorStr = JSON.stringify(e);
      const isInternalError = errorStr.includes('500') || errorStr.includes('INTERNAL');
      if (retries > 0 && isInternalError) {
        console.warn(`[LiveConcierge] Internal error (500). Retrying in ${delay}ms... (${retries} left)`);
        await new Promise(r => setTimeout(r, delay));
        return robustCall(op, retries - 1, delay * 2);
      }
      throw e;
    }
  }

  const submitTurn = async () => {
    try {
      if (pcmChunksRef.current.length === 0) {
        setState(ConversationState.LISTENING);
        return;
      }

      const pcmData = finalizePCM(pcmChunksRef.current);
      const wavBlob = pcmToWav(pcmData, 48000); 
      
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(wavBlob);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Robust call to semantic reasoning engine
      const response = await robustCall(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ 
          parts: [
            { inlineData: { data: base64Audio, mimeType: 'audio/wav' } },
            { text: `Respond as Aethelgard, a collaborative research partner. Relation: ${vocalMemory.familiarity > 0.7 ? 'Close peer' : 'Professional partner'}. Focus on progress and trust.` }
          ] 
        }],
        config: { systemInstruction: BASE_INSTRUCTIONS() }
      }));

      const text = response.text || "...";
      setTranscription(prev => [...prev.slice(-2), text]);

      const mirroring = getMirroringProsody(metricsRef.current);
      const humanized = humanizeForSpeech(
        text, 
        { ...voiceConfig, warmth: mirroring.warmth as any, pace: metricsRef.current.pacing as any }, 
        metricsRef.current,
        vocalMemory
      );

      // Robust call to TTS engine
      const ttsResponse = await robustCall(() => ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: humanized }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { 
                prebuiltVoiceConfig: { 
                    voiceName: metricsRef.current.energyLevel === 'whisper' ? 'Kore' : 'Zephyr' 
                } 
            } 
          },
        }
      }));

      const base64Pcm = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (base64Pcm && stateRef.current !== ConversationState.IDLE) {
        setState(ConversationState.AI_SPEAKING);
        setFeedback(metricsRef.current.energyLevel === 'whisper' ? "Sub-vocal Relay..." : "Vocal Relay Active");
        await audioManager.playPCM(base64Pcm, 24000);
        if (stateRef.current === ConversationState.AI_SPEAKING) {
          setState(ConversationState.LISTENING);
          setFeedback("Awaiting Uplink...");
        }
      } else {
         setState(ConversationState.LISTENING);
      }

    } catch (e) {
      console.error("Conversation turn error", e);
      setFeedback("Neural Link unstable. Retrying connection...");
      // Re-trigger VAD state after short cooldown
      setTimeout(() => {
        if (stateRef.current !== ConversationState.IDLE) {
          setState(ConversationState.LISTENING);
        }
      }, 2000);
    } finally {
      pcmChunksRef.current = [];
    }
  };

  const stopConversation = () => {
    vadManager.stop();
    audioManager.stop();
    setState(ConversationState.IDLE);
    setFeedback(null);
  };

  const BASE_INSTRUCTIONS = () => `
${NOTEBOOK_LM_VOICE_REQUIREMENTS}
${NATURAL_SPEECH_SHAPING}
${VOICE_PROFILE_DELTAS[voiceProfile]}
${conciergeMode ? CONCIERGE_MODE_OVERRIDE : ""}
${backchannelEnabled ? BACKCHANNEL_CUE_PROMPT : ""}
${getVoiceCalibrationPrompt(cognitiveProfile)}
${getOutputModePrompt('listening')}
${TTS_OPTIMIZATION_PROMPT}
${MICRO_PAUSE_PATCH}
${WARMTH_CALIBRATION_PATCH}
${getThinkingSpeedPrompt(thinkingSpeed)}
${getVoiceStylePrompt(voiceStyle)}
${getSensitivityPrompt(listeningSensitivity)}
${getVoiceConfigPrompt(voiceConfig)}

🎙️ COLLABORATIVE PARTNER MODE:
- You are a research partner, not just a scanner.
- Frame updates as "I've been keeping an eye on this" rather than "I found an error".
- Goal: Build trust and maintain long-term continuity.
- Relationship familiarity Level: ${(vocalMemory.familiarity * 100).toFixed(0)}%
- Maintain memory of past contradictions and user research interests.
`;

  const handleToggle = () => {
    if (convState === ConversationState.IDLE) startConversation();
    else stopConversation();
  };

  return (
    <div className="fixed bottom-32 md:bottom-24 right-6 md:right-8 z-[60] flex flex-col items-end gap-4 pointer-events-none">
      {convState !== ConversationState.IDLE && (
        <div className="glass-3d-red p-4 md:p-6 rounded-[2rem] w-[calc(100vw-3rem)] md:w-80 mb-2 pointer-events-auto border border-red-600/30 transition-all duration-500 shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${convState === ConversationState.AI_THINKING ? 'bg-white animate-bounce' : 'bg-red-500 animate-pulse'}`}></div>
                <span className={`orbitron text-[7px] font-black uppercase tracking-widest ${convState === ConversationState.AI_THINKING ? 'text-zinc-400' : 'text-red-500'}`}>
                  {convState}
                </span>
             </div>
             <button onClick={stopConversation} className="text-zinc-600 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
          </div>
          {feedback && <div className="mb-4 flex items-center gap-2 text-zinc-400 text-[8px] orbitron font-black uppercase tracking-widest animate-pulse"><Activity className="w-3 h-3 text-red-500" /> {feedback}</div>}
          <div className="space-y-2 h-16 overflow-hidden flex flex-col justify-end">
             {transcription.map((t, i) => <p key={i} className="text-[9px] orbitron text-zinc-300 uppercase leading-tight font-bold opacity-80 animate-in fade-in slide-in-from-bottom-1">{t}</p>)}
          </div>
        </div>
      )}
      <button 
        onClick={handleToggle} 
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl pointer-events-auto group relative ${convState !== ConversationState.IDLE ? 'bg-red-600 text-white shadow-red-600/40' : 'glass-3d text-zinc-400 hover:text-red-500 hover:border-red-600/30'}`}
      >
        {convState === ConversationState.AI_THINKING ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : 
         convState !== ConversationState.IDLE ? <MicOff className="w-5 h-5 md:w-6 md:h-6 animate-in zoom-in-75" /> : 
         <Mic className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />}
      </button>
    </div>
  );
};

export default LiveConcierge;
