"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCreations } from "@/lib/creation-store";
import {
  Play, Pause, Volume2, VolumeX, SkipBack,
  Repeat, ChevronDown, ChevronUp, Music, ExternalLink,
} from "lucide-react";

interface BgmTrack {
  id: string;
  title: string;
  url: string;
}

export default function BgmPlayer() {
  const { bookId } = useParams();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [tracks, setTracks] = useState<BgmTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!bookId) return;
    const all = getCreations();
    const musicTracks = all
      .filter((c) => c.bookId === bookId && c.type === "music" && c.content)
      .map((c) => ({ id: c.id, title: c.title, url: c.content }));
    setTracks(musicTracks);
  }, [bookId]);

  const currentTrack = tracks[currentIndex];

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (currentIndex < tracks.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.src = currentTrack.url;
    audioRef.current.load();
    if (isPlaying) audioRef.current.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const t = (Number(e.target.value) / 100) * audioRef.current.duration;
    audioRef.current.currentTime = t;
    setProgress(Number(e.target.value));
  };

  const fmt = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (tracks.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto mb-4 mx-4">
          <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg border border-[var(--color-mono-080)]">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-030)] flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-[var(--color-primary-500)]" />
            </div>
            <p className="text-[13px] text-[var(--color-mono-600)]">이 책에 어울리는 브금을 만들어보세요</p>
            <button onClick={() => router.push(`/creation/music?bookId=${bookId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary-500)] text-white text-[12px] font-semibold hover:bg-[var(--color-primary-600)] transition-colors flex-shrink-0">
              <Music className="w-3.5 h-3.5" />음악 만들기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl shadow-lg border border-[var(--color-mono-080)]">
          <button onClick={togglePlay}
            className="w-8 h-8 rounded-xl bg-[var(--color-primary-500)] flex items-center justify-center text-white hover:bg-[var(--color-primary-600)] transition-colors">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <div className="max-w-[120px]">
            <p className="text-[12px] font-medium text-[var(--color-mono-800)] truncate">{currentTrack?.title}</p>
            <p className="text-[10px] text-[var(--color-mono-400)]">{isPlaying ? "재생 중" : "일시정지"}</p>
          </div>
          <button onClick={() => setIsMinimized(false)} className="p-1 text-[var(--color-mono-400)] hover:text-[var(--color-mono-700)]">
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
        <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} />
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center">
      <div className="w-full max-w-2xl mx-4 mb-4 bg-white rounded-2xl shadow-xl border border-[var(--color-mono-080)] overflow-hidden">
        <div className="relative h-1 bg-[var(--color-mono-080)]">
          <div className="absolute left-0 top-0 h-full bg-[var(--color-primary-500)] transition-all" style={{ width: `${progress}%` }} />
          <input type="range" min={0} max={100} value={progress} onChange={handleSeek} className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
        </div>
        <div className="px-5 py-3.5 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-030)] flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-[var(--color-primary-500)]" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[var(--color-mono-900)] truncate">{currentTrack?.title}</p>
              <p className="text-[11px] text-[var(--color-mono-400)]">{fmt(currentTime)} / {fmt(duration)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsRepeat(!isRepeat)}
              className={`p-1.5 rounded-lg transition-colors ${isRepeat ? "text-[var(--color-primary-500)] bg-[var(--color-primary-030)]" : "text-[var(--color-mono-300)] hover:text-[var(--color-mono-600)]"}`}>
              <Repeat className="w-4 h-4" />
            </button>
            <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = 0; }}
              className="p-1.5 rounded-lg text-[var(--color-mono-400)] hover:text-[var(--color-mono-700)] transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={togglePlay}
              className="w-10 h-10 rounded-xl bg-[var(--color-primary-500)] flex items-center justify-center text-white hover:bg-[var(--color-primary-600)] transition-colors shadow-sm">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg text-[var(--color-mono-400)] hover:text-[var(--color-mono-700)] transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
              className="w-16 accent-[var(--color-primary-500)]" />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => router.push(`/creation/music?bookId=${bookId}`)} title="음악 만들기"
              className="p-1.5 rounded-lg text-[var(--color-mono-300)] hover:text-[var(--color-primary-500)] hover:bg-[var(--color-primary-030)] transition-colors">
              <ExternalLink className="w-4 h-4" />
            </button>
            <button onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-[var(--color-mono-300)] hover:text-[var(--color-mono-600)] transition-colors">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
        <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} />
      </div>
    </div>
  );
}
