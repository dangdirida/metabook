"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, Film, Gift, Heart, Sparkles, ChevronUp } from "lucide-react";
import { getCreations, toggleHeart, type CreationItem } from "@/lib/creation-store";

const TYPE_CONFIG: Record<string, { label: string; gradient: string; icon: React.ElementType; textColor: string }> = {
  shortbook:  { label: "숏북",  gradient: "from-emerald-400 to-teal-600",   icon: BookOpen, textColor: "text-emerald-700" },
  shortmovie: { label: "숏뮤비", gradient: "from-purple-400 to-violet-600", icon: Film,     textColor: "text-purple-700" },
  goods:      { label: "굿즈",  gradient: "from-orange-400 to-rose-500",    icon: Gift,     textColor: "text-orange-700" },
};

const OPEN_HEIGHT = 280;

export default function CreationGallery() {
  const { bookId } = useParams();
  const router = useRouter();
  const [creations, setCreations] = useState<CreationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
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

  const handleCreate = (type: "shortbook" | "shortmovie" | "goods") => {
    router.push(`/creation/${type}?bookId=${bookId}`);
  };

  const ctaButtons = [
    { type: "shortbook"  as const, label: "숏북",   icon: BookOpen, color: "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300" },
    { type: "shortmovie" as const, label: "숏뮤비", icon: Film,     color: "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"   },
    { type: "goods"      as const, label: "굿즈",   icon: Gift,     color: "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"    },
  ];

  return (
    <div className="flex-shrink-0 border-t border-mono-200 bg-white flex flex-col overflow-hidden">
      {/* 헤더 (토글만) */}
      <div
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none hover:bg-mono-050 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
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
          {ctaButtons.map((btn) => (
            <button
              key={btn.type}
              onClick={(e) => { e.stopPropagation(); handleCreate(btn.type); }}
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

      {/* 갤러리 콘텐츠 (고정 높이) */}
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{ maxHeight: isOpen ? OPEN_HEIGHT : 0 }}
      >
        <div className="overflow-y-auto px-3 pb-3" style={{ maxHeight: OPEN_HEIGHT }}>
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
                    className="group cursor-pointer rounded-xl overflow-hidden border border-mono-100 hover:border-mono-300 hover:shadow-md transition-all"
                  >
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
                      <span className="absolute top-1.5 left-1.5 text-[8px] font-semibold bg-black/40 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        {cfg.label}
                      </span>
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
      </div>
    </div>
  );
}
