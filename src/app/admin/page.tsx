import { BookOpen, Bot, Users, Palette, ShoppingBag, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "등록 도서", value: "11", sub: "+1 이번 주", icon: BookOpen, href: "/admin/books", color: "text-primary-500" },
  { label: "AI 에이전트", value: "22", sub: "전체 도서", icon: Bot, href: "/admin/agents", color: "text-secondary-500" },
  { label: "커뮤니티 멤버", value: "2,760", sub: "MAU 1,234", icon: Users, href: "/admin/community", color: "text-blue-300" },
  { label: "2차 창작", value: "89", sub: "이번 주 +6", icon: Palette, href: "/admin/creations", color: "text-primary-500" },
  { label: "굿즈 주문", value: "23", sub: "대기 3건", icon: ShoppingBag, href: "/admin/commerce", color: "text-secondary-500" },
  { label: "일일 조회수", value: "4,521", sub: "전주 대비 +12%", icon: BarChart3, href: "/admin/analytics", color: "text-blue-300" },
];

const RECENT_ACTIVITY = [
  { user: "user_a12", action: "애인의 애인에게 돈키 작성", time: "2분 전", type: "creation" },
  { user: "user_b34", action: "무엇이 나를 움직이게 하는가 도서 등록", time: "15분 전", type: "book" },
  { user: "user_c56", action: "숨북 생성 완료", time: "32분 전", type: "shortbook" },
  { user: "user_d78", action: "애인의 애인에게 커뮤니티 참여", time: "1시간 전", type: "community" },
  { user: "user_e90", action: "들나 쿠션 주문", time: "2시간 전", type: "commerce" },
];

const TYPE_COLOR: Record<string, string> = {
  creation: "bg-primary-050 text-primary-600",
  book: "bg-blue-030 text-blue-300",
  shortbook: "bg-secondary-050 text-secondary-500",
  community: "bg-mono-050 text-mono-600",
  commerce: "bg-red-030 text-red-300",
};

export default function AdminPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">대시보드</h1>
          <p className="text-sm text-mono-500 mt-1">MetaBook 관리자 패널</p>
        </div>
        <span className="text-xs text-mono-400">{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {STATS.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-xl border border-mono-080 p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <TrendingUp className="w-3.5 h-3.5 text-mono-300" />
            </div>
            <p className="text-2xl font-bold text-mono-900">{stat.value}</p>
            <p className="text-sm text-mono-600 mt-0.5">{stat.label}</p>
            <p className="text-xs text-mono-400 mt-1">{stat.sub}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-mono-080 p-5">
        <h2 className="text-sm font-semibold text-mono-900 mb-4">최근 활동</h2>
        <div className="space-y-3">
          {RECENT_ACTIVITY.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-mono-050 flex items-center justify-center text-xs font-medium text-mono-500">
                {a.user.slice(-2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-mono-700 truncate">{a.action}</p>
                <p className="text-xs text-mono-400">{a.time}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLOR[a.type]}`}>
                {a.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
