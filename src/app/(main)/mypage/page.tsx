"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BookOpen, MessageCircle, Palette, Sparkles, Heart, X, StickyNote, Camera, Trash2 } from "lucide-react";
import { getCreations, deleteCreation, type CreationItem } from "@/lib/creation-store";
import { getNotes, deleteNote, type Note } from "@/lib/notes-store";
import { getFavorites } from "@/lib/favorites-store";
import type { Highlight } from "@/lib/highlight-store";
import { mockBooks } from "@/lib/mock-data";
import Link from "next/link";
import UserMenu from "@/components/ui/UserMenu";

const TYPE_GRADIENTS: Record<string, string> = {
  shortbook: "from-emerald-400 to-teal-600",
  shortmovie: "from-purple-400 to-violet-600",
  goods: "from-orange-400 to-rose-500",
};

export default function MyPage() {
  const { data: session } = useSession();
  const [myCreations, setMyCreations] = useState<CreationItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [favorites, setFavorites] = useState<{ bookId: string; title: string; coverImage: string }[]>([]);
  const [chatCount, setChatCount] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    setMyCreations(getCreations());
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
  }, []);

  const handleDeleteCreation = (id: string) => {
    if (!confirm("이 창작물을 삭제할까요?\n삭제 후 복구할 수 없어요.")) return;
    deleteCreation(id);
    setMyCreations(getCreations());
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
                <label className="relative cursor-pointer group/avatar block mx-auto w-20 h-20">
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    {profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-primary-100)] flex items-center justify-center text-3xl font-bold text-[var(--color-primary-600)]">{initial}</div>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center"><Camera className="w-6 h-6 text-white" /></div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { const d = ev.target?.result as string; setProfileImage(d); localStorage.setItem("metabook_profile_image", d); }; r.readAsDataURL(f); }} />
                </label>
                <h2 className="text-xl font-bold text-[var(--color-mono-990)] mt-3">{nickname}</h2>
                <p className="text-sm text-[var(--color-mono-500)]">{email}</p>
              </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "읽은 책", value: recentBooks.length, unit: "권", Icon: BookOpen, gradient: "from-[var(--color-primary-030)] to-[var(--color-primary-050)]", iconColor: "text-[var(--color-primary-500)]", valueColor: "text-[var(--color-primary-600)]" },
                { label: "AI 대화", value: aiChatCount, unit: "회", Icon: MessageCircle, gradient: "from-purple-50 to-purple-100", iconColor: "text-purple-500", valueColor: "text-purple-600" },
                { label: "내 창작물", value: myCreations.length, unit: "개", Icon: Palette, gradient: "from-amber-50 to-amber-100", iconColor: "text-amber-500", valueColor: "text-amber-600" },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-2xl p-4 bg-gradient-to-br ${stat.gradient} border border-white/50 text-center`}>
                  <div className="flex justify-center mb-2"><stat.Icon className={`w-6 h-6 ${stat.iconColor}`} /></div>
                  <p className={`text-[26px] font-bold ${stat.valueColor} leading-none mb-1`}>{stat.value}<span className="text-[14px] font-normal ml-0.5">{stat.unit}</span></p>
                  <p className="text-[11px] text-[var(--color-mono-500)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-8 min-w-0">
            {/* 내 창작물 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-mono-990)]">내 창작물</h3>
              </div>
              {myCreations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles className="w-12 h-12 text-[var(--color-mono-200)] mb-3" />
                  <p className="text-sm font-semibold text-[var(--color-mono-600)]">아직 창작물이 없어요</p>
                  <p className="text-xs text-[var(--color-mono-400)] mt-1">책을 읽고 첫 창작물을 만들어보세요!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {myCreations.map((item: CreationItem) => {
                    const gradient = TYPE_GRADIENTS[item.type] || "from-gray-400 to-gray-600";
                    return (
                      <div key={item.id} className="relative bg-white rounded-xl border border-[var(--color-mono-080)] overflow-hidden hover:shadow-md transition-shadow group">
                        <Link href={`/creations/${item.id}`}>
                          <div className="aspect-square relative overflow-hidden">
                            {item.thumbnail ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}><Palette className="w-8 h-8 text-white/60" /></div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium text-[var(--color-mono-900)] line-clamp-1">{item.title}</p>
                            <p className="text-xs text-[var(--color-mono-400)] mt-1">{new Date(item.createdAt).toLocaleDateString("ko-KR")}</p>
                          </div>
                        </Link>
                        <button onClick={() => handleDeleteCreation(item.id)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/70"
                          title="삭제">
                          <X className="w-3 h-3" />
                        </button>
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
