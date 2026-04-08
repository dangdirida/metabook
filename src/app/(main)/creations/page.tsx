"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getCreations } from "@/lib/creation-store";
import { mockBooks } from "@/lib/mock-data";
import { Heart, Search, Filter, ArrowLeft, Sticker, Music, Video, BookOpen, FileText, Gift, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Creation } from "@/types";
import CreationThumbnail from "@/components/CreationThumbnail";

const TYPE_META: Record<string, { label: string; color: string }> = {
  sticker: { label: "스티커", color: "bg-amber-50 text-amber-700" },
  music: { label: "음악", color: "bg-blue-50 text-blue-700" },
  shortbook: { label: "숏북", color: "bg-teal-50 text-teal-700" },
  webtoon: { label: "웹툰", color: "bg-orange-50 text-orange-700" },
  novel: { label: "소설", color: "bg-violet-50 text-violet-700" },
  video: { label: "영상", color: "bg-red-50 text-red-700" },
  goods: { label: "굿즈", color: "bg-rose-50 text-rose-700" },
};
const TYPE_GRADIENTS: Record<string, string> = {
  sticker: "from-amber-400 to-orange-500", music: "from-blue-400 to-indigo-500",
  shortbook: "from-teal-400 to-emerald-500", webtoon: "from-orange-400 to-amber-500",
  novel: "from-violet-400 to-purple-500", video: "from-red-400 to-rose-500",
  goods: "from-rose-400 to-pink-500",
};
// 카테고리 탭 (스티커는 굿즈에 포함 → 별도 탭 없음)
const ALL_TYPES = ["music", "shortbook", "video", "goods"];
const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sticker: Sticker, music: Music, shortbook: BookOpen, webtoon: FileText,
  novel: BookOpen, video: Video, goods: Gift,
};

const GOODS_SUB = [
  { id: "sticker", label: "스티커" },
  { id: "phonecase", label: "폰케이스" },
  { id: "tumbler", label: "텀블러" },
  { id: "photocard", label: "포토카드" },
  { id: "bookmark", label: "책갈피" },
];

function seedRandom(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) { hash = ((hash << 5) - hash) + seed.charCodeAt(i); hash |= 0; }
  return min + Math.abs(hash) % (max - min + 1);
}

export default function CreationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  const [storeItems, setStoreItems] = useState<ReturnType<typeof getCreations>>([]);
  const [firestoreItems, setFirestoreItems] = useState<Creation[]>([]);
  const [goodsItems, setGoodsItems] = useState<Creation[]>([]);

  useEffect(() => { setStoreItems(getCreations()); }, []);

  // Firestore creations + goodsCreations 병렬 로드
  useEffect(() => {
    Promise.all([
      fetch("/api/creations?limit=50").then((r) => r.json()).catch(() => ({ items: [] })),
      fetch("/api/goods-creations?limit=50").then((r) => r.json()).catch(() => ({ items: [] })),
    ]).then(([d1, d2]) => {
      // creations 컬렉션
      setFirestoreItems((d1.items || []).map((c: Record<string, unknown>) => ({
        id: c.id as string, bookId: (c.bookId as string) || "", userId: (c.userId as string) || "anonymous",
        userName: (c.userName as string) || (c.userId as string) || "anonymous", title: (c.title as string) || "",
        description: (c.description as string) || "", type: (c.type as Creation["type"]) || "sticker",
        fileUrl: "", thumbnailUrl: (c.imageUrl as string) || (c.thumbnailUrl as string) || "",
        tags: (c.tags as string[]) || [], status: "approved" as const,
        likes: (c.likes as number) || 0, ogqLinked: false,
        createdAt: (c.createdAt as string) || new Date().toISOString(),
        audioUrl: c.audioUrl, genre: c.genre, moods: c.moods, duration: c.duration,
      })));
      // goodsCreations 컬렉션
      setGoodsItems((d2.items || []).map((g: Record<string, unknown>) => ({
        id: `goods-${g.id}`, bookId: (g.bookId as string) || "", userId: (g.userId as string) || "anonymous",
        userName: (g.userId as string) || "anonymous", title: (g.title as string) || "",
        description: "", type: "goods" as const, fileUrl: "",
        thumbnailUrl: (g.thumbnailDataUrl as string) || "",
        tags: [], status: "approved" as const, likes: (g.likes as number) || 0, ogqLinked: false,
        createdAt: (g.createdAt as string) || new Date().toISOString(),
        _goodsId: g.id, _goodsProductType: (g.productType as string) || "",
      })));
    });
  }, []);

  const allCreations: Creation[] = [
    ...storeItems.map((c) => ({
      id: c.id, bookId: c.bookId || "", userId: "me", userName: "나", title: c.title,
      description: c.content || "", type: c.type as Creation["type"], fileUrl: "",
      thumbnailUrl: c.thumbnail || "", tags: [], status: "approved" as const,
      likes: c.hearts, ogqLinked: false, createdAt: c.createdAt,
    })),
    ...firestoreItems,
    ...goodsItems,
  ].filter((c) => c.type !== "webtoon" && c.type !== "novel");

  const filtered = allCreations.filter((c) => {
    let matchType = true;
    if (selectedType !== "all") {
      if (selectedType === "goods") {
        matchType = c.type === "goods" || c.type === "sticker";
        if (matchType && selectedSubType) {
          if (selectedSubType === "sticker") {
            matchType = c.type === "sticker" || (c as unknown as Record<string, unknown>)._goodsProductType === "sticker";
          } else {
            matchType = (c as unknown as Record<string, unknown>).productType === selectedSubType
              || (c as unknown as Record<string, unknown>)._goodsProductType === selectedSubType;
          }
        }
      } else {
        matchType = c.type === selectedType;
      }
    }
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.userName.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q)) || mockBooks.find((b) => b.id === c.bookId)?.title.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) =>
    sortBy === "popular" ? b.likes - a.likes : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-[var(--color-mono-030)]">
      <div className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[var(--color-mono-050)] transition-colors md:hidden"><ArrowLeft className="w-4 h-4 text-[var(--color-mono-600)]" /></button>
              <h1 className="text-[18px] font-bold text-[var(--color-mono-990)]">창작물 탐색</h1>
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "latest" | "popular")}
              className="text-[12px] px-3 py-1.5 border border-[var(--color-mono-100)] rounded-lg bg-white text-[var(--color-mono-600)] outline-none">
              <option value="latest">최신순</option><option value="popular">인기순</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-mono-050)] rounded-xl mb-3">
            <Search className="w-4 h-4 text-[var(--color-mono-400)] flex-shrink-0" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, 창작자, 책 이름, 태그 검색"
              className="flex-1 bg-transparent text-[13px] text-[var(--color-mono-800)] placeholder:text-[var(--color-mono-300)] outline-none" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            <button onClick={() => { setSelectedType("all"); setSelectedSubType(null); }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${selectedType === "all" ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-600)] hover:bg-[var(--color-mono-080)]"}`}>전체</button>
            {ALL_TYPES.map((type) => (
              <button key={type} onClick={() => { setSelectedType(type); setSelectedSubType(null); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${selectedType === type ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-600)] hover:bg-[var(--color-mono-080)]"}`}>
                {TYPE_META[type].label}
              </button>
            ))}
          </div>
          {/* 굿즈 서브필터 */}
          {selectedType === "goods" && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-0.5">
              {GOODS_SUB.map((sub) => (
                <button key={sub.id}
                  onClick={() => setSelectedSubType(selectedSubType === sub.id ? null : sub.id)}
                  className="flex-shrink-0 px-3 py-1 rounded-full text-[12px] font-medium transition-colors"
                  style={{
                    border: `1.5px solid ${selectedSubType === sub.id ? "#10b981" : "#e5e7eb"}`,
                    background: selectedSubType === sub.id ? "#f0fdf4" : "white",
                    color: selectedSubType === sub.id ? "#10b981" : "#6b7280",
                  }}>
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Filter className="w-12 h-12 text-[var(--color-mono-200)] mb-3" />
            <p className="text-[14px] text-[var(--color-mono-500)]">검색 결과가 없어요</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sorted.map((creation) => {
              const book = mockBooks.find((b) => b.id === creation.bookId);
              const meta = TYPE_META[creation.type];
              const gradient = TYPE_GRADIENTS[creation.type] || "from-gray-400 to-gray-500";
              const goodsId = (creation as unknown as Record<string, unknown>)._goodsId as string | undefined;
              const href = goodsId ? `/goods/${goodsId}` : `/creations/${creation.id}`;
              return (
                <Link key={creation.id} href={href}
                  className="group bg-white rounded-2xl overflow-hidden border border-[var(--color-mono-080)] hover:shadow-md hover:border-[var(--color-primary-200)] transition-all">
                  <div className="relative" style={{ borderRadius: "inherit", overflow: "hidden" }}>
                    <CreationThumbnail item={{ id: creation.id, type: creation.type, title: creation.title, bookTitle: book?.title, imageUrl: creation.thumbnailUrl, genre: (creation as unknown as Record<string, unknown>).genre as string | undefined, moods: (creation as unknown as Record<string, unknown>).moods as string[] | undefined, duration: (creation as unknown as Record<string, unknown>).duration as number | undefined, productType: (creation as unknown as Record<string, unknown>)._goodsProductType as string | undefined }} />
                    {meta && <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.color}`} style={{ zIndex: 3 }}>{meta.label}</span>}
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-medium text-[var(--color-mono-900)] line-clamp-1 mb-0.5">{creation.title}</p>
                    <p className="text-[11px] text-[var(--color-mono-400)] truncate mb-1.5">
                      {creation.userName}{book && <span className="text-[var(--color-mono-300)]"> · {book.title}</span>}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[var(--color-mono-400)]"><Heart className="w-3 h-3" />{creation.likes}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
