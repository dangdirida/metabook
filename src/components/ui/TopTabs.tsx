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
} from "lucide-react";
import { getCreations, toggleHeart, type CreationItem } from "@/lib/creation-store";

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  shortbook: { label: "숏북", color: "bg-emerald-100 text-emerald-700" },
  shortmovie: { label: "숏뮤비", color: "bg-purple-100 text-purple-700" },
  goods: { label: "굿즈", color: "bg-orange-100 text-orange-700" },
};

type ModalType = "shortbook" | "shortmovie" | "goods" | null;

export default function TopTabs() {
  const { bookId } = useParams();
  const router = useRouter();
  const [galleryOpen, setGalleryOpen] = useState(true);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [creations, setCreations] = useState<CreationItem[]>([]);

  useEffect(() => {
    setCreations(getCreations(bookId as string));
  }, [bookId]);

  const refreshCreations = () => {
    setCreations(getCreations(bookId as string));
  };

  const handleHeart = (id: string) => {
    toggleHeart(id);
    refreshCreations();
  };

  return (
    <div className="bg-white dark:bg-mono-900 border-b border-mono-200 dark:border-mono-800 flex flex-col flex-shrink-0">
      {/* 클릭 가능한 타이틀 바 */}
      <button
        onClick={() => setGalleryOpen(!galleryOpen)}
        className="flex items-center justify-between px-4 py-2.5 w-full hover:bg-gray-50 dark:hover:bg-mono-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-mono-500" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-gray-800 dark:text-mono-200">창작 갤러리</span>
        </div>
        <ChevronUp
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${galleryOpen ? "" : "rotate-180"}`}
          strokeWidth={1.5}
        />
      </button>

      {/* 열릴 때만 보이는 콘텐츠 */}
      <div className={`overflow-hidden transition-all duration-300 ${galleryOpen ? "max-h-64" : "max-h-0"}`}>
        {/* CTA 버튼 3개 */}
        <div className="flex flex-wrap gap-2 justify-start px-4 py-2.5 border-b border-mono-200 dark:border-mono-800">
          <button
            onClick={() => setOpenModal("shortbook")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-white border border-[var(--color-mono-200)] text-[var(--color-mono-900)] hover:bg-[var(--color-mono-050)] hover:border-[var(--color-mono-400)] dark:bg-[#1e2a1e] dark:border-[#2a3a2a] dark:text-[#c8d5c8] dark:hover:bg-[#2a332a] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--color-mono-500)]" strokeWidth={1.5} /> 숏북 만들기
          </button>
          <button
            onClick={() => setOpenModal("shortmovie")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-white border border-[var(--color-mono-200)] text-[var(--color-mono-900)] hover:bg-[var(--color-mono-050)] hover:border-[var(--color-mono-400)] dark:bg-[#1e2a1e] dark:border-[#2a3a2a] dark:text-[#c8d5c8] dark:hover:bg-[#2a332a] transition-colors"
          >
            <Film className="w-3.5 h-3.5 text-[var(--color-mono-500)]" strokeWidth={1.5} /> 숏뮤비 만들기
          </button>
          <button
            onClick={() => setOpenModal("goods")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-white border border-[var(--color-mono-200)] text-[var(--color-mono-900)] hover:bg-[var(--color-mono-050)] hover:border-[var(--color-mono-400)] dark:bg-[#1e2a1e] dark:border-[#2a3a2a] dark:text-[#c8d5c8] dark:hover:bg-[#2a332a] transition-colors"
          >
            <Gift className="w-3.5 h-3.5 text-[var(--color-mono-500)]" strokeWidth={1.5} /> 굿즈 만들기
          </button>
        </div>

        {/* 창작물 피드 */}
        <div className="overflow-y-auto custom-scrollbar p-3" style={{ maxHeight: "calc(16rem - 80px)" }}>
          {creations.length === 0 ? (
            <div className="text-center py-4">
              <Sparkles className="w-8 h-8 text-mono-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-mono-700 font-semibold text-sm">아직 이 책의 창작물이 없어요</p>
              <p className="text-xs text-mono-500 mt-1">위 버튼을 눌러 첫 창작물을 만들어보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {creations.map((item) => {
                const badge = TYPE_BADGE[item.type];
                return (
                  <div
                    key={item.id}
                    className="rounded-lg overflow-hidden hover:shadow-md transition-shadow relative aspect-[3/4] bg-gradient-to-br from-mono-100 to-mono-200 dark:from-mono-800 dark:to-mono-700"
                  >
                    {item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumbnail} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {item.type === "shortbook" && <BookOpen className="w-5 h-5 text-mono-300" strokeWidth={1.5} />}
                        {item.type === "shortmovie" && <Film className="w-5 h-5 text-mono-300" strokeWidth={1.5} />}
                        {item.type === "goods" && <Gift className="w-5 h-5 text-mono-300" strokeWidth={1.5} />}
                      </div>
                    )}
                    {badge && (
                      <span className={`absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1.5 pt-4">
                      <p className="text-xs font-medium text-white truncate">{item.title}</p>
                      <button
                        onClick={() => handleHeart(item.id)}
                        className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 text-[10px] text-white/70 hover:text-red-400 transition-colors"
                      >
                        <Heart className={`w-3 h-3 ${item.hearted ? "fill-red-400 text-red-400" : ""}`} strokeWidth={1.5} />
                        {item.hearts}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 소개 모달 */}
      {openModal && (
        <IntroModal
          type={openModal}
          bookId={bookId as string}
          onClose={() => setOpenModal(null)}
          onNavigate={(path) => {
            setOpenModal(null);
            router.push(path);
          }}
        />
      )}
    </div>
  );
}

// 기능 카드 아이콘 매핑
const FEATURE_ICONS: Record<string, ReactNode> = {
  "다른 시점으로": <RefreshCw className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "다른 결말로": <Sparkles className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "장면 영상화": <Film className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "책갈피": <Bookmark className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "스티커": <Smile className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "일러스트": <ImageIcon className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
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
      title: "숏북 만들기",
      desc: "책의 특정 구간을 AI가 완전히 새롭게 재집필해요.\n다른 인물의 시점으로 보거나, 결말을 바꿔볼 수 있어요.",
      features: [
        { title: "다른 시점으로", desc: "선택한 인물의 눈으로 이야기를 다시 써요" },
        { title: "다른 결말로", desc: "내가 원하는 방향으로 결말을 바꿔요" },
      ],
      ctaLabel: "숏북 만들러 가기",
      ctaColor: "bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)]",
      path: `/creation/shortbook?bookId=${bookId}`,
    },
    shortmovie: {
      title: "숏뮤비 만들기",
      desc: "책 속 장면을 AI가 실제 움직이는 영상으로 만들어줘요.\n원하는 구간과 인물을 선택하면 5~8초 영상이 완성돼요.",
      features: [
        { title: "장면 영상화", desc: "텍스트 장면을 720p HD 영상으로 변환해요" },
      ],
      ctaLabel: "숏뮤비 만들러 가기",
      ctaColor: "bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)]",
      path: `/creation/shortmovie?bookId=${bookId}`,
    },
    goods: {
      title: "굿즈 만들기",
      desc: "책에서 마음에 드는 구절이나 장면으로 나만의 굿즈를 만들어요.",
      features: [
        { title: "책갈피", desc: "좋아하는 구절로 나만의 책갈피를 만들어요" },
        { title: "스티커", desc: "캐릭터/장면을 AI 일러스트 스티커로" },
        { title: "일러스트", desc: "장면을 다양한 스타일의 일러스트로" },
      ],
      ctaLabel: "굿즈 만들러 가기",
      ctaColor: "hover:opacity-90",
      ctaStyle: { backgroundColor: "#f5a623" } as React.CSSProperties,
      path: `/creation/goods?bookId=${bookId}`,
    },
  };

  const config = configs[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-mono-200">
          <h2 className="text-lg font-bold text-mono-900">{config.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-mono-100 rounded-lg">
            <X className="w-5 h-5 text-mono-500" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-mono-600 leading-relaxed whitespace-pre-line">
            {config.desc}
          </p>

          <div className="space-y-3">
            {config.features.map((feat) => (
              <div
                key={feat.title}
                className="flex items-start gap-3 p-3 bg-[var(--color-mono-050)] rounded-xl"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {FEATURE_ICONS[feat.title]}
                </div>
                <div>
                  <p className="font-semibold text-sm text-mono-900">{feat.title}</p>
                  <p className="text-xs text-mono-500 mt-0.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate(config.path)}
            className={`w-full py-3 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${config.ctaColor}`}
            style={"ctaStyle" in config ? config.ctaStyle : undefined}
          >
            {config.ctaLabel}
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
