
import { create } from 'zustand';

interface AudioState {
  status: 'idle' | 'synthesizing' | 'playing' | 'paused';
  currentTime: number;
  duration: number;
  activeItemId?: string;
  audioUrl?: string;

  setStatus: (status: 'idle' | 'synthesizing' | 'playing' | 'paused') => void;
  setProgress: (current: number, total: number) => void;
  setAudio: (url: string, itemId: string) => void;
  setActiveItem: (id: string | undefined) => void;
  reset: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  status: 'idle',
  currentTime: 0,
  duration: 0,
  setStatus: (status) => set({ status }),
  setProgress: (currentTime, duration) => set({ currentTime: isNaN(currentTime) ? 0 : currentTime, duration: isNaN(duration) ? 0 : duration }),
  setAudio: (audioUrl, activeItemId) => set({ audioUrl, activeItemId, status: 'playing' }),
  setActiveItem: (activeItemId) => set({ activeItemId }),
  reset: () => set({ status: 'idle', activeItemId: undefined, audioUrl: undefined, currentTime: 0, duration: 0 }),
}));
