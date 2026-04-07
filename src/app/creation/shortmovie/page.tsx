"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Film, Loader2, Download, Share2 } from "lucide-react";
import { mockBooks } from "@/lib/mock-data";
import { getChaptersByBookId } from "@/lib/mock-content";
import { addCreation } from "@/lib/creation-store";

function ShortMovieContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get("bookId") || "";
  const book = mockBooks.find((b) => b.id === bookId);

  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const chapters = getChaptersByBookId(bookId);

  const allCharacters = Array.from(
    new Set(chapters.flatMap((ch) => ch.characters))
  );

  const toggleCharacter = (char: string) => {
    setSelectedCharacters((prev) =>
      prev.includes(char) ? prev.filter((c) => c !== char) : [...prev, char]
    );
  };

  const handleGenerate = async () => {
    const chapter = chapters.find((ch) => ch.number === selectedChapter);
    if (!chapter) return;

    setIsGenerating(true);
    setVideoUrl("");
    setError("");
    setStatusMsg("영상 생성을 요청하고 있어요...");
    setElapsed(0);

    const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);

    try {
      // 1단계: POST → request_id 받기
      const res = await fetch("/api/shortmovie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterText: chapter.content,
          characters: selectedCharacters,
          additionalContext,
          bookTitle: book?.title || "",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "요청에 실패했어요.");
        setIsGenerating(false);
        clearInterval(timer);
        return;
      }

      const { request_id } = data;
      setStatusMsg("영상 생성 대기 중...");

      // 2단계: 5초마다 상태 폴링 (최대 3분)
      let attempts = 0;
      const poll = async () => {
        attempts++;
        if (attempts > 36) {
          setError("영상 생성 시간이 초과됐어요. 다시 시도해주세요.");
          setIsGenerating(false);
          clearInterval(timer);
          return;
        }

        try {
          const statusRes = await fetch(`/api/shortmovie?request_id=${request_id}`);
          const statusData = await statusRes.json();

          if (statusData.status === "COMPLETED" && statusData.videoUrl) {
            setVideoUrl(statusData.videoUrl);
            setIsGenerating(false);
            setStatusMsg("");
            clearInterval(timer);
            return;
          }

          if (statusData.error) {
            setError(statusData.error);
            setIsGenerating(false);
            clearInterval(timer);
            return;
          }

          if (statusData.status === "IN_PROGRESS") {
            setStatusMsg("영상 생성 중...");
          } else {
            setStatusMsg("영상 생성 대기 중...");
          }
        } catch {
          // 폴링 실패는 무시하고 재시도
        }

        setTimeout(poll, 5000);
      };

      setTimeout(poll, 5000);
    } catch (err) {
      setError(`오류: ${String(err)}`);
      setIsGenerating(false);
      clearInterval(timer);
    }
  };

  const handleSave = () => {
    addCreation({
      bookId,
      bookTitle: book?.title || "",
      type: "shortmovie",
      title: `${book?.title} ${selectedChapter}장 숏뮤비`,
      thumbnail: "",
      content: videoUrl,
    });
    router.push(`/library/${bookId}/intro`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-mono-010)]">
      <header className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push(`/library/${bookId}/intro`)}
            className="p-2 rounded-lg hover:bg-[var(--color-mono-050)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--color-mono-700)]" />
          </button>
          <h1 className="text-lg font-bold text-[var(--color-mono-990)]">숏뮤비 만들기</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        {/* 좌측 사이드바 */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-5 sticky top-24">
            <div className="w-full aspect-[3/4] bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
              {book?.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Film className="w-10 h-10 text-purple-300" />
              )}
            </div>
            <h3 className="font-bold text-[var(--color-mono-990)] text-sm">{book?.title}</h3>
            <p className="text-xs text-[var(--color-mono-400)] mt-1">{book?.author}</p>
          </div>
        </aside>

        {/* 우측 메인 */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-6 md:p-8">
            {!isGenerating && !videoUrl && !error && (
              <div className="max-w-lg mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-mono-990)]">장면을 영상으로 만들어보세요</h2>
                  <p className="text-sm text-[var(--color-mono-400)] mt-1">챕터와 인물을 선택하면 AI가 영상으로 변환해요</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">챕터/구간 선택</label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm bg-white"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.number} value={ch.number}>{ch.number}장: {ch.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">등장인물 (선택)</label>
                  <div className="flex flex-wrap gap-3">
                    {allCharacters.map((char) => (
                      <button
                        key={char}
                        onClick={() => toggleCharacter(char)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedCharacters.includes(char)
                            ? "bg-purple-500 text-white shadow-md"
                            : "bg-[var(--color-mono-050)] text-[var(--color-mono-700)] hover:bg-[var(--color-mono-080)]"
                        }`}
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">부가 상황 설명 (선택)</label>
                  <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="예: 밤 장면, 웅장한 분위기"
                    className="w-full px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm resize-none h-24 bg-white"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full py-3.5 bg-purple-500 text-white rounded-xl font-semibold text-base hover:bg-purple-600 transition-colors"
                >
                  영상 만들기
                </button>
              </div>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                </div>
                <p className="text-[var(--color-mono-700)] font-bold text-lg mb-2">
                  {statusMsg || "AI가 영상을 만들고 있어요..."}
                </p>
                <p className="text-sm text-[var(--color-mono-400)]">{elapsed}초 경과 · 보통 30~90초 소요돼요</p>
              </div>
            )}

            {error && (
              <div className="text-center py-16">
                <p className="text-red-500 mb-6 text-lg">{error}</p>
                <button
                  onClick={() => { setError(""); setIsGenerating(false); }}
                  className="px-8 py-3 bg-[var(--color-mono-050)] text-[var(--color-mono-700)] rounded-xl hover:bg-[var(--color-mono-080)] font-medium"
                >
                  다시 시도
                </button>
              </div>
            )}

            {videoUrl && !isGenerating && (
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-xl font-bold text-[var(--color-mono-990)]">영상이 완성되었어요!</h2>
                <video src={videoUrl} controls autoPlay className="w-full rounded-2xl shadow-lg" />
                <div className="flex gap-3">
                  <a
                    href={videoUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--color-mono-050)] text-[var(--color-mono-700)] rounded-xl hover:bg-[var(--color-mono-080)] font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" /> 다운로드
                  </a>
                  <button onClick={() => { const text = `숏뮤비를 만들었어요!`; const url = window.location.origin; if (navigator.share) { navigator.share({ title: "OGQ 숏뮤비", text, url }); } else { navigator.clipboard.writeText(`${text}\n${url}`); } }}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--color-mono-050)] text-[var(--color-mono-700)] rounded-xl font-medium hover:bg-[var(--color-mono-080)] transition-colors">
                    <Share2 className="w-4 h-4" />공유
                  </button>
                  <button onClick={handleSave}
                    className="flex-1 py-3.5 bg-[var(--color-primary-500)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-600)] transition-colors">
                    갤러리에 저장
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ShortMoviePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}>
      <ShortMovieContent />
    </Suspense>
  );
}
