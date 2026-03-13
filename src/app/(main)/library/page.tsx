"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import BookCard from "@/components/ui/BookCard";
import UserMenu from "@/components/ui/UserMenu";
import { mockBooks, filterBooks } from "@/lib/mock-data";
import type { Book } from "@/types";

const CATEGORIES = ["전체", "인문", "역사", "과학", "심리학", "경제", "교육", "수학", "물리학", "우주", "미래학", "사회"];

// 책이 5권 미만이면 5권 이상이 될 때까지 복제
function padBooks(books: Book[]): Book[] {
  if (books.length === 0) return [];
  const result = [...books];
  while (result.length < 5) {
    result.push(...books);
  }
  return result;
}

// --- 무한 캐러셀 ---
function PublisherSlider({ title, books: rawBooks }: { title: string; books: Book[] }) {
  const books = useMemo(() => padBooks(rawBooks), [rawBooks]);
  const len = books.length;

  // 3배 복제: [set0 | set1(초기) | set2]
  const tripled = useMemo(() => [...books, ...books, ...books], [books]);

  const [index, setIndex] = useState(len); // set1 시작점
  const [animated, setAnimated] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jumpingRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setIndex((prev) => prev + 1);
      setAnimated(true);
    }, 2800);
  }, [clearTimer]);

  // 경계 도달 시 순간이동
  useEffect(() => {
    if (jumpingRef.current) return;

    if (index >= len * 2) {
      jumpingRef.current = true;
      // 애니메이션 완료 후 순간이동
      const t = setTimeout(() => {
        setAnimated(false);
        setIndex(len);
        jumpingRef.current = false;
      }, 520);
      return () => clearTimeout(t);
    }

    if (index < len) {
      jumpingRef.current = true;
      const t = setTimeout(() => {
        setAnimated(false);
        setIndex(len + (index % len));
        jumpingRef.current = false;
      }, 520);
      return () => clearTimeout(t);
    }
  }, [index, len]);

  // animated가 false로 바뀌면 다음 프레임에서 다시 true
  useEffect(() => {
    if (!animated) {
      const raf = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [animated]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  const go = (dir: -1 | 1) => {
    setAnimated(true);
    setIndex((prev) => prev + dir);
    startTimer();
  };

  const activeDot = index % len;

  const goToDot = (dotIndex: number) => {
    setAnimated(true);
    // 현재 set1 기준 위치로 이동
    setIndex(len + dotIndex);
    startTimer();
  };

  return (
    <section className="py-5">
      <h2 className="text-lg font-bold text-[var(--color-mono-990)] mb-4">{title}</h2>
      <div className="relative group">
        {/* 좌우 화살표 */}
        <button
          onClick={() => go(-1)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-[var(--color-mono-080)] shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4 text-[var(--color-mono-990)]" />
        </button>
        <button
          onClick={() => go(1)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-[var(--color-mono-080)] shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-4 h-4 text-[var(--color-mono-990)]" />
        </button>

        {/* 슬라이드 영역 */}
        <div className="overflow-hidden">
          <div
            className="flex gap-4"
            style={{
              transition: animated ? "transform 500ms ease-in-out" : "none",
              transform: `translateX(calc(-${index} * (calc((100% - 64px) / 5) + 16px)))`,
            }}
          >
            {tripled.map((book, i) => (
              <div key={`${book.id}-${i}`} className="flex-shrink-0" style={{ width: "calc((100% - 64px) / 5)" }}>
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 도트 인디케이터 */}
      {len > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {books.map((_, i) => (
            <button
              key={i}
              onClick={() => goToDot(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === activeDot ? "bg-[var(--color-primary-500)]" : "bg-[var(--color-mono-080)]"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// --- 메인 ---
function LibraryContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("전체");

  const isFiltering = search.trim() !== "" || category !== "전체";

  const kimyoungsaBooks = useMemo(() => mockBooks.filter((b) => b.publisher === "김영사"), []);
  const juniorBooks = useMemo(() => mockBooks.filter((b) => b.publisher === "주니어김영사"), []);

  const filteredBooks = useMemo(() => {
    return filterBooks({
      search,
      genre: category === "전체" ? "" : category,
    });
  }, [search, category]);

  return (
    <div className="min-h-screen bg-[var(--color-mono-010)]">
      {/* 헤더 */}
      <header className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-[var(--color-mono-990)]">
              Meta<span className="text-[var(--color-primary-500)]">Book</span>
            </h1>
            <UserMenu />
          </div>
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-mono-400)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목, 저자, 캐릭터 검색..."
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-mono-010)] border border-[var(--color-mono-080)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        {/* 슬라이더 섹션 (필터 중이 아닐 때만) */}
        {!isFiltering && (
          <>
            <PublisherSlider title="김영사" books={kimyoungsaBooks} />
            <div className="border-t border-[var(--color-mono-080)]" />
            <PublisherSlider title="주니어김영사" books={juniorBooks} />
            <div className="border-t border-[var(--color-mono-080)]" />
          </>
        )}

        {/* 카테고리 탭바 */}
        <div className="py-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  category === cat
                    ? "bg-[var(--color-mono-990)] text-white"
                    : "bg-white text-[var(--color-mono-990)] border border-[var(--color-mono-080)] hover:bg-[var(--color-mono-010)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 도서 그리드 */}
        <div className="pb-8">
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-5 gap-4">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="w-16 h-16 text-mono-300 mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-mono-990)] mb-2">
                {search ? `"${search}"에 대한 결과가 없어요` : "조건에 맞는 책이 없어요"}
              </h3>
              <p className="text-mono-500">다른 검색어나 카테고리를 시도해보세요.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-mono-400">로딩 중...</div>
        </div>
      }
    >
      <LibraryContent />
    </Suspense>
  );
}
