"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, ChevronDown, Globe, QrCode } from "lucide-react";
import { mockBooks, getBookById } from "@/lib/mock-data";
import type { Book } from "@/types";
import QRGenerator from "@/components/ui/QRGenerator";

export default function LeftPanel() {
  const { bookId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");
  const [expandedBookId, setExpandedBookId] = useState<string | null>(
    bookId as string
  );
  const [showQR, setShowQR] = useState<string | null>(null);

  const currentBook = getBookById(bookId as string);

  // 내 서재 (QR 진입했거나 현재 보는 책)
  const myBooks = mockBooks.filter((b) => b.id === bookId);
  const displayBooks = activeTab === "my" ? myBooks : mockBooks;

  return (
    <aside className="w-full md:w-[280px] border-r border-mono-200 overflow-y-auto custom-scrollbar flex-shrink-0 bg-white">
      {/* 현재 책 표지 + 제목 */}
      {currentBook && (
        <div className="p-4 border-b border-mono-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-mono-100">
              {currentBook.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentBook.coverImage} alt={currentBook.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-500" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-mono-900 text-sm truncate">
                {currentBook.title}
              </p>
              <p className="text-xs text-mono-500">{currentBook.author}</p>
            </div>
          </div>
        </div>
      )}

      {/* 내 서재 / 전체 도서 탭 */}
      <div className="flex border-b border-mono-200">
        <button
          onClick={() => setActiveTab("my")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "my"
              ? "text-primary-500 border-b-2 border-primary-500"
              : "text-mono-500 hover:text-mono-700"
          }`}
        >
          내 서재
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "text-primary-500 border-b-2 border-primary-500"
              : "text-mono-500 hover:text-mono-700"
          }`}
        >
          전체 도서
        </button>
      </div>

      {/* 책 목록 */}
      <div className="p-2">
        {displayBooks.map((book) => (
          <BookItem
            key={book.id}
            book={book}
            isActive={book.id === bookId}
            isExpanded={expandedBookId === book.id}
            onSelect={() => router.push(`/library/${book.id}`)}
            onToggleExpand={() =>
              setExpandedBookId(
                expandedBookId === book.id ? null : book.id
              )
            }
            onShowQR={(imageId) => setShowQR(imageId)}
          />
        ))}
      </div>

      {/* QR 모달 */}
      {showQR && (
        <QRGenerator
          url={`${typeof window !== "undefined" ? window.location.origin : ""}/world/${bookId}/${showQR}`}
          onClose={() => setShowQR(null)}
        />
      )}
    </aside>
  );
}

function BookItem({
  book,
  isActive,
  isExpanded,
  onSelect,
  onToggleExpand,
  onShowQR,
}: {
  book: Book;
  isActive: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onShowQR: (imageId: string) => void;
}) {
  // book.images에서 앞 4개만 사용, 없으면 빈 배열
  const displayImages = book.images?.slice(0, 4) ?? [];

  return (
    <div className="mb-1">
      <div
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
          isActive ? "bg-primary-50" : "hover:bg-mono-50"
        }`}
      >
        <div
          onClick={onSelect}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <div className="w-8 h-10 rounded flex-shrink-0 overflow-hidden bg-mono-100">
            {book.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-500" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-mono-900 truncate">
              {book.title}
            </p>
            <p className="text-xs text-mono-500 truncate">{book.author}</p>
          </div>
        </div>
        <button
          onClick={onToggleExpand}
          className="p-1 hover:bg-mono-100 rounded transition-colors"
        >
          <ChevronDown
            className={`w-4 h-4 text-mono-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* 이미지 탐색 아코디언 */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-2 gap-2 p-2 pl-12">
          {displayImages.map((img, idx) => (
            <div key={img.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all bg-mono-100">
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.alt || `삽화 ${idx + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-mono-100 to-mono-200 flex items-center justify-center">
                    <span className="text-xs text-mono-400">삽화 {idx + 1}</span>
                  </div>
                )}
                <div className="absolute bottom-1 right-1">
                  <Globe className="w-3.5 h-3.5 text-white drop-shadow" />
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowQR(img.id);
                }}
                className="absolute top-1 right-1 p-0.5 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <QrCode className="w-3 h-3 text-mono-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

