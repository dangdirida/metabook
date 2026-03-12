"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
  Users,
  Palette,
  ShoppingBag,
  BarChart3,
  Shield,
} from "lucide-react";
import UserMenu from "@/components/ui/UserMenu";

const SIDEBAR_ITEMS = [
  { href: "/admin/books", icon: BookOpen, label: "책 관리" },
  { href: "/admin/agents", icon: Bot, label: "AI Agent" },
  { href: "/admin/community", icon: Users, label: "커뮤니티" },
  { href: "/admin/creations", icon: Palette, label: "2차 창작" },
  { href: "/admin/commerce", icon: ShoppingBag, label: "커머스" },
  { href: "/admin/analytics", icon: BarChart3, label: "애널리틱스" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-mono-50 flex">
      {/* 좌측 사이드바 */}
      <aside className="w-60 bg-white border-r border-mono-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-mono-200">
          <Link href="/admin" className="text-xl font-bold text-mono-900">
            Meta<span className="text-primary-500">Book</span>
          </Link>
          <div className="flex items-center gap-1 mt-1">
            <Shield className="w-3 h-3 text-primary-500" />
            <span className="text-xs text-primary-500 font-medium">Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-2">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-600 font-medium"
                    : "text-mono-600 hover:bg-mono-50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-mono-200">
          <Link
            href="/library"
            className="text-xs text-mono-500 hover:text-mono-700"
          >
            ← 사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 어드민 헤더 */}
        <header className="h-14 bg-white border-b border-mono-200 flex items-center justify-between px-6">
          <h2 className="text-sm font-medium text-mono-700">
            {SIDEBAR_ITEMS.find((i) => pathname.startsWith(i.href))?.label ||
              "대시보드"}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-mono-500">super_admin</span>
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
