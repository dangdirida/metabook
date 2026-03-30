"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, MessageSquare, Palette, Sparkles, Heart } from "lucide-react";
import { getCreations, type CreationItem } from "@/lib/creation-store";
import Link from "next/link";

const TYPE_GRADIENTS: Record<string, string> = {
  shortbook: "from-emerald-400 to-teal-600",
  shortmovie: "from-purple-400 to-violet-600",
  goods: "from-orange-400 to-rose-500",
};

export default function MyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const creations = typeof window !== "undefined" ? getCreations() : [];

  const user = session?.user;
  const nickname = user?.name || "게스트";
  const email = user?.email || "로그인이 필요합니다";
  const initial = nickname.charAt(0).toUpperCase();

  // Mock 통계
  const stats = {
    booksRead: 3,
    aiChats: 24,
    creations: creations.length,
  };

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
          <h1 className="text-lg font-bold text-[var(--color-mono-990)]">마이페이지</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* 프로필 영역 */}
        <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-2xl font-bold text-[var(--color-primary-600)]">
              {initial}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[var(--color-mono-990)]">{nickname}</h2>
              <p className="text-sm text-[var(--color-mono-500)]">{email}</p>
              <p className="text-xs text-[var(--color-mono-400)] mt-1">가입일: 2024년 10월</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium border border-[var(--color-mono-200)] rounded-xl text-[var(--color-mono-700)] hover:bg-[var(--color-mono-050)] transition-colors">
              프로필 수정
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-050)] flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-5 h-5 text-[var(--color-primary-500)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--color-mono-990)]">{stats.booksRead}</p>
            <p className="text-xs text-[var(--color-mono-500)] mt-1">읽은 책</p>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--color-mono-990)]">{stats.aiChats}</p>
            <p className="text-xs text-[var(--color-mono-500)] mt-1">AI 대화</p>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <Palette className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--color-mono-990)]">{stats.creations}</p>
            <p className="text-xs text-[var(--color-mono-500)] mt-1">창작물</p>
          </div>
        </div>

        {/* 내 창작물 */}
        <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-mono-050)]">
            <h3 className="text-lg font-bold text-[var(--color-mono-990)]">내 창작물</h3>
          </div>
          {creations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="w-12 h-12 text-[var(--color-mono-200)] mb-3" />
              <p className="text-sm font-semibold text-[var(--color-mono-600)]">아직 창작물이 없어요</p>
              <p className="text-xs text-[var(--color-mono-400)] mt-1">책을 읽고 첫 창작물을 만들어보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-4">
              {creations.map((item: CreationItem) => {
                const gradient = TYPE_GRADIENTS[item.type] || "from-gray-400 to-gray-600";
                return (
                  <Link
                    key={item.id}
                    href={`/creations/${item.id}`}
                    className="rounded-xl border border-[var(--color-mono-080)] overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video relative overflow-hidden">
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
        </div>

        {/* 찜한 책 */}
        <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-mono-050)]">
            <h3 className="text-lg font-bold text-[var(--color-mono-990)]">찜한 책</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
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
        </div>
      </div>
    </div>
  );
}
