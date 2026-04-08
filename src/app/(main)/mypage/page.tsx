"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BookOpen, MessageCircle, Palette, Sparkles, Heart, X, StickyNote, Camera, Trash2 } from "lucide-react";
import CreationThumbnail from "@/components/CreationThumbnail";
import { getCreations, deleteCreation, type CreationItem } from "@/lib/creation-store";
import { getNotes, deleteNote, type Note } from "@/lib/notes-store";
import { getFavorites } from "@/lib/favorites-store";
import type { Highlight } from "@/lib/highlight-store";
import { mockBooks } from "@/lib/mock-data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserMenu from "@/components/ui/UserMenu";

const TYPE_GRADIENTS: Record<string, string> = {
  shortbook: "from-emerald-400 to-teal-600",
  shortmovie: "from-purple-400 to-violet-600",
  goods: "from-orange-400 to-rose-500",
};

interface MyCreationItem {
  id: string;
  type: string;
  title: string;
  thumbnail?: string;
  thumbnailDataUrl?: string;
  createdAt: string;
  bookId?: string;
  bookTitle?: string;
  _source: "local" | "goods";
  _goodsId?: string;
}

export default function MyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [myCreations, setMyCreations] = useState<MyCreationItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [favorites, setFavorites] = useState<{ bookId: string; title: string; coverImage: string }[]>([]);
  const [chatCount, setChatCount] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [userProfile, setUserProfile] = useState<{ name?: string; avatar?: string } | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    // localStorage 창작물
    const localItems: MyCreationItem[] = getCreations().map((c) => ({
      id: c.id, type: c.type, title: c.title, thumbnail: c.thumbnail,
      createdAt: c.createdAt, bookId: c.bookId, bookTitle: c.bookTitle, _source: "local" as const,
    }));

    // Firestore 굿즈 창작물
    fetch("/api/goods-creations?limit=50")
      .then((r) => r.json())
      .then((d) => {
        const goodsItems: MyCreationItem[] = (d.items || []).map((g: { id: string; title: string; bookId: string; bookTitle?: string; thumbnailDataUrl?: string; createdAt: string; productType?: string }) => ({
          id: `goods-${g.id}`, type: g.productType === "sticker" ? "sticker" : "goods",
          title: g.title, thumbnailDataUrl: g.thumbnailDataUrl,
          createdAt: g.createdAt || new Date().toISOString(),
          bookId: g.bookId, bookTitle: g.bookTitle, _source: "goods" as const, _goodsId: g.id,
        }));
        const all = [...localItems, ...goodsItems].sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setMyCreations(all);
      })
      .catch(() => setMyCreations(localItems));

    setNotes(getNotes());
    const savedImg = localStorage.getItem("metabook_profile_image");
    if (savedImg) setProfileImage(savedImg);
    setFavorites(getFavorites());
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("chat_")) { try { total += JSON.parse(localStorage.getItem(k) || "[]").length; } catch { /* */ } }
    }
    setChatCount(total);
    try { setHighlights(JSON.parse(localStorage.getItem("metabook_highlights") || "[]")); } catch { setHighlights([]); }
    // 유저 프로필 로드
    fetch("/api/user/profile").then((r) => r.json()).then((d) => {
      if (d.profile) { setUserProfile(d.profile); setEditName(d.profile.name || ""); }
    }).catch(() => {});
  }, []);

  const handleDeleteCreation = async (item: MyCreationItem) => {
    if (!confirm("이 창작물을 삭제할까요?\n삭제 후 복구할 수 없어요.")) return;
    if (item._source === "goods" && item._goodsId) {
      try {
        const res = await fetch(`/api/goods-creations/${item._goodsId}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
      } catch { alert("삭제에 실패했어요."); return; }
    } else {
      deleteCreation(item.id);
    }
    setMyCreations((prev) => prev.filter((c) => c.id !== item.id));
  };

  const user = session?.user;
  const nickname = user?.name || "게스트";
  const email = user?.email || "로그인이 필요합니다";
  const initial = nickname.charAt(0).toUpperCase();
  const recentBooks = mockBooks.slice(0, 5);

  const aiChatCount = chatCount;

  return (
    <div className="min-h-screen bg-[var(--color-mono-010)]">
      <header className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Link href="/library"><img src="/logo_ogq_green.png" alt="OGQ" className="h-7 w-auto" /></Link>
          <UserMenu />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-6">
              <div className="flex flex-col items-center text-center">
                {/* 프사 */}
                <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 12px" }}>
                  {(userProfile?.avatar || session?.user?.image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userProfile?.avatar || session?.user?.image || ""} alt="프로필"
                      style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }} />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "white", border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                      {initial}
                    </div>
                  )}
                </div>
                {/* 닉네임 편집 */}
                {editingProfile ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)}
                      style={{ textAlign: "center", fontSize: 15, fontWeight: 600, border: "1.5px solid #10b981", borderRadius: 8, padding: "4px 10px", width: "80%" }} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={async () => {
                        await fetch("/api/user/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editName }) });
                        setUserProfile((p) => ({ ...p, name: editName }));
                        setEditingProfile(false);
                      }} style={{ padding: "4px 14px", borderRadius: 8, border: "none", background: "#10b981", color: "white", fontSize: 12, cursor: "pointer" }}>저장</button>
                      <button onClick={() => setEditingProfile(false)}
                        style={{ padding: "4px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", fontSize: 12, cursor: "pointer" }}>취소</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 17, fontWeight: 600, color: "#262d2e" }}>{userProfile?.name || nickname}</div>
                    <p className="text-sm text-[var(--color-mono-500)]" style={{ marginTop: 2 }}>{email}</p>
                    <button onClick={() => { setEditName(userProfile?.name || nickname); setEditingProfile(true); }}
                      style={{ marginTop: 6, fontSize: 12, color: "#7c9295", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 2 }}>
                      프로필 편집
                    </button>
                  </div>
                )}
              </div>
              {/* 통계 */}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                {[
                  { value: recentBooks.length, label: "읽은 책" },
                  { value: aiChatCount, label: "AI 대화" },
                  { value: myCreations.length, label: "내 창작물" },
                ].map((s) => (
                  <div key={s.label} style={{ flex: 1, background: "#f3f6f6", borderRadius: 12, padding: "14px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#262d2e", lineHeight: 1, marginBottom: 5 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#7c9295", fontWeight: 400, letterSpacing: "0.02em" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-8 min-w-0">
            {/* 내 창작물 */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 className="text-lg font-bold text-[var(--color-mono-990)]">내 창작물</h3>
                {myCreations.length > 4 && (
                  <button onClick={() => router.push("/mypage/creations")}
                    style={{ fontSize: 13, color: "#10b981", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                    전체보기
                  </button>
                )}
              </div>
              {myCreations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles className="w-12 h-12 text-[var(--color-mono-200)] mb-3" />
                  <p className="text-sm font-semibold text-[var(--color-mono-600)]">아직 창작물이 없어요</p>
                  <p className="text-xs text-[var(--color-mono-400)] mt-1">책을 읽고 첫 창작물을 만들어보세요!</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {myCreations.slice(0, 4).map((item) => {
                    const thumbSrc = item.thumbnail || item.thumbnailDataUrl;
                    const isGoods = item._source === "goods";
                    const href = isGoods && item._goodsId ? `/goods/${item._goodsId}` : `/creations/${item.id}`;
                    return (
                      <div key={item.id} style={{ position: "relative", cursor: "pointer" }} className="group" onClick={() => router.push(href)}>
                        <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 6, border: "1px solid #f0f0f0" }}>
                          <CreationThumbnail item={{ id: item.id, type: item.type, title: item.title, imageUrl: thumbSrc, bookTitle: item.bookTitle }} />
                        </div>
                        <div style={{ fontSize: 12, color: "#374151", fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.title}</div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCreation(item); }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          style={{ fontSize: 10 }}>✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 독서 노트 */}
            {notes.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-[var(--color-mono-990)]">독서 노트</h3>
                  <span className="text-[12px] text-[var(--color-mono-400)]">{notes.length}개</span>
                </div>
                <div className="space-y-3">
                  {notes.slice(0, 5).map((note) => (
                    <div key={note.id} className="bg-white rounded-xl p-4 border border-[var(--color-mono-080)]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-[var(--color-mono-400)] mb-1.5">{note.bookTitle} · {note.chapterTitle}</p>
                          <p className="text-[13px] text-[var(--color-mono-700)] leading-relaxed border-l-2 border-[var(--color-primary-300)] pl-3 italic">&quot;{note.text}&quot;</p>
                        </div>
                        <button onClick={() => { deleteNote(note.id); setNotes(getNotes()); }}
                          className="p-1 text-[var(--color-mono-300)] hover:text-red-400 transition-colors flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {notes.length > 5 && <p className="text-[12px] text-[var(--color-primary-500)] text-center">+{notes.length - 5}개 더 있어요</p>}
                </div>
              </section>
            )}

            {/* 최근 읽은 책 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-mono-990)]">최근 읽은 책</h3>
                <Link href="/library" className="text-sm text-[var(--color-primary-500)] hover:underline">전체보기</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {recentBooks.map((book) => (
                  <Link key={book.id} href={`/library/${book.id}/intro`} className="flex-shrink-0 w-28 group">
                    <div className="w-28 aspect-[3/4] rounded-lg overflow-hidden bg-[var(--color-mono-050)] shadow-sm group-hover:shadow-md transition-shadow">
                      {book.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] flex items-center justify-center"><BookOpen className="w-6 h-6 text-[var(--color-primary-300)]" /></div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[var(--color-mono-900)] mt-2 line-clamp-2">{book.title}</p>
                    <p className="text-[10px] text-[var(--color-mono-400)]">{book.author}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* 찜한 책 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-mono-990)]">찜한 책</h3>
              </div>
              {favorites.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] flex flex-col items-center justify-center py-12 text-center">
                  <Heart className="w-12 h-12 text-[var(--color-mono-200)] mb-3" />
                  <p className="text-sm font-semibold text-[var(--color-mono-600)]">찜한 책이 없어요</p>
                  <p className="text-xs text-[var(--color-mono-400)] mt-1">마음에 드는 책에 하트를 눌러보세요!</p>
                  <Link href="/library" className="mt-4 px-4 py-2 text-sm font-medium bg-[var(--color-primary-500)] text-white rounded-xl hover:bg-[var(--color-primary-600)] transition-colors">도서관 둘러보기</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.map((fav) => (
                    <div key={fav.bookId} className="bg-white rounded-xl border border-[var(--color-mono-080)] p-3">
                      <Link href={`/library/${fav.bookId}/intro`} className="block">
                        <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-[var(--color-mono-050)] mb-2">
                          {fav.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={fav.coverImage} alt={fav.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)]" />
                          )}
                        </div>
                        <p className="text-[13px] font-medium text-[var(--color-mono-900)] line-clamp-1">{fav.title}</p>
                      </Link>
                      <div className="flex gap-1.5 mt-2">
                        <Link href={`/chat?bookId=${fav.bookId}`} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--color-primary-030)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-050)] transition-colors">
                          <MessageCircle className="w-3 h-3" />채팅
                        </Link>
                        <Link href={`/library/${fav.bookId}/intro`} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--color-mono-050)] text-[var(--color-mono-600)] hover:bg-[var(--color-mono-080)] transition-colors">
                          <BookOpen className="w-3 h-3" />읽기
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 하이라이트 */}
            {highlights.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-bold text-[var(--color-mono-900)]">하이라이트</h3>
                  <span className="text-[12px] text-[var(--color-mono-400)]">{highlights.length}개</span>
                </div>
                <div className="space-y-2">
                  {highlights.slice(0, 5).map((h) => {
                    const cm: Record<string, string> = { yellow: "#FEF08A", green: "#BBF7D0", pink: "#FBCFE8", blue: "#BFDBFE" };
                    return (
                      <div key={h.id} className="bg-white rounded-xl p-4 border border-[var(--color-mono-080)] flex gap-3">
                        <div className="w-1 rounded-full flex-shrink-0 self-stretch" style={{ backgroundColor: cm[h.color] ?? "#FEF08A" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-[var(--color-mono-400)] mb-1">{h.bookId}</p>
                          <p className="text-[13px] text-[var(--color-mono-800)] leading-relaxed"><span style={{ backgroundColor: cm[h.color] ?? "#FEF08A", borderRadius: 4, padding: "1px 4px" }}>{h.text}</span></p>
                        </div>
                      </div>
                    );
                  })}
                  {highlights.length > 5 && <p className="text-[12px] text-[var(--color-primary-500)] text-center py-1">+{highlights.length - 5}개 더 있어요</p>}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
