"use client";
import { useState } from "react";
import Link from "next/link";
import { Music, Play, Pause, Lock, ExternalLink, Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { mockBooks } from "@/lib/mock-data";
import { getCreationsByBookId } from "@/lib/mock-creations";
import { useBgmStore } from "@/store/bgmStore";
import BgmMiniPlayer from "@/components/ui/BgmMiniPlayer";
import type { Creation } from "@/types";

export default function BgmPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { currentTrack, isPlaying, setTrack, togglePlay } = useBgmStore();

  const allMusicTracks = mockBooks.flatMap((book) =>
    getCreationsByBookId(book.id)
      .filter((c) => c.type === "music")
      .map((c) => ({ ...c, bookTitle: book.title, _bookId: book.id }))
  );

  const filtered = searchQuery.trim()
    ? allMusicTracks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allMusicTracks;

  const grouped = filtered.reduce<Record<string, { bookTitle: string; bookId: string; tracks: typeof allMusicTracks }>>((acc, t) => {
    if (!acc[t._bookId]) acc[t._bookId] = { bookTitle: t.bookTitle, bookId: t._bookId, tracks: [] };
    acc[t._bookId].tracks.push(t);
    return acc;
  }, {});

  const handlePlay = (track: Creation) => {
    if (!track.audioUrl) return;
    if (currentTrack?.id === track.id) { togglePlay(); } else { setTrack(track); }
  };

  return (
    <div className="min-h-screen bg-[var(--color-mono-030)] pb-24">
      <div className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[var(--color-mono-050)] transition-colors md:hidden">
              <ArrowLeft className="w-4 h-4 text-[var(--color-mono-600)]" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-030)] flex items-center justify-center">
              <Music className="w-5 h-5 text-[var(--color-primary-500)]" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-[var(--color-mono-990)]">브금 플레이리스트</h1>
              <p className="text-[12px] text-[var(--color-mono-400)]">독자들이 만든 책 속 음악</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-mono-050)] rounded-xl">
            <Search className="w-4 h-4 text-[var(--color-mono-400)] flex-shrink-0" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="곡 제목, 창작자, 책 이름 검색"
              className="flex-1 bg-transparent text-[13px] text-[var(--color-mono-800)] placeholder:text-[var(--color-mono-300)] outline-none" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {Object.values(grouped).map(({ bookTitle, bookId, tracks }) => (
          <div key={bookId} className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-mono-080)]">
              <p className="text-[13px] font-semibold text-[var(--color-mono-800)]">{bookTitle}</p>
              <Link href={`/library/${bookId}`} className="text-[11px] text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] font-medium">
                책 읽으러 가기 →
              </Link>
            </div>
            <div className="p-3 space-y-1">
              {tracks.map((track) => {
                const isCurrent = currentTrack?.id === track.id;
                const isPaid = track.ogqLinked;
                return (
                  <div key={track.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isCurrent ? "bg-[var(--color-primary-030)] border border-[var(--color-primary-200)]" : "hover:bg-[var(--color-mono-030)] border border-transparent"}`}>
                    <button onClick={() => isPaid ? window.open(track.ogqUrl, "_blank") : handlePlay(track)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isPaid ? "bg-[var(--color-mono-080)] text-[var(--color-mono-400)]"
                          : isCurrent ? "bg-[var(--color-primary-500)] text-white"
                          : "bg-[var(--color-mono-050)] text-[var(--color-mono-500)] hover:bg-[var(--color-primary-500)] hover:text-white"
                      }`}>
                      {isPaid ? <Lock className="w-4 h-4" /> : isCurrent && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium truncate ${isCurrent ? "text-[var(--color-primary-700)]" : "text-[var(--color-mono-900)]"}`}>{track.title}</p>
                      <p className="text-[11px] text-[var(--color-mono-400)] truncate">
                        {track.userName}
                        {isPaid && <span className="ml-1.5 text-[var(--color-primary-500)] font-medium">유료</span>}
                        {!isPaid && <span className="ml-1.5 text-[var(--color-mono-400)]">무료</span>}
                      </p>
                    </div>
                    {isPaid && track.ogqUrl && (
                      <a href={track.ogqUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] transition-colors flex-shrink-0">
                        구매 <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Music className="w-16 h-16 text-[var(--color-mono-200)] mb-4" />
            <p className="text-[14px] text-[var(--color-mono-500)]">검색 결과가 없어요</p>
          </div>
        )}
      </div>
      <BgmMiniPlayer />
    </div>
  );
}
