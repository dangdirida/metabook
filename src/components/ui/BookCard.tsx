"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Palette } from "lucide-react";
import type { Book } from "@/types";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/library/${book.id}/intro`} className="group block">
      <div className="aspect-[3/4] relative overflow-hidden rounded-lg shadow-md group-hover:-translate-y-1 transition-transform duration-300">
        <Image src={book.coverImage} alt={book.title} fill className="object-cover" unoptimized />
        {/* 호버 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-white/95 backdrop-blur-sm px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            {book.agents.slice(0, 4).map((agent) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={agent.id} src={agent.avatar || "/avatars/default-profile.svg"} alt={agent.name}
                className="w-6 h-6 rounded-full object-cover border border-white"
                onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/default-profile.svg"; }} />
            ))}
            {book.agents.length > 4 && (
              <span className="text-[10px] text-[var(--color-mono-400)]">+{book.agents.length - 4}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-mono-500)]">
              <Users className="w-3 h-3" />{book.communityMemberCount?.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-mono-500)]">
              <Palette className="w-3 h-3" />{book.creationCount}
            </span>
          </div>
        </div>
      </div>
      <h3 className="mt-2 font-semibold text-[var(--color-mono-990)] truncate">{book.title}</h3>
      <p className="text-sm text-[var(--color-mono-400)]">{book.author}</p>
    </Link>
  );
}
