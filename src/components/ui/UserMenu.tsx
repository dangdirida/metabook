"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) {
    return (
      <Link href="/mypage" className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-primary-600" />
      </Link>
    );
  }

  const user = session.user;
  const initial = user.name?.[0] || "U";

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/chat"
        className="p-2 rounded-xl hover:bg-[var(--color-mono-050)] transition-colors"
        title="채팅"
      >
        <MessageCircle className="w-5 h-5 text-[var(--color-mono-600)]" />
      </Link>
      <Link
        href="/favorites"
        className="p-2 rounded-xl hover:bg-[var(--color-mono-050)] transition-colors"
        title="찜한 도서"
      >
        <Heart className="w-5 h-5 text-[var(--color-mono-500)]" />
      </Link>
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-200 hover:border-primary-400 transition-colors flex-shrink-0"
        aria-label="사용자 메뉴"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm text-primary-600 font-medium">
              {initial}
            </span>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-56 bg-white rounded-xl border border-mono-200 shadow-lg z-50 py-2">
          <div className="px-4 py-3 border-b border-mono-100">
            <p className="text-sm font-medium text-mono-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-mono-500 truncate">{user.email}</p>
          </div>
          <Link
            href="/mypage"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-mono-600 hover:bg-mono-50 transition-colors"
          >
            <User className="w-4 h-4" />
            마이페이지
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-mono-600 hover:bg-mono-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      )}
    </div>
    </div>
  );
}
