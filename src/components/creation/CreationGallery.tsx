"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BookOpen, Film, Gift, Heart, Sparkles } from "lucide-react";
import { getCreations, toggleHeart, type CreationItem } from "@/lib/creation-store";
import { mockBooks } from "@/lib/mock-data";
import ShortBookModal from "./ShortBookModal";
import ShortMovieModal from "./ShortMovieModal";
import GoodsModal from "./GoodsModal";

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  shortbook: { label: "숏북", color: "bg-emerald-100 text-emerald-700" },
  shortmovie: { label: "숏뮤비", color: "bg-purple-100 text-purple-700" },
  goods: { label: "굿즈", color: "bg-orange-100 text-orange-700" },
};

export default function CreationGallery() {
  const { bookId } = useParams();
  const book = mockBooks.find((b) => b.id === bookId);
  const [creations, setCreations] = useState<CreationItem[]>([]);
  const [openModal, setOpenModal] = useState<"shortbook" | "shortmovie" | "goods" | null>(null);

  useEffect(() => {
    setCreations(getCreations(bookId as string));
  }, [bookId]);

  const refreshCreations = () => {
    setCreations(getCreations(bookId as string));
  };

  const handleHeart = (id: string) => {
    toggleHeart(id);
    refreshCreations();
  };

  const ctaButtons = [
    { type: "shortbook" as const, label: "숏북 만들기", icon: BookOpen, color: "from-emerald-500 to-emerald-600" },
    { type: "shortmovie" as const, label: "숏뮤비 만들기", icon: Film, color: "from-purple-500 to-purple-600" },
    { type: "goods" as const, label: "굿즈 만들기", icon: Gift, color: "from-orange-500 to-orange-600" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* CTA 버튼 3개 */}
      <div className="flex gap-2 p-3 border-b border-mono-200 flex-shrink-0">
        {ctaButtons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => setOpenModal(btn.type)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-gradient-to-br ${btn.color} text-white hover:opacity-90 transition-opacity`}
          >
            <btn.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{btn.label}</span>
          </button>
        ))}
      </div>

      {/* 창작물 피드 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {creations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Sparkles className="w-12 h-12 text-mono-300 mb-4" />
            <p className="text-mono-700 font-semibold mb-1">아직 창작물이 없어요</p>
            <p className="text-sm text-mono-500">위 버튼을 눌러 첫 창작물을 만들어보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {creations.map((item) => {
              const badge = TYPE_BADGE[item.type];
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-mono-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* 썸네일 */}
                  <div className="aspect-square bg-gradient-to-br from-mono-100 to-mono-200 relative">
                    {item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {item.type === "shortbook" && <BookOpen className="w-8 h-8 text-mono-300" />}
                        {item.type === "shortmovie" && <Film className="w-8 h-8 text-mono-300" />}
                        {item.type === "goods" && <Gift className="w-8 h-8 text-mono-300" />}
                      </div>
                    )}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-mono-900 line-clamp-1">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-mono-500">
                        {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                      <button
                        onClick={() => handleHeart(item.id)}
                        className="flex items-center gap-1 text-xs text-mono-400 hover:text-red-400 transition-colors"
                      >
                        <Heart className={`w-3 h-3 ${item.hearted ? "fill-red-400 text-red-400" : ""}`} />
                        {item.hearts}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {openModal === "shortbook" && (
        <ShortBookModal
          bookTitle={book?.title || ""}
          bookId={bookId as string}
          onClose={() => setOpenModal(null)}
          onSaved={refreshCreations}
        />
      )}
      {openModal === "shortmovie" && (
        <ShortMovieModal
          bookTitle={book?.title || ""}
          bookId={bookId as string}
          onClose={() => setOpenModal(null)}
          onSaved={refreshCreations}
        />
      )}
      {openModal === "goods" && (
        <GoodsModal
          bookTitle={book?.title || ""}
          bookId={bookId as string}
          onClose={() => setOpenModal(null)}
          onSaved={refreshCreations}
        />
      )}
    </div>
  );
}
