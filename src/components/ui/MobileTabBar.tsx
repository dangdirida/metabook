"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessageCircle, Music, User } from "lucide-react";

const TABS = [
  { href: "/library", icon: BookOpen, label: "홈" },
  { href: "/chat", icon: MessageCircle, label: "채팅" },
  { href: "/bgm", icon: Music, label: "브금" },
  { href: "/mypage", icon: User, label: "내 정보" },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  // 책 상세 페이지에서는 숨김 (별도 모바일 탭바 있음)
  if (pathname.match(/^\/library\/[^/]+$/)) return null;
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--color-mono-080)] flex items-center">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors">
            <tab.icon className={`w-5 h-5 ${isActive ? "text-[var(--color-primary-500)]" : "text-[var(--color-mono-400)]"}`} />
            <span className={`text-[10px] font-medium ${isActive ? "text-[var(--color-primary-500)]" : "text-[var(--color-mono-400)]"}`}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
