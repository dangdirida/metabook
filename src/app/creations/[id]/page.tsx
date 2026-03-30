"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Heart, ExternalLink, Palette, Sparkles, Tag } from "lucide-react";
import { getCreationById } from "@/lib/mock-creations";
import { getCreations, type CreationItem } from "@/lib/creation-store";
import type { Creation } from "@/types";

interface DisplayCreation {
  id: string;
  title: string;
  description: string;
  type: string;
  userName: string;
  thumbnailUrl: string;
  tags: string[];
  likes: number;
  createdAt: string;
  ogqLinked: boolean;
  ogqUrl?: string;
  bookId: string;
}

const TYPE_LABELS: Record<string, string> = {
  sticker: "스티커", music: "음악", photo: "이미지",
  video: "영상", webtoon: "웹툰", novel: "소설",
  webdrama: "웹드라마", ai_agent: "AI Agent",
  prompt: "프롬프트", extension: "익스텐션",
  goods: "굿즈", shortbook: "숏북", shortmovie: "숏뮤비",
};

const TYPE_GRADIENTS: Record<string, string> = {
  sticker: "from-[var(--color-primary-050)] to-[var(--color-primary-100)]",
  novel: "from-[var(--color-primary-050)] to-[var(--color-primary-100)]",
  shortbook: "from-[var(--color-primary-050)] to-[var(--color-primary-100)]",
  music: "from-blue-50 to-blue-100",
  video: "from-red-50 to-red-100",
  webdrama: "from-red-50 to-red-100",
  shortmovie: "from-red-50 to-red-100",
  webtoon: "from-orange-50 to-orange-100",
  goods: "from-purple-50 to-purple-100",
};
const DEFAULT_GRADIENT = "from-mono-100 to-mono-200";

export default function CreationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const mockCreation: Creation | undefined = getCreationById(id);

  const [storeItems, setStoreItems] = useState<CreationItem[]>([]);
  useEffect(() => {
    setStoreItems(getCreations());
  }, []);

  const creation: DisplayCreation | null = useMemo(() => {
    if (mockCreation) {
      return {
        id: mockCreation.id,
        title: mockCreation.title,
        description: mockCreation.description || "",
        type: mockCreation.type,
        userName: mockCreation.userName,
        thumbnailUrl: mockCreation.thumbnailUrl || "",
        tags: mockCreation.tags || [],
        likes: mockCreation.likes,
        createdAt: mockCreation.createdAt,
        ogqLinked: mockCreation.ogqLinked,
        ogqUrl: mockCreation.ogqUrl,
        bookId: mockCreation.bookId,
      };
    }
    const storeItem = storeItems.find((c) => c.id === id);
    if (storeItem) {
      return {
        id: storeItem.id,
        title: storeItem.title,
        description: storeItem.content || "",
        type: storeItem.type,
        userName: "나",
        thumbnailUrl: storeItem.thumbnail || "",
        tags: [],
        likes: storeItem.hearts,
        createdAt: storeItem.createdAt,
        ogqLinked: false,
        bookId: storeItem.bookId,
      };
    }
    return null;
  }, [mockCreation, storeItems, id]);

  const isLoading = !mockCreation && storeItems.length === 0;

  return (
    <div className="min-h-screen bg-[var(--color-mono-010)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-mono-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-mono-600 hover:text-mono-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </button>
          {creation && (
            <span className="flex items-center gap-1.5 text-sm text-mono-500">
              <Heart className="w-4 h-4 text-red-400" />
              {creation.likes}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 로딩 */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-mono-400">불러오는 중...</p>
          </div>
        )}

        {/* 못 찾음 */}
        {!isLoading && !creation && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Sparkles className="w-12 h-12 text-mono-300 mb-4" />
            <p className="text-mono-700 font-semibold mb-2">창작물을 찾을 수 없어요</p>
            <p className="text-sm text-mono-400 mb-6">삭제되었거나 존재하지 않는 창작물이에요</p>
            <button
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-primary-500)] text-white text-sm font-medium hover:bg-[var(--color-primary-600)] transition-colors"
            >
              돌아가기
            </button>
          </div>
        )}

        {/* 정상 표시 */}
        {creation && (
          <div className="space-y-6">
            {/* A. 썸네일 */}
            {creation.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creation.thumbnailUrl}
                alt={creation.title}
                className="w-full rounded-2xl object-cover"
                style={{ maxHeight: "400px" }}
              />
            ) : (
              <div
                className={`w-full h-64 rounded-2xl bg-gradient-to-br ${TYPE_GRADIENTS[creation.type] || DEFAULT_GRADIENT} flex items-center justify-center`}
              >
                <Palette className="w-16 h-16 text-mono-300" />
              </div>
            )}

            {/* B. 타입 배지 */}
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-primary-050)] text-[var(--color-primary-700)]">
                {TYPE_LABELS[creation.type] || creation.type}
              </span>
            </div>

            {/* C. 제목 */}
            <h1 className="text-2xl font-bold text-mono-900">{creation.title}</h1>

            {/* D. 메타 정보 */}
            <div className="flex items-center gap-4 text-sm text-mono-500">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-[10px] font-bold text-[var(--color-primary-600)]">
                  {creation.userName.charAt(0)}
                </span>
                {creation.userName}
              </span>
              <span>{new Date(creation.createdAt).toLocaleDateString("ko-KR")}</span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                {creation.likes}
              </span>
            </div>

            {/* E. 구분선 */}
            <hr className="border-mono-100" />

            {/* F. 본문 */}
            {creation.description ? (
              <p className="text-mono-700 leading-relaxed whitespace-pre-wrap text-base">
                {creation.description}
              </p>
            ) : (
              <p className="text-mono-400 text-sm">본문 내용이 없어요.</p>
            )}

            {/* G. 태그 */}
            {creation.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {creation.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-mono-100 text-mono-600"
                  >
                    <Tag className="w-3 h-3" />
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* H. OGQ Market 버튼 */}
            {creation.ogqLinked && creation.ogqUrl && (
              <div>
                <a
                  href={creation.ogqUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-primary-500)] text-white font-medium hover:bg-[var(--color-primary-600)] transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  OGQ Market에서 보기
                </a>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
