import { create } from "zustand";
import type { Creation } from "@/types";

interface BgmState {
  currentTrack: Creation | null;
  isPlaying: boolean;
  volume: number;
  setTrack: (track: Creation) => void;
  togglePlay: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
}

export const useBgmStore = create<BgmState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  setTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  stop: () => set({ currentTrack: null, isPlaying: false }),
  setVolume: (volume) => set({ volume }),
}));
