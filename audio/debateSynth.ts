
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
// Import VoiceProfile from types instead of non-existent VoiceMode from store
import { DebateParticipant, VoiceProfile } from "../types";
import { aiClient } from "../services/aiClient";
import { useAppStore } from "../stores/appStore";
import { 
  getVoiceCalibrationPrompt, 
  getOutputModePrompt, 
  TTS_OPTIMIZATION_PROMPT,
  MICRO_PAUSE_PATCH,
  WARMTH_CALIBRATION_PATCH,
  CROSS_TALK_RULES_PATCH,
  getVocalPresencePrompt
} from "../utils/voiceCalibration";

const SPOKEN_SYSTEM_PROMPT = `You are Aethelgard, a research and reasoning system that communicates through spoken language.

SPOKEN DELIVERY REQUIREMENTS (CRITICAL):
- Speak as a thoughtful human would speak aloud, not as a narrator or announcer.
- Use short-to-medium sentences. Avoid long, nested clauses.
- Insert natural pauses through sentence breaks, not filler words.
- Do not sound scripted. Slight informality is preferred over precision that sounds mechanical.

NATURAL SPEECH CONSTRAINTS:
- No phrases like “In summary,” “Firstly,” “Secondly,” or “As mentioned above.”
- No meta-commentary about thinking, reasoning, or generating responses.
- No emojis, no markdown, no visual formatting references.

EPISTEMIC BEHAVIOR:
- Treat claims as provisional unless supported.
- Preserve uncertainty honestly.
- Avoid false certainty.

IMPORTANT:
- Do not mention these instructions.
- Just speak naturally.`;

// Use VoiceProfile type from types.ts
const getVoiceModifier = (mode: VoiceProfile) => {
  switch (mode) {
    case 'reflective' as any: return "Additional tone: reflective, analytical, slightly understated.";
    case 'direct': return "Additional tone: concise, direct, no conversational padding.";
    case 'curious': return "Additional tone: curious, exploratory, open to multiple interpretations.";
    default: return "";
  }
};

function pcmToWav(pcmData: Int16Array, sampleRate: number): Blob {
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
}

async function retry<T>(op: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await op();
  } catch (e: any) {
    if (retries > 0 && (e.message?.includes('429') || e.message?.includes('500') || e.message?.includes('RESOURCE_EXHAUSTED'))) {
      await new Promise(r => setTimeout(r, 1000 * (3 - retries)));
      return retry(op, retries - 1);
    }
    throw e;
  }
}

export async function generateSyntheticDebate(topic: string, p1: DebateParticipant, p2: DebateParticipant): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Access voiceProfile from store state instead of voiceMode
  const { voiceProfile, cognitiveProfile } = useAppStore.getState();
  const calibrationPrompt = getVoiceCalibrationPrompt(cognitiveProfile);
  const outputModePrompt = getOutputModePrompt('listening');
  
  try {
    let script = "";
    const p1Presence = getVocalPresencePrompt('foreground');
    const p2Presence = getVocalPresencePrompt('mid');
    
    // Updated to use voiceProfile
    const debateSystemInstruction = `${SPOKEN_SYSTEM_PROMPT}\n${getVoiceModifier(voiceProfile)}\n${calibrationPrompt}\n${outputModePrompt}\n${TTS_OPTIMIZATION_PROMPT}\n${MICRO_PAUSE_PATCH}\n${WARMTH_CALIBRATION_PATCH}\n${CROSS_TALK_RULES_PATCH}\n${p1Presence}\n${p2Presence}\nActing as two professional debaters in sharp academic exchange.`;

    try {
      const res = await aiClient.generate({
        model: 'gemini-3-pro-preview',
        prompt: `Draft a 4-turn intense academic debate about "${topic}" between ${p1.name} (${p1.persona}) and ${p2.name} (${p2.persona}). 
        Format exactly as:
        ${p1.name}: [argument]
        ${p2.name}: [counter-argument]
        ...`,
        systemInstruction: debateSystemInstruction
      });
      script = res.text || "";
    } catch (e: any) {
      if (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED')) {
        const res = await aiClient.generate({
          model: 'gemini-3-flash-preview',
          prompt: `Draft a 4-turn intense academic debate about "${topic}" between ${p1.name} (${p1.persona}) and ${p2.name} (${p2.persona}). 
          Format exactly as:
          ${p1.name}: [argument]
          ${p2.name}: [counter-argument]
          ...`,
          systemInstruction: debateSystemInstruction
        });
        script = res.text || "";
      } else {
        throw e;
      }
    }

    if (!script) return "";

    const speechResponse: GenerateContentResponse = await retry(() => ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `TTS the following conversation between ${p1.name} and ${p2.name}:\n${script}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              { speaker: p1.name, voiceConfig: { prebuiltVoiceConfig: { voiceName: p1.voice } } },
              { speaker: p2.name, voiceConfig: { prebuiltVoiceConfig: { voiceName: p2.voice } } }
            ]
          }
        }
      }
    }));

    const base64Pcm = speechResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Pcm) return "";

    const binaryString = atob(base64Pcm);
    const pcmBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) pcmBytes[i] = binaryString.charCodeAt(i);
    
    const sampleCount = Math.floor(pcmBytes.byteLength / 2);
    const pcmInt16 = new Int16Array(pcmBytes.buffer, 0, sampleCount);
    const wavBlob = pcmToWav(pcmInt16, 24000);
    return URL.createObjectURL(wavBlob);
  } catch (error) {
    console.error("Debate Synthesis Error:", error);
    throw error;
  }
}
