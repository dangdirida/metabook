"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, ArrowLeft, BookOpen, Film, Gift } from "lucide-react";
import {
  getFavorites,
  removeFavorite,
  getFavoriteCreations,
  removeFavoriteCreation,
  type FavoriteItem,
  type FavoriteCreation,
} from "@/lib/favorites-store";

const TYPE_BADGE: Record<string, { label: string; color: string; icon: typeof BookOpen }> = {
  shortbook: { label: "숏북", color: "bg-emerald-100 text-emerald-700", icon: BookOpen },
  shortmovie: { label: "숏뮤비", color: "bg-purple-100 text-purple-700", icon: Film },
  goods: { label: "굿즈", color: "bg-orange-100 text-orange-700", icon: Gift },
};

export default function FavoritesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"books" | "creations">("books");
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [creationFavorites, setCreationFavorites] = useState<FavoriteCreation[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
    setCreationFavorites(getFavoriteCreations());
  }, []);

  const handleRemoveBook = (bookId: string) => {
    removeFavorite(bookId);
    setFavorites(getFavorites());
  };

  const handleRemoveCreation = (id: string) => {
    removeFavoriteCreation(id);
    setCreationFavorites(getFavoriteCreations());
  };

  return (
    <div className="min-h-screen bg-[var(--color-mono-010)]">
      <header className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-[var(--color-mono-050)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--color-mono-700)]" />
          </button>
          <h1 className="text-xl font-bold text-[var(--color-mono-990)]">찜 목록</h1>
        </div>

        {/* 탭 */}
        <div className="max-w-5xl mx-auto px-4 flex gap-4 border-t border-[var(--color-mono-050)]">
          <button
            onClick={() => setTab("books")}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === "books"
                ? "border-[var(--color-primary-500)] text-[var(--color-primary-500)]"
                : "border-transparent text-[var(--color-mono-400)] hover:text-[var(--color-mono-700)]"
            }`}
          >
            찜한 도서
          </button>
          <button
            onClick={() => setTab("creations")}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === "creations"
                ? "border-[var(--color-primary-500)] text-[var(--color-primary-500)]"
                : "border-transparent text-[var(--color-mono-400)] hover:text-[var(--color-mono-700)]"
            }`}
          >
            찜한 창작물
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 찜한 도서 */}
        {tab === "books" && (
          <>
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Heart className="w-16 h-16 text-[var(--color-mono-200)] mb-4" />
                <h3 className="text-lg font-semibold text-[var(--color-mono-990)] mb-2">
                  찜한 도서가 없어요
                </h3>
                <p className="text-[var(--color-mono-400)]">
                  책 읽기 화면에서 하트를 눌러 찜해보세요.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {favorites.map((item) => (
                  <div key={item.bookId} className="group relative">
                    <div
                      onClick={() => router.push(`/library/${item.bookId}/intro`)}
                      className="cursor-pointer"
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-md group-hover:-translate-y-1 transition-transform duration-300 bg-[var(--color-mono-050)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="mt-2 font-semibold text-[var(--color-mono-990)] truncate text-sm">
                        {item.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleRemoveBook(item.bookId)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="찜 해제"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[var(--color-mono-500)]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 찜한 창작물 */}
        {tab === "creations" && (
          <>
            {creationFavorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Heart className="w-16 h-16 text-[var(--color-mono-200)] mb-4" />
                <h3 className="text-lg font-semibold text-[var(--color-mono-990)] mb-2">
                  찜한 창작물이 없어요
                </h3>
                <p className="text-[var(--color-mono-400)]">
                  창작 갤러리에서 하트를 눌러 찜해보세요.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {creationFavorites.map((item) => {
                  const badge = TYPE_BADGE[item.type];
                  const Icon = badge?.icon || BookOpen;
                  return (
                    <div key={item.id} className="group relative">
                      <div className="bg-white rounded-xl border border-[var(--color-mono-080)] overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center">
                          {item.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Icon className="w-8 h-8 text-gray-300" />
                          )}
                          <span
                            className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full ${badge?.color || "bg-gray-100 text-gray-600"}`}
                          >
                            {badge?.label || item.type}
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-[var(--color-mono-990)] line-clamp-1">
                            {item.title}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCreation(item.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        title="찜 해제"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[var(--color-mono-500)]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
