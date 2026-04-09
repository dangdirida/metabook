"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Music, Play, Pause, Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBgmStore } from "@/store/bgmStore";
import BgmMiniPlayer from "@/components/ui/BgmMiniPlayer";

interface MusicTrack {
  id: string; title: string; audioUrl?: string; imageUrl?: string;
  bookId?: string; bookTitle?: string; userName?: string; type?: string;
}

export default function BgmPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { currentTrack, isPlaying, setTrack, togglePlay } = useBgmStore();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creations?limit=100")
      .then((r) => r.json())
      .then((d) => {
        const music: MusicTrack[] = (d.items || []).filter((i: MusicTrack) => i.type === "music" && i.audioUrl);
        setTracks(music);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allMusicTracks = tracks;

  const filtered = searchQuery.trim()
    ? allMusicTracks.filter((t) =>
        (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.bookTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allMusicTracks;

  const grouped = filtered.reduce<Record<string, { bookTitle: string; bookId: string; tracks: MusicTrack[] }>>((acc, t) => {
    const bId = t.bookId || "etc";
    const bTitle = t.bookTitle || "기타";
    if (!acc[bId]) acc[bId] = { bookTitle: bTitle, bookId: bId, tracks: [] };
    acc[bId].tracks.push(t);
    return acc;
  }, {});

  const handlePlay = (track: MusicTrack) => {
    if (!track.audioUrl) return;
    if (currentTrack?.id === track.id) { togglePlay(); } else { setTrack(track as never); }
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
              <Link href={`/library/${bookId}/intro`} className="text-[11px] text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] font-medium">
                책 읽으러 가기 →
              </Link>
            </div>
            <div className="p-3 space-y-1">
              {tracks.map((track) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div key={track.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isCurrent ? "bg-[var(--color-primary-030)] border border-[var(--color-primary-200)]" : "hover:bg-[var(--color-mono-030)] border border-transparent"}`}>
                    <button onClick={() => handlePlay(track)}
                      disabled={!track.audioUrl}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        !track.audioUrl ? "bg-[var(--color-mono-080)] text-[var(--color-mono-300)]"
                          : isCurrent ? "bg-[var(--color-primary-500)] text-white"
                          : "bg-[var(--color-mono-050)] text-[var(--color-mono-500)] hover:bg-[var(--color-primary-500)] hover:text-white"
                      }`}>
                      {isCurrent && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium truncate ${isCurrent ? "text-[var(--color-primary-700)]" : "text-[var(--color-mono-900)]"}`}>{track.title}</p>
                      <p className="text-[11px] text-[var(--color-mono-400)] truncate">{track.userName || "독자"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="text-[13px] text-[var(--color-mono-400)]">불러오는 중...</p>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-030)] flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-[var(--color-primary-300)]" />
            </div>
            <p className="text-[15px] font-bold text-[var(--color-mono-700)] mb-2">{searchQuery ? "검색 결과가 없어요" : "아직 음악이 없어요"}</p>
            <p className="text-[13px] text-[var(--color-mono-400)] mb-6">{searchQuery ? "다른 키워드로 검색해보세요" : "음악 만들기로 첫 트랙을 만들어보세요!"}</p>
            <button onClick={() => router.push("/creation/music")} className="px-5 py-2.5 rounded-2xl bg-[var(--color-primary-500)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-600)] transition-colors">브금 만들기</button>
          </div>
        )}
      </div>
      <BgmMiniPlayer />
    </div>
  );
}
