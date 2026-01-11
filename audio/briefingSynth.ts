
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { useAppStore } from "../stores/appStore";
import { VoiceProfile } from "../types";
import { aiClient } from "../services/aiClient";
import { 
  getVoiceCalibrationPrompt, 
  getOutputModePrompt, 
  TTS_OPTIMIZATION_PROMPT,
  MICRO_PAUSE_PATCH,
  WARMTH_CALIBRATION_PATCH,
  NOTEBOOK_LM_VOICE_REQUIREMENTS,
  humanizeForSpeech
} from "../utils/voiceCalibration";

const SPOKEN_SYSTEM_PROMPT = `You are Aethelgard, a research and reasoning system that communicates through spoken language.
SPOKEN DELIVERY REQUIREMENTS (CRITICAL):
- Speak as a thoughtful human would speak aloud, not as a narrator or announcer.
- Use short-to-medium sentences. Avoid long, nested clauses.
- Insert natural pauses through sentence breaks, not filler words.
- Do not sound scripted. Slight informality is preferred.
- No phrases like “In summary,” “Firstly,” “Secondly.”`;

const getVoiceModifier = (mode: VoiceProfile) => {
  switch (mode) {
    case 'calm': return "Additional tone: reflective, analytical, slightly understated.";
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

export async function generateBriefingAudio(title: string, content: string): Promise<string> {
  const { voiceProfile, cognitiveProfile } = useAppStore.getState();
  const calibrationPrompt = getVoiceCalibrationPrompt(cognitiveProfile);
  const outputModePrompt = getOutputModePrompt('listening');
  
  try {
    // 1. Script Generation (Silent)
    const scriptResponse = await aiClient.generate({
      model: 'gemini-3-flash-preview',
      prompt: `Draft a professional spoken intelligence script for "${title}" using this data: ${content.slice(0, 5000)}.`,
      systemInstruction: `${SPOKEN_SYSTEM_PROMPT}\n${NOTEBOOK_LM_VOICE_REQUIREMENTS}\n${getVoiceModifier(voiceProfile)}\n${calibrationPrompt}\n${outputModePrompt}\n${TTS_OPTIMIZATION_PROMPT}\n${MICRO_PAUSE_PATCH}\n${WARMTH_CALIBRATION_PATCH}`,
    });

    const script = scriptResponse?.text || content.slice(0, 1000); // Fallback to raw content if AI fails
    const humanizedScript = humanizeForSpeech(script);

    // 2. TTS Synthesis
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const speechResponse: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: humanizedScript }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });

    const base64Pcm = speechResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Pcm) throw new Error("No audio bytes returned");
    
    const binaryString = atob(base64Pcm);
    const pcmBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) pcmBytes[i] = binaryString.charCodeAt(i);
    const wavBlob = pcmToWav(new Int16Array(pcmBytes.buffer), 24000);
    return URL.createObjectURL(wavBlob);
  } catch (error: any) {
    console.error("Briefing Synthesis Pipeline Failed:", error);
    return "";
  }
}
