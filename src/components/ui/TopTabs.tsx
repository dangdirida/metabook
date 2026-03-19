"use client";
import { useState, useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  X,
  BookOpen,
  Film,
  Gift,
  Heart,
  Sparkles,
  ChevronRight,
  ChevronUp,
  RefreshCw,
  Bookmark,
  Smile,
  Image as ImageIcon,
  GripHorizontal,
  Play,
  Plus,
} from "lucide-react";
import { getCreations, toggleHeart, type CreationItem } from "@/lib/creation-store";

const TYPE_CONFIG: Record<string, { label: string; gradient: string; accentColor: string; icon: React.ElementType }> = {
  shortbook: {
    label: "ìë¶",
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    accentColor: "text-emerald-500",
    icon: BookOpen,
  },
  shortmovie: {
    label: "ìë®¤ë¹",
    gradient: "from-violet-500 via-purple-500 to-indigo-600",
    accentColor: "text-violet-500",
    icon: Film,
  },
  goods: {
    label: "êµ¿ì¦",
    gradient: "from-orange-400 via-rose-400 to-pink-500",
    accentColor: "text-orange-500",
    icon: Gift,
  },
};

type ModalType = "shortbook" | "shortmovie" | "goods" | null;

export default function TopTabs() {
  const { bookId } = useParams();
  const router = useRouter();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [creations, setCreations] = useState<CreationItem[]>([]);
  const [galleryHeight, setGalleryHeight] = useState(280);

  useEffect(() => {
    setGalleryOpen(false);
    setCreations(getCreations(bookId as string));
  }, [bookId]);

  const refreshCreations = () => { setCreations(getCreations(bookId as string)); };

  const handleHeart = (id: string) => {
    toggleHeart(id);
    refreshCreations();
  };

  return (
    <div className="bg-white dark:bg-mono-900 border-b border-mono-200 dark:border-mono-800 flex flex-col flex-shrink-0">
      {/* íì´í ë° */}
      <button
        onClick={() => setGalleryOpen(!galleryOpen)}
        className="flex items-center justify-between px-4 py-2.5 w-full hover:bg-gray-50 dark:hover:bg-mono-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-gray-800 dark:text-mono-200">ì°½ì ê°¤ë¬ë¦¬</span>
          {creations.length > 0 && (
            <span className="text-[10px] font-semibold bg-primary-500 text-white px-1.5 py-0.5 rounded-full">
              {creations.length}
            </span>
          )}
        </div>
        <ChevronUp
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${galleryOpen ? "" : "rotate-180"}`}
          strokeWidth={1.5}
        />
      </button>

      {/* ëëê·¸ í¸ë¤ */}
      {galleryOpen && (
        <div
          className="flex justify-center py-1 cursor-ns-resize hover:bg-mono-50 select-none"
          onMouseDown={(e) => {
            e.preventDefault();
            const startY = e.clientY;
            const startH = galleryHeight;
            const onMove = (ev: MouseEvent) => {
              const delta = ev.clientY - startY;
              setGalleryHeight(Math.min(560, Math.max(140, startH + delta)));
            };
            const onUp = () => {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
        >
          <GripHorizontal className="w-4 h-4 text-mono-300" strokeWidth={1.5} />
        </div>
      )}

      {/* ì´ë¦´ ëë§ ë³´ì´ë ì½íì¸  */}
      <div
        className={`overflow-hidden transition-all duration-300 ${galleryOpen ? "" : "max-h-0"}`}
        style={galleryOpen ? { maxHeight: galleryHeight } : undefined}
      >
        {/* CTA ë²í¼ 3ê° */}
        <div className="flex flex-wrap gap-2 justify-start px-4 py-2.5 border-b border-mono-100 dark:border-mono-800">
          {(["shortbook", "shortmovie", "goods"] as const).map((type) => {
            const cfg = TYPE_CONFIG[type];
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => setOpenModal(type)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-mono-200 text-mono-700 hover:bg-mono-50 hover:border-mono-300 dark:bg-[#1e2a1e] dark:border-[#2a3a2a] dark:text-[#c8d5c8] dark:hover:bg-[#2a332a] transition-colors shadow-sm"
              >
                <Icon className={`w-3.5 h-3.5 ${cfg.accentColor}`} strokeWidth={1.5} />
                {cfg.label} ë§ë¤ê¸°
              </button>
            );
          })}
        </div>

        {/* ì°½ìë¬¼ í¼ë */}
        <div className="overflow-y-auto custom-scrollbar p-3" style={{ maxHeight: "calc(100% - 56px)" }}>
          {creations.length === 0 ? (
            /* ë¹ ìí */
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-mono-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7 text-mono-300" strokeWidth={1.5} />
              </div>
              <p className="text-mono-700 font-semibold text-sm">ì²« ì°½ìë¬¼ì ë§ë¤ì´ë³´ì¸ì!</p>
              <p className="text-xs text-mono-400 mt-1 leading-relaxed">
                AIë¡ ìë¶, ë®¤ë¹, êµ¿ì¦ë¥¼<br />ëë± ë§ë¤ ì ìì´ì â¨
              </p>
              <button
                onClick={() => setOpenModal("shortbook")}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                ì§ê¸ ë§ë¤ê¸°
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {creations.map((item) => {
                const cfg = TYPE_CONFIG[item.type];
                const Icon = cfg.icon;
                return (
                  <CreationCard
                    key={item.id}
                    item={item}
                    cfg={cfg}
                    Icon={Icon}
                    onOpen={() => setOpenModal(item.type as ModalType)}
                    onHeart={() => handleHeart(item.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ìê° ëª¨ë¬ */}
      {openModal && (
        <IntroModal
          type={openModal}
          bookId={bookId as string}
          onClose={() => setOpenModal(null)}
          onNavigate={(path) => { setOpenModal(null); router.push(path); }}
        />
      )}
    </div>
  );
}

/* ì°½ìë¬¼ ì¹´ë ì»´í¬ëí¸ */
function CreationCard({
  item,
  cfg,
  Icon,
  onOpen,
  onHeart,
}: {
  item: CreationItem;
  cfg: { label: string; gradient: string; accentColor: string; icon: React.ElementType };
  Icon: React.ElementType;
  onOpen: () => void;
  onHeart: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      className="group cursor-pointer rounded-xl overflow-hidden border border-mono-100 hover:border-mono-200 hover:shadow-lg transition-all duration-200"
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-mono-100">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          /* ì¸ë¤ì¼ ìì ë â ì¸ë ¨ë ê·¸ë¼ëì¸í¸ íë ì´ì¤íë */
          <div className={`w-full h-full bg-gradient-to-br ${cfg.gradient} flex flex-col items-end justify-end p-2`}>
            {/* ë°°ê²½ ë°ì½ */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1 left-1 w-8 h-8 rounded-full bg-white/30" />
              <div className="absolute bottom-3 right-1 w-5 h-5 rounded-full bg-white/20" />
              <div className="absolute top-4 right-2 w-3 h-3 rounded-full bg-white/25" />
            </div>
            {/* ìì´ì½ */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
            </div>
            {/* ì ëª© */}
            <p className="relative text-[9px] text-white/90 font-semibold text-right line-clamp-2 leading-tight z-10">
              {item.title}
            </p>
          </div>
        )}

        {/* íì ë°°ì§ */}
        <span className="absolute top-1.5 left-1.5 text-[8px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
          {cfg.label}
        </span>

        {/* í¸ë² ì¤ë²ë ì´ */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
            <Play className="w-3.5 h-3.5 text-mono-800 ml-0.5" strokeWidth={2} />
          </div>
        </div>

        {/* ì° ë²í¼ */}
        <button
          onClick={(e) => { e.stopPropagation(); onHeart(); }}
          className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart
            className={`w-2.5 h-2.5 ${item.hearted ? "fill-red-400 text-red-400" : "text-white"}`}
          />
          <span className="text-[8px] text-white font-medium">{item.hearts}</span>
        </button>
      </div>
    </div>
  );
}

// ê¸°ë¥ ì¹´ë ìì´ì½ ë§¤í
const FEATURE_ICONS: Record<string, ReactNode> = {
  "ë¤ë¥¸ ìì ì¼ë¡": <RefreshCw className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "ë¤ë¥¸ ê²°ë§ë¡": <Sparkles className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "ì¥ë©´ ììí": <Film className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "ì±ê°í¼": <Bookmark className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "ì¤í°ì»¤": <Smile className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "ì¼ë¬ì¤í¸": <ImageIcon className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
};

function IntroModal({
  type,
  bookId,
  onClose,
  onNavigate,
}: {
  type: "shortbook" | "shortmovie" | "goods";
  bookId: string;
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  const configs = {
    shortbook: {
      title: "ìë¶ ë§ë¤ê¸°",
      emoji: "ð",
      desc: "ì±ì í¹ì  êµ¬ê°ì AIí´ ìì í ìë¡­ê² ì¬ì§íí´ì.\në¤ë¥¸ ì¸ë¬¼ì ìì ì¼ë¡ ë³´ê±°ë, ê²°ë§ì ë°ê¿ë³¼ ì ìì´ì.",
      features: [
        { title: "ë¤ë¥¸ ìì ì¼ë¡", desc: "ì íí ì¸ë¬¼ì ëì¼ë¡ ì´ì¼ê¸°ë¥¼ ë¤ì ì¨ì" },
        { title: "ë¤ë¥¸ ê²°ë§ë¡", desc: "ë´ê° ìíë ë°©í¥ì¼ë¡ ê²°ë§ì ë°ê¿ì" },
      ],
      ctaLabel: "ìë¶ ë§ë¤ë¬ ê°ê¸°",
      ctaClass: "bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)]",
      path: `/creation/shortbook?bookId=${bookId}`,
    },
    shortmovie: {
      title: "ìë®¤ë¹ ë§ë¤ê¸°",
      emoji: "ð¬",
      desc: "ì± ì ì¥ë©´ì AIê° ì¤ì  ìì§ì´ë ììì¼ë¡ ë§ë¤ì´ì¤ì.\nìíë êµ¬ê°ê³¼ ì¸ë¬¼ì ì ííë©´ 5~8ì´ ììì´ ìì±ë¼ì.",
      features: [
        { title: "ì¥ë©´ ììí", desc: "íì¤í¸ ì¥ë©´ì 720p HD ììì¼ë¡ ë³íí´ì" },
      ],
      ctaLabel: "ìë®¤ë¹ ë§ë¤ë¬ ê°ê¸°",
      ctaClass: "bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)]",
      path: `/creation/shortmovie?bookId=${bookId}`,
    },
    goods: {
      title: "êµ¿ì¦ ë§ë¤ê¸°",
      emoji: "ð",
      desc: "ì±ìì ë§ìì ëë êµ¬ì ì´ë ì¥ë©´ì¼ë¡ ëë§ì êµ¿ì¦ë¥¼ ë§ë¤ì´ì.",
      features: [
        { title: "ì±ê°í¼", desc: "ì¢ìíë êµ¬ì ë¡ ëë§ì ì±ê°í¼ë¥¼ ë§ë¤ì´ì" },
        { title: "ì¤í°ì»¤", desc: "ìºë¦­í°/ì¥ë©´ì AI ì¼ë¬ì¤í¸ ì¤í°ì»¤ë¡" },
        { title: "ì¼ë¬ì¤í¸", desc: "ì¥ë©´ì ë¤ìí ì¤íì¼ì ì¼ë¬ì¤í¸ë¡" },
      ],
      ctaLabel: "êµ¿ì¦ ë§ë¤ë¬ ê°ê¸°",
      ctaClass: "hover:opacity-90",
      ctaStyle: { backgroundColor: "#f5a623" } as React.CSSProperties,
      path: `/creation/goods?bookId=${bookId}`,
    },
  };

  const config = configs[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-mono-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.emoji}</span>
            <h2 className="text-lg font-bold text-mono-900">{config.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-mono-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-mono-500" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-mono-600 leading-relaxed whitespace-pre-line">{config.desc}</p>
          <div className="space-y-2.5">
            {config.features.map((feat) => (
              <div key={feat.title} className="flex items-start gap-3 p-3 bg-mono-50 rounded-xl">
                <div className="flex-shrink-0 mt-0.5">{FEATURE_ICONS[feat.title]}</div>
                <div>
                  <p className="font-semibold text-sm text-mono-900">{feat.title}</p>
                  <p className="text-xs text-mono-500 mt-0.5">{feat.desc}</p>
                </div>
               </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate(config.path)}
            className={`w-full py-3 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${config.ctaClass}`}
            style={"ctaStyle" in config ? config.ctaStyle : undefined}
          >
            {config.ctaLabel}
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
