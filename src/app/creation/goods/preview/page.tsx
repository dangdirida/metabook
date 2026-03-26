"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Share2, ArrowLeft, RotateCcw } from "lucide-react";

interface Props {
  params: { id: string };
  searchParams: { image?: string; title?: string; book?: string; price?: string };
}

export default function BookmarkPreviewPage({ params, searchParams }: Props) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isRotating, setIsRotating] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const imageUrl = decodeURIComponent(searchParams.image || "");
  const title = decodeURIComponent(searchParams.title || "\ucc45\uac08\ud53c");
  const book = decodeURIComponent(searchParams.book || "");
  const price = searchParams.price || "9,900";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 600;

    let angle = 0;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl || "";

    const draw = () => {
      ctx.clearRect(0, 0, 600, 600);

      // 배경
      const bg = ctx.createRadialGradient(300, 300, 0, 300, 300, 400);
      bg.addColorStop(0, "#1a1a2e");
      bg.addColorStop(1, "#0a0a14");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 600, 600);

      // 그림자
      const scaleX = Math.cos(angle);
      const w = 120;
      const h = 380;
      const cx = 300;
      const cy = 300;

      ctx.save();
      ctx.shadowColor = "rgba(50,210,157,0.4)";
      ctx.shadowBlur = 40;

      // 책갈피 3D 효과
      const perspW = Math.abs(scaleX) * w;
      if (perspW > 2) {
        ctx.save();
        ctx.beginPath();
        // 앞면/뒷면 판별
        if (scaleX >= 0) {
          // 앞면: 이미지 또는 색상
          if (img.complete && img.naturalWidth > 0) {
            ctx.rect(cx - perspW / 2, cy - h / 2, perspW, h);
            ctx.clip();
            // 원근 변환으로 이미지 그리기
            ctx.drawImage(img, cx - perspW / 2, cy - h / 2, perspW, h);
          } else {
            ctx.rect(cx - perspW / 2, cy - h / 2, perspW, h);
            ctx.clip();
            const grad = ctx.createLinearGradient(cx - perspW/2, 0, cx + perspW/2, 0);
            grad.addColorStop(0, "#00c389");
            grad.addColorStop(1, "#32d29d");
            ctx.fillStyle = grad;
            ctx.fillRect(cx - perspW / 2, cy - h / 2, perspW, h);
          }
          // 하이라이트
          ctx.globalAlpha = 0.15 * scaleX;
          const hi = ctx.createLinearGradient(cx - perspW/2, 0, cx + perspW/2, 0);
          hi.addColorStop(0, "white");
          hi.addColorStop(0.3, "transparent");
          ctx.fillStyle = hi;
          ctx.fillRect(cx - perspW / 2, cy - h / 2, perspW, h);
          ctx.globalAlpha = 1;
        } else {
          // 뒷면: 어두운 면
          ctx.rect(cx - perspW / 2, cy - h / 2, perspW, h);
          ctx.clip();
          ctx.fillStyle = "#0d4a35";
          ctx.fillRect(cx - perspW / 2, cy - h / 2, perspW, h);
        }
        ctx.restore();

        // 측면 두께
        const thickness = 8;
        ctx.save();
        ctx.fillStyle = scaleX >= 0 ? "#007a58" : "#006147";
        const sideX = scaleX >= 0 ? cx + perspW / 2 : cx - perspW / 2;
        ctx.fillRect(sideX - (scaleX >= 0 ? 0 : thickness), cy - h/2, thickness, h);
        ctx.restore();
      }

      ctx.restore();

      // 바닥 반사
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.scale(1, -0.2);
      const perspW2 = Math.abs(scaleX) * w;
      if (perspW2 > 2 && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, cx - perspW2 / 2, -(cy + h/2 + 600*4 + h), perspW2, h);
      }
      ctx.restore();

      // 파티클 효과
      for (let i = 0; i < 6; i++) {
        const px = 200 + Math.sin(angle * 2 + i) * 150;
        const py = 200 + Math.cos(angle * 1.5 + i * 1.2) * 150;
        const r = 2 + Math.sin(angle + i) * 1;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(50,210,157,${0.3 + Math.sin(angle + i) * 0.2})`;
        ctx.fill();
      }

      if (isRotating) angle += 0.02;
      animRef.current = requestAnimationFrame(draw);
    };

    img.onload = () => { animRef.current = requestAnimationFrame(draw); };
    if (!imageUrl) animRef.current = requestAnimationFrame(draw);
    img.src = imageUrl || "";
    if (!imageUrl || img.complete) animRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animRef.current);
  }, [imageUrl, isRotating]);

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">돌아가기</span>
        </button>
        <h1 className="text-sm font-semibold text-white/80">3D 미리보기</h1>
        <button className="text-white/60 hover:text-white transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <div className="flex flex-col items-center px-6 py-8 gap-8">
        {/* 3D 캔버스 */}
        <div className="relative">
          <canvas ref={canvasRef} className="rounded-2xl" style={{ width: 320, height: 320 }} />
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="absolute bottom-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* 정보 */}
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold">{title}</h2>
            {book && <p className="text-sm text-white/50 mt-1">{book}</p>}
          </div>

          <div className="bg-white/5 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">상품 유형</span>
              <span className="text-sm font-medium">철제 책갈피</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">재질</span>
              <span className="text-sm font-medium">PVC 코팅 + 왜등금속</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">배송</span>
              <span className="text-sm font-medium">주문 후 5-7일</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="text-white/60 text-sm">가격</span>
              <span className="text-xl font-bold text-[#32d29d]">{price}원</span>
            </div>
          </div>

          {purchased ? (
            <div className="w-full py-4 bg-[#32d29d]/20 border border-[#32d29d]/40 rounded-2xl text-center">
              <p className="text-[#32d29d] font-semibold">구매가 완료되었어요! 🎉</p>
              <p className="text-white/50 text-sm mt-1">주문 확인 이메일을 보내드리겠습니다.</p>
            </div>
          ) : (
            <button
              onClick={() => setPurchased(true)}
              className="w-full py-4 bg-[#32d29d] hover:bg-[#00c389] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors text-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              구매하기
            </button>
          )}

          <p className="text-center text-white/30 text-xs">
            다른 유저가 직접 디자인한 책갈피입니다
          </p>
        </div>
      </div>
    </div>
  );
}
