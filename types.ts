
export interface VaultItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  sourceUrls: { uri: string; title: string }[];
  timestamp: number;
  tags: string[];
  workspaceId: string;
}

export interface AgentMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
}

export interface VaultAnnotation {
  id: string;
  type: 'agent_objection' | 'contradiction' | 'staleness_warning' | 'adversarial_finding' | 'red_team_scout';
  agent: string;
  message: string;
  severity: number; // 0 to 1
  timestamp: number;
  thread?: AgentMessage[];
  sources?: SourceResult[];
}

export interface ResearchThread {
  id: string;
  title: string;
  origin: string; // synthesisId
  status: 'open' | 'resolved';
  createdBy: 'RedTeamScout' | 'user';
  focus: string;
  sources: SourceResult[];
  confidence: number;
  createdAt: number;
}

export interface ScoutMemory {
  interests: string[];
  unresolvedThreads: string[]; // ids
  historicalErrors: { synthesisId: string; hypothesis: string; confirmed: boolean }[];
}

export interface ScoutGoal {
  focus: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ScoutUpdate {
  id: string;
  synthesisId: string;
  title: string;
  hypothesis: string;
  findings: string;
  driftScore: number;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  RESEARCH = 'RESEARCH',
  VAULT = 'VAULT',
  GRAPH = 'GRAPH',
  KITS = 'KITS',
  DEBATE = 'DEBATE',
  AGENTS = 'AGENTS',
  ONBOARDING = 'ONBOARDING',
  PRICING = 'PRICING',
  SETTINGS = 'SETTINGS'
}

export enum ConversationState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  USER_SPEAKING = 'USER_SPEAKING',
  AI_THINKING = 'AI_THINKING',
  AI_SPEAKING = 'AI_SPEAKING',
  INTERRUPTED = 'INTERRUPTED'
}

export interface UserMetrics {
  rms: number;
  duration: number;
  energyLevel: 'whisper' | 'normal' | 'energized';
  pacing: 'calm' | 'neutral' | 'rapid';
  affectIntensity: number; // 0 to 1
}

export interface VocalMemory {
  familiarity: number; // 0 to 1
  emotionalDepth: number; // 0 to 1
  conflictHistory: number; // 0 to 1
  trust: number; // 0 to 1
}

export type ScanMode = 'quick' | 'deep';
export type ResearchMode = 'web' | 'news' | 'academic';
export type FreshnessLevel = 'latest' | 'recent' | 'balanced' | 'historical';
export type DevilMode = 'standard' | 'legal' | 'academic' | 'steelman';

// User-facing Voice Settings
export type VoiceTone = 'conversational' | 'analytical' | 'calm' | 'direct';
export type VoicePace = 'slow' | 'normal' | 'fast';
export type VerbosityLevel = 'brief' | 'balanced' | 'detailed';
export type ResponseStyle = 'thoughtful' | 'straightforward';
export type VoiceWarmth = 'cool' | 'natural' | 'warm';
export type NoiseGateLevel = 'low' | 'medium' | 'high';
export type VoiceProfile = 'calm' | 'direct' | 'curious';

export interface VoiceConfig {
  tone: VoiceTone;
  pace: VoicePace;
  verbosity: VerbosityLevel;
  responseStyle: ResponseStyle;
  warmth: VoiceWarmth;
  noiseGate: NoiseGateLevel;
}

export interface MatrixSettings {
  gpuAcceleration: boolean;
  graphDbV5: boolean;
  nlpOverride: boolean;
}

export interface Agent {
  id: string;
  name: string;
  type: 'Academic' | 'Market' | 'Synthesizer' | 'Advocate' | 'Briefing' | 'Scout';
  status: 'Active' | 'Idle' | 'Scanning';
  frequency: 'manual' | 'daily' | 'weekly';
  lastRun?: number;
  description: string;
  tier: Tier;
}

export type Tier = 'Explorer' | 'Researcher' | 'Strategist' | 'Architect';

export interface DebateParticipant {
  name: string;
  persona: string;
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
}

export interface CognitiveProfile {
  reasoningPriority: 'evidence' | 'consensus' | 'novelty' | 'skeptical';
  uncertaintyTolerance: 'low' | 'medium' | 'high';
  domainFocus: string[];
}

export type ThinkingSpeed = 'slow' | 'measured' | 'fast';
export type VoiceStyle = 'natural' | 'crisp' | 'calm';
export type ListeningSensitivity = 'normal' | 'reduced' | 'high';
export type MicState = 'idle' | 'listening' | 'error';
export type AudioState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface AudioPlaybackState {
  status: 'idle' | 'synthesizing' | 'playing' | 'paused';
  progress: number;
  activeItemId?: string;
}

export interface SourceResult {
  title: string;
  uri: string;
  snippet: string;
  published?: string;
  source: 'web' | 'vault' | 'internal' | 'news' | 'academic';
  score?: number;
  explanation?: string[];
  type?: 'rct' | 'observational' | 'statute' | 'case' | 'independent' | 'vendor';
}

export interface ResearchResult {
  text: string | null;
  sources: SourceResult[];
  mode: 'live' | 'internal' | 'local' | 'cached' | 'raw';
  status: 'optimal' | 'degraded' | 'restricted' | 'offline';
  query: string;
}

export interface KnowledgeSynthesis {
  text: string;
  clusters: any[];
  links: any[];
  temporal: any;
  timestamp: number;
}

export interface DevilsAdvocateReport {
  headline: string;
  keyChallenges: any[];
  counterfactuals: any[];
  debateOutcome: string;
  steelman?: string;
  mode: DevilMode;
  confidenceAdjustment: {
    originalConfidence: number;
    adjustedConfidence: number;
    warning: string | null;
  };
  reviewMetrics?: any;
}
