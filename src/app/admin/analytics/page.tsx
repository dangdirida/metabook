import { BarChart3, Users, Bot, MessageSquare, Palette } from "lucide-react";

const METRICS = [
  { label: "MAU", value: "1,234", change: "+12%", icon: Users },
  { label: "DAU", value: "342", change: "+8%", icon: Users },
  { label: "AI 대화", value: "5,678", change: "+23%", icon: Bot },
  { label: "커뮤니티 메시지", value: "12,345", change: "+15%", icon: MessageSquare },
  { label: "2차 창작", value: "45", change: "+5%", icon: Palette },
];

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-mono-900 mb-6">애널리틱스</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {METRICS.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-mono-200 p-4">
            <m.icon className="w-4 h-4 text-primary-500 mb-2" />
            <p className="text-2xl font-bold text-mono-900">{m.value}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-mono-500">{m.label}</span>
              <span className="text-xs text-primary-500 font-medium">{m.change}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-mono-200 p-10 text-center">
        <BarChart3 className="w-12 h-12 text-mono-300 mx-auto mb-3" />
        <p className="text-mono-500">차트 대시보드 (recharts 연동 예정)</p>
      </div>
    </div>
  );
}
