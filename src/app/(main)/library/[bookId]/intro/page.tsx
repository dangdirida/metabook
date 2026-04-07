"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Palette } from "lucide-react";
import { getBookById } from "@/lib/mock-data";

export default function BookIntroPage() {
  const { bookId } = useParams();
  const router = useRouter();
  const book = getBookById(bookId as string);

  const [savedProgress, setSavedProgress] = useState<{
    chapterIndex: number;
    progress: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(`metabook_progress_${bookId}`);
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.chapterIndex >= 0) setSavedProgress(p);
      }
    } catch { /* */ }
  }, [bookId]);

  if (!book) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-mono-030)] p-8">
        <p className="text-[var(--color-mono-500)]">책을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const hasProgress = mounted && savedProgress !== null && savedProgress.chapterIndex >= 0;

  const handleStart = () => {
    localStorage.removeItem(`metabook_progress_${bookId}`);
    router.push(`/library/${bookId}?from=intro`);
  };

  const handleContinue = () => {
    if (!savedProgress) return;
    router.push(`/library/${bookId}?chapter=${savedProgress.chapterIndex}&from=intro`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-mono-030)] overflow-auto">
      {/* 상단 바 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-[var(--color-mono-080)] px-4 py-3">
        <button onClick={() => router.push("/library")} className="flex items-center gap-2 text-[13px] text-[var(--color-mono-500)] hover:text-[var(--color-mono-700)] transition-colors">
          <ArrowLeft className="w-4 h-4" />라이브러리
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* 책 정보 */}
          <div className="flex gap-8 mb-10">
            {/* 표지 */}
            {book.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.coverImage} alt={book.title}
                className="w-48 h-auto object-cover rounded-xl shadow-lg flex-shrink-0" />
            )}
            {/* 메타 정보 */}
            <div className="flex-1 py-2">
              <p className="text-[12px] font-medium text-[var(--color-mono-400)] mb-1">{book.publisher}</p>
              <h1 className="text-2xl font-bold text-[var(--color-mono-990)] mb-2 leading-tight">{book.title}</h1>
              <p className="text-[14px] text-[var(--color-mono-500)] mb-4">{book.author}</p>
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-mono-400)]">
                  <Users className="w-3.5 h-3.5" />{book.communityMemberCount?.toLocaleString()}명
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-mono-400)]">
                  <Palette className="w-3.5 h-3.5" />창작물 {book.creationCount}개
                </div>
              </div>
              <p className="text-[14px] text-[var(--color-mono-600)] leading-relaxed">{book.description || "이 책에 대한 소개가 아직 없습니다."}</p>
            </div>
          </div>

          {/* 대화 가능한 인물 */}
          <div className="bg-white rounded-2xl p-5 border border-[var(--color-mono-080)] mb-8">
            <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider mb-4">대화 가능한 인물</p>
            <div className="flex gap-4 flex-wrap">
              {book.agents.map((agent) => (
                <div key={agent.id} className="flex flex-col items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={agent.avatar || "/avatars/default-profile.svg"} alt={agent.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/default-profile.svg"; }} />
                  <span className="text-[11px] text-[var(--color-mono-600)] font-medium">{agent.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="sticky bottom-0 bg-white border-t border-[var(--color-mono-080)] px-6 py-4">
        <div className="max-w-2xl mx-auto">
          {hasProgress ? (
            <div className="flex gap-3">
              <button onClick={handleContinue}
                className="flex-1 py-3 rounded-full bg-[var(--color-primary-500)] text-white text-[14px] font-medium hover:bg-[var(--color-primary-600)] transition-colors">
                이어읽기 · {savedProgress!.chapterIndex + 1}장부터
              </button>
              <button onClick={handleStart}
                className="px-8 py-3 rounded-full border border-[var(--color-mono-300)] text-[var(--color-mono-600)] text-[14px] hover:bg-[var(--color-mono-050)] transition-colors">
                처음부터 읽기
              </button>
            </div>
          ) : (
            <button onClick={() => router.push(`/library/${bookId}?from=intro`)}
              className="w-full py-3 rounded-full bg-[var(--color-primary-500)] text-white text-[14px] font-medium hover:bg-[var(--color-primary-600)] transition-colors">
              읽기 시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
