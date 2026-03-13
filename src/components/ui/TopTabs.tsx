"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Heart, ExternalLink, Palette, ShoppingBag, BookCopy, Sparkles } from "lucide-react";
import { getCreationsByBookId } from "@/lib/mock-creations";
import { getGoodsByBookId } from "@/lib/mock-goods";
import { mockBooks } from "@/lib/mock-data";
import type { CreationType } from "@/types";

const CREATION_FILTER_CHIPS = [
  { value: "all", label: "전체" },
  { value: "sticker", label: "스티커" },
  { value: "music", label: "음악" },
  { value: "webtoon", label: "웹툰" },
  { value: "video", label: "영상" },
  { value: "novel", label: "소설" },
  { value: "other", label: "기타" },
] as const;

const OTHER_TYPES: CreationType[] = ["ai_agent", "prompt", "extension"];

const TYPE_COLORS: Record<string, string> = {
  sticker: "bg-secondary-50 text-secondary-600",
  music: "bg-blue-50 text-blue-300",
  photo: "bg-primary-50 text-primary-700",
  video: "bg-red-50 text-red-300",
  webtoon: "bg-accent-orange/10 text-accent-orange",
  novel: "bg-primary-50 text-primary-600",
};

const TYPE_LABELS: Record<CreationType, string> = {
  sticker: "스티커", music: "음악", photo: "이미지", video: "영상",
  webtoon: "웹툰", novel: "소설", webdrama: "웹드라마",
  ai_agent: "AI Agent", prompt: "프롬프트", extension: "익스텐션", goods: "굿즈",
};

type TabType = "gallery" | "goods" | "series";

export default function TopTabs() {
  const { bookId } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("gallery");
  const [filterChip, setFilterChip] = useState("all");
  const [galleryOpen, setGalleryOpen] = useState(false);

  const creations = getCreationsByBookId(bookId as string);
  const goods = getGoodsByBookId(bookId as string);
  const book = mockBooks.find((b) => b.id === bookId);
  const seriesBooks = book?.seriesId
    ? mockBooks.filter((b) => b.seriesId === book.seriesId)
    : [];

  const hasGoods = goods.length > 0;
  const hasSeries = seriesBooks.length >= 2;

  // 필터칩 활성 상태 계산
  const chipCounts = useMemo(() => {
    const counts: Record<string, number> = { all: creations.length };
    creations.forEach((c) => {
      if (OTHER_TYPES.includes(c.type)) {
        counts["other"] = (counts["other"] || 0) + 1;
      } else {
        counts[c.type] = (counts[c.type] || 0) + 1;
      }
    });
    return counts;
  }, [creations]);

  const filteredCreations = useMemo(() => {
    if (filterChip === "all") return creations;
    if (filterChip === "other") return creations.filter((c) => OTHER_TYPES.includes(c.type));
    return creations.filter((c) => c.type === filterChip);
  }, [creations, filterChip]);

  const tabs: { type: TabType; label: string; icon: React.ReactNode; show: boolean }[] = [
    { type: "gallery", label: "창작 갤러리", icon: <Palette className="w-4 h-4" />, show: true },
    { type: "goods", label: "굿즈", icon: <ShoppingBag className="w-4 h-4" />, show: hasGoods },
    { type: "series", label: "시리즈", icon: <BookCopy className="w-4 h-4" />, show: hasSeries },
  ];

  return (
    <div className="bg-white border-t border-mono-200 flex flex-col">
      {/* 클릭 가능한 타이틀 바 */}
      <button
        onClick={() => setGalleryOpen(!galleryOpen)}
        className="flex items-center justify-between px-4 py-3 w-full hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">✦</span>
          <span className="text-sm font-semibold text-gray-800">창작 갤러리</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${galleryOpen ? '' : 'rotate-180'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* 열릴 때만 보이는 콘텐츠 */}
      <div className={`overflow-hidden transition-all duration-300 ${galleryOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
        {/* 대탭 */}
        <div className="flex border-b border-mono-200">
          {tabs
            .filter((t) => t.show)
            .map((tab) => (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.type
                    ? "text-primary-500 border-b-2 border-primary-500"
                    : "text-mono-500 hover:text-mono-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
        </div>

        {/* 창작 갤러리 필터칩 */}
        {activeTab === "gallery" && (
          <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-mono-200">
            {CREATION_FILTER_CHIPS.map((chip) => {
              const count = chipCounts[chip.value] || 0;
              const isActive = filterChip === chip.value;
              const isDisabled = chip.value !== "all" && count === 0;

              return (
                <button
                  key={chip.value}
                  onClick={() => !isDisabled && setFilterChip(chip.value)}
                  disabled={isDisabled}
                  className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary-500 text-white"
                      : isDisabled
                      ? "bg-mono-100 text-mono-400 cursor-not-allowed"
                      : "bg-mono-100 text-mono-600 hover:bg-mono-200"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar p-4">
        {activeTab === "gallery" && (
          <>
            {filteredCreations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredCreations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => window.open("#", "_blank")}
                    className="bg-white rounded-xl border border-mono-200 overflow-hidden hover:shadow-md transition-shadow text-left"
                  >
                    <div className="aspect-square bg-gradient-to-br from-mono-100 to-mono-200 relative flex items-center justify-center">
                      <Palette className="w-8 h-8 text-mono-300" />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full ${TYPE_COLORS[c.type] || "bg-mono-100 text-mono-600"}`}>
                        {TYPE_LABELS[c.type]}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-mono-900 line-clamp-1">{c.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-mono-500">{c.userName}</span>
                        <span className="flex items-center gap-1 text-xs text-mono-400">
                          <Heart className="w-3 h-3" /> {c.likes}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Sparkles className="w-10 h-10 text-mono-300 mx-auto mb-3" />
                <p className="text-mono-700 font-semibold">아직 이 책의 창작물이 없어요</p>
                <p className="text-sm text-mono-500 mt-1 mb-4">첫 번째가 되어볼까요? ✨</p>
                <button className="px-5 py-2.5 bg-primary-500 text-white text-sm rounded-xl hover:bg-primary-600">
                  창작물 올리기
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "goods" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {goods.map((g) => (
              <div key={g.id} className={`rounded-xl border border-mono-200 overflow-hidden ${g.stock === 0 ? "opacity-60 grayscale" : ""}`}>
                <div className="aspect-square bg-gradient-to-br from-mono-100 to-mono-200 relative flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-mono-300" />
                  {g.isLimitedEdition && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-50 text-red-300">한정판</span>
                  )}
                  {g.stock === 0 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold">품절</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-mono-900 line-clamp-1">{g.name}</p>
                  <p className="text-sm font-bold text-primary-600 mt-1">{g.price.toLocaleString()}원</p>
                  {g.stock > 0 ? (
                    <button
                      onClick={() => window.open(g.externalUrl, "_blank")}
                      className="w-full mt-2 py-2 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> 바로 구매
                    </button>
                  ) : (
                    <button className="w-full mt-2 py-2 bg-mono-200 text-mono-600 text-xs rounded-lg">
                      재입고 알림
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "series" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {seriesBooks.map((sb) => (
              <a
                key={sb.id}
                href={`/library/${sb.id}`}
                className={`rounded-xl border overflow-hidden hover:shadow-md transition-shadow ${
                  sb.id === bookId ? "border-primary-300 ring-2 ring-primary-100" : "border-mono-200"
                }`}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <BookCopy className="w-8 h-8 text-primary-300" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-mono-900 line-clamp-1">{sb.title}</p>
                  <p className="text-xs text-mono-500 mt-0.5">{sb.author}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
