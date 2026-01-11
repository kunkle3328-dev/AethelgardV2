
import { create } from 'zustand';
import { AudioPlaybackState } from '../types';

interface AudioStore extends AudioPlaybackState {
  setStatus: (status: AudioPlaybackState['status']) => void;
  setActiveItem: (id: string | undefined) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  status: 'idle',
  progress: 0,
  setStatus: (status) => set({ status }),
  setActiveItem: (activeItemId) => set({ activeItemId }),
  setProgress: (progress) => set({ progress }),
  reset: () => set({ status: 'idle', activeItemId: undefined, progress: 0 }),
}));
