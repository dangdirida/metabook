"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import BookCard from "@/components/ui/BookCard";
import UserMenu from "@/components/ui/UserMenu";
import { mockBooks } from "@/lib/mock-data";
import { GALLERY_BOOKS } from "@/lib/gallery-books";
import type { Book } from "@/types";

const CATEGORIES = ["전체", "소설", "인문", "심리학", "자기계발", "건강", "에세이", "어린이", "판타지", "동화", "학습만화", "그림책"];
const VISIBLE = 5;
const PAGE_SIZE = 12;

// --- 무한 캐러셀 ---
function PublisherSlider({
  title,
  books,
  intervalMs = 3000,
}: {
  title: string;
  books: Book[];
  intervalMs?: number;
}) {
  const len = books.length;
  const cloned = useMemo(
    () => [...books, ...books, ...books, ...books, ...books],
    [books]
  );

  const [idx, setIdx] = useState(len * 2);
  const [animated, setAnimated] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setIdx((prev) => prev + 1);
      setAnimated(true);
    }, intervalMs);
  }, [clearTimer, intervalMs]);

  useEffect(() => {
    if (idx >= len * 4) {
      const t = setTimeout(() => {
        setAnimated(false);
        setIdx(len * 2);
      }, 520);
      return () => clearTimeout(t);
    }
    if (idx < len) {
      const t = setTimeout(() => {
        setAnimated(false);
        setIdx(len * 3 - 1);
      }, 520);
      return () => clearTimeout(t);
    }
  }, [idx, len]);

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
    setIdx((prev) => prev + dir);
    startTimer();
  };

  const activeDot = ((idx % len) + len) % len;

  const goToDot = (dotIdx: number) => {
    setAnimated(true);
    setIdx(len * 2 + dotIdx);
    startTimer();
  };

  return (
    <section className="py-5">
      <h2 className="text-xl font-bold text-[var(--color-mono-990)] mb-4">
        {title}
      </h2>
      <div className="relative group">
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

        <div className="overflow-hidden">
          <div
            className="flex"
            style={{
              transition: animated ? "transform 0.5s ease" : "none",
              transform: `translateX(-${idx * (100 / VISIBLE)}%)`,
            }}
          >
            {cloned.map((book, i) => (
              <div
                key={`${book.id}-${i}`}
                className="flex-none"
                style={{ width: "20%", paddingRight: "16px" }}
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {len > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {books.map((_, i) => (
            <button
              key={i}
              onClick={() => goToDot(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === activeDot
                  ? "bg-[var(--color-primary-500)]"
                  : "bg-[var(--color-mono-080)]"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// --- 갤러리 카드 (img 태그 직접 사용) ---
function GalleryCard({ title, coverImage }: { title: string; coverImage: string }) {
  return (
    <div className="group">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg shadow-md group-hover:-translate-y-1 transition-transform duration-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <h3 className="mt-2 font-semibold text-[var(--color-mono-990)] truncate text-sm">
        {title}
      </h3>
    </div>
  );
}

// --- 메인 ---
function LibraryContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("전체");

  const isFiltering = search.trim() !== "" || category !== "전체";

  const kimyoungsaBooks = useMemo(
    () => mockBooks.filter((b) => b.publisher === "김영사"),
    []
  );
  const juniorBooks = useMemo(
    () => mockBooks.filter((b) => b.publisher === "주니어김영사"),
    []
  );

  // 갤러리 무한 순환 스크롤
  const [displayedGallery, setDisplayedGallery] = useState(
    GALLERY_BOOKS.slice(0, PAGE_SIZE)
  );
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (page === 1) return;
    const startIdx = ((page - 1) * PAGE_SIZE) % GALLERY_BOOKS.length;
    const newBooks: typeof GALLERY_BOOKS = [];
    for (let i = 0; i < PAGE_SIZE; i++) {
      newBooks.push(GALLERY_BOOKS[(startIdx + i) % GALLERY_BOOKS.length]);
    }
    setDisplayedGallery((prev) => [...prev, ...newBooks]);
  }, [page]);

  // 카테고리 필터링 — mockBooks에서 장르 기반
  const filteredByCategory = useMemo(() => {
    if (category === "전체") return null;
    return mockBooks.filter((b) => b.genre.includes(category));
  }, [category]);

  // 검색 필터링
  const filteredForSearch = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return GALLERY_BOOKS.filter((b) => b.title.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="min-h-screen bg-[var(--color-mono-010)]">
      {/* 헤더 */}
      <header className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl md:text-2xl font-bold text-[var(--color-mono-990)]">
              Meta<span className="text-[var(--color-primary-500)]">Book</span>
            </h1>
            <UserMenu />
          </div>
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-10">
        {/* 히어로 배너 */}
        {!isFiltering && (
          <div className="relative w-full overflow-hidden bg-[#0a0a0a] rounded-2xl isolate h-48 md:h-72 lg:h-80 xl:h-[420px]" style={{borderRadius: '16px'}}>
            {/* 책 표지 흐르는 배경 — 3줄, 반대방향 */}
            <div className="absolute inset-0 flex flex-col gap-3 opacity-35" style={{top: '-20px'}}>
              {/* 1번 줄 — 왼쪽으로 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="flex gap-3 animate-scroll-left" style={{width: 'max-content'}}>
                {[...Array(3)].flatMap(() => [
                  '/covers/gy-1.png', '/covers/gy-2.png', '/covers/gy-3.png', '/covers/gy-4.png',
                  '/covers/gy-5.jpg', '/covers/gy-6.jpg', '/covers/gy-7.jpg',
                  '/covers/jr-1.jpg', '/covers/jr-2.png', '/covers/jr-3.png',
                ]).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`row1-${i}`} src={src} alt="" className="h-24 md:h-36 lg:h-48 w-auto rounded object-cover flex-shrink-0" />
                ))}
              </div>
              {/* 2번 줄 — 오른쪽으로 */}
              <div className="flex gap-3 animate-scroll-right" style={{width: 'max-content'}}>
                {[...Array(3)].flatMap(() => [
                  '/covers/jr-4.png', '/covers/jr-5.png', '/covers/gy-7.jpg',
                  '/covers/gy-1.png', '/covers/gy-3.png', '/covers/gy-5.jpg',
                  '/covers/jr-1.jpg', '/covers/gy-2.png', '/covers/jr-2.png',
                ]).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`row2-${i}`} src={src} alt="" className="h-24 md:h-36 lg:h-48 w-auto rounded object-cover flex-shrink-0" />
                ))}
              </div>
              {/* 3번 줄 — 왼쪽으로 (느리게) */}
              <div className="flex gap-3 animate-scroll-left-slow" style={{width: 'max-content'}}>
                {[...Array(3)].flatMap(() => [
                  '/covers/gy-6.jpg', '/covers/jr-3.png', '/covers/gy-4.png',
                  '/covers/jr-5.png', '/covers/gy-2.png', '/covers/jr-4.png',
                  '/covers/gy-7.jpg', '/covers/gy-1.png', '/covers/gy-3.png',
                ]).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`row3-${i}`} src={src} alt="" className="h-24 md:h-36 lg:h-48 w-auto rounded object-cover flex-shrink-0" />
                ))}
              </div>
            </div>

            {/* 그라디언트 오버레이 (좌우 페이드) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
            {/* 어두운 오버레이 */}
            <div className="absolute inset-0 bg-[#0a0a0a]/50" />

            {/* 텍스트 콘텐츠 */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
              <h1 className="text-white font-bold leading-none mb-2 md:mb-4 text-3xl md:text-5xl lg:text-6xl xl:text-7xl" style={{letterSpacing: '-1px'}}>
                책 속 세계가<br />
                <span style={{color: '#32d29d'}}>살아납니다.</span>
              </h1>
              <p className="text-white/60 text-sm md:text-lg leading-relaxed hidden sm:block" style={{maxWidth: '480px'}}>
                김영사의 책들을 AI 캐릭터와 함께 탐험하고,<br />
                나만의 독서 세계를 만들어보세요.
              </p>
              <div className="mt-3 md:mt-6 flex items-center gap-3">
                <Link href="/about" className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full text-xs md:text-sm font-semibold transition-all border border-white/30">
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  자세히 보기 <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 슬라이더 섹션 */}
        {!isFiltering && (
          <>
            <div className="mt-10" />
            <PublisherSlider
              title="김영사"
              books={kimyoungsaBooks}
              intervalMs={3200}
            />
            <div className="border-t border-[var(--color-mono-080)]" />
            <PublisherSlider
              title="주니어김영사"
              books={juniorBooks}
              intervalMs={4700}
            />
          </>
        )}

        {/* 슬라이더 ↔ 카테고리 사이 간격 */}
        <div className="mt-10 md:mt-20 border-t border-[var(--color-mono-080)]" />

        {/* 카테고리 탭바 */}
        <div className="py-4 mb-10 -mx-4 px-4 overflow-x-auto scrollbar-hide">
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

        {/* 도서 갤러리 그리드 — 무한 순환 스크롤 */}
        <div className="pb-8">
          {filteredForSearch ? (
            // 검색 결과
            filteredForSearch.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                {filteredForSearch.map((book, i) => (
                  <GalleryCard key={`search-${i}`} {...book} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-mono-990)] mb-2">
                  &ldquo;{search}&rdquo;에 대한 결과가 없어요
                </h3>
                <p className="text-[var(--color-mono-400)]">
                  다른 검색어를 시도해보세요.
                </p>
              </div>
            )
          ) : filteredByCategory ? (
            // 카테고리 필터 결과
            filteredByCategory.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                {filteredByCategory.map((book) => (
                  <GalleryCard key={book.id} title={book.title} coverImage={book.coverImage} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="text-lg font-semibold text-[var(--color-mono-990)] mb-2">
                  &ldquo;{category}&rdquo; 카테고리에 도서가 없어요
                </h3>
                <p className="text-[var(--color-mono-400)]">
                  다른 카테고리를 선택해보세요.
                </p>
              </div>
            )
          ) : (
            // 무한 순환 스크롤
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                {displayedGallery.map((book, i) => (
                  <GalleryCard key={`gallery-${i}`} {...book} />
                ))}
              </div>
              <div
                ref={loaderRef}
                className="h-10 flex items-center justify-center mt-4"
              >
                <div className="w-6 h-6 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
              </div>
            </>
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
