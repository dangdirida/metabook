"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, Share2, ArrowLeft, RotateCcw, Pause, Play } from "lucide-react";
import { Suspense } from "react";

function BookmarkViewer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const angleRef = useRef(0);
  const [isRotating, setIsRotating] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const isRotatingRef = useRef(true);

  const imageUrl = decodeURIComponent(searchParams.get("image") || "");
  const title = decodeURIComponent(searchParams.get("title") || "책갈피");
  const book = decodeURIComponent(searchParams.get("book") || "");
  const price = searchParams.get("price") || "9,900";

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 500;
    canvas.height = 500;

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    const draw = () => {
      ctx.clearRect(0, 0, 500, 500);

      // 배경
      const bg = ctx.createRadialGradient(250, 250, 0, 250, 250, 350);
      bg.addColorStop(0, "#1a1a2e");
      bg.addColorStop(1, "#0d0d1a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 500, 500);

      // 바닥 글로우
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(250, 400, 80, 15, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(50,210,157,0.15)";
      ctx.fill();
      ctx.restore();

      const angle = angleRef.current;
      const scaleX = Math.cos(angle);
      const BW = 110;
      const BH = 340;
      const cx = 250, cy = 240;
      const perspW = Math.abs(scaleX) * BW;

      if (perspW > 1) {
        ctx.save();
        // 그림자
        ctx.shadowColor = "rgba(50,210,157,0.3)";
        ctx.shadowBlur = 30;

        const isFront = scaleX >= 0;

        if (isFront) {
          // 앞면
          ctx.beginPath();
          ctx.rect(cx - perspW/2, cy - BH/2, perspW, BH);
          ctx.clip();

          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, cx - perspW/2, cy - BH/2, perspW, BH);
          } else {
            const grad = ctx.createLinearGradient(cx - perspW/2, cy - BH/2, cx + perspW/2, cy + BH/2);
            grad.addColorStop(0, "#00c389");
            grad.addColorStop(0.5, "#32d29d");
            grad.addColorStop(1, "#00b57f");
            ctx.fillStyle = grad;
            ctx.fillRect(cx - perspW/2, cy - BH/2, perspW, BH);

            // 텍스트 placeholder
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.font = "bold 14px Pretendard, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("책갈피", cx, cy);
          }

          // 하이라이트
          const hi = ctx.createLinearGradient(cx - perspW/2, 0, cx + perspW/2, 0);
          hi.addColorStop(0, "rgba(255,255,255,0.25)");
          hi.addColorStop(0.4, "rgba(255,255,255,0)");
          ctx.globalAlpha = scaleX;
          ctx.fillStyle = hi;
          ctx.fillRect(cx - perspW/2, cy - BH/2, perspW, BH);
          ctx.globalAlpha = 1;
        } else {
          // 뒷면
          ctx.beginPath();
          ctx.rect(cx - perspW/2, cy - BH/2, perspW, BH);
          ctx.clip();
          ctx.fillStyle = "#0a3d28";
          ctx.fillRect(cx - perspW/2, cy - BH/2, perspW, BH);
        }

        ctx.restore();

        // 두께 (측면)
        ctx.save();
        const sideW = 6;
        ctx.fillStyle = isFront ? "#007a58" : "#004d37";
        if (isFront) {
          ctx.fillRect(cx + perspW/2, cy - BH/2, sideW * scaleX, BH);
        } else {
          ctx.fillRect(cx - perspW/2 - sideW * Math.abs(scaleX), cy - BH/2, sideW * Math.abs(scaleX), BH);
        }
        ctx.restore();
      }

      // 반사
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.transform(1, 0, 0, -0.3, 0, cy + BH/2 + (500 - cy - BH/2) * 0.3 + cy + BH/2);
      if (perspW > 1 && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, cx - perspW/2, cy - BH/2, perspW, BH);
      }
      ctx.restore();

      // 파티클
      for (let i = 0; i < 8; i++) {
        const t = angle * 0.7 + i * 0.8;
        const px = 100 + Math.sin(t) * 180;
        const py = 100 + Math.cos(t * 0.7) * 150;
        const r = 1.5 + Math.sin(t * 1.3) * 1;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(50,210,157,${0.2 + Math.sin(t) * 0.15})`;
        ctx.fill();
      }

      if (isRotatingRef.current) angleRef.current += 0.02;
      animRef.current = requestAnimationFrame(draw);
    };

    img.onload = () => { cancelAnimationFrame(animRef.current); animRef.current = requestAnimationFrame(draw); };
    img.onerror = () => { cancelAnimationFrame(animRef.current); animRef.current = requestAnimationFrame(draw); };

    if (imageUrl) { img.src = imageUrl; }
    else { animRef.current = requestAnimationFrame(draw); }

    return () => cancelAnimationFrame(animRef.current);
  }, [imageUrl]);

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">돌아가기</span>
        </button>
        <h1 className="text-sm font-semibold text-white/80">3D 책갈피 미리보기</h1>
        <button className="text-white/60 hover:text-white transition-colors"><Share2 className="w-5 h-5" /></button>
      </header>

      <div className="flex-1 flex flex-col items-center px-6 py-8 gap-6 max-w-md mx-auto w-full">
        {/* 3D 캔버스 */}
        <div className="relative w-full">
          <canvas ref={canvasRef} className="w-full rounded-2xl" style={{ aspectRatio: "1" }} />
          <button
            onClick={() => setIsRotating(v => !v)}
            className="absolute bottom-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
          >
            {isRotating ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
          </button>
          <button
            onClick={() => { angleRef.current = 0; }}
            className="absolute bottom-4 left-4 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* 정보 */}
        <div className="w-full space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold">{title}</h2>
            {book && <p className="text-sm text-white/50 mt-1">{book}</p>}
          </div>

          <div className="bg-white/5 rounded-2xl p-5 space-y-3 border border-white/10">
            {[
              ["상품 유형", "철제 책갈피"],
              ["재질", "PVC 코팅 + 왜등 금속"],
              ["배송", "주문 후 5-7일"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-white/50 text-sm">{k}</span>
                <span className="text-sm font-medium">{v}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="text-white/50 text-sm">가격</span>
              <span className="text-2xl font-bold text-[#32d29d]">{price}원</span>
            </div>
          </div>

          {purchased ? (
            <div className="w-full py-4 bg-[#32d29d]/10 border border-[#32d29d]/30 rounded-2xl text-center">
              <p className="text-[#32d29d] font-bold text-lg">구매 완료! 감사합니다</p>
              <p className="text-white/40 text-sm mt-1">주문 확인 이메일을 보내드리겠습니다.</p>
            </div>
          ) : (
            <button
              onClick={() => setPurchased(true)}
              className="w-full py-4 bg-[#32d29d] hover:bg-[#00c389] active:scale-95 text-[#0d0d1a] rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              구매하기
            </button>
          )}
          <p className="text-center text-white/20 text-xs">다른 유저가 직접 디자인한 책갈피입니다</p>
        </div>
      </div>
    </div>
  );
}

export default function BookmarkPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#32d29d] border-t-transparent rounded-full animate-spin" /></div>}>
      <BookmarkViewer />
    </Suspense>
  );
}
