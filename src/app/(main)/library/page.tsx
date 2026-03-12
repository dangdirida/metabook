"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, BookOpen } from "lucide-react";
import BookCard from "@/components/ui/BookCard";
import UserMenu from "@/components/ui/UserMenu";
import { filterBooks } from "@/lib/mock-data";

const PUBLISHERS = ["김영사", "주니어김영사"];
const GENRES = ["인문", "역사", "과학", "심리학", "경제", "교육", "수학", "물리학", "우주", "미래학", "사회"];
const AGE_GROUPS = ["어린이", "청소년", "성인"];
const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "creation", label: "창작순" },
];

function LibraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);

  const publisher = searchParams.get("publisher") || "";
  const genre = searchParams.get("genre") || "";
  const ageGroup = searchParams.get("age") || "";
  const sort = searchParams.get("sort") || "latest";

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/library?${params.toString()}`, { scroll: false });
  };

  const books = useMemo(
    () => filterBooks({ search, publisher, genre, ageGroup, sort }),
    [search, publisher, genre, ageGroup, sort]
  );

  return (
    <div className="min-h-screen bg-mono-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-mono-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-mono-900">
              Meta<span className="text-primary-500">Book</span>
            </h1>
            <UserMenu />
          </div>

          {/* 검색바 */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mono-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="제목, 저자, 캐릭터 검색..."
                className="w-full pl-10 pr-4 py-3 bg-mono-50 border border-mono-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl border transition-colors ${
                showFilters
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-white text-mono-600 border-mono-200 hover:bg-mono-50"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* 필터 패널 */}
          {showFilters && (
            <div className="mt-4 p-4 bg-mono-50 rounded-xl space-y-4">
              {/* 출판사 */}
              <div>
                <p className="text-sm font-medium text-mono-700 mb-2">출판사</p>
                <div className="flex gap-2">
                  <FilterChip
                    label="전체"
                    active={!publisher}
                    onClick={() => updateParams("publisher", "")}
                  />
                  {PUBLISHERS.map((p) => (
                    <FilterChip
                      key={p}
                      label={p}
                      active={publisher === p}
                      onClick={() => updateParams("publisher", publisher === p ? "" : p)}
                    />
                  ))}
                </div>
              </div>

              {/* 장르 */}
              <div>
                <p className="text-sm font-medium text-mono-700 mb-2">장르</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="전체"
                    active={!genre}
                    onClick={() => updateParams("genre", "")}
                  />
                  {GENRES.map((g) => (
                    <FilterChip
                      key={g}
                      label={g}
                      active={genre === g}
                      onClick={() => updateParams("genre", genre === g ? "" : g)}
                    />
                  ))}
                </div>
              </div>

              {/* 연령대 */}
              <div>
                <p className="text-sm font-medium text-mono-700 mb-2">연령대</p>
                <div className="flex gap-2">
                  <FilterChip
                    label="전체"
                    active={!ageGroup}
                    onClick={() => updateParams("age", "")}
                  />
                  {AGE_GROUPS.map((a) => (
                    <FilterChip
                      key={a}
                      label={a}
                      active={ageGroup === a}
                      onClick={() => updateParams("age", ageGroup === a ? "" : a)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 정렬 */}
          <div className="flex gap-2 mt-3">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateParams("sort", opt.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  sort === opt.value
                    ? "bg-primary-500 text-white"
                    : "text-mono-600 hover:bg-mono-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 도서 그리드 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <EmptyState search={search} />
        )}
      </main>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
        active
          ? "bg-primary-500 text-white"
          : "bg-white text-mono-600 border border-mono-200 hover:bg-mono-100"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BookOpen className="w-16 h-16 text-mono-300 mb-4" />
      <h3 className="text-lg font-semibold text-mono-700 mb-2">
        {search ? `"${search}"에 대한 결과가 없어요` : "조건에 맞는 책이 없어요"}
      </h3>
      <p className="text-mono-500">다른 검색어나 필터를 시도해보세요.</p>
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
