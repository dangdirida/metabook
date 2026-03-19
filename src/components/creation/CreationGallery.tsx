"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { BookOpen, Film, Gift, Heart, Sparkles, ChevronUp, GripHorizontal } from "lucide-react";
import { getCreations, toggleHeart, type CreationItem } from "@/lib/creation-store";
import { mockBooks } from "@/lib/mock-data";
import ShortBookModal from "./ShortBookModal";
import ShortMovieModal from "./ShortMovieModal";
import GoodsModal from "./GoodsModal";

const TYPE_CONFIG: Record<string, { label: string; gradient: string; icon: React.ElementType; textColor: string }> = {
  shortbook:  { label: "숏북",  gradient: "from-emerald-400 to-teal-600",   icon: BookOpen, textColor: "text-emerald-700" },
  shortmovie: { label: "숏뮤비", gradient: "from-purple-400 to-violet-600", icon: Film,     textColor: "text-purple-700" },
  goods:      { label: "굿즈",  gradient: "from-orange-400 to-rose-500",    icon: Gift,     textColor: "text-orange-700" },
};

const COLLAPSED_H = 48;   // 헤더만 보이는 높이
const DEFAULT_H   = 48;   // 시작 높이 (닫힘)
const MAX_H       = 520;  // 최대 높이
const MIN_OPEN_H  = 180;  // 열렸을 때 최소 높이

export default function CreationGallery() {
  const { bookId } = useParams();
  const book = mockBooks.find((b) => b.id === bookId);
  const [creations, setCreations] = useState<CreationItem[]>([]);
  const [panelH, setPanelH] = useState(DEFAULT_H);
  const [isOpen, setIsOpen] = useState(false);
  const [openModal, setOpenModal] = useState<{ type: "shortbook" | "shortmovie" | "goods"; item?: CreationItem } | null>(null);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // bookId 바뀌면 닫힘 상태로 리셋
  useEffect(() => {
    setPanelH(DEFAULT_H);
    setIsOpen(false);
  }, [bookId]);

  useEffect(() => {
    setCreations(getCreations(bookId as string));
  }, [bookId]);

  const refreshCreations = () => setCreations(getCreations(bookId as string));

  const handleHeart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleHeart(id);
    refreshCreations();
  };

  // 헤더 클릭 — 토글
  const togglePanel = () => {
    if (isOpen) {
      setPanelH(COLLAPSED_H);
      setIsOpen(false);
    } else {
      setPanelH(MIN_OPEN_H);
      setIsOpen(true);
    }
  };

  // 드래그 핸들 — 위로 드래그할수록 갤러리가 커짐
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startH: panelH };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - ev.clientY; // 위로 드래그 = 양수
      const newH = Math.min(MAX_H, Math.max(COLLAPSED_H, dragRef.current.startH + delta));
      setPanelH(newH);
      setIsOpen(newH > COLLAPSED_H);
    };

    const onUp = () => {
      // 살짝만 열었으면 MIN_OPEN_H로 스냅
      setPanelH(prev => {
        if (prev > COLLAPSED_H && prev < MIN_OPEN_H) return MIN_OPEN_H;
        if (prev <= COLLAPSED_H) { setIsOpen(false); return COLLAPSED_H; }
        return prev;
      });
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [panelH]);

  const ctaButtons = [
    { type: "shortbook"  as const, label: "숏북",   icon: BookOpen, color: "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300" },
    { type: "shortmovie" as const, label: "숏뮤비", icon: Film,     color: "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"   },
    { type: "goods"      as const, label: "굿즈",   icon: Gift,     color: "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"    },
  ];

  return (
    <div
      ref={panelRef}
      className="flex-shrink-0 border-t border-mono-200 bg-white flex flex-col overflow-hidden transition-[height] duration-200 ease-out"
      style={{ height: panelH }}
    >
      {/* 드래그 핸들 + 헤더 */}
      <div
        className="flex-shrink-0 cursor-ns-resize select-none"
        onMouseDown={onMouseDown}
      >
        {/* 그립 바 */}
        <div className="flex justify-center pt-1 pb-0.5">
          <GripHorizontal className="w-4 h-4 text-mono-300" strokeWidth={1.5} />
        </div>

        {/* 헤더 클릭 영역 */}
        <div
          className="flex items-center justify-between px-3 pb-2 cursor-pointer"
          onClick={togglePanel}
          onMouseDown={(e) => e.stopPropagation()} // 헤더 클릭은 드래그 아님
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-mono-800">창작 갤러리</span>
            {creations.length > 0 && (
              <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-medium">
                {creations.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* CTA 버튼들 */}
            {ctaButtons.map((btn) => (
              <button
                key={btn.type}
                onClick={(e) => { e.stopPropagation(); setOpenModal({ type: btn.type }); }}
                className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg border border-mono-200 text-mono-500 transition-all ${btn.color}`}
              >
                <btn.icon className="w-3 h-3" strokeWidth={1.5} />
                {btn.label}
              </button>
            ))}
            <ChevronUp
              className={`w-3.5 h-3.5 text-mono-400 transition-transform duration-200 ${isOpen ? "" : "rotate-180"}`}
              strokeWidth={1.5}
            />
          </div>
        </div>
      </div>

      {/* 갤러리 콘텐츠 */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto px-3 pb-3" style={{ minHeight: 0 }}>
          {creations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="w-8 h-8 text-mono-300 mb-2" strokeWidth={1.5} />
              <p className="text-xs font-semibold text-mono-600 mb-0.5">아직 창작물이 없어요</p>
              <p className="text-[11px] text-mono-400">위 버튼으로 첫 창작물을 만들어보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {creations.map((item) => {
                const cfg = TYPE_CONFIG[item.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => setOpenModal({ type: item.type, item })}
                    className="group cursor-pointer rounded-xl overflow-hidden border border-mono-100 hover:border-mono-300 hover:shadow-md transition-all"
                  >
                    {/* 썸네일 */}
                    <div className="aspect-[3/4] relative overflow-hidden">
                      {item.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${cfg.gradient} flex flex-col items-center justify-center gap-1.5 p-2`}>
                          <Icon className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                          <p className="text-[9px] text-white/90 font-medium text-center line-clamp-3 leading-tight">
                            {item.title}
                          </p>
                        </div>
                      )}
                      {/* 타입 뱃지 */}
                      <span className="absolute top-1.5 left-1.5 text-[8px] font-semibold bg-black/40 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        {cfg.label}
                      </span>
                      {/* 하트 */}
                      <button
                        onClick={(e) => handleHeart(e, item.id)}
                        className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/30 backdrop-blur-sm rounded-full px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className={`w-2.5 h-2.5 ${item.hearted ? "fill-red-400 text-red-400" : "text-white"}`} />
                        <span className="text-[8px] text-white">{item.hearts}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {openModal?.type === "shortbook" && (
        <ShortBookModal
          bookTitle={book?.title || ""}
          bookId={bookId as string}
          onClose={() => setOpenModal(null)}
          onSaved={refreshCreations}
          item={openModal.item}
        />
      )}
      {openModal?.type === "shortmovie" && (
        <ShortMovieModal
          bookTitle={book?.title || ""}
          bookId={bookId as string}
          onClose={() => setOpenModal(null)}
          onSaved={refreshCreations}
          item={openModal.item}
        />
      )}
      {openModal?.type === "goods" && (
        <GoodsModal
          bookTitle={book?.title || ""}
          bookId={bookId as string}
          onClose={() => setOpenModal(null)}
          onSaved={refreshCreations}
          item={openModal.item}
        />
      )}
    </div>
  );
}
