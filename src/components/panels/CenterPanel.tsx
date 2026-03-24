"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
} from "lucide-react";
import { getChaptersByBookId } from "@/lib/mock-content";
import { getBookById } from "@/lib/mock-data";
import { usePanelStore } from "@/store/panelStore";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/favorites-store";

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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; text: string } | null>(null);
  const [showWorldModal, setShowWorldModal] = useState<{ imageId: string; worldUrl: string } | null>(null);
  const bookWorldUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    book?.images?.forEach(img => { map[img.id] = img.worldUrl || book?.worldUrl || ""; });
    return map;
  }, [book]);
  const [popover, setPopover] = useState<{ x: number; y: number; name: string; role: string; chapters: string } | null>(null);
  const { setSelectedAgent, setActiveTab } = usePanelStore();
  const chapters = getChaptersByBookId(bookId as string);
  const chapter = chapters[currentChapter];
  const totalChapters = chapters.length;

  useEffect(() => {
    const savedFontSize = localStorage.getItem("metabook_fontsize");
    const savedDark = localStorage.getItem("metabook_dark");
    if (savedFontSize) setFontSize(Number(savedFontSize));
    if (savedDark === "true") setIsDark(true);
    if (bookId) setLiked(isFavorite(bookId as string));
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
      document.body.style.background = "#1a1f1c";
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
      setProgress(scrollHeight > 0 ? (el.scrollTop / scrollHeight) * 100 : 0);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [currentChapter]);

  const saveScrollPosition = () => {
    if (contentRef.current) {
      localStorage.setItem(`metabook_scroll_ch${chapter.number}`, String(contentRef.current.scrollTop));
    }
  };

  const goToChapter = (dir: number) => {
    saveScrollPosition();
    const next = currentChapter + dir;
    if (next >= 0 && next < totalChapters) {
      setCurrentChapter(next);
      setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = 0; }, 0);
    }
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
    setPopover({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
      name,
      role:
        name === "얄리" ? "뉴기니 현지 정치인"
        : name === "재레드 다이아몬드" ? "저자, 생물지리학자"
        : "등장인물",
      chapters: `제1~${totalChapters}장`,
    });
    const agentId = name === "얄리" ? "a2" : "a1";
    setSelectedAgent(agentId);
    setActiveTab("ai");
  };

  const renderContent = (text: string) => {
    const characters = chapter.characters;
    if (!characters.length) return text;
    const regex = new RegExp(`(${characters.join("|")})`, "g");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      characters.includes(part) ? (
        <span
          key={i}
          className="text-primary-600 cursor-pointer hover:text-primary-700 hover:underline transition-colors font-medium"
          onClick={(e) => handleCharacterClick(part, e)}
          title={`${part} 정보 보기`}
        >
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const contextActions = [
    { icon: Highlighter, label: "하이라이트", action: () => setContextMenu(null) },
    { icon: StickyNote, label: "메모", action: () => setContextMenu(null) },
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
      className={`flex-1 flex flex-col overflow-hidden relative ${isDark ? "bg-mono-900 text-mono-200" : "bg-white text-mono-900"}`}
      onClick={() => { setPopover(null); setShowHint(false); }}
    >
      {showHint && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-mono-900/80 text-white px-6 py-3 rounded-2xl text-sm animate-pulse pointer-events-auto">
            인물 이름을 눌러보세요 ✨
          </div>
        </div>
      )}

      <div className={`flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0 ${isDark ? "border-mono-800" : "border-mono-200"}`}>
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${isDark ? "bg-mono-800 text-mono-400" : "bg-mono-100 text-mono-500"}`}>
              {chapter.number} / {totalChapters}
            </span>
            <span className={`text-sm font-semibold truncate ${isDark ? "text-mono-200" : "text-mono-800"}`}>
              {chapter.title}
            </span>
          </div>
          <div className={`h-1 rounded-full ${isDark ? "bg-mono-800" : "bg-mono-100"}`}>
            <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg mr-1 ${isDark ? "bg-mono-800" : "bg-mono-50"}`} title="글씨 크기">
            <Type className={`w-3 h-3 mr-0.5 ${isDark ? "text-mono-500" : "text-mono-400"}`} />
            <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${isDark ? "hover:bg-mono-700 text-mono-300" : "hover:bg-mono-200 text-mono-600"}`} title="글씨 크기 줄이기"><Minus className="w-3.5 h-3.5" /></button>
            <span className={`text-xs w-7 text-center font-medium tabular-nums ${isDark ? "text-mono-300" : "text-mono-700"}`}>{fontSize}</span>
            <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${isDark ? "hover:bg-mono-700 text-mono-300" : "hover:bg-mono-200 text-mono-600"}`} title="글씨 크기 키우기"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-mono-800 text-yellow-400" : "hover:bg-mono-100 text-mono-500"}`} title={isDark ? "라이트 모드" : "다크 모드"}>{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
          <button onClick={() => { if (!book) return; if (liked) { removeFavorite(book.id); } else { addFavorite({ bookId: book.id, title: book.title, coverImage: book.coverImage, addedAt: new Date().toISOString() }); } setLiked(!liked); }} className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-mono-800" : "hover:bg-mono-100"}`} title={liked ? "찜 해제" : "찜하기"}><Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-mono-400"}`} /></button>
        </div>
      </div>

      <div ref={contentRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <h2 className={`text-2xl font-bold mb-8 ${isDark ? "text-mono-100" : "text-mono-900"}`}>제{chapter.number}장. {chapter.title}</h2>
          <div style={{ fontSize: `${fontSize}px`, lineHeight: 1.95 }} className="whitespace-pre-wrap">
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

      <div className={`flex items-center justify-between px-4 py-3 border-t flex-shrink-0 ${isDark ? "border-mono-800" : "border-mono-200"}`}>
        <button onClick={() => goToChapter(-1)} disabled={currentChapter === 0} className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentChapter === 0 ? "opacity-20 cursor-not-allowed" : isDark ? "hover:bg-mono-800" : "hover:bg-mono-100"}`}><ChevronLeft className="w-4 h-4" />이전</button>
        <span className={`text-xs font-medium ${isDark ? "text-mono-500" : "text-mono-400"}`}>{Math.round(progress)}% 읽음</span>
        <button onClick={() => goToChapter(1)} disabled={currentChapter === totalChapters - 1} className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentChapter === totalChapters - 1 ? "opacity-20 cursor-not-allowed" : isDark ? "hover:bg-mono-800" : "hover:bg-mono-100"}`}>다음<ChevronRight className="w-4 h-4" /></button>
      </div>

      {contextMenu && (<div className="fixed z-50 bg-white rounded-xl shadow-xl border border-mono-200 p-1 flex gap-0.5" style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px`, transform: "translate(-50%, -100%)" }}>{contextActions.map((action) => (<button key={action.label} onClick={action.action} className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-mono-50 transition-colors" title={action.label}><action.icon className="w-4 h-4 text-mono-600" /><span className="text-[10px] text-mono-500">{action.label}</span></button>))}</div>)}
      {popover && (<div className="fixed z-50 bg-white rounded-xl shadow-xl border border-mono-200 p-4 w-60" style={{ left: `${popover.x}px`, top: `${popover.y}px`, transform: "translateX(-50%)" }}><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center ring-2 ring-primary-200"><span className="text-primary-600 font-bold text-sm">{popover.name[0]}</span></div><div><p className="font-semibold text-mono-900 text-sm">{popover.name}</p><p className="text-xs text-mono-500">{popover.role}</p></div></div><p className="text-xs text-mono-400">등장: {popover.chapters}</p><p className="text-[11px] text-primary-500 mt-2 font-medium">→ 오른쪽 채팅에서 대화해보세요</p></div>)}
      {showWorldModal && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"><Globe className="w-12 h-12 text-primary-500 mx-auto mb-4" /><h3 className="text-lg font-semibold text-mono-900 mb-2">책 속 세계로 들어갈까요?</h3><p className="text-sm text-mono-500 mb-6">삽화 속 공간을 3D로 탐험할 수 있어요.</p><div className="flex gap-3"><button onClick={() => setShowWorldModal(null)} className="flex-1 py-3 rounded-xl border border-mono-200 text-mono-700 font-medium hover:bg-mono-50">취소</button><button onClick={() => { if (showWorldModal?.worldUrl) { window.open(showWorldModal.worldUrl, "_blank", "noopener,noreferrer"); } setShowWorldModal(null); }} className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600">들어가기</button></div></div></div>)}
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
