"use client";
import { TrendingUp, Eye, Heart } from "lucide-react";

const METRICS = [
  { label: "DAU", value: "1,234", change: "+8.2%", up: true },
  { label: "MAU", value: "4,521", change: "+12.1%", up: true },
  { label: "평균 독서 시간", value: "23분", change: "+3분", up: true },
  { label: "숨북 생성수", value: "142", change: "+18%", up: true },
  { label: "커뮤니티 참여율", value: "34%", change: "-2%", up: false },
  { label: "신규 가입", value: "89", change: "+5", up: true },
];

const TOP_BOOKS = [
  { title: "나를 모르는 나에게", views: 12400, likes: 587 },
  { title: "애인의 애인에게", views: 9800, likes: 341 },
  { title: "무엇이 나를 움직이게 하는가", views: 7200, likes: 276 },
  { title: "통증 어를 때 깨내 보는 백과", views: 6100, likes: 287 },
  { title: "까다로운 사람과 함께 일하는 법", views: 4300, likes: 203 },
];

export default function AdminAnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mono-900">통계</h1>
        <p className="text-sm text-mono-500 mt-1">최근 30일 기준</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {METRICS.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-mono-080 p-5">
            <p className="text-sm text-mono-500">{m.label}</p>
            <p className="text-2xl font-bold text-mono-900 mt-1">{m.value}</p>
            <p className={`text-xs mt-1 font-medium ${m.up ? "text-primary-600" : "text-red-300"}`}>
              {m.change} 저번 대비
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-mono-080 p-5">
        <h2 className="text-sm font-semibold text-mono-900 mb-4">TOP 5 도서</h2>
        <div className="space-y-3">
          {TOP_BOOKS.map((book, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm font-bold text-mono-300 w-5">{i+1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-mono-800 truncate">{book.title}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-mono-400 shrink-0">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{book.views.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{book.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
