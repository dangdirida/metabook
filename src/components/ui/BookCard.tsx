"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Bot } from "lucide-react";
import type { Book } from "@/types";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/library/${book.id}`}
      className="group block bg-white rounded-2xl border border-mono-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all"
    >
      {/* 표지 이미지 */}
      <div className="aspect-[3/4] bg-mono-50 relative overflow-hidden">
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          className="object-cover"
          unoptimized
        />
        {/* 출판사 배지 */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            book.publisher === "주니어김영사"
              ? "bg-primary-100 text-primary-800"
              : "bg-secondary-50 text-secondary-600"
          }`}>
            {book.publisher}
          </span>
        </div>
      </div>

      {/* 카드 정보 */}
      <div className="p-4">
        <h3 className="font-semibold text-mono-900 group-hover:text-primary-600 transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-sm text-mono-500 mt-1">{book.author}</p>

        {/* 장르 태그 */}
        <div className="flex flex-wrap gap-1 mt-2">
          {book.genre.slice(0, 2).map((g) => (
            <span
              key={g}
              className="px-2 py-0.5 text-xs bg-mono-100 text-mono-600 rounded-full"
            >
              {g}
            </span>
          ))}
        </div>

        {/* AI Agent 수 + 커뮤니티 인원 */}
        <div className="flex items-center gap-3 mt-3 text-xs text-mono-500">
          <span className="flex items-center gap-1">
            <Bot className="w-3.5 h-3.5" />
            {book.agents.length}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {book.communityMemberCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
