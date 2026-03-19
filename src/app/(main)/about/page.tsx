"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Box,
  MessageCircle,
  Users,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Check,
} from "lucide-react";

const FEATURES = [
  {
    id: "qr",
    number: "01",
    icon: QrCode,
    title: "QR로 책 속 세계 입장",
    subtitle: "책 표지·페이지의 QR 코드를 스캔하면 바로 이 세계로",
    description:
      "책에 인쇄된 QR 코드를 스캔하면 해당 책의 MetaBook 페이지로 즉시 이동합니다. 서점에서, 도서관에서, 집 책장에서 — 언제 어디서든 QR 하나로 책 속 세계가 열립니다.",
    details: [
      "책 표지 QR → 책 전체 소개 페이지",
      "본문 페이지 QR → 해당 장면 페이지",
      "앱 설치 없이 브라우저만으로 이용 가능",
    ],
    gradient: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badgeColor: "bg-emerald-100 text-emerald-700",
    visual: (
      <div className="relative w-full h-48 flex items-center justify-center">
        <div className="w-32 h-40 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1 p-2 space-y-1">
            <div className="h-1.5 bg-gray-100 rounded-full w-full" />
            <div className="h-1.5 bg-gray-100 rounded-full w-3/4" />
            <div className="h-1.5 bg-emerald-100 rounded-full w-1/2" />
          </div>
        </div>
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-0.5 w-10 h-10">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`rounded-sm ${[0,1,3,4,5,7,8].includes(i) ? "bg-gray-800" : "bg-white"}`} />
            ))}
          </div>
        </div>
        <div className="absolute left-0 bottom-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
          QR 스캔
        </div>
      </div>
    ),
  },
  {
    id: "3d",
    number: "02",
    icon: Box,
    title: "책 속 세계를 3D로 탐험",
    subtitle: "장면 이미지를 선택하면 3D 공간으로 입장",
    description:
      "책 속 배경과 장면들을 실제 3D 공간으로 재현했습니다. 카페, 저택, 골목길 — 작가가 묘사한 그 공간을 직접 걷는 듯한 몰입감을 경험하세요.",
    details: [
      "360° 자유 시점으로 공간 탐험",
      "책 속 주요 장면의 3D 재현",
      "장면 이미지 클릭 → 즉시 3D 입장",
    ],
    gradient: "from-violet-400 to-purple-500",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    badgeColor: "bg-violet-100 text-violet-700",
    visual: (
      <div className="relative w-full h-48 flex items-center justify-center">
        <div className="w-44 h-32 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-violet-900 to-indigo-900 relative">
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="absolute border border-violet-300/30" style={{ left: `${i * 20}%`, top: 0, bottom: 0, width: "1px", transform: `perspective(100px) rotateY(${i * 5}deg)` }} />
            ))}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {[1,2,3].map(i => (
              <div key={i} className="w-2 h-8 bg-violet-300/40 rounded-sm" style={{ transform: `scaleY(${0.5 + i * 0.2})` }} />
            ))}
          </div>
          <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <Box className="w-3 h-3 text-violet-200" />
            <span className="text-violet-100 text-[9px] font-medium">3D MODE</span>
          </div>
        </div>
        <div className="absolute -bottom-1 right-2 bg-white rounded-full shadow-md px-2 py-1 flex items-center gap-1 text-[10px] font-semibold text-violet-600 border border-violet-100">
          <Box className="w-3 h-3" /> 3D 탐험
        </div>
      </div>
    ),
  },
  {
    id: "chat",
    number: "03",
    icon: MessageCircle,
    title: "책 속 인물과 1:1 채팅",
    subtitle: "캐릭터가 직접 대답합니다 — AI로 구현된 책 속 인물",
    description:
      "주인공에게 묻고 싶은 게 있었나요? MetaBook에서는 책 속 인물과 직접 대화할 수 있습니다. AI가 캐릭터의 성격, 말투, 가치관을 학습해 진짜처럼 대답합니다.",
    details: [
      "캐릭터 고유의 말투와 성격 반영",
      "책 내용을 기반으로 한 답변",
      "무한 대화 — 책이 끝나도 이야기는 계속",
    ],
    gradient: "from-sky-400 to-blue-500",
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
    badgeColor: "bg-sky-100 text-sky-700",
    visual: (
      <div className="relative w-full h-48 flex items-center justify-center">
        <div className="w-48 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-400 to-blue-500 px-3 py-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-white text-[10px] font-bold">재</div>
            <span className="text-white text-xs font-semibold">재레드 다이아몬드</span>
          </div>
          <div className="p-2 space-y-1.5">
            <div className="flex justify-end"><div className="bg-sky-500 text-white text-[9px] rounded-xl rounded-tr-sm px-2 py-1 max-w-[80%]">왜 문명이 발전한 건가요?</div></div>
            <div className="flex"><div className="bg-gray-100 text-gray-700 text-[9px] rounded-xl rounded-tl-sm px-2 py-1 max-w-[80%]">지리적 환경이 결정적 역할을 했습니다. 작물화 가능한 식물과...</div></div>
            <div className="flex justify-end"><div className="bg-sky-500 text-white text-[9px] rounded-xl rounded-tr-sm px-2 py-1">더 자세히 알고 싶어요!</div></div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:"0.1s"}} /><div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{animationDelay:"0.2s"}} /></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "community",
    number: "04",
    icon: Users,
    title: "독자들과 실시간 감상 공유",
    subtitle: "같은 책을 읽은 독자들과 지금 바로 이야기하세요",
    description:
      "혼자 읽고 끝내기 아쉬웠나요? MetaBook 커뮤니티에서 같은 책을 읽은 독자들과 실시간으로 감상을 나누세요. 누군가와 함께라면 책이 더 풍부해집니다.",
    details: [
      "책별 전용 커뮤니티 채팅방",
      "실시간 메시지 + 이모지 반응",
      "독자 초대 링크로 친구와 함께",
    ],
    gradient: "from-rose-400 to-pink-500",
    bg: "bg-rose-50",
    iconColor: "text-rose-600",
    badgeColor: "bg-rose-100 text-rose-700",
    visual: (
      <div className="relative w-full h-48 flex items-center justify-center">
        <div className="w-48 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="relative w-2 h-2"><span className="absolute w-full h-full bg-green-400 rounded-full animate-ping opacity-75" /><span className="w-full h-full bg-green-500 rounded-full block" /></div>
              <span className="text-[10px] font-semibold text-gray-700">독자 커뮤니티</span>
            </div>
            <span className="text-[9px] text-green-600 font-semibold">12명 온라인</span>
          </div>
          <div className="p-2 space-y-1.5">
            {[{name:"민지", msg:"결말이 너무 충격적이에요 😱", isMe:false},{name:"수연", msg:"저도요!! 3장부터 복선이...", isMe:false},{name:"나", msg:"작가님 천재인듯 🔥", isMe:true}].map((item) => (
              <div key={item.name} className={`flex ${item.isMe ? "justify-end" : ""} gap-1.5`}>
                {!item.isMe && <div className="w-4 h-4 rounded-full bg-rose-200 flex items-center justify-center text-[8px] font-bold text-rose-600 flex-shrink-0">{item.name[0]}</div>}
                <div className={`text-[9px] rounded-xl px-2 py-1 max-w-[75%] ${item.isMe ? "bg-rose-500 text-white rounded-tr-sm" : "bg-gray-100 text-gray-700 rounded-tl-sm"}`}>{item.msg}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "creation",
    number: "05",
    icon: Sparkles,
    title: "마음에 드는 장면으로 2차 창작",
    subtitle: "숏북·숏뮤비·굿즈 — AI와 함께 나만의 창작물",
    description:
      "책에서 마음에 드는 구절이나 장면을 골라 나만의 2차 창작물을 만들어보세요. AI가 함께하기 때문에 글솜씨나 디자인 실력이 없어도 됩니다.",
    details: [
      "숏북 — 다른 시점·결말로 재집필",
      "숏뮤비 — 책 장면을 AI 영상으로",
      "굿즈 — 책갈피·스티커·일러스트",
    ],
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    badgeColor: "bg-amber-100 text-amber-700",
    visual: (
      <div className="relative w-full h-48 flex items-center justify-center gap-2">
        {[
          { label: "숏북", color: "from-emerald-400 to-teal-500", icon: "📖" },
          { label: "숏뮤비", color: "from-violet-400 to-purple-500", icon: "🎬" },
          { label: "굿즈", color: "from-amber-400 to-orange-500", icon: "🎁" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1.5">
            <div className={`w-14 rounded-xl bg-gradient-to-br ${item.color} flex flex-col items-center justify-center shadow-md`} style={{height:"72px"}}>
              <span className="text-2xl">{item.icon}</span>
            </div>
            <span className="text-[10px] font-semibold text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function AboutPage() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </button>
          <span className="text-sm font-semibold text-gray-900">MetaBook 소개</span>
          <button
            onClick={() => router.push("/library")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary-500)] text-white rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            시작하기 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 히어로 */}
      <div className="bg-gradient-to-b from-gray-950 to-gray-900 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-200">책이 살아있는 세계</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            책 속 세계가
            <br />
            <span className="text-[#32d29d]">살아납니다.</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-lg mx-auto">
            MetaBook은 책을 읽는 경험을 완전히 바꿉니다.<br />
            QR 하나로 들어와 3D 세계를 탐험하고, 캐릭터와 대화하고,<br />
            독자들과 실시간으로 이야기를 나누세요.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {["QR 입장", "3D 탐험", "AI 채팅", "커뮤니티", "2차 창작"].map((tag) => (
              <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 기능 목록 */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">5가지 핵심 기능</h2>
          <p className="text-gray-500 text-sm">지금까지 경험하지 못한 새로운 독서의 세계</p>
        </div>

        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          return (
            <div
              key={feature.id}
              className="rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setActiveFeature(isActive ? null : feature.id)}
            >
              {/* 카드 헤더 */}
              <div className={`${feature.bg} px-6 py-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${feature.badgeColor}`}>
                          {feature.number}
                        </span>
                        <h3 className="text-base font-bold text-gray-900">{feature.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500">{feature.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-300 ${isActive ? "rotate-90" : ""}`}
                  />
                </div>
              </div>

              {/* 카드 상세 (펼침) */}
              {isActive && (
                <div className="px-6 py-5 bg-white border-t border-gray-100 grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${feature.iconColor}`} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-center">
                    {feature.visual}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 CTA */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-14 px-4">
        <div className="max-w-md mx-auto text-center space-y-5">
          <h2 className="text-2xl font-bold text-gray-900">지금 바로 시작해보세요</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            QR 코드를 스캔하거나, 도서 목록에서 책을 선택하면<br />
            MetaBook의 세계가 펼쳐집니다.
          </p>
          <button
            onClick={() => router.push("/library")}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-base shadow-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--color-primary-500)" }}
          >
            <Sparkles className="w-5 h-5" />
            도서 목록 보러 가기
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-gray-400">앱 설치 없이 브라우저에서 바로 이용 가능합니다</p>
        </div>
      </div>
    </div>
  );
}
