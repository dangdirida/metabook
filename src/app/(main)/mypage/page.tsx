"use client";

import { useSession } from "next-auth/react";
import { BookOpen, MessageSquare, Palette, Sparkles, Heart } from "lucide-react";
import { getCreations, type CreationItem } from "@/lib/creation-store";
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
  const creations = typeof window !== "undefined" ? getCreations() : [];

  const user = session?.user;
  const nickname = user?.name || "게스트";
  const email = user?.email || "로그인이 필요합니다";
  const initial = nickname.charAt(0).toUpperCase();

  const stats = {
    booksRead: 3,
    aiChats: 24,
    creations: creations.length,
  };

  const recentBooks = mockBooks.slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--color-mono-010)]">
      {/* 헤더 */}
      <header className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/library" className="text-2xl font-bold text-[var(--color-mono-990)]">
            OGQ
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* 본문 */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">

          {/* 좌측 사이드바 */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-6">
              {/* 프로필 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-3xl font-bold text-[var(--color-primary-600)]">
                  {initial}
                </div>
                <h2 className="text-xl font-bold text-[var(--color-mono-990)] mt-3">{nickname}</h2>
                <p className="text-sm text-[var(--color-mono-500)]">{email}</p>
                <p className="text-xs text-[var(--color-mono-400)] mt-1">가입일: 2024년 10월</p>
                <button className="w-full mt-4 px-4 py-2.5 text-sm font-medium border border-[var(--color-mono-200)] rounded-xl text-[var(--color-mono-700)] hover:bg-[var(--color-mono-050)] transition-colors">
                  프로필 수정
                </button>
              </div>

              {/* 구분선 */}
              <div className="border-t border-[var(--color-mono-080)] my-5" />

              {/* 통계 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[var(--color-primary-500)]" />
                    <span className="text-sm text-[var(--color-mono-600)]">읽은 책</span>
                  </div>
                  <span className="text-2xl font-bold text-[var(--color-primary-500)]">{stats.booksRead}<span className="text-sm font-normal text-[var(--color-mono-400)] ml-0.5">권</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-[var(--color-mono-600)]">AI 대화</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-500">{stats.aiChats}<span className="text-sm font-normal text-[var(--color-mono-400)] ml-0.5">회</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-[var(--color-mono-600)]">창작물</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-500">{stats.creations}<span className="text-sm font-normal text-[var(--color-mono-400)] ml-0.5">개</span></span>
                </div>
              </div>
            </div>
          </aside>

          {/* 오른쪽 메인 콘텐츠 */}
          <div className="space-y-8 min-w-0">
            {/* 내 창작물 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-mono-990)]">내 창작물</h3>
              </div>
              {creations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles className="w-12 h-12 text-[var(--color-mono-200)] mb-3" />
                  <p className="text-sm font-semibold text-[var(--color-mono-600)]">아직 창작물이 없어요</p>
                  <p className="text-xs text-[var(--color-mono-400)] mt-1">책을 읽고 첫 창작물을 만들어보세요!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {creations.map((item: CreationItem) => {
                    const gradient = TYPE_GRADIENTS[item.type] || "from-gray-400 to-gray-600";
                    return (
                      <Link
                        key={item.id}
                        href={`/creations/${item.id}`}
                        className="bg-white rounded-xl border border-[var(--color-mono-080)] overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-square relative overflow-hidden">
                          {item.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                              <Palette className="w-8 h-8 text-white/60" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-[var(--color-mono-900)] line-clamp-1">{item.title}</p>
                          <p className="text-xs text-[var(--color-mono-400)] mt-1">
                            {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 최근 읽은 책 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-mono-990)]">최근 읽은 책</h3>
                <Link href="/library" className="text-sm text-[var(--color-primary-500)] hover:underline">전체보기</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {recentBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/library/${book.id}`}
                    className="flex-shrink-0 w-28 group"
                  >
                    <div className="w-28 aspect-[3/4] rounded-lg overflow-hidden bg-[var(--color-mono-050)] shadow-sm group-hover:shadow-md transition-shadow">
                      {book.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-[var(--color-primary-300)]" />
                        </div>
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
              <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] flex flex-col items-center justify-center py-12 text-center">
                <Heart className="w-12 h-12 text-[var(--color-mono-200)] mb-3" />
                <p className="text-sm font-semibold text-[var(--color-mono-600)]">찜한 책이 없어요</p>
                <p className="text-xs text-[var(--color-mono-400)] mt-1">마음에 드는 책에 하트를 눌러보세요!</p>
                <Link
                  href="/library"
                  className="mt-4 px-4 py-2 text-sm font-medium bg-[var(--color-primary-500)] text-white rounded-xl hover:bg-[var(--color-primary-600)] transition-colors"
                >
                  도서관 둘러보기
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
