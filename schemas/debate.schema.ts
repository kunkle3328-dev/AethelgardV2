
export interface DebatePersona {
  id: string;
  role: "optimist" | "skeptic" | "historian" | "expert";
  name: string;
  // Character description/profile for the persona, used in prompting
  persona: string;
  prompt: string;
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
}

export interface DebateTurn {
  personaId: string;
  name: string;
  content: string;
  timestamp: number;
}

export interface Debate {
  id: string;
  topic: string;
  personas: DebatePersona[];
  turns: DebateTurn[];
  transcript: string;
  createdAt: number;
}
