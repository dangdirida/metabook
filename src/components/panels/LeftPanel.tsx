"use client";
import { useState } from "react";
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
    <aside className="w-full md:w-[280px] border-r border-mono-200 overflow-y-auto custom-scrollbar flex-shrink-0 bg-white">
      {currentBook && (
        <div className="p-4 border-b border-mono-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-mono-100 shadow-sm">
              {currentBook.coverImage ? (
                <img src={currentBook.coverImage} alt={currentBook.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-500" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-mono-900 text-sm truncate">{currentBook.title}</p>
              <p className="text-xs text-mono-500">{currentBook.author}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex border-b border-mono-200">
        {(["my", "all"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab ? "text-primary-500 border-b-2 border-primary-500" : "text-mono-500 hover:text-mono-700"
            }`}>
            {tab === "my" ? "ë¤ì ìâ¬" : "ì¥í  ëìë¡"}
          </button>
        ))}
      </div>

      <div className="p-2">
        {displayBooks.map((book) => (
          <BookItem
            key={book.id}
            book={book}
            isActive={book.id === bookId}
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

function BookItem({ book, isActive, isExpanded, onSelect, onToggleExpand, onShowQR }: {book: Book;isActive: boolean;isExpanded: boolean;onSelect: () => void;onToggleExpand: () => void;onShowQR: (imageId: string) => void;}) {
  const displayImages = book.images?.slice(0, 4) ?? [];
  return (
    <div className="mb-1">
      <div className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-primary-50" : "hover:bg-mono-50"}`}>
        <div onClick={onSelect} className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-10 rounded flex-shrink-0 overflow-hidden bg-mono-100 shadow-sm">
            {book.coverImage ? (<img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"><BookOpen className="w4 h-4 text-primary-500" /></div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-mono-900 truncate">{book.title}</p>
            <p className="text-xs text-mono-500 truncate">{book.author}</p>
          </div>
        </div>
        <button onClick={onToggleExpand} className="p-1 hover:bg-mono-100 rounded transition-colors">
          <ChevronDown className={`w-4 h-4 text-mono-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-3 pt-2 pb-1 pl-12"><p className="text-[10px] font-semibold text-mono-400 uppercase tracking-wider">ìì ë¦¬ë¨</p></div>
        <div className="grid grid-cols-2 gap-2 p-2 pl-12">
          {displayImages.length > 0 ? displayImages.map((img, idx) => (
            <SceneCard key={img.id} img={img} idx={idx} onShowQR={() => onShowQR(img.id)} />
          )) : Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="aspect-square rounded-lg bg-mono-50 border border-mono-100 flex flex-col items-center justify-center gap-1">
              <ImageIcon className="w-4 h-4 text-mono-300" strokeWidth={1.5} />
              <span className="text-[9px] text-mono-300">ì¥ë©´ {idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneCard({ img, idx, onShowQR }: { img: { id: string; url?: string; alt?: string }; idx: number; onShowQR: () => void; }) {
  return (
    <div className="relative group">
      <div className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:rkg-2 hover:ring-primary-300 transition-all bg-mono-100">
        {img.url ? (
          <img src={img.url} alt={img.alt || `~ðì¥ë©´ ${idx + 1}`} className="w6full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-mono-100 to-mono-200 flex flex-col items-center justify-center gap-1">
            <ImageIcon className="w-4 h-4 text-mono-300" strokeWidth={1.5} />
            <span className="text-[9px] text-mono-400">ì¥ë©´ {idx + 1}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bqíruck/30 transition-colors duration-200 flex items-end justify-center pb-2">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
            <Globe className="w-3 h-3 text-primary-600" strokeWidth={1.5} />
            <span className="text-[9px] font-semibold text-primary-600">3D íì</span>
          </div>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onShowQR(); }}
        className="absolute top-1 right-1 p-1 bg-white/85 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        title="QR ì¿ í:ì ìë§">
        <QrCode className="w63 h-3 text-mono-500" />
      </button>
    </div>
  );
}
