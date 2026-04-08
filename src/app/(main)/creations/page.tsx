"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { mockCreations, loversCreations } from "@/lib/mock-creations";
import { getCreations } from "@/lib/creation-store";
import { mockBooks } from "@/lib/mock-data";
import { Heart, Search, Filter, ArrowLeft, Sticker, Music, Video, BookOpen, FileText, Gift, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Creation } from "@/types";

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
  const [goodsItems, setGoodsItems] = useState<Creation[]>([]);
  useEffect(() => { setStoreItems(getCreations()); }, []);
  useEffect(() => {
    fetch("/api/goods-creations?limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (data.items) {
          setGoodsItems(data.items.map((g: { id: string; title: string; bookId: string; userId: string; thumbnailDataUrl: string; likes: number; createdAt: string; productType?: string }) => ({
            id: `goods-${g.id}`, bookId: g.bookId || "", userId: g.userId || "anonymous",
            userName: g.userId || "anonymous", title: g.title, description: "",
            type: "goods" as const, fileUrl: "", thumbnailUrl: g.thumbnailDataUrl || "",
            tags: [], status: "approved" as const, likes: g.likes || 0, ogqLinked: false,
            createdAt: g.createdAt || new Date().toISOString(),
            _goodsId: g.id, _goodsProductType: g.productType || "",
          })));
        }
      })
      .catch(() => {});
  }, []);
  const allCreations: Creation[] = [
    ...mockCreations, ...loversCreations,
    ...storeItems.map((c) => ({
      id: c.id, bookId: c.bookId || "", userId: "me", userName: "나", title: c.title,
      description: c.content || "", type: c.type as Creation["type"], fileUrl: "",
      thumbnailUrl: c.thumbnail || "", tags: [], status: "approved" as const,
      likes: c.hearts, ogqLinked: false, createdAt: c.createdAt,
    })),
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
                  <div className="aspect-square relative" style={{ borderRadius: "inherit", overflow: "hidden" }}>
                    {/* 숏북: 종이 노트 디자인 */}
                    {creation.type === "shortbook" ? (
                      <div style={{ width: "100%", height: "100%", position: "relative", backgroundColor: "#fffef7", border: "1px solid #e8e4d9" }}>
                        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 200 200" preserveAspectRatio="none">
                          {[40, 56, 72, 88, 104, 120, 136, 152, 168].map((y, i) => (
                            <line key={i} x1="0" y1={y} x2="200" y2={y} stroke="#e8e4d9" strokeWidth="0.8" />
                          ))}
                          <line x1="28" y1="0" x2="28" y2="200" stroke="#fca5a5" strokeWidth="1.2" />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 20px", zIndex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", textAlign: "center", lineHeight: 1.6, wordBreak: "keep-all", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{creation.title}</div>
                          {book && <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 8, textAlign: "center" }}>— {book.title}</div>}
                        </div>
                      </div>

                    /* 음악: 감성 그라디언트 + 파형 + 제목 */
                    ) : creation.type === "music" ? (
                      <div style={{ width: "100%", height: "100%", position: "relative", background: "linear-gradient(160deg, #0f0f2e 0%, #1a1a5c 50%, #0a0a2e 100%)" }}>
                        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 200 200">
                          {[[20,30],[80,15],[150,40],[170,80],[140,160],[60,170],[30,120],[100,90],[45,65],[160,130]].map(([cx,cy], i) => (
                            <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 1.5 : 1} fill="white" opacity={0.3 + (i % 4) * 0.15} />
                          ))}
                          <path d="M0 160 Q40 140 80 155 Q120 170 160 150 Q180 140 200 155 L200 200 L0 200 Z" fill="white" opacity="0.04" />
                          <path d="M0 175 Q50 155 100 168 Q150 182 200 168 L200 200 L0 200 Z" fill="white" opacity="0.06" />
                          {[55,70,85,100,115,130,145].map((x, i) => { const h = [20,40,28,55,35,45,22][i]; return <rect key={i} x={x-2} y={100-h/2} width="4" height={h} rx="2" fill="white" opacity={0.12 + i * 0.02} />; })}
                        </svg>
                        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: "55%", height: "55%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)" }} />
                        <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", fontSize: 16, opacity: 0.5, color: "white", letterSpacing: 6 }}>♩ ♪ ♩</div>
                        <div style={{ position: "absolute", inset: "28px 14px 28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "white", textAlign: "center", lineHeight: 1.5, wordBreak: "keep-all", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textShadow: "0 1px 8px rgba(0,0,0,0.6)" } as React.CSSProperties}>{creation.title}</div>
                          {book && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{book.title}</div>}
                        </div>
                        <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4 }}>
                          {`${seedRandom(creation.id, 1, 5)}:${String(seedRandom(creation.id + "s", 0, 59)).padStart(2, "0")}`}
                        </div>
                      </div>

                    /* 영상: 인물 실루엣 배경 + 플레이 버튼 */
                    ) : creation.type === "video" ? (
                      <div style={{ width: "100%", height: "100%", position: "relative", background: "#111" }}>
                        {creation.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={creation.thumbnailUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 200 200">
                            <defs><linearGradient id={`vbg-${creation.id}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1a0a2e" /><stop offset="50%" stopColor="#2d1060" /><stop offset="100%" stopColor="#0a0a1a" /></linearGradient></defs>
                            <rect width="200" height="200" fill={`url(#vbg-${creation.id})`} />
                            <ellipse cx="100" cy="75" rx="22" ry="26" fill="white" opacity="0.08" />
                            <path d="M55 200 Q60 130 100 125 Q140 130 145 200 Z" fill="white" opacity="0.06" />
                            <rect x="0" y="140" width="200" height="60" fill="black" opacity="0.3" />
                          </svg>
                        )}
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)" }} />
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(255,255,255,0.2)", zIndex: 2 }}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="white"><polygon points="6,3 15,9 6,15" /></svg>
                        </div>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 10px 8px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "white", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>{creation.title}</div>
                        </div>
                        <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.65)", color: "white", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, zIndex: 3 }}>
                          {`0:${String(seedRandom(creation.id, 5, 20)).padStart(2, "0")}`}
                        </div>
                      </div>

                    /* 굿즈/스티커: 흰 배경 + contain */
                    ) : creation.thumbnailUrl && (creation.type === "goods" || creation.type === "sticker") ? (
                      <div style={{ width: "100%", height: "100%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={creation.thumbnailUrl} alt={creation.title} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                      </div>

                    /* 기본: 썸네일 이미지 or 그라디언트 */
                    ) : creation.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={creation.thumbnailUrl} alt={creation.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>{(() => { const Icon = TYPE_ICONS[creation.type] || Package; return <Icon className="w-14 h-14 text-white/60" />; })()}</div>
                    )}
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
