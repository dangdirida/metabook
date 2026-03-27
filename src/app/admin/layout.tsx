import Link from "next/link";
import { BookOpen, Bot, Users, Palette, ShoppingBag, BarChart3, Home, UserCircle } from "lucide-react";

const NAV = [
  { href: "/admin", label: "대시보드", icon: Home },
  { href: "/admin/books", label: "도서 관리", icon: BookOpen },
  { href: "/admin/agents", label: "AI 에이전트", icon: Bot },
  { href: "/admin/users", label: "회원 관리", icon: UserCircle },
  { href: "/admin/community", label: "커뮤니티", icon: Users },
  { href: "/admin/creations", label: "2차 창작", icon: Palette },
  { href: "/admin/commerce", label: "굿즈", icon: ShoppingBag },
  { href: "/admin/analytics", label: "통계", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mono-050 flex">
      <aside className="w-56 bg-white border-r border-mono-080 flex flex-col">
        <div className="px-5 py-4 border-b border-mono-080">
          <span className="text-sm font-bold text-primary-600">MetaBook</span>
          <span className="ml-2 text-xs text-mono-400">Admin</span>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-mono-600 hover:bg-mono-050 hover:text-mono-900 transition-colors">
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-mono-080">
          <Link href="/" className="text-xs text-mono-400 hover:text-mono-600">← 사이트로 돌아가기</Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
