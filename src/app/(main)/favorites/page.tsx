"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, ArrowLeft } from "lucide-react";
import { getFavorites, removeFavorite, FavoriteItem } from "@/lib/favorites-store";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleRemove = (bookId: string) => {
    removeFavorite(bookId);
    setFavorites(getFavorites());
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
          <h1 className="text-xl font-bold text-[var(--color-mono-990)]">
            찜한 도서
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
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
                  onClick={() => router.push(`/library/${item.bookId}`)}
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
                  onClick={() => handleRemove(item.bookId)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  title="찜 해제"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[var(--color-mono-500)]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
