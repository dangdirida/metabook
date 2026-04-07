"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Minus,
  Plus,
  Globe,
  Highlighter,
  StickyNote,
  Palette,
  Bot,
  Share2,
  Heart,
  Type,
  Music,
  MessageCircle,
  X,
} from "lucide-react";
import { getChaptersByBookId } from "@/lib/mock-content";
import { getBookById } from "@/lib/mock-data";
import { usePanelStore } from "@/store/panelStore";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/favorites-store";
import { addNote } from "@/lib/notes-store";
import { addHighlight, getHighlights, removeHighlight } from "@/lib/highlight-store";
import type { Highlight } from "@/lib/highlight-store";
import BgmModal from "@/components/ui/BgmModal";
import BgmMiniPlayer from "@/components/ui/BgmMiniPlayer";

export default function CenterPanel() {
  const { bookId } = useParams();
  const book = getBookById(bookId as string);
  const bookImageMap = useMemo(() => {
    const map: Record<string, string> = {};
    book?.images?.forEach(img => { map[img.id] = img.url; });
    return map;
  }, [book]);

  const [currentChapter, setCurrentChapter] = useState(0);
  const [fontSize, setFontSize] = useState(17);
  const [isDark, setIsDark] = useState(false);
  const [liked, setLiked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showBgmModal, setShowBgmModal] = useState(false);
  const [showNoteToast, setShowNoteToast] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeTouchX, setSwipeTouchX] = useState(0);
  const [swipeDragX, setSwipeDragX] = useState(0);
  const [swipeDragging, setSwipeDragging] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightPickerPos, setHighlightPickerPos] = useState<{ x: number; y: number } | null>(null);
  const [pendingText, setPendingText] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; text: string } | null>(null);
  const [showWorldModal, setShowWorldModal] = useState<{ imageId: string; worldUrl: string } | null>(null);
  const worldUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    book?.images?.forEach(img => { map[img.id] = img.worldUrl || book?.worldUrl || ""; });
    return map;
  }, [book]);
  const [popover, setPopover] = useState<{ x: number; y: number; name: string; role: string; chapters: string } | null>(null);
  const { setSelectedAgent, setActiveTab } = usePanelStore();
  const chapters = getChaptersByBookId(bookId as string);
  const safeChapterIdx = Math.min(currentChapter, Math.max(0, chapters.length - 1));
  const chapter = chapters[safeChapterIdx] || { id: "", number: 1, title: "", content: "", images: [], characters: [] };
  const totalChapters = chapters.length;

  useEffect(() => {
    const savedFontSize = localStorage.getItem("metabook_fontsize");
    const savedDark = localStorage.getItem("metabook_dark");
    if (savedFontSize) setFontSize(Number(savedFontSize));
    if (savedDark === "true") setIsDark(true);
    if (bookId) setLiked(isFavorite(bookId as string));
    setHighlights(getHighlights(bookId as string));
    const savedProgress = localStorage.getItem(`metabook_progress_${bookId}`);
    if (savedProgress) { try { const { chapterIndex } = JSON.parse(savedProgress); if (chapterIndex > 0) setCurrentChapter(chapterIndex); } catch { /* ignore */ } }
    const hintShown = localStorage.getItem("metabook_hint_shown");
    if (!hintShown) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000);
      localStorage.setItem("metabook_hint_shown", "true");
    }
  }, [bookId]);

  useEffect(() => { localStorage.setItem("metabook_fontsize", String(fontSize)); }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("metabook_dark", String(isDark));
    if (isDark) {
      document.documentElement.classList.add("dark-mode");
      document.body.style.background = "#1c1917";
    } else {
      document.documentElement.classList.remove("dark-mode");
      document.body.style.background = "";
    }
  }, [isDark]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const p = scrollHeight > 0 ? (el.scrollTop / scrollHeight) * 100 : 0;
      setProgress(p);
      localStorage.setItem(`metabook_progress_${bookId}`, JSON.stringify({ chapterIndex: currentChapter, progress: p, updatedAt: new Date().toISOString() }));
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [currentChapter]);

  // 스와이프 슬라이드 애니메이션 초기화
  useEffect(() => {
    if (slideDir) {
      const t = setTimeout(() => setSlideDir(null), 300);
      return () => clearTimeout(t);
    }
  }, [slideDir]);

  const saveScrollPosition = () => {
    if (contentRef.current) {
      localStorage.setItem(`metabook_scroll_ch${chapter.number}`, String(contentRef.current.scrollTop));
    }
  };

  const goToChapter = (dir: number) => {
    const next = currentChapter + dir;
    if (next < 0 || next >= totalChapters) return;
    setIsTransitioning(true);
    saveScrollPosition();
    setTimeout(() => {
      setCurrentChapter(next);
      localStorage.setItem(`metabook_progress_${bookId}`, JSON.stringify({ chapterIndex: next, progress: 0, updatedAt: new Date().toISOString() }));
      setTimeout(() => {
        if (contentRef.current) {
          const nextChNum = chapters[next]?.number;
          const savedPos = nextChNum ? localStorage.getItem(`metabook_scroll_ch${nextChNum}`) : null;
          contentRef.current.scrollTop = savedPos ? Number(savedPos) : 0;
        }
        setIsTransitioning(false);
      }, 50);
    }, 200);
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setContextMenu(null);
      return;
    }
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setContextMenu({ x: rect.left + rect.width / 2, y: rect.top - 10, text: selection.toString() });
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => document.removeEventListener("mouseup", handleTextSelection);
  }, [handleTextSelection]);

  const handleCharacterClick = (name: string, e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const agent = book?.agents?.find((a) => a.name === name);
    setPopover({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
      name,
      role: agent?.role || "등장인물",
      chapters: `제1~${totalChapters}장`,
    });
    if (agent) {
      setSelectedAgent(agent.id);
      setActiveTab("ai");
    }
  };

  const renderContent = (text: string): React.ReactNode => {
    const characters = chapter.characters;
    const chapterHighlights = highlights.filter((h) => h.chapterNumber === chapter.number);
    const colorMap: Record<string, string> = { yellow: "#FEF08A", green: "#BBF7D0", pink: "#FBCFE8", blue: "#BFDBFE" };

    // Split text by highlights
    const splitByHL = (str: string): { text: string; hl?: Highlight }[] => {
      if (!chapterHighlights.length) return [{ text: str }];
      let segs: { text: string; hl?: Highlight }[] = [{ text: str }];
      for (const h of chapterHighlights) {
        const next: { text: string; hl?: Highlight }[] = [];
        for (const seg of segs) {
          if (seg.hl) { next.push(seg); continue; }
          const idx = seg.text.indexOf(h.text);
          if (idx === -1) { next.push(seg); continue; }
          if (idx > 0) next.push({ text: seg.text.slice(0, idx) });
          next.push({ text: h.text, hl: h });
          const after = seg.text.slice(idx + h.text.length);
          if (after) next.push({ text: after });
        }
        segs = next;
      }
      return segs;
    };

    const renderCharacters = (str: string, keyPrefix: string): React.ReactNode => {
      if (!characters.length) return str;
      const regex = new RegExp(`(${characters.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
      const parts = str.split(regex);
      return parts.map((part, pi) =>
        characters.includes(part) ? (
          <span key={`${keyPrefix}-c${pi}`} className="text-[var(--color-primary-600)] font-medium cursor-pointer hover:text-[var(--color-primary-700)] hover:underline transition-colors"
            onClick={(e) => handleCharacterClick(part, e)} title={`${part} 정보 보기`}>{part}</span>
        ) : <span key={`${keyPrefix}-c${pi}`}>{part}</span>
      );
    };

    const segs = splitByHL(text);
    return segs.map((seg, si) => {
      if (seg.hl) {
        return (
          <mark key={`hl-${seg.hl.id}-${si}`} style={{ backgroundColor: colorMap[seg.hl.color] || "#FEF08A", borderRadius: "3px", padding: "1px 2px", cursor: "pointer" }}
            title="클릭하면 삭제" onClick={(e) => { e.stopPropagation(); removeHighlight(seg.hl!.id); setHighlights(getHighlights(bookId as string)); }}>
            {renderCharacters(seg.text, `hl${si}`)}
          </mark>
        );
      }
      return <span key={`s${si}`}>{renderCharacters(seg.text, `s${si}`)}</span>;
    });
  };

  const contextActions = [
    { icon: Highlighter, label: "하이라이트", action: () => { if (!contextMenu) return; setPendingText(contextMenu.text); setHighlightPickerPos({ x: contextMenu.x, y: contextMenu.y }); setContextMenu(null); } },
    { icon: StickyNote, label: "메모", action: () => { if (contextMenu) { addNote({ bookId: bookId as string, bookTitle: book?.title || "", chapterTitle: chapter.title, text: contextMenu.text, memo: "" }); setContextMenu(null); setShowNoteToast(true); setTimeout(() => setShowNoteToast(false), 2000); } } },
    {
      icon: Palette,
      label: "2차 창작",
      action: () => {
        if (contextMenu) { sessionStorage.setItem("creation_source_text", contextMenu.text); }
        setContextMenu(null);
      },
    },
    { icon: Bot, label: "AI에게 질문", action: () => { setActiveTab("ai"); setContextMenu(null); } },
    { icon: Share2, label: "공유", action: () => setContextMenu(null) },
  ];

  return (
    <main
      className={`flex-1 flex flex-col overflow-hidden relative ${isDark ? "bg-[#1c1917] text-[#e7e5e4]" : "bg-white text-[var(--color-mono-900)]"}`}
      onClick={() => { setPopover(null); setShowHint(false); setHighlightPickerPos(null); setPendingText(""); }}
    >
      {showHint && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-mono-900/80 text-white px-6 py-3 rounded-2xl text-sm animate-pulse pointer-events-auto">
            인물 이름을 눌러보세요
          </div>
        </div>
      )}

      {/* 상단 챕터 바 */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0 ${isDark ? "border-mono-800 bg-mono-900" : "border-[var(--color-mono-080)] bg-white"}`}>
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${isDark ? "bg-mono-800 text-mono-400" : "bg-[var(--color-mono-050)] text-[var(--color-mono-500)]"}`}>
              {chapter.number} / {totalChapters}
            </span>
            {currentChapter === 0 && book?.section && <span className={`text-[11px] ${isDark ? "text-mono-500" : "text-[var(--color-mono-400)]"}`}>{book.section}</span>}
            <span className={`text-[13px] font-medium truncate ${isDark ? "text-mono-300" : "text-[var(--color-mono-700)]"}`}>
              {chapter.title}
            </span>
          </div>
          <div className={`h-1 rounded-full ${isDark ? "bg-mono-800" : "bg-[var(--color-mono-080)]"}`}>
            <div className="h-full bg-[var(--color-primary-500)] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg mr-1 ${isDark ? "bg-mono-800" : "bg-[var(--color-mono-050)]"}`} title="글씨 크기">
            <Type className={`w-3 h-3 mr-0.5 ${isDark ? "text-mono-500" : "text-[var(--color-mono-400)]"}`} />
            <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-mono-700 text-mono-300" : "hover:bg-[var(--color-mono-050)] text-[var(--color-mono-600)]"}`} title="글씨 크기 줄이기"><Minus className="w-3.5 h-3.5" /></button>
            <span className={`text-[13px] w-7 text-center font-medium tabular-nums ${isDark ? "text-mono-300" : "text-[var(--color-mono-700)]"}`}>{fontSize}</span>
            <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-mono-700 text-mono-300" : "hover:bg-[var(--color-mono-050)] text-[var(--color-mono-600)]"}`} title="글씨 크기 키우기"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <button onClick={(ev) => { ev.stopPropagation(); setShowBgmModal(true); }} className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-mono-800 text-mono-400" : "hover:bg-[var(--color-mono-050)] text-mono-500"}`} title="브금 선택"><Music className="w-4 h-4" /></button>
          <button onClick={() => setIsDark(!isDark)} className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-mono-800 text-yellow-400" : "hover:bg-[var(--color-mono-050)] text-mono-500"}`} title={isDark ? "라이트 모드" : "다크 모드"}>{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
          <button onClick={() => { if (!book) return; if (liked) { removeFavorite(book.id); } else { addFavorite({ bookId: book.id, title: book.title, coverImage: book.coverImage, addedAt: new Date().toISOString() }); } setLiked(!liked); }} className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-mono-800" : "hover:bg-[var(--color-mono-050)]"}`} title={liked ? "찜 해제" : "찜하기"}><Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-mono-400"}`} /></button>
        </div>
      </div>

      {/* 본문 영역 — 좌우 스와이프로 챕터 이동 */}
      <div ref={contentRef}
        className={`flex-1 overflow-y-auto custom-scrollbar ${slideDir === "left" ? "animate-slide-in-left" : slideDir === "right" ? "animate-slide-in-right" : ""} ${isTransitioning ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
        onTouchStart={(e) => setSwipeTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => { const delta = swipeTouchX - e.changedTouches[0].clientX; if (Math.abs(delta) > 80) { if (delta > 0) { setSlideDir("left"); goToChapter(1); } else { setSlideDir("right"); goToChapter(-1); } } }}
        onMouseDown={(e) => { if (e.button !== 0) return; setSwipeDragX(e.clientX); setSwipeDragging(true); }}
        onMouseUp={(e) => { if (!swipeDragging) return; setSwipeDragging(false); const delta = swipeDragX - e.clientX; if (Math.abs(delta) > 80) { if (delta > 0) { setSlideDir("left"); goToChapter(1); } else { setSlideDir("right"); goToChapter(-1); } } }}
        onMouseLeave={() => setSwipeDragging(false)}>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-6">
            {currentChapter === 0 && book?.section && <p className={`text-[11px] font-light tracking-[0.25em] mb-1 ${isDark ? "text-mono-500" : "text-[var(--color-mono-400)]"}`}>{book.section}</p>}
            <p className={`text-[14px] font-normal ${isDark ? "text-mono-300" : "text-[var(--color-mono-600)]"}`}>{chapter.title}</p>
          </div>
          <div style={{ fontSize: `${fontSize}px`, lineHeight: 1.95 }} className={`whitespace-pre-wrap ${isDark ? "" : "text-[var(--color-mono-800)]"}`}>
            {chapter.content.split("\n\n").map((paragraph, i) => (
              <div key={i}>
                <p className="mb-7">{renderContent(paragraph)}</p>
                {i === 0 && chapter.images[0] && (<ImageFigure caption={chapter.images[0].caption} url={bookImageMap[chapter.images[0].id]} isDark={isDark} onClick={() => setShowWorldModal({ imageId: chapter.images[0].id, worldUrl: worldUrlMap[chapter.images[0].id] })} />)}
                {i === 2 && chapter.images[1] && (<ImageFigure caption={chapter.images[1].caption} url={bookImageMap[chapter.images[1].id]} isDark={isDark} onClick={() => setShowWorldModal({ imageId: chapter.images[1].id, worldUrl: worldUrlMap[chapter.images[1].id] })} />)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 이전/다음 버튼 */}
      <div className={`flex items-center justify-between px-4 py-3 border-t flex-shrink-0 ${isDark ? "border-mono-800 bg-mono-900" : "border-[var(--color-mono-080)] bg-white"}`}>
        <button onClick={() => goToChapter(-1)} disabled={currentChapter === 0} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors ${currentChapter === 0 ? "opacity-30 cursor-not-allowed" : isDark ? "hover:bg-mono-800 text-mono-300" : "text-[var(--color-mono-700)] hover:bg-[var(--color-mono-050)]"}`}><ChevronLeft className="w-4 h-4" />이전</button>
        <span className={`text-[12px] font-medium ${isDark ? "text-mono-500" : "text-[var(--color-mono-400)]"}`}>{Math.round(progress)}% 읽음</span>
        <button onClick={() => goToChapter(1)} disabled={currentChapter === totalChapters - 1} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors ${currentChapter === totalChapters - 1 ? "opacity-30 cursor-not-allowed" : isDark ? "hover:bg-mono-800 text-mono-300" : "text-[var(--color-mono-700)] hover:bg-[var(--color-mono-050)]"}`}>다음<ChevronRight className="w-4 h-4" /></button>
      </div>

      {contextMenu && (<div className="fixed z-50 bg-white rounded-xl shadow-xl border border-mono-200 p-1 flex gap-0.5" style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px`, transform: "translate(-50%, -100%)" }}>{contextActions.map((action) => (<button key={action.label} onClick={action.action} className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-mono-50 transition-colors" title={action.label}><action.icon className="w-4 h-4 text-mono-600" /><span className="text-[10px] text-mono-500">{action.label}</span></button>))}</div>)}
      {highlightPickerPos && (
        <div className="fixed z-[60] bg-white rounded-2xl shadow-2xl border border-[var(--color-mono-080)] px-3 py-2.5 flex items-center gap-2"
          style={{ left: highlightPickerPos.x, top: highlightPickerPos.y, transform: "translate(-50%, -120%)" }}
          onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] text-[var(--color-mono-500)] mr-0.5 whitespace-nowrap">색상</span>
          {[{ id: "yellow" as const, bg: "#FEF08A" }, { id: "green" as const, bg: "#BBF7D0" }, { id: "pink" as const, bg: "#FBCFE8" }, { id: "blue" as const, bg: "#BFDBFE" }].map((c) => (
            <button key={c.id} style={{ backgroundColor: c.bg }} className="w-7 h-7 rounded-full border-2 border-white shadow hover:scale-125 transition-transform"
              onClick={() => { if (!pendingText) return; const h = addHighlight({ bookId: bookId as string, chapterNumber: chapter.number, text: pendingText, color: c.id }); setHighlights((prev) => [...prev, h]); setHighlightPickerPos(null); setPendingText(""); }} />
          ))}
          <button onClick={() => { setHighlightPickerPos(null); setPendingText(""); }} className="ml-1 p-1 rounded-lg text-[var(--color-mono-400)] hover:text-[var(--color-mono-700)] hover:bg-[var(--color-mono-050)]"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {popover && (<div className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-[var(--color-mono-080)] w-64 overflow-hidden" style={{ left: `${popover.x}px`, top: `${popover.y}px`, transform: "translateX(-50%)" }}>
        <div className="flex items-center gap-3 p-4 border-b border-[var(--color-mono-080)]">
          {(() => { const ag = book?.agents?.find(a => a.name === popover.name); return <img src={ag?.avatar || "/avatars/default-profile.svg"} alt={popover.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-[var(--color-primary-100)]" onError={(ev) => { (ev.target as HTMLImageElement).src = "/avatars/default-profile.svg"; }} />; })()}
          <div className="min-w-0"><p className="text-[15px] font-bold text-[var(--color-mono-990)] truncate">{popover.name}</p><p className="text-[11px] text-[var(--color-mono-400)] truncate">{popover.role}</p></div>
        </div>
        {(() => { const ag = book?.agents?.find(a => a.name === popover.name); return ag?.personality?.length ? (<div className="px-4 py-2.5 border-b border-[var(--color-mono-080)]"><div className="flex flex-wrap gap-1">{ag.personality.map(t => <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-primary-030)] text-[var(--color-primary-700)]">{t}</span>)}</div></div>) : null; })()}
        <div className="p-3"><button onClick={() => { const ag = book?.agents?.find(a => a.name === popover.name); if (ag) { setSelectedAgent(ag.id); setActiveTab("ai"); } setPopover(null); }} className="w-full py-2.5 rounded-xl bg-[var(--color-primary-500)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-600)] transition-colors flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" />채팅하기</button></div>
      </div>)}
      {showWorldModal && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"><Globe className="w-12 h-12 text-primary-500 mx-auto mb-4" /><h3 className="text-lg font-semibold text-mono-900 mb-2">책 속 세계로 들어갈까요?</h3><p className="text-sm text-mono-500 mb-6">삽화 속 공간을 3D로 탐험할 수 있어요.</p><div className="flex gap-3"><button onClick={() => setShowWorldModal(null)} className="flex-1 py-3 rounded-xl border border-mono-200 text-mono-700 font-medium hover:bg-mono-50">취소</button><button onClick={() => { if (showWorldModal?.worldUrl) { window.open(showWorldModal.worldUrl, "_blank", "noopener,noreferrer"); } setShowWorldModal(null); }} className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600">들어가기</button></div></div></div>)}
      <BgmMiniPlayer />
      {showBgmModal && <BgmModal bookId={bookId as string} onClose={() => setShowBgmModal(false)} />}
      {showNoteToast && (<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-mono-900)] text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"><StickyNote className="w-4 h-4 text-[var(--color-primary-400)]" />노트에 저장됐어요</div>)}
    </main>
  );
}

function ImageFigure({ caption, url, isDark, onClick }: { caption: string; url?: string; isDark: boolean; onClick: () => void }) {
  return (
    <figure className="my-8">
      <div onClick={onClick} className="relative aspect-video rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all group">
        {url ? (<img src={url} alt={caption} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />) : (<div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center"><span className={`text-sm ${isDark ? "text-primary-300" : "text-primary-400"}`}>{caption}</span></div>)}
        {caption && (<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3"><span className="text-white text-xs font-medium">{caption}</span></div>)}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"><Globe className="w-3.5 h-3.5 text-white" /><span className="text-white text-[10px] font-medium">3D 탐험</span></div>
      </div>
    </figure>
  );
}
