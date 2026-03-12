"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import { mockChapters } from "@/lib/mock-content";
import { usePanelStore } from "@/store/panelStore";

export default function CenterPanel() {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isDark, setIsDark] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [showWorldModal, setShowWorldModal] = useState<string | null>(null);
  const [popover, setPopover] = useState<{
    x: number;
    y: number;
    name: string;
    role: string;
    chapters: string;
  } | null>(null);

  const { setSelectedAgent, setActiveTab } = usePanelStore();
  const chapter = mockChapters[currentChapter];
  const totalChapters = mockChapters.length;

  // localStorage에서 설정 복원
  useEffect(() => {
    const savedFontSize = localStorage.getItem("metabook_fontsize");
    const savedDark = localStorage.getItem("metabook_dark");
    if (savedFontSize) setFontSize(Number(savedFontSize));
    if (savedDark) setIsDark(savedDark === "true");

    // 첫 방문 힌트 (1회만)
    const hintShown = localStorage.getItem("metabook_hint_shown");
    if (!hintShown) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000);
      localStorage.setItem("metabook_hint_shown", "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("metabook_fontsize", String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("metabook_dark", String(isDark));
  }, [isDark]);

  // 스크롤 진행률
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

  // 스크롤 위치 복원
  useEffect(() => {
    const saved = localStorage.getItem(`metabook_scroll_ch${chapter.number}`);
    if (saved && contentRef.current) {
      contentRef.current.scrollTop = Number(saved);
    }
  }, [chapter.number]);

  const saveScrollPosition = () => {
    if (contentRef.current) {
      localStorage.setItem(
        `metabook_scroll_ch${chapter.number}`,
        String(contentRef.current.scrollTop)
      );
    }
  };

  const goToChapter = (dir: number) => {
    saveScrollPosition();
    const next = currentChapter + dir;
    if (next >= 0 && next < totalChapters) {
      setCurrentChapter(next);
      if (contentRef.current) contentRef.current.scrollTop = 0;
    }
  };

  // 인터랙션 C: 텍스트 선택 시 컨텍스트 메뉴
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setContextMenu(null);
      return;
    }
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setContextMenu({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      text: selection.toString(),
    });
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => document.removeEventListener("mouseup", handleTextSelection);
  }, [handleTextSelection]);

  // 인물 클릭 핸들러
  const handleCharacterClick = (
    name: string,
    e: React.MouseEvent<HTMLSpanElement>
  ) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();

    // 팝오버 표시
    setPopover({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
      name,
      role:
        name === "얄리"
          ? "뉴기니 현지 정치인"
          : name === "재레드 다이아몬드"
          ? "저자, 생물지리학자"
          : "등장인물",
      chapters: `제1~${totalChapters}장`,
    });

    // 오른쪽 패널로 Agent 선택
    const agentId = name === "얄리" ? "a2" : "a1";
    setSelectedAgent(agentId);
    setActiveTab("ai");
  };

  // 인물 이름 하이라이트 렌더링
  const renderContent = (text: string) => {
    const characters = chapter.characters;
    if (!characters.length) return text;

    const regex = new RegExp(`(${characters.join("|")})`, "g");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      characters.includes(part) ? (
        <span
          key={i}
          className="text-primary-600 cursor-pointer hover:text-primary-700 hover:underline transition-colors"
          onClick={(e) => handleCharacterClick(part, e)}
        >
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // 컨텍스트 메뉴 액션
  const contextActions = [
    { icon: Highlighter, label: "하이라이트", action: () => setContextMenu(null) },
    { icon: StickyNote, label: "메모", action: () => setContextMenu(null) },
    {
      icon: Palette,
      label: "2차 창작",
      action: () => {
        if (contextMenu) {
          sessionStorage.setItem("creation_source_text", contextMenu.text);
        }
        setContextMenu(null);
      },
    },
    {
      icon: Bot,
      label: "AI에게 질문",
      action: () => {
        setActiveTab("ai");
        setContextMenu(null);
      },
    },
    { icon: Share2, label: "공유", action: () => setContextMenu(null) },
  ];

  return (
    <main
      className={`flex-1 flex flex-col overflow-hidden relative ${
        isDark ? "bg-mono-900 text-mono-200" : "bg-white text-mono-900"
      }`}
      onClick={() => {
        setPopover(null);
        setShowHint(false);
      }}
    >
      {/* 첫 방문 힌트 오버레이 */}
      {showHint && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-mono-900/80 text-white px-6 py-3 rounded-2xl text-sm animate-pulse pointer-events-auto">
            인물 이름을 눌러보세요 👆
          </div>
        </div>
      )}

      {/* 상단 툴바 */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b flex-shrink-0 ${
          isDark ? "border-mono-800" : "border-mono-200"
        }`}
      >
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-mono-500">
              {chapter.number} / {totalChapters}
            </span>
            <span className="text-xs text-mono-400 truncate">
              {chapter.title}
            </span>
          </div>
          <div
            className={`h-1 rounded-full ${isDark ? "bg-mono-800" : "bg-mono-200"}`}
          >
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            className={`p-1.5 rounded-lg ${isDark ? "hover:bg-mono-800" : "hover:bg-mono-100"}`}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xs w-8 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize(Math.min(24, fontSize + 2))}
            className={`p-1.5 rounded-lg ${isDark ? "hover:bg-mono-800" : "hover:bg-mono-100"}`}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-1.5 rounded-lg ml-1 ${isDark ? "hover:bg-mono-800" : "hover:bg-mono-100"}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 본문 콘텐츠 */}
      <div ref={contentRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <h2
            className={`text-2xl font-bold mb-8 ${isDark ? "text-mono-100" : "text-mono-900"}`}
          >
            제{chapter.number}장. {chapter.title}
          </h2>

          <div
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            className="whitespace-pre-wrap"
          >
            {chapter.content.split("\n\n").map((paragraph, i) => (
              <div key={i}>
                <p className="mb-6">{renderContent(paragraph)}</p>
                {/* 삽화 — 인터랙션 B */}
                {i === 0 && chapter.images[0] && (
                  <ImageFigure
                    caption={chapter.images[0].caption}
                    isDark={isDark}
                    onClick={() => setShowWorldModal(chapter.images[0].id)}
                  />
                )}
                {i === 2 && chapter.images[1] && (
                  <ImageFigure
                    caption={chapter.images[1].caption}
                    isDark={isDark}
                    onClick={() => setShowWorldModal(chapter.images[1].id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 이전/다음 챕터 */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-t flex-shrink-0 ${
          isDark ? "border-mono-800" : "border-mono-200"
        }`}
      >
        <button
          onClick={() => goToChapter(-1)}
          disabled={currentChapter === 0}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 ${
            isDark ? "hover:bg-mono-800" : "hover:bg-mono-100"
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> 이전
        </button>
        <span className="text-sm text-mono-500">{Math.round(progress)}% 읽음</span>
        <button
          onClick={() => goToChapter(1)}
          disabled={currentChapter === totalChapters - 1}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 ${
            isDark ? "hover:bg-mono-800" : "hover:bg-mono-100"
          }`}
        >
          다음 <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 인터랙션 C: 텍스트 선택 컨텍스트 메뉴 */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-mono-200 p-1 flex gap-0.5"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {contextActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-mono-50 transition-colors"
              title={action.label}
            >
              <action.icon className="w-4 h-4 text-mono-600" />
              <span className="text-[10px] text-mono-500">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 인물 정보 팝오버 */}
      {popover && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-mono-200 p-4 w-56"
          style={{
            left: `${popover.x}px`,
            top: `${popover.y}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm">
                {popover.name[0]}
              </span>
            </div>
            <div>
              <p className="font-semibold text-mono-900 text-sm">
                {popover.name}
              </p>
              <p className="text-xs text-mono-500">{popover.role}</p>
            </div>
          </div>
          <p className="text-xs text-mono-400">등장: {popover.chapters}</p>
        </div>
      )}

      {/* 인터랙션 B: 월드 확인 모달 */}
      {showWorldModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <Globe className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-mono-900 mb-2">
              책 속 세계로 들어갈까요?
            </h3>
            <p className="text-sm text-mono-500 mb-6">
              삽화 속 공간을 3D로 탐험할 수 있어요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWorldModal(null)}
                className="flex-1 py-3 rounded-xl border border-mono-200 text-mono-700 font-medium hover:bg-mono-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  window.open(
                    `/world/guns-germs-steel/${showWorldModal}`,
                    "_blank"
                  );
                  setShowWorldModal(null);
                }}
                className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600"
              >
                들어가기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ImageFigure({
  caption,
  isDark,
  onClick,
}: {
  caption: string;
  isDark: boolean;
  onClick: () => void;
}) {
  return (
    <figure className="my-8">
      <div
        onClick={onClick}
        className="relative aspect-video bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all"
      >
        <span className={`text-sm ${isDark ? "text-primary-300" : "text-primary-400"}`}>
          {caption}
        </span>
        <div className="absolute bottom-2 right-2">
          <Globe className="w-5 h-5 text-primary-500" />
        </div>
      </div>
      <figcaption
        className={`text-center text-sm mt-2 ${isDark ? "text-mono-500" : "text-mono-400"}`}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
