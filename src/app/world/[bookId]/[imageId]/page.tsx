"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Camera,
  Share2,
  MessageCircle,
  Maximize,
  ChevronRight,
  X,
  Bot,
} from "lucide-react";
import { getBookById } from "@/lib/mock-data";

export default function WorldViewerPage() {
  const { bookId, imageId } = useParams();
  const book = getBookById(bookId as string);
  const image = book?.images?.find(img => img.id === imageId) ?? book?.images?.[0];
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // 마우스/터치로 3D tilt 효과
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * -20;
    setRotation({ x, y });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  // 터치 드래그 pan
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    setRotation((prev) => ({
      x: Math.max(-30, Math.min(30, prev.x + dy * 0.2)),
      y: Math.max(-30, Math.min(30, prev.y - dx * 0.2)),
    }));
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handle3DExplore = () => {
    const targetUrl = image?.worldUrl || book?.worldUrl;
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleScreenshot = () => {
    alert("스크린샷이 저장되었습니다! (스텁)");
  };

  return (
    <div className="min-h-screen bg-mono-900 text-white relative overflow-hidden">
      {/* 전체화면 뷰어 */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        {/* 삽화 with CSS 3D tilt */}
        <div
          className="w-[80vw] h-[60vh] max-w-4xl rounded-2xl overflow-hidden relative transition-transform duration-100"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {image?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          ) : book?.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-900/50 via-primary-800/30 to-primary-900/50 flex items-center justify-center">
              <p className="text-2xl font-bold">{book?.title || "책"}</p>
            </div>
          )}
          {image?.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-white text-lg font-medium">{image.caption}</p>
            </div>
          )}
        </div>
      </div>

      {/* 상단 헤더 */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-20">
        <a
          href={`/library/${bookId}`}
          className="text-lg font-bold"
        >
          Meta<span className="text-primary-400">Book</span>
          <span className="text-mono-500 text-sm ml-2">World</span>
        </a>
        <button
          onClick={() => window.close()}
          className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* 3D 탐험 버튼 */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={handle3DExplore}
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30"
        >
          <Maximize className="w-5 h-5" />
          🌐 WorldLabs에서 탐험하기
        </button>
      </div>

      {/* 우측 플로팅 패널 */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        <button
          onClick={handleScreenshot}
          className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          title="스크린샷"
        >
          <Camera className="w-5 h-5" />
        </button>
        <button
          className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          title="공유"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowAgentPanel(!showAgentPanel)}
          className={`p-3 rounded-xl transition-colors ${
            showAgentPanel ? "bg-primary-500" : "bg-white/10 hover:bg-white/20"
          }`}
          title="AI 대화"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Agent 패널 (슬라이드인) */}
      {showAgentPanel && book && (
        <div className="absolute right-16 top-1/2 -translate-y-1/2 z-20 w-72 bg-mono-800/90 backdrop-blur-lg rounded-2xl border border-mono-700 p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary-400" />
            등장인물
          </h4>
          <div className="space-y-2">
            {book.agents.map((agent) => (
              <button
                key={agent.id}
                className="w-full flex items-center gap-3 p-3 bg-mono-700/50 rounded-xl hover:bg-mono-700 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-400">
                    {agent.name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  <p className="text-xs text-mono-400">{agent.personality[0]}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-mono-500" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
