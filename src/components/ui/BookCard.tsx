"use client";

import Link from "next/link";
import Image from "next/image";
import type { Book } from "@/types";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/library/${book.id}`} className="group block">
      {/* 표지 이미지 */}
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg shadow-md group-hover:-translate-y-1 transition-transform duration-300">
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* 제목 */}
      <h3 className="mt-2 font-semibold text-[var(--color-mono-990)] truncate">
        {book.title}
      </h3>

      {/* 저자 */}
      <p className="text-sm text-[var(--color-mono-400)]">{book.author}</p>
    </Link>
  );
}
