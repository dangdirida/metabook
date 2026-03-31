"use client";
import { useEffect, useRef } from "react";
import { useBgmStore } from "@/store/bgmStore";
import { Play, Pause, X, Volume2, Music } from "lucide-react";

export default function BgmMiniPlayer() {
  const { currentTrack, isPlaying, volume, togglePlay, stop, setVolume } = useBgmStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current || !currentTrack?.audioUrl) return;
    audioRef.current.src = currentTrack.audioUrl;
    audioRef.current.volume = volume;
    audioRef.current.load();
    if (isPlaying) audioRef.current.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.play().catch(() => {}); } else { audioRef.current.pause(); }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-xl border border-[var(--color-mono-080)]" style={{ minWidth: 280 }}>
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-030)] flex items-center justify-center flex-shrink-0">
          <Music className="w-4 h-4 text-[var(--color-primary-500)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[var(--color-mono-900)] truncate">{currentTrack.title}</p>
          <p className="text-[11px] text-[var(--color-mono-400)] truncate">{currentTrack.userName}</p>
        </div>
        <div className="flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5 text-[var(--color-mono-400)]" />
          <input type="range" min={0} max={1} step={0.05} value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-14 accent-[var(--color-primary-500)]" />
        </div>
        <button onClick={togglePlay}
          className="w-9 h-9 rounded-xl bg-[var(--color-primary-500)] flex items-center justify-center text-white hover:bg-[var(--color-primary-600)] transition-colors flex-shrink-0">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button onClick={stop}
          className="p-1.5 rounded-lg text-[var(--color-mono-300)] hover:text-[var(--color-mono-600)] transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
        <audio ref={audioRef} loop />
      </div>
    </div>
  );
}
