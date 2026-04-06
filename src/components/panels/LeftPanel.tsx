"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, ChevronDown, Globe, QrCode, Image as ImageIcon } from "lucide-react";
import { mockBooks, getBookById } from "@/lib/mock-data";
import type { Book } from "@/types";
import QRGenerator from "@/components/ui/QRGenerator";

export default function LeftPanel() {
  const { bookId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");
  const [expandedBookId, setExpandedBookId] = useState<string | null>(bookId as string);
  const [showQR, setShowQR] = useState<string | null>(null);
  const currentBook = getBookById(bookId as string);
  const myBooks = mockBooks.filter((b) => b.id === bookId);
  const displayBooks = activeTab === "my" ? myBooks : mockBooks;

  return (
    <aside className="w-full md:w-[280px] border-r border-[var(--color-mono-080)] overflow-y-auto custom-scrollbar flex-shrink-0 bg-white font-sans">
      {currentBook && (
        <div className="p-4 border-b border-[var(--color-mono-080)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-mono-100 shadow-sm">
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
              <p className="text-[15px] font-semibold text-[var(--color-mono-990)] truncate">{currentBook.title}</p>
              <p className="text-[13px] text-[var(--color-mono-500)]">{currentBook.author}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex border-b border-[var(--color-mono-080)]">
        {(["my", "all"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[13px] font-medium transition-colors ${
              activeTab === tab ? "text-[var(--color-primary-500)] border-b-2 border-[var(--color-primary-500)]" : "text-[var(--color-mono-400)] hover:text-[var(--color-mono-700)]"
            }`}>
            {tab === "my" ? "내 서재" : "전체 도서"}
          </button>
        ))}
      </div>

      <div className="py-2">
        {displayBooks.map((book) => (
          <BookItem
            key={book.id} book={book} isActive={book.id === bookId}
            isExpanded={expandedBookId === book.id}
            onSelect={() => router.push(`/library/${book.id}`)}
            onToggleExpand={() => setExpandedBookId(expandedBookId === book.id ? null : book.id)}
            onShowQR={(imageId) => setShowQR(imageId)}
          />
        ))}
      </div>

      {showQR && (
        <QRGenerator
          url={`${typeof window !== "undefined" ? window.location.origin : ""}/world/${bookId}/${showQR}`}
          onClose={() => setShowQR(null)}
        />
      )}
    </aside>
  );
}

function ProgressBarWidget({ bookId }: { bookId: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    try { const s = localStorage.getItem(`metabook_progress_${bookId}`); if (s) setProgress(JSON.parse(s).progress || 0); } catch { /* */ }
  }, [bookId]);
  if (progress <= 0) return null;
  return (
    <div className="mt-1.5 h-1 rounded-full bg-[var(--color-mono-080)] overflow-hidden">
      <div className="h-full bg-[var(--color-primary-400)] rounded-full transition-all" style={{ width: `${progress}%` }} />
    </div>
  );
}

function BookItem({ book, isActive, isExpanded, onSelect, onToggleExpand, onShowQR }: {
  book: Book; isActive: boolean; isExpanded: boolean;
  onSelect: () => void; onToggleExpand: () => void; onShowQR: (imageId: string) => void;
}) {
  const displayImages = book.images?.slice(0, 4) ?? [];
  return (
    <div className="mb-1">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 cursor-pointer transition-colors ${isActive ? "bg-[var(--color-primary-030)] hover:bg-[var(--color-primary-050)]" : "hover:bg-[var(--color-mono-050)]"}`}>
        <div onClick={onSelect} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-10 rounded flex-shrink-0 overflow-hidden bg-mono-100 shadow-sm">
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
            <p className="text-[14px] font-medium text-[var(--color-mono-900)] truncate">{book.title}</p>
            <p className="text-[12px] text-[var(--color-mono-400)] truncate">{book.author}</p>
            <ProgressBarWidget bookId={book.id} />
          </div>
        </div>
        <button onClick={onToggleExpand} className="p-1 hover:bg-mono-100 rounded transition-colors">
          <ChevronDown className={`w-4 h-4 text-[var(--color-mono-400)] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 py-2 pl-12">
          <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider">장면</p>
        </div>
        <div className="grid grid-cols-2 gap-2 px-3 pb-3 pl-12">
          {displayImages.length > 0 ? displayImages.map((img, idx) => (
            <SceneCard key={img.id} img={img} idx={idx} onShowQR={() => onShowQR(img.id)} />
          )) : Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="aspect-square rounded-xl bg-[var(--color-mono-050)] border border-mono-100 flex flex-col items-center justify-center gap-1">
              <ImageIcon className="w-4 h-4 text-mono-300" strokeWidth={1.5} />
              <span className="text-[9px] text-mono-300">장면 {idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneCard({ img, idx, onShowQR }: { img: { id: string; url?: string; alt?: string }; idx: number; onShowQR: () => void }) {
  return (
    <div className="relative group">
      <div className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--color-primary-400)] transition-all bg-mono-100">
        {img.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.url} alt={img.alt || `장면 ${idx + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-mono-100 to-mono-200 flex flex-col items-center justify-center gap-1">
            <ImageIcon className="w-4 h-4 text-mono-300" strokeWidth={1.5} />
            <span className="text-[9px] text-mono-400">장면 {idx + 1}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end justify-end p-2">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Globe className="w-4 h-4 text-white drop-shadow" strokeWidth={1.5} />
          </div>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onShowQR(); }}
        className="absolute top-1 right-1 p-1 bg-white/85 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        title="QR 코드">
        <QrCode className="w-3 h-3 text-mono-500" />
      </button>
    </div>
  );
}

