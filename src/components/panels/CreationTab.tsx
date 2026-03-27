"use client";

import { useState } from "react";
import { Heart, ExternalLink, Palette, Sparkles, X } from "lucide-react";
import { useParams } from "next/navigation";
import { getCreationsByBookId } from "@/lib/mock-creations";
import type { Creation, CreationType } from "@/types";

const TYPE_LABELS: Record<CreationType, string> = {
  sticker: "스티커",
  music: "음악",
  photo: "이미지",
  video: "영상",
  webtoon: "웹툰",
  novel: "소설",
  webdrama: "웹드라마",
  ai_agent: "AI Agent",
  prompt: "프롬프트",
  extension: "익스텐션",
  goods: "굿즈",
};

const TYPE_COLORS: Record<string, string> = {
  sticker: "bg-secondary-50 text-secondary-600",
  music: "bg-blue-50 text-blue-300",
  photo: "bg-primary-50 text-primary-700",
  video: "bg-red-50 text-red-300",
  webtoon: "bg-accent-orange/10 text-accent-orange",
  novel: "bg-primary-50 text-primary-600",
};

const SORT_OPTIONS = [
  { value: "ranking", label: "랭킹순" },
  { value: "latest", label: "최신순" },
  { value: "likes", label: "좋아요순" },
];

export default function CreationTab() {
  const { bookId } = useParams();
  const [sort, setSort] = useState("ranking");
  const [selectedCreation, setSelectedCreation] = useState<Creation | null>(null);
  const creations = getCreationsByBookId(bookId as string);

  const sorted = [...creations].sort((a, b) => {
    if (sort === "latest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "likes") return b.likes - a.likes;
    return b.likes - a.likes; // ranking = likes
  });

  const handleCardClick = (creation: Creation) => {
    if (creation.ogqUrl) {
      window.open(creation.ogqUrl, "_blank");
    } else {
      setSelectedCreation(creation);
    }
  };

  if (creations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center">
        <Sparkles className="w-12 h-12 text-mono-300 mb-4" />
        <p className="text-mono-700 font-semibold mb-1">
          아직 이 책의 창작물이 없어요
        </p>
        <p className="text-sm text-mono-500 mb-6">첫 번째가 되어볼까요?</p>
        <button className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
          창작물 올리기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 정렬 + CTA */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-mono-200 flex-shrink-0">
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                sort === opt.value
                  ? "bg-primary-500 text-white"
                  : "text-mono-500 hover:bg-mono-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600">
          <Palette className="w-3.5 h-3.5" />
          올리기
        </button>
      </div>

      {/* 카드 그리드 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        <div className="grid grid-cols-2 gap-3">
          {sorted.map((creation) => (
            <button
              key={creation.id}
              onClick={() => handleCardClick(creation)}
              className="bg-white rounded-xl border border-mono-200 overflow-hidden hover:shadow-md transition-shadow text-left"
            >
              {/* 썸네일 */}
              <div className="aspect-square bg-gradient-to-br from-mono-100 to-mono-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Palette className="w-8 h-8 text-mono-300" />
                </div>
                {/* 유형 배지 */}
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    TYPE_COLORS[creation.type] || "bg-mono-100 text-mono-600"
                  }`}
                >
                  {TYPE_LABELS[creation.type]}
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-mono-900 line-clamp-1">
                  {creation.title}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-mono-500">
                    {creation.userName}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-mono-400">
                    <Heart className="w-3 h-3" />
                    {creation.likes}
                  </span>
                </div>
                {creation.ogqLinked && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-primary-500">
                      <ExternalLink className="w-3 h-3" />
                      OGQ Market
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 창작물 상세 모달 */}
      {selectedCreation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedCreation(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-mono-100">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    TYPE_COLORS[selectedCreation.type] || "bg-mono-100 text-mono-600"
                  }`}
                >
                  {TYPE_LABELS[selectedCreation.type]}
                </span>
                <h2 className="text-lg font-bold text-mono-900 line-clamp-1">
                  {selectedCreation.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCreation(null)}
                className="p-1.5 hover:bg-mono-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-mono-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-mono-500">{selectedCreation.userName}</span>
                <span className="flex items-center gap-1 text-mono-400">
                  <Heart className="w-3.5 h-3.5" />
                  {selectedCreation.likes}
                </span>
              </div>
              {selectedCreation.description && (
                <p className="text-sm text-mono-700 leading-relaxed whitespace-pre-wrap">
                  {selectedCreation.description}
                </p>
              )}
              {selectedCreation.ogqUrl && (
                <a
                  href={selectedCreation.ogqUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  OGQ Market에서 보기
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
