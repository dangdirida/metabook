"use client";
import { useBgmStore } from "@/store/bgmStore";
import { getCreationsByBookId } from "@/lib/mock-creations";
import { Play, Pause, Lock, ExternalLink, X, Music } from "lucide-react";
import type { Creation } from "@/types";

interface Props {
  bookId: string;
  onClose: () => void;
}

export default function BgmModal({ bookId, onClose }: Props) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = useBgmStore();

  const allCreations = getCreationsByBookId(bookId);
  const musicTracks = allCreations.filter((c) => c.type === "music");
  const freeTracks = musicTracks.filter((c) => !c.ogqLinked);
  const paidTracks = musicTracks.filter((c) => c.ogqLinked);

  const handlePlay = (track: Creation) => {
    if (!track.audioUrl) return;
    if (currentTrack?.id === track.id) { togglePlay(); } else { setTrack(track); }
  };

  const TrackItem = ({ track }: { track: Creation }) => {
    const isCurrent = currentTrack?.id === track.id;
    const isPaid = track.ogqLinked;

    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isCurrent ? "bg-[var(--color-primary-030)] border border-[var(--color-primary-200)]" : "hover:bg-[var(--color-mono-030)] border border-transparent"}`}>
        <button
          onClick={() => isPaid ? window.open(track.ogqUrl, "_blank") : handlePlay(track)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            isPaid ? "bg-[var(--color-mono-080)] text-[var(--color-mono-400)]"
              : isCurrent ? "bg-[var(--color-primary-500)] text-white"
              : "bg-[var(--color-mono-050)] text-[var(--color-mono-600)] hover:bg-[var(--color-primary-500)] hover:text-white"
          }`}>
          {isPaid ? <Lock className="w-4 h-4" /> : isCurrent && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-medium truncate ${isCurrent ? "text-[var(--color-primary-700)]" : "text-[var(--color-mono-900)]"}`}>{track.title}</p>
          <p className="text-[11px] text-[var(--color-mono-400)] truncate">{track.userName} · {track.description}</p>
        </div>
        {isPaid && track.ogqUrl && (
          <a href={track.ogqUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] transition-colors flex-shrink-0">
            구매 <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl z-10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-mono-080)]">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-[var(--color-primary-500)]" />
            <h2 className="text-[15px] font-bold text-[var(--color-mono-990)]">이 책의 브금</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-mono-050)] text-[var(--color-mono-400)]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
          {freeTracks.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider mb-2 px-1">무료 브금</p>
              <div className="space-y-1">{freeTracks.map((t) => <TrackItem key={t.id} track={t} />)}</div>
            </div>
          )}
          {paidTracks.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider mb-2 px-1">유료 브금</p>
              <div className="space-y-1">{paidTracks.map((t) => <TrackItem key={t.id} track={t} />)}</div>
            </div>
          )}
          {musicTracks.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <Music className="w-12 h-12 text-[var(--color-mono-200)] mb-3" />
              <p className="text-[13px] text-[var(--color-mono-500)]">아직 이 책의 브금이 없어요</p>
              <p className="text-[11px] text-[var(--color-mono-400)] mt-1">첫 번째 브금 창작자가 되어보세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
