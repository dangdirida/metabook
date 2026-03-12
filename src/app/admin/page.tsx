import { BookOpen, Bot, Users, Palette, ShoppingBag, BarChart3 } from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "등록 도서", value: "10", icon: BookOpen, href: "/admin/books" },
  { label: "AI Agents", value: "13", icon: Bot, href: "/admin/agents" },
  { label: "커뮤니티 멤버", value: "2,760", icon: Users, href: "/admin/community" },
  { label: "2차 창작", value: "6", icon: Palette, href: "/admin/creations" },
  { label: "굿즈", value: "3", icon: ShoppingBag, href: "/admin/commerce" },
  { label: "MAU", value: "1,234", icon: BarChart3, href: "/admin/analytics" },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-mono-900 mb-6">대시보드</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {STATS.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border border-mono-200 p-5 hover:shadow-md transition-shadow"
          >
            <stat.icon className="w-5 h-5 text-primary-500 mb-3" />
            <p className="text-2xl font-bold text-mono-900">{stat.value}</p>
            <p className="text-sm text-mono-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
