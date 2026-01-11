
import { CognitiveProfile, ThinkingSpeed, VoiceStyle, ListeningSensitivity, VoiceProfile, VoiceConfig, UserMetrics, VocalMemory } from "../types";

export const VOICE_PROFILE_DELTAS = {
  calm: `
CALM VOICE BEHAVIOR:
- Speak slowly and evenly.
- Use fewer words.
- Allow frequent pauses.
- Sound grounded, composed, and unhurried.
`,
  direct: `
DIRECT VOICE BEHAVIOR:
- Be concise and efficient.
- Minimize pauses.
- State conclusions clearly and immediately.
- Avoid exploratory or "thinking aloud" phrasing.
`,
  curious: `
CURIOUS VOICE BEHAVIOR:
- Sound inquisitive and engaged.
- Use gentle variation in tone and pitch.
- Occasionally reflect aloud on the information.
- Invite thought without necessarily asking direct questions.
`
};

/**
 * Maps persistent Vocal Memory signals to subtle prosody drifts.
 * These changes are almost imperceptible turn-by-turn but define the relationship.
 */
export function getVocalMemoryDrift(memory: VocalMemory): { rate: string; pitch: string; pauseScale: number } {
  // Familiarity ↑ : Slightly faster, shorter pauses
  // Trust ↑ : Warmer contour, more relaxed pitch
  const rateBase = 92 + (memory.familiarity * 6); // 92% to 98%
  const pitchBase = -2 + (memory.trust * 2);      // -2st to 0st
  const pauseScale = 1.2 - (memory.familiarity * 0.4); // 1.2x to 0.8x

  return {
    rate: `${rateBase}%`,
    pitch: `${pitchBase}st`,
    pauseScale
  };
}

/**
 * Maps inferred user emotional state to TTS prosody adjustments.
 */
export function getMirroringProsody(metrics: UserMetrics): { rate: string; pitch: string; warmth: string } {
  if (metrics.energyLevel === 'whisper') {
    return { rate: "85%", pitch: "-3st", warmth: "cool" };
  }
  
  if (metrics.energyLevel === 'energized') {
    return { rate: "102%", pitch: "+1st", warmth: "warm" };
  }
  
  if (metrics.pacing === 'calm') {
    return { rate: "88%", pitch: "-2st", warmth: "natural" };
  }
  
  return { rate: "96%", pitch: "0st", warmth: "natural" };
}

export const COGNITIVE_BEHAVIOR_BIASES = {
  synthesizer: `
SUBTLE BEHAVIORAL BIAS — THE SYNTHESIZER:
• PACE: Slightly faster, energetic cadence to reflect active ideation.
• PHRASING: Use exploratory phrasing (e.g., "this potentially links to...", "looking at the broader pattern...").
• LINKS: Emphasize broader contextual connections between disparate data points.
• TONE: Curious and intellectually engaged tone.
`,
  skeptic: `
SUBTLE BEHAVIORAL BIAS — THE SKEPTIC:
• PACE: Slower, more deliberate pace.
• PHRASING: Use careful, precise wording.
• MARKERS: Use explicit uncertainty markers (e.g., "the evidence for this remains provisional...", "it's worth questioning if...").
• TONE: Grounded, objective, and cautious tone.
`,
  analyst: `
SUBTLE BEHAVIORAL BIAS — THE ANALYST:
• PACE: Neutral, rhythmic, and steady human tempo.
• PHRASING: Structured delivery using clear step-by-step logic.
• LOGIC: Prioritize sequential reasoning and methodological clarity.
• TONE: Professional and balanced tone.
`
};

export const NATURAL_SPEECH_SHAPING = `
🗣️ NATURAL SPEECH SHAPING (MANDATORY):
1. **Variable Pacing**: Do NOT speak at a constant speed. Slow down slightly when introducing complex ideas. Speed up for simple connections.
2. **Sentence Chunking**: Group speech into natural thought units of 12-16 words max. Insert a distinct micro-pause between chunks.
3. **Clause Awareness**: Always pause briefly before conjunctions like "however", "so", "because", or "which means".
4. **Ending Cadence**: Use a slight downward intonation at the end of statements to sound grounded and resolved.
5. **Human Markers**: Occasionally use soft hesitations like "hm" or "well" only at the start of complex thoughts.
`;

/**
 * Humanizes text for TTS by adding punctuation-based pauses and removing AI artifacts.
 * Now handles 'Emotional Leakage'—subtle hesitations that signal presence.
 */
export function humanizeForSpeech(text: string, config?: VoiceConfig, metrics?: UserMetrics, memory?: VocalMemory): string {
  if (!text) return "";
  
  let processed = text
    .replace(/In conclusion,?/gi, "So,")
    .replace(/In summary,?/gi, "Basically,")
    .replace(/Firstly,?/gi, "To start,")
    .replace(/Secondly,?/gi, "Then,")
    .replace(/Thirdly,?/gi, "Also,")
    .replace(/As a result,?/gi, "Consequently,")
    .replace(/It is important to note that/gi, "Mind you,")
    .replace(/Additionally,?/gi, "What's more,")
    .replace(/Furthermore,?/gi, "On top of that,")
    .replace(/Moreover,?/gi, "And really,")
    .replace(/In other words,?/gi, "To put it simply,")
    .replace(/That is to say,?/gi, "Meaning,")
    .replace(/\*\*.*?\*\*/g, (match) => match.replace(/\*\*/g, ''))
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '');

  // 1️⃣ Emotional Leakage: Hesitation Injection
  // Inject micro-hesitation only if we are in an emotional context or deep relationship
  const shouldHesitate = (memory?.emotionalDepth ?? 0) > 0.4 || (metrics?.affectIntensity ?? 0) > 0.6;
  
  if (shouldHesitate && processed.length > 30) {
    const pauseStr = memory?.familiarity && memory.familiarity > 0.7 ? ".. hm .." : "... hm ...";
    processed = pauseStr + " " + processed;
  } else if (processed.length > 100 && config?.responseStyle !== 'straightforward') {
    processed = "hm ... " + processed;
  }

  // Handle Whisper Mode specifically with longer breath spacing
  if (metrics?.energyLevel === 'whisper') {
    processed = processed.replace(/\. \.\.\. /g, ". ... ... ");
  }

  // Refined prosody shaping using dots (...) which Gemini TTS interprets as pauses
  processed = processed
    .replace(/\n\n/g, ". ... ") 
    .replace(/([.?!])\s+/g, "$1 ... ") 
    .replace(/,\s+/g, ", .. ") 
    .replace(/\s+/g, " ")
    .trim();

  // Apply response style based refinements
  if (config?.responseStyle === 'thoughtful') {
    processed = processed.replace(/\. \.\.\. /g, ". ... well ... ");
    processed = processed.replace(/, \.\. /g, ", .. hm .. ");
  }

  // Adjust punctuation pauses based on pace or metrics
  if (config?.pace === 'slow' || metrics?.pacing === 'calm') {
    processed = processed.replace(/\.\.\./g, "....");
  } else if (config?.pace === 'fast' || metrics?.pacing === 'rapid') {
    processed = processed.replace(/\.\.\./g, ".");
  }

  return processed;
}

export function getVoiceConfigPrompt(config: VoiceConfig): string {
  const toneMap = {
    conversational: "Tone: Balanced, human, and conversational. Sound like a peer.",
    analytical: "Tone: Precise, careful, and evidence-focused. Slightly more formal.",
    calm: "Tone: Reflective, steady, lower energy. Unhurried.",
    direct: "Tone: Efficient, conclusion-first, minimize conversational filler."
  };

  const paceMap = {
    slow: "Pacing: Deliberate and slow. Insert frequent gaps for digestion.",
    normal: "Pacing: Natural human tempo with standard breathing breaks.",
    fast: "Pacing: Brisk and efficient. Minimal pauses between sentences."
  };

  const verbosityMap = {
    brief: "Verbosity: Highly concise. Answer in 1-2 sentences max.",
    balanced: "Verbosity: Standard detail. Provide context but stay on point.",
    detailed: "Verbosity: Comprehensive. Explore nuances and provide deep background.",
  };

  const responseStyleMap = {
    thoughtful: "Response Style: Use thoughtful pauses and occasional hesitations like 'well' or 'hm' to signal processing.",
    straightforward: "Response Style: Clean delivery. Deliver insights immediately without hesitation."
  };

  return `
VOICE CONFIGURATION OVERRIDE:
- ${toneMap[config.tone]}
- ${paceMap[config.pace]}
- ${verbosityMap[config.verbosity]}
- ${responseStyleMap[config.responseStyle]}
- Timbre: ${config.warmth === 'warm' ? 'Deep and resonant' : config.warmth === 'cool' ? 'Crisp and precise' : 'Standard human warmth'}
`;
}

export const CONCIERGE_MODE_OVERRIDE = `
CONCIERGE MODE (CRITICAL):
- Use spoken-first phrasing (linear, no complex structures).
- Do not speak citations unless explicitly asked for a source.
- Reduce facts-per-sentence to ensure clarity.
- Allow natural micro-pauses.
- Prioritize context and continuity over raw data.
`;

export const BACKCHANNEL_CUE_PROMPT = `
BACKCHANNEL CUES:
- Occasionally use subtle verbal cues like "mm," "right," or "okay" during transitions.
- Use these sparingly (max once every 30 seconds) and only when synthesizing or confirming complex user input.
`;

export const NOTEBOOK_LM_VOICE_REQUIREMENTS = `
🎤 CONCIERGE VOICE BEHAVIOR (NOTEBOOK-LM GRADE):
- **Role**: You are a thoughtful research partner, not a digital assistant.
- **Delivery**: Speak as if you are thinking aloud. Use a conversational, podcast-style delivery.
- **Hesitation**: It is acceptable to use occasional "hm" or "well" to signal processing complex thoughts, but do not overuse.
- **Structure**: Break down complex answers into digestible spoken chunks. Never read a list of bullet points.
- **Engagement**: Sound interested in the topic. Your voice should reflect the content (serious for serious topics, lighter for simple ones).
- **No Meta-Talk**: Never say "I am thinking", "Here is the answer", or "As an AI". Just speak the answer.
`;

export const TTS_OPTIMIZATION_PROMPT = `
🎧 TTS OPTIMIZATION OVERLAY:
- **Sentence Length**: Aim for sentences of 8–16 words.
- **Breathing**: End sentences fully before starting the next.
- **Flow**: Avoid choppy, staccato delivery. Link ideas smoothly.
`;

export const MICRO_PAUSE_PATCH = `
🎧 MICRO-PAUSE CALIBRATION:
- Insert subtle pauses (comma-length) through frequent sentence breaks.
- Allow brief gaps before important conclusions.
- Pacing: Measured, human, and thoughtful.
`;

export const WARMTH_CALIBRATION_PATCH = `
🧠 TONE CALIBRATION:
- Maintain emotional neutrality (no hype).
- Use warmth through clarity and grounded delivery.
- Target tone: Calm, professional, adult.
`;

export const CROSS_TALK_RULES_PATCH = `
🎤 CROSS-TALK & INTERACTION RULES:
- If acting as multiple speakers, ensure distinct perspectives.
- Allow for slight overlapping ideas but keep audio clear.
- Debaters should reference each other's points naturally (e.g., "To your point about...", "I see that, but...").
- Maintain a respectful but sharp academic exchange.
`;

export function getVoiceStylePrompt(style: VoiceStyle): string {
  return `VOICE STYLE: ${style}`;
}

export function getSensitivityPrompt(sensitivity: ListeningSensitivity): string {
  const mapping = {
    normal: 'medium',
    reduced: 'low',
    high: 'high'
  };
  return `VAD SENSITIVITY: ${mapping[sensitivity]}`;
}

export function getThinkingSpeedPrompt(speed: ThinkingSpeed): string {
  switch (speed) {
    case 'slow': return "THINKING SPEED: slow (Deliberate, careful)";
    case 'fast': return "THINKING SPEED: fast (Rapid fire, snappy)";
    case 'measured':
    default: return "THINKING SPEED: measured (Balanced, rhythmic)";
  }
}

export function getVoiceCalibrationPrompt(profile: CognitiveProfile | null): string {
  if (!profile) return "";
  
  let behaviorBias = "";
  if (profile.reasoningPriority === 'novelty') {
    behaviorBias = COGNITIVE_BEHAVIOR_BIASES.synthesizer;
  } else if (profile.reasoningPriority === 'skeptical' || profile.reasoningPriority === 'evidence') {
    behaviorBias = COGNITIVE_BEHAVIOR_BIASES.skeptic;
  } else if (profile.reasoningPriority === 'consensus') {
    behaviorBias = COGNITIVE_BEHAVIOR_BIASES.analyst;
  }

  return `
COGNITIVE PROFILE CALIBRATION:
- Reasoning Logic: ${profile.reasoningPriority}
- Uncertainty Tolerance: ${profile.uncertaintyTolerance}
- Domain Expertise: ${profile.domainFocus.join(', ')}

${behaviorBias}
`;
}

export function getOutputModePrompt(mode: 'listening' | 'reading'): string {
  if (mode === 'listening') {
    return `
OUTPUT MODE: LISTENING (Audio First)
- Shorter sentences.
- No lists or bullets.
- Linear explanation only.
- Frequent natural breaks.
`;
  }
  return `
OUTPUT MODE: READING (Text First)
- Structured explanations allowed.
- Light use of bullets for data.
`;
}

export function getConfidenceVoicePrompt(confidence: number): string {
  return `INTEL CONFIDENCE: ${Math.floor(confidence * 100)}%`;
}

export function getVocalPresencePrompt(presence: 'foreground' | 'mid' | 'background'): string {
  return `VOCAL PRESENCE: ${presence}`;
}
