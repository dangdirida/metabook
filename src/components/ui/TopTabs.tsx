"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, Film, Gift, Heart, Sparkles, ChevronUp, Play, Plus, ShoppingBag, Library, Music } from "lucide-react";
import { getCreations, toggleHeart, type CreationItem } from "@/lib/creation-store";
import { getGoodsByBookId } from "@/lib/mock-goods";
import { mockBooks, getBookById } from "@/lib/mock-data";
import { getCreationsByBookId } from "@/lib/mock-creations";
import type { Creation } from "@/types";
import Link from "next/link";

const TYPE_CONFIG: Record<string, { label: string; gradient: string; accentColor: string; icon: React.ElementType }> = {
  shortbook: { label: "숏북", gradient: "from-emerald-400 via-teal-500 to-cyan-600", accentColor: "text-emerald-500", icon: BookOpen },
  shortmovie: { label: "숏뮤비", gradient: "from-violet-500 via-purple-500 to-indigo-600", accentColor: "text-violet-500", icon: Film },
  music: { label: "음악", gradient: "from-blue-500 via-indigo-500 to-violet-600", accentColor: "text-blue-500", icon: Music },
  goods: { label: "굿즈", gradient: "from-orange-400 via-rose-400 to-pink-500", accentColor: "text-orange-500", icon: Gift },
};

const OPEN_HEIGHT = 280;

type TabKey = "gallery" | "goods" | "series";

export default function TopTabs() {
  const { bookId } = useParams();
  const router = useRouter();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [storeCreations, setStoreCreations] = useState<CreationItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("gallery");
  useEffect(() => { setGalleryOpen(false); setStoreCreations(getCreations(bookId as string)); }, [bookId]);
  const refreshCreations = () => setStoreCreations(getCreations(bookId as string));
  const handleHeart = (id: string) => { toggleHeart(id); refreshCreations(); };

  const mockCreations = getCreationsByBookId(bookId as string);
  const totalCount = storeCreations.length + mockCreations.length;

  const book = getBookById(bookId as string);
  const goods = getGoodsByBookId(bookId as string);
  const seriesBooks = useMemo(() => {
    if (!book?.seriesId) return [];
    return mockBooks.filter((b) => b.seriesId === book.seriesId);
  }, [book]);

  // API 굿즈 게시물
  const [apiGoods, setApiGoods] = useState<{ id: string; title: string; price: number; thumbnailDataUrl: string }[]>([]);
  const [apiGoodsLoading, setApiGoodsLoading] = useState(false);
  useEffect(() => {
    if (!bookId) return;
    setApiGoodsLoading(true);
    fetch(`/api/goods-creations?bookId=${bookId}`)
      .then((r) => r.json())
      .then((d) => { setApiGoods(d.items || []); setApiGoodsLoading(false); })
      .catch(() => setApiGoodsLoading(false));
  }, [bookId]);

  const hasSeries = seriesBooks.length >= 2;

  const tabs = useMemo(() => {
    const t: { key: TabKey; label: string }[] = [{ key: "gallery", label: "창작 갤러리" }];
    t.push({ key: "goods", label: "굿즈" }); // 항상 표시
    if (hasSeries) t.push({ key: "series", label: "시리즈" });
    return t;
  }, [hasSeries]);

  const handleCreate = (type: "shortbook" | "shortmovie" | "goods" | "music") => {
    router.push(`/creation/${type}?bookId=${bookId}`);
  };

  return (
    <div className="bg-white dark:bg-mono-900 border-b border-[var(--color-mono-080)] dark:border-mono-800 flex flex-col flex-shrink-0">
      <button onClick={() => setGalleryOpen(!galleryOpen)} className="flex items-center justify-between px-4 py-2.5 w-full hover:bg-[var(--color-mono-030)] dark:hover:bg-mono-800 transition-colors">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary-500)]" strokeWidth={1.5} />
          <span className="text-[13px] font-semibold text-[var(--color-mono-800)] dark:text-mono-200">창작 갤러리</span>
          {totalCount > 0 && <span className="bg-[var(--color-primary-500)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalCount}</span>}
        </div>
        <ChevronUp className={`w-4 h-4 text-[var(--color-mono-400)] transition-transform duration-300 ${galleryOpen ? "" : "rotate-180"}`} strokeWidth={1.5} />
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: galleryOpen ? OPEN_HEIGHT : 0 }}>
        {/* 탭 (조건부) */}
        {tabs.length > 1 && (
          <div className="flex border-b border-[var(--color-mono-080)] dark:border-mono-800 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 text-[12px] font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-[var(--color-primary-500)] border-b-2 border-[var(--color-primary-500)]"
                    : "text-[var(--color-mono-400)] hover:text-[var(--color-mono-600)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* 갤러리 탭 */}
        {activeTab === "gallery" && (
          <>
            <div className="flex flex-wrap gap-2 justify-start px-4 py-2.5 border-b border-[var(--color-mono-080)] dark:border-mono-800">
              {(["shortbook","shortmovie","music","goods"] as const).map((type) => {
                const cfg=TYPE_CONFIG[type]; const Icon=cfg.icon;
                return (<button key={type} onClick={()=>handleCreate(type)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border border-[var(--color-mono-100)] bg-white text-[var(--color-mono-700)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-030)] hover:text-[var(--color-primary-600)] dark:bg-[#1e2a1e] dark:border-[#2a3a2a] dark:text-[#c8d5c8] dark:hover:bg-[#2a332a] transition-all shadow-sm"><Icon className={`w-3.5 h-3.5 ${cfg.accentColor}`} strokeWidth={1.5} />{cfg.label}만들기</button>);
              })}
            </div>
            <div className="overflow-y-auto custom-scrollbar p-3" style={{ maxHeight: OPEN_HEIGHT - 56 }}>
              {storeCreations.length === 0 && mockCreations.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-[var(--color-mono-050)] rounded-2xl flex items-center justify-center mx-auto mb-3"><Sparkles className="w-7 h-7 text-mono-300" strokeWidth={1.5} /></div>
                  <p className="text-[var(--color-mono-700)] font-semibold text-sm">첫 창작물을 만들어보세요!</p>
                  <p className="text-xs text-[var(--color-mono-400)] mt-1 leading-relaxed">AI로 숏북, 뮤비, 굿즈를 만들 수 있어요</p>
                  <button onClick={()=>handleCreate("shortbook")} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] transition-colors"><Plus className="w-3.5 h-3.5" strokeWidth={2} />지금 만들기</button>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {mockCreations.map((mc) => (
                    <MockCreationCard
                      key={mc.id}
                      creation={mc}
                      onClick={() => router.push(`/creations/${mc.id}`)}
                    />
                  ))}
                  {storeCreations.map((item) => {
                    if (item.type === "music") {
                      return <MusicCard key={item.id} item={item} onHeart={() => handleHeart(item.id)} />;
                    }
                    const cfg = TYPE_CONFIG[item.type];
                    const Icon = cfg?.icon;
                    if (!cfg) return null;
                    return (
                      <CreationCard
                        key={item.id}
                        item={item}
                        cfg={cfg}
                        Icon={Icon}
                        onHeart={() => handleHeart(item.id)}
                        onClick={() => router.push(`/creations/${item.id}`)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* 굿즈 탭 */}
        {activeTab === "goods" && (
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: OPEN_HEIGHT - 40 }}>
            {/* 만들기 버튼 */}
            <div className="px-3 pt-3 pb-2 border-b border-[var(--color-mono-050)]">
              <button onClick={() => router.push(`/creation/goods?bookId=${bookId}`)}
                className="w-full py-2.5 rounded-xl border-[1.5px] border-dashed border-emerald-400 bg-emerald-50 text-emerald-600 text-[13px] font-semibold hover:bg-emerald-100 transition-colors">
                + 굿즈 만들기
              </button>
            </div>
            {apiGoodsLoading ? (
              <div className="py-8 text-center text-[13px] text-[var(--color-mono-400)]">불러오는 중...</div>
            ) : apiGoods.length === 0 && goods.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-[28px] mb-2">🎁</div>
                <p className="text-[13px] text-[var(--color-mono-400)]">아직 게시된 굿즈가 없어요</p>
                <p className="text-[11px] text-[var(--color-mono-300)] mt-1">첫 번째 굿즈를 만들어보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 p-3">
                {/* API 굿즈 */}
                {apiGoods.map((g) => (
                  <Link key={g.id} href={`/goods/${g.id}`} className="rounded-xl border border-[var(--color-mono-080)] overflow-hidden hover:shadow-md transition-shadow bg-white">
                    <div className="aspect-square bg-white flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.thumbnailDataUrl} alt={g.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="p-2 border-t border-[var(--color-mono-050)]">
                      <p className="text-[10px] font-medium text-[var(--color-mono-800)] line-clamp-1">{g.title}</p>
                      <p className="text-[10px] text-[var(--color-primary-500)] font-semibold">{g.price?.toLocaleString("ko-KR")}원</p>
                    </div>
                  </Link>
                ))}
                {/* 기존 mock 굿즈 */}
                {goods.map((g) => (
                  <a key={g.id} href={g.externalUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[var(--color-mono-080)] overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] font-medium text-[var(--color-mono-800)] line-clamp-1">{g.name}</p>
                      <p className="text-[10px] text-[var(--color-primary-500)] font-semibold">{g.price.toLocaleString()}원</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 시리즈 탭 */}
        {activeTab === "series" && (
          <div className="overflow-y-auto custom-scrollbar p-3" style={{ maxHeight: OPEN_HEIGHT - 40 }}>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {seriesBooks.map((b) => (
                <Link key={b.id} href={`/library/${b.id}`} className={`flex-shrink-0 w-20 group ${b.id === bookId ? "ring-2 ring-primary-500 rounded-lg" : ""}`}>
                  <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden bg-mono-100">
                    {b.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <Library className="w-5 h-5 text-primary-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-mono-700 font-medium mt-1 line-clamp-2 text-center">{b.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreationCard({item,cfg,Icon,onHeart,onClick}:{item:CreationItem;cfg:{label:string;gradient:string;accentColor:string;icon:React.ElementType};Icon:React.ElementType;onHeart:()=>void;onClick?:()=>void}) {
  return (
    <div onClick={onClick} className="group cursor-pointer rounded-xl overflow-hidden border border-mono-100 hover:border-mono-200 hover:shadow-lg transition-all duration-200">
      <div className="aspect-[3/4] relative overflow-hidden bg-mono-100">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${cfg.gradient} flex flex-col items-end justify-end p-2`}>
            <div className="absolute inset-0 opacity-20"><div className="absolute top-1 left-1 w-8 h-8 rounded-full bg-white/30" /><div className="absolute bottom-3 right-1 w-5 h-5 rounded-full bg-white/20" /><div className="absolute top-4 right-2 w-3 h-3 rounded-full bg-white/25" /></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"><Icon className="w-5 h-5 text-white" strokeWidth={1.5} /></div></div>
            <p className="relative text-[9px] text-white/90 font-semibold text-right line-clamp-2 leading-tight z-10">{item.title}</p>
          </div>
        )}
        <span className="absolute top-1.5 left-1.5 text-[8px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">{cfg.label}</span>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center"><div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"><Play className="w-3.5 h-3.5 text-mono-800 ml-0.5" strokeWidth={2} /></div></div>
        <button onClick={(e)=>{e.stopPropagation();onHeart();}} className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><Heart className={`w-2.5 h-2.5 ${item.hearted?"fill-red-400 text-red-400":"text-white"}`} /><span className="text-[8px] text-white font-medium">{item.hearts}</span></button>
      </div>
    </div>
  );
}

const TYPE_LABELS_MOCK: Record<string, string> = {
  sticker:"스티커", music:"음악", photo:"이미지",
  video:"영상", webtoon:"웹툰", novel:"소설",
  webdrama:"웹드라마", ai_agent:"AI", prompt:"프롬프트",
  extension:"익스텐션", goods:"굿즈",
};

const TYPE_GRADIENTS_MOCK: Record<string, string> = {
  sticker: "from-emerald-400 via-teal-500 to-cyan-600",
  music: "from-blue-400 via-blue-500 to-indigo-600",
  video: "from-red-400 via-rose-500 to-pink-600",
  webdrama: "from-red-400 via-rose-500 to-pink-600",
  webtoon: "from-orange-400 via-amber-500 to-yellow-500",
  novel: "from-violet-400 via-purple-500 to-indigo-600",
  goods: "from-orange-400 via-rose-400 to-pink-500",
};

function MockCreationCard({
  creation,
  onClick,
}: {
  creation: Creation;
  onClick: () => void;
}) {
  const gradient = TYPE_GRADIENTS_MOCK[creation.type] || "from-mono-300 via-mono-400 to-mono-500";
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl overflow-hidden border border-mono-100 hover:border-mono-200 hover:shadow-lg transition-all duration-200"
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-mono-100">
        {creation.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creation.thumbnailUrl}
            alt={creation.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-end justify-end p-2`}>
            <p className="relative text-[9px] text-white/90 font-semibold text-right line-clamp-2 leading-tight z-10">
              {creation.title}
            </p>
          </div>
        )}
        <span className="absolute top-1.5 left-1.5 text-[8px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
          {TYPE_LABELS_MOCK[creation.type] || creation.type}
        </span>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
            <Play className="w-3.5 h-3.5 text-mono-800 ml-0.5" strokeWidth={2} />
          </div>
        </div>
        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5">
          <Heart className="w-2.5 h-2.5 text-white" />
          <span className="text-[8px] text-white font-medium">{creation.likes}</span>
        </div>
      </div>
    </div>
  );
}

function MusicCard({ item, onHeart }: { item: CreationItem; onHeart: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.audioUrl && !item.audioPreviewUrl) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(item.audioPreviewUrl || item.audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden border border-mono-100 hover:border-mono-200 hover:shadow-lg transition-all duration-200">
      <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600">
        <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-30">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`w-1 rounded-full bg-white transition-all ${isPlaying ? "animate-pulse" : ""}`}
              style={{ height: `${20 + Math.sin(i * 0.8) * 15 + 5}px`, animationDelay: `${i * 0.1}s`, animationDuration: `${0.6 + i * 0.1}s` }} />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button onClick={togglePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
              item.audioUrl || item.audioPreviewUrl ? "bg-white/90 hover:bg-white hover:scale-110" : "bg-white/30 cursor-not-allowed"
            }`}>
            {isPlaying ? (
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
        </div>
        {!item.audioUrl && !item.audioPreviewUrl && (
          <div className="absolute top-1.5 right-1.5 bg-amber-400/90 text-amber-900 text-[7px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">준비중</div>
        )}
        <span className="absolute top-1.5 left-1.5 text-[8px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">음악</span>
        <button onClick={(e) => { e.stopPropagation(); onHeart(); }}
          className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className={`w-2.5 h-2.5 ${item.hearted ? "fill-red-400 text-red-400" : "text-white"}`} />
          <span className="text-[8px] text-white font-medium">{item.hearts}</span>
        </button>
        {item.musicDuration && (
          <div className="absolute bottom-1.5 left-1.5 text-[8px] text-white/80 font-medium">
            {Math.floor(item.musicDuration / 60)}:{String(item.musicDuration % 60).padStart(2, "0")}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-4">
          <p className="text-[9px] text-white/90 font-semibold line-clamp-1">{item.title}</p>
        </div>
      </div>
    </div>
  );
}
