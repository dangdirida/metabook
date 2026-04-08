"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/ui/UserMenu";

const NAV_ITEMS = [
  { label: "홈", href: "/library" },
  { label: "창작물", href: "/creations" },
  { label: "브금", href: "/bgm" },
  { label: "채팅", href: "/chat" },
];

export default function DesktopNav() {
  const pathname = usePathname();

  // 책 상세 페이지에서는 숨김 (별도 헤더 있음)
  if (pathname.match(/^\/library\/[^/]+/)) return null;

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[var(--color-mono-080)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/library" className="flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_ogq_green.png" alt="OGQ" className="h-7 w-auto" />
        </Link>

        {/* 중앙 메뉴 */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/library"
              ? pathname === "/library"
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`px-4 py-2 rounded-xl text-[14px] font-medium transition-colors ${
                  isActive
                    ? "text-[var(--color-primary-600)] bg-[var(--color-primary-030)]"
                    : "text-[var(--color-mono-600)] hover:text-[var(--color-mono-990)] hover:bg-[var(--color-mono-050)]"
                }`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 우측 */}
        <div className="flex-shrink-0">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
