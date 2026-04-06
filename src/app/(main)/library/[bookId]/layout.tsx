"use client";

import { usePanelStore } from "@/store/panelStore";
import { BookOpen, MessageCircle, Library } from "lucide-react";
import Link from "next/link";
import JuniorBadge from "@/components/ui/JuniorBadge";
import UserMenu from "@/components/ui/UserMenu";


export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activePanel, setActivePanel } = usePanelStore();

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 상단 헤더 */}
      <header className="h-14 border-b border-mono-200 flex items-center justify-between px-4 flex-shrink-0" role="banner">
        <Link href="/library" className="focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 rounded">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_ogq_green.png" alt="OGQ" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <JuniorBadge />
          <UserMenu />
        </div>
      </header>

      {/* 3패널 본문 - 데스크탑 */}
      <div className="flex-1 overflow-hidden hidden md:flex" role="main">
        {children}
      </div>

      {/* 모바일: 단일 패널 + 하단 탭바 */}
      <div className="flex-1 overflow-hidden flex flex-col md:hidden">
        <div className="flex-1 overflow-auto" role="main">{children}</div>
        <nav className="h-14 border-t border-mono-200 flex items-center justify-around bg-white flex-shrink-0" role="navigation" aria-label="패널 전환">
          <TabButton
            icon={<Library className="w-5 h-5" />}
            label="서재"
            active={activePanel === "library"}
            onClick={() => setActivePanel("library")}
          />
          <TabButton
            icon={<BookOpen className="w-5 h-5" />}
            label="본문"
            active={activePanel === "content"}
            onClick={() => setActivePanel("content")}
          />
          <TabButton
            icon={<MessageCircle className="w-5 h-5" />}
            label="대화"
            active={activePanel === "chat"}
            onClick={() => setActivePanel("chat")}
          />
        </nav>
      </div>
    </div>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-primary-500 rounded ${
        active ? "text-primary-500" : "text-mono-400"
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
