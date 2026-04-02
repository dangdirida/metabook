"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Users, Palette } from "lucide-react";
import LeftPanel from "@/components/panels/LeftPanel";
import CenterPanel from "@/components/panels/CenterPanel";
import RightPanel from "@/components/panels/RightPanel";
import TopTabs from "@/components/ui/TopTabs";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { usePanelStore } from "@/store/panelStore";
import { getBookById } from "@/lib/mock-data";

export default function BookDetailPage() {
  const { bookId } = useParams();
  const { activePanel } = usePanelStore();
  const book = getBookById(bookId as string);

  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    setShowIntro(!localStorage.getItem(`metabook_started_${bookId}`));
  }, [bookId]);

  if (showIntro && book) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-mono-030)] p-8">
        <div className="max-w-lg w-full animate-fade-in-up">
          <div className="flex gap-6 mb-8">
            {book.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.coverImage} alt={book.title} className="w-28 h-40 object-cover rounded-xl shadow-lg flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-[12px] font-medium text-[var(--color-primary-500)] mb-1">{book.publisher}</p>
              <h1 className="text-[22px] font-bold text-[var(--color-mono-990)] mb-2 leading-tight">{book.title}</h1>
              <p className="text-[14px] text-[var(--color-mono-500)] mb-4">{book.author}</p>
              <p className="text-[13px] text-[var(--color-mono-700)] leading-relaxed">{book.description}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[var(--color-mono-080)] mb-4">
            <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider mb-3">대화 가능한 인물</p>
            <div className="flex gap-3 flex-wrap">
              {book.agents.map((agent) => (
                <div key={agent.id} className="flex flex-col items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={agent.avatar || "/avatars/default-profile.svg"} alt={agent.name} className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/default-profile.svg"; }} />
                  <span className="text-[11px] text-[var(--color-mono-600)]">{agent.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mb-8">
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-mono-500)]"><Users className="w-3.5 h-3.5" />커뮤니티 {book.communityMemberCount?.toLocaleString()}명</div>
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-mono-500)]"><Palette className="w-3.5 h-3.5" />창작물 {book.creationCount}개</div>
          </div>
          <button onClick={() => { localStorage.setItem(`metabook_started_${bookId}`, "1"); setShowIntro(false); }}
            className="w-full py-4 rounded-2xl bg-[var(--color-primary-500)] text-white text-[15px] font-bold hover:bg-[var(--color-primary-600)] transition-colors shadow-sm">
            읽기 시작하기
          </button>
          {(() => { try { const p = JSON.parse(localStorage.getItem(`metabook_progress_${bookId}`) || "null"); return p ? (
            <button onClick={() => { localStorage.setItem(`metabook_started_${bookId}`, "1"); setShowIntro(false); }}
              className="w-full mt-2 py-3 rounded-2xl border border-[var(--color-mono-100)] text-[13px] font-medium text-[var(--color-mono-600)] hover:bg-[var(--color-mono-030)] transition-colors">
              {Math.round(p.progress)}% 이어 읽기
            </button>) : null; } catch { return null; } })()}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:contents">
        <ErrorBoundary><LeftPanel /></ErrorBoundary>
        <div className="flex-1 flex flex-col overflow-hidden">
          <ErrorBoundary><TopTabs /></ErrorBoundary>
          <ErrorBoundary><CenterPanel /></ErrorBoundary>
        </div>
        <ErrorBoundary><RightPanel /></ErrorBoundary>
      </div>
      <div className="md:hidden w-full">
        <ErrorBoundary>
          {activePanel === "library" && <LeftPanel />}
          {activePanel === "content" && (<div className="flex flex-col h-full"><TopTabs /><CenterPanel /></div>)}
          {activePanel === "chat" && <RightPanel />}
        </ErrorBoundary>
      </div>
    </>
  );
}
