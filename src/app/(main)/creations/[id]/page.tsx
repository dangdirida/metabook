"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, ExternalLink, Palette, BookOpen, Film, Gift, Tag } from "lucide-react";
import { mockCreations } from "@/lib/mock-creations";
import { getCreations, type CreationItem } from "@/lib/creation-store";
import type { Creation, CreationType } from "@/types";

const TYPE_LABELS: Record<string, string> = {
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
  shortbook: "숏북",
  shortmovie: "숏뮤비",
};

const TYPE_GRADIENTS: Record<string, string> = {
  sticker: "from-yellow-400 to-orange-500",
  music: "from-blue-400 to-indigo-500",
  photo: "from-emerald-400 to-teal-500",
  video: "from-red-400 to-rose-500",
  webtoon: "from-orange-400 to-amber-500",
  novel: "from-violet-400 to-purple-500",
  shortbook: "from-emerald-400 to-teal-600",
  shortmovie: "from-purple-400 to-violet-600",
  goods: "from-orange-400 to-rose-500",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  shortbook: BookOpen,
  shortmovie: Film,
  goods: Gift,
};

interface NormalizedCreation {
  id: string;
  title: string;
  type: string;
  userName: string;
  description: string;
  content: string;
  likes: number;
  createdAt: string;
  tags: string[];
  ogqUrl?: string;
  thumbnail?: string;
}

function normalizeFromMock(c: Creation): NormalizedCreation {
  return {
    id: c.id,
    title: c.title,
    type: c.type,
    userName: c.userName,
    description: c.description,
    content: "",
    likes: c.likes,
    createdAt: c.createdAt,
    tags: c.tags,
    ogqUrl: c.ogqUrl,
    thumbnail: c.thumbnailUrl,
  };
}

function normalizeFromStore(c: CreationItem): NormalizedCreation {
  return {
    id: c.id,
    title: c.title,
    type: c.type,
    userName: "나",
    description: "",
    content: c.content,
    likes: c.hearts,
    createdAt: c.createdAt,
    tags: [],
    ogqUrl: undefined,
    thumbnail: c.thumbnail || undefined,
  };
}

export default function CreationDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  // mock-creations에서 찾기
  const mockItem = mockCreations.find((c) => c.id === id);
  // creation-store(localStorage)에서 찾기
  const storeItems = typeof window !== "undefined" ? getCreations() : [];
  const storeItem = storeItems.find((c) => c.id === id);

  const creation: NormalizedCreation | null = mockItem
    ? normalizeFromMock(mockItem)
    : storeItem
    ? normalizeFromStore(storeItem)
    : null;

  if (!creation) {
    return (
      <div className="min-h-screen bg-[var(--color-mono-010)] flex flex-col items-center justify-center">
        <Palette className="w-16 h-16 text-[var(--color-mono-200)] mb-4" />
        <p className="text-lg font-semibold text-[var(--color-mono-600)]">창작물을 찾을 수 없어요</p>
        <p className="text-sm text-[var(--color-mono-400)] mt-1">삭제되었거나 존재하지 않는 창작물입니다</p>
        <button
          onClick={() => router.back()}
          className="mt-6 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-medium hover:bg-[var(--color-primary-600)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </button>
      </div>
    );
  }

  const gradient = TYPE_GRADIENTS[creation.type] || "from-gray-400 to-gray-600";
  const Icon = TYPE_ICONS[creation.type] || Palette;
  const bodyText = creation.content || creation.description;
  const formattedDate = new Date(creation.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[var(--color-mono-010)]">
      {/* 헤더 */}
      <header className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[var(--color-mono-050)] transition-colors text-[var(--color-mono-600)] hover:text-[var(--color-mono-900)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">돌아가기</span>
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 히어로 영역 */}
        <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] overflow-hidden">
          {/* 썸네일 / 그라데이션 플레이스홀더 */}
          <div className="relative aspect-[16/7] overflow-hidden">
            {creation.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creation.thumbnail}
                alt={creation.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Icon className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
            {/* 유형 배지 */}
            <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold bg-black/50 text-white rounded-full backdrop-blur-sm">
              {TYPE_LABELS[creation.type] || creation.type}
            </span>
          </div>

          {/* 정보 영역 */}
          <div className="p-6 md:p-8 space-y-5">
            {/* 제목 */}
            <h1 className="text-2xl font-bold text-[var(--color-mono-990)]">{creation.title}</h1>

            {/* 메타 정보 */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-xs font-bold text-[var(--color-primary-600)]">
                  {creation.userName.charAt(0)}
                </div>
                <span className="font-medium text-[var(--color-mono-700)]">{creation.userName}</span>
              </div>
              <span className="text-[var(--color-mono-300)]">·</span>
              <span className="text-[var(--color-mono-400)]">{formattedDate}</span>
              <span className="text-[var(--color-mono-300)]">·</span>
              <span className="flex items-center gap-1 text-[var(--color-mono-400)]">
                <Heart className="w-4 h-4" />
                {creation.likes}
              </span>
            </div>

            {/* 본문 */}
            {bodyText && (
              <div className="bg-[var(--color-mono-050)] rounded-xl p-5">
                <p className="text-[var(--color-mono-800)] leading-relaxed whitespace-pre-wrap text-base">
                  {bodyText}
                </p>
              </div>
            )}

            {/* 태그 */}
            {creation.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-[var(--color-mono-300)]" />
                {creation.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-[var(--color-mono-050)] text-[var(--color-mono-600)] rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* OGQ Market 링크 */}
            {creation.ogqUrl && (
              <a
                href={creation.ogqUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary-500)] text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-600)] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                OGQ Market에서 보기
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
