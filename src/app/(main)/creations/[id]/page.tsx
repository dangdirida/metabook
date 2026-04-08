"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, ExternalLink, Palette, BookOpen, Film, Gift, Share2, Bookmark, Eye } from "lucide-react";
import { getCreationById, getCreationsByBookId } from "@/lib/mock-creations";
import { getCreations, type CreationItem } from "@/lib/creation-store";
import { getBookById } from "@/lib/mock-data";
import type { Creation } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  sticker: "스티커", music: "음악", photo: "이미지", video: "영상",
  webtoon: "웹툰", novel: "소설", webdrama: "웹드라마", ai_agent: "AI Agent",
  prompt: "프롬프트", extension: "익스텐션", goods: "굿즈",
  shortbook: "숏북", shortmovie: "숏뮤비",
};

const TYPE_GRADIENTS: Record<string, string> = {
  sticker: "from-yellow-400 to-orange-500", music: "from-blue-400 to-indigo-500",
  photo: "from-emerald-400 to-teal-500", video: "from-red-400 to-rose-500",
  webtoon: "from-orange-400 to-amber-500", novel: "from-violet-400 to-purple-500",
  shortbook: "from-emerald-400 to-teal-600", shortmovie: "from-purple-400 to-violet-600",
  goods: "from-orange-400 to-rose-500",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  shortbook: BookOpen, shortmovie: Film, goods: Gift,
};

interface NormalizedCreation {
  id: string; title: string; type: string; userName: string;
  description: string; content: string; likes: number; createdAt: string;
  tags: string[]; ogqUrl?: string; thumbnail?: string; bookId: string;
  audioUrl?: string; images?: string[]; genre?: string; moods?: string[];
  style?: string; price?: number;
}

function normalizeFromMock(c: Creation): NormalizedCreation {
  return { id: c.id, title: c.title, type: c.type, userName: c.userName, description: c.description,
    content: "", likes: c.likes, createdAt: c.createdAt, tags: c.tags, ogqUrl: c.ogqUrl,
    thumbnail: c.thumbnailUrl, bookId: c.bookId };
}

function normalizeFromStore(c: CreationItem): NormalizedCreation {
  return { id: c.id, title: c.title, type: c.type, userName: "나", description: "",
    content: c.content, likes: c.hearts, createdAt: c.createdAt, tags: [],
    ogqUrl: undefined, thumbnail: c.thumbnail || undefined, bookId: c.bookId };
}

export default function CreationDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const mockItem = getCreationById(id as string);
  const [storeItem, setStoreItem] = useState(() => {
    return null as ReturnType<typeof getCreations>[number] | null;
  });
  const [firestoreItem, setFirestoreItem] = useState<NormalizedCreation | null>(null);
  useEffect(() => {
    const items = getCreations();
    const found = items.find((c) => c.id === id) || null;
    setStoreItem(found);
    // Firestore에서도 조회 시도
    if (!found && !mockItem) {
      fetch(`/api/creations/${id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.item) {
            setFirestoreItem({
              id: d.item.id, title: d.item.title || "", type: d.item.type || d.item.productType || "goods",
              userName: d.item.userName || d.item.userId || "anonymous", description: d.item.description || "",
              content: d.item.content || "", likes: d.item.likes || 0,
              createdAt: d.item.createdAt || new Date().toISOString(), tags: d.item.tags || [],
              ogqUrl: undefined, thumbnail: d.item.thumbnailUrl || d.item.thumbnailDataUrl || d.item.imageUrl || undefined,
              bookId: d.item.bookId || "", audioUrl: d.item.audioUrl, images: d.item.images,
              genre: d.item.genre, moods: d.item.moods, style: d.item.style, price: d.item.price,
            });
          }
        })
        .catch(() => {});
    }
  }, [id, mockItem]);

  const creation: NormalizedCreation | null = mockItem
    ? normalizeFromMock(mockItem)
    : storeItem ? normalizeFromStore(storeItem) : firestoreItem;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(creation?.likes || 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    const likedList = JSON.parse(localStorage.getItem("liked_creations") || "[]");
    const bookmarkedList = JSON.parse(localStorage.getItem("bookmarked_creations") || "[]");
    setLiked(likedList.includes(id));
    setBookmarked(bookmarkedList.includes(id));
  }, [id]);

  const toggleLike = () => {
    const likedList: string[] = JSON.parse(localStorage.getItem("liked_creations") || "[]");
    if (liked) {
      localStorage.setItem("liked_creations", JSON.stringify(likedList.filter((i) => i !== id)));
      setLikeCount((c) => c - 1);
    } else {
      localStorage.setItem("liked_creations", JSON.stringify([...likedList, id]));
      setLikeCount((c) => c + 1);
    }
    setLiked(!liked);
  };

  const toggleBookmark = () => {
    const list: string[] = JSON.parse(localStorage.getItem("bookmarked_creations") || "[]");
    if (bookmarked) {
      localStorage.setItem("bookmarked_creations", JSON.stringify(list.filter((i) => i !== id)));
    } else {
      localStorage.setItem("bookmarked_creations", JSON.stringify([...list, id]));
    }
    setBookmarked(!bookmarked);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  if (!creation) {
    return (
      <div className="min-h-screen bg-[var(--color-mono-010)] flex flex-col items-center justify-center">
        <Palette className="w-16 h-16 text-[var(--color-mono-200)] mb-4" />
        <p className="text-lg font-semibold text-[var(--color-mono-600)]">창작물을 찾을 수 없어요</p>
        <p className="text-sm text-[var(--color-mono-400)] mt-1">삭제되었거나 존재하지 않는 창작물입니다</p>
        <button onClick={() => router.back()}
          className="mt-6 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-medium hover:bg-[var(--color-primary-600)] transition-colors">
          <ArrowLeft className="w-4 h-4" />돌아가기
        </button>
      </div>
    );
  }

  const gradient = TYPE_GRADIENTS[creation.type] || "from-gray-400 to-gray-600";
  const Icon = TYPE_ICONS[creation.type] || Palette;
  const bodyText = creation.content || creation.description;
  const formattedDate = new Date(creation.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  const relatedCreations = getCreationsByBookId(creation.bookId).filter((c) => c.id !== id).slice(0, 4);
  const book = getBookById(creation.bookId);

  return (
    <div className="min-h-screen bg-[var(--color-mono-030)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[var(--color-mono-080)]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-mono-600)] hover:text-[var(--color-mono-900)] transition-colors">
            <ArrowLeft className="w-4 h-4" />돌아가기
          </button>
          <div className="flex items-center gap-1">
            <button onClick={toggleBookmark}
              className={`p-2 rounded-xl transition-colors ${bookmarked ? "text-[var(--color-primary-500)] bg-[var(--color-primary-030)]" : "text-[var(--color-mono-400)] hover:bg-[var(--color-mono-050)]"}`}>
              <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
            </button>
            <button onClick={handleShare}
              className="p-2 rounded-xl text-[var(--color-mono-400)] hover:bg-[var(--color-mono-050)] transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          {/* 왼쪽 컬럼 */}
          <div className="space-y-4">
            {/* 썸네일 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm relative">
              <div className={`overflow-hidden ${creation.type === "goods" || creation.type === "sticker" ? "aspect-square bg-white flex items-center justify-center p-6" : "aspect-[16/9]"}`}>
                {creation.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={creation.thumbnail} alt={creation.title} className={creation.type === "goods" || creation.type === "sticker" ? "max-w-full max-h-full object-contain" : "w-full h-full object-cover"} />
                ) : creation.type === "shortbook" ? (
                  <div className="w-full h-full relative" style={{ background: "linear-gradient(145deg, #fff 0%, #f8f9fa 100%)", aspectRatio: "16/9" }}>
                    <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 22px, #f0f0f0 22px, #f0f0f0 23px)", opacity: 0.5 }} />
                    <div className="relative z-[1] w-full h-full flex items-center justify-center px-8">
                      <p className="text-[16px] font-bold text-[var(--color-mono-800)] text-center leading-relaxed line-clamp-3">{creation.title}</p>
                    </div>
                  </div>
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon className="w-24 h-24 text-white/60" />
                  </div>
                )}
              </div>
              <span className="absolute top-4 left-4 px-3 py-1 text-[11px] font-semibold bg-black/50 text-white rounded-full backdrop-blur-sm">
                {TYPE_LABELS[creation.type] || creation.type}
              </span>
              <span className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-black/40 text-white text-[11px] rounded-full backdrop-blur-sm">
                <Eye className="w-3 h-3" />{(likeCount * 8 + 120).toLocaleString()}
              </span>
            </div>

            {/* 제목 + 메타 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[var(--color-primary-030)] text-[var(--color-primary-700)] mb-3">
                {TYPE_LABELS[creation.type] || creation.type}
              </span>
              <h1 className="text-[22px] md:text-[26px] font-bold text-[var(--color-mono-990)] leading-tight mb-4">{creation.title}</h1>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center">
                    <span className="text-[13px] font-bold text-[var(--color-primary-600)]">{creation.userName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--color-mono-800)]">{creation.userName}</p>
                    <p className="text-[11px] text-[var(--color-mono-400)]">{formattedDate}</p>
                  </div>
                </div>
                <button onClick={toggleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-[13px] transition-all ${liked ? "bg-red-50 text-red-500 border border-red-200" : "bg-[var(--color-mono-050)] text-[var(--color-mono-500)] hover:bg-red-50 hover:text-red-400 border border-transparent"}`}>
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />{likeCount}
                </button>
              </div>
              <hr className="border-[var(--color-mono-080)] mb-5" />
              {/* 음악 전용: 오디오 플레이어 */}
              {creation.type === "music" && creation.audioUrl && (
                <div className="mb-5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-5">
                  <p className="text-[13px] font-semibold text-indigo-700 mb-3">오디오 재생</p>
                  <audio controls src={creation.audioUrl} className="w-full" style={{ borderRadius: 8 }} />
                  {creation.genre && <p className="text-[12px] text-indigo-500 mt-2">장르: {creation.genre}{creation.moods?.length ? ` · ${creation.moods.join(", ")}` : ""}</p>}
                </div>
              )}

              {/* 스티커 전용: 이미지 그리드 */}
              {(creation.type === "sticker" || creation.type === "goods") && creation.images && creation.images.length > 0 && (
                <div className="mb-5">
                  <p className="text-[13px] font-semibold text-[var(--color-mono-700)] mb-3">스티커 전체 ({creation.images.length}종)</p>
                  <div className="grid grid-cols-6 gap-2">
                    {creation.images.map((img, i) => (
                      <div key={i} className="aspect-square bg-white border border-[var(--color-mono-080)] rounded-lg flex items-center justify-center p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`스티커 ${i + 1}`} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bodyText && (
                <div className="mb-5">
                  <p className="text-[14px] font-semibold text-[var(--color-mono-700)] mb-2">{creation.type === "shortbook" ? "본문" : "소개"}</p>
                  <p className="text-[14px] text-[var(--color-mono-700)] leading-relaxed whitespace-pre-wrap bg-[var(--color-mono-030)] rounded-xl p-4">{bodyText}</p>
                </div>
              )}
              {creation.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {creation.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--color-mono-050)] text-[var(--color-mono-600)] border border-[var(--color-mono-080)] hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-030)] hover:text-[var(--color-primary-600)] transition-colors cursor-default">
                      # {tag}
                    </span>
                  ))}
                </div>
              )}
              {creation.ogqUrl && (
                <a href={creation.ogqUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--color-primary-500)] text-white text-[14px] font-semibold hover:bg-[var(--color-primary-600)] transition-colors">
                  <ExternalLink className="w-4 h-4" />OGQ Market에서 구매하기
                </a>
              )}
            </div>

            {/* 관련 창작물 */}
            {relatedCreations.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-[15px] font-bold text-[var(--color-mono-900)] mb-4">같은 책의 다른 창작물</h2>
                <div className="grid grid-cols-2 gap-3">
                  {relatedCreations.map((rc) => (
                    <Link key={rc.id} href={`/creations/${rc.id}`}
                      className="group rounded-xl overflow-hidden border border-[var(--color-mono-080)] hover:border-[var(--color-primary-300)] hover:shadow-md transition-all">
                      <div className={`aspect-video bg-gradient-to-br ${TYPE_GRADIENTS[rc.type] || "from-gray-300 to-gray-400"} flex items-center justify-center`}>
                        <Palette className="w-6 h-6 text-white/70" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-[12px] font-medium text-[var(--color-mono-800)] line-clamp-1">{rc.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-[var(--color-mono-400)]">{rc.userName}</span>
                          <span className="flex items-center gap-0.5 text-[10px] text-[var(--color-mono-400)]"><Heart className="w-3 h-3" />{rc.likes}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="space-y-4">
            {/* 원작 도서 */}
            {book && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider mb-3">원작 도서</p>
                <Link href={`/library/${book.id}/intro`} className="flex gap-3 group">
                  {book.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={book.coverImage} alt={book.title} className="w-16 h-22 object-cover rounded-lg flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[var(--color-mono-900)] line-clamp-2 mb-1 group-hover:text-[var(--color-primary-600)] transition-colors">{book.title}</p>
                    <p className="text-[11px] text-[var(--color-mono-500)] mb-2">{book.author}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-primary-600)] bg-[var(--color-primary-030)] px-2 py-0.5 rounded-full">
                      <BookOpen className="w-3 h-3" />책 읽으러 가기
                    </span>
                  </div>
                </Link>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[var(--color-mono-080)]">
                  <div className="text-center">
                    <p className="text-[18px] font-bold text-[var(--color-mono-900)]">{book.communityMemberCount?.toLocaleString()}</p>
                    <p className="text-[10px] text-[var(--color-mono-400)]">커뮤니티</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[18px] font-bold text-[var(--color-mono-900)]">{book.creationCount}</p>
                    <p className="text-[10px] text-[var(--color-mono-400)]">창작물</p>
                  </div>
                </div>
              </div>
            )}

            {/* 창작자 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider mb-3">창작자</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[16px] font-bold text-[var(--color-primary-600)]">{creation.userName.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--color-mono-900)]">{creation.userName}</p>
                  <p className="text-[11px] text-[var(--color-mono-400)] mt-0.5">독자 크리에이터</p>
                </div>
              </div>
            </div>

            {/* 공유 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider mb-3">공유하기</p>
              <button onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--color-mono-100)] text-[13px] font-medium text-[var(--color-mono-600)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-600)] hover:bg-[var(--color-primary-030)] transition-all">
                <Share2 className="w-4 h-4" />링크 복사
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 토스트 */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-mono-900)] text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--color-primary-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          링크가 복사됐어요!
        </div>
      )}
    </div>
  );
}
