"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Sticker, Image as ImageIcon, Download, Gift, Loader2 } from "lucide-react";
import { mockBooks } from "@/lib/mock-data";
import { addCreation } from "@/lib/creation-store";

type GoodsType = "bookmark" | "sticker" | "illustration";
type Step = "select" | "editor";

const PRESET_COLORS = ["#32d29d", "#7e5ae2", "#1384d7", "#e21235", "#f5a623", "#262d2e"];
const FONTS = ["Pretendard", "Noto Serif KR", "Noto Sans KR"];
const STICKER_STYLES = [
  { value: "cute", label: "귀여운" },
  { value: "realistic", label: "사실적" },
  { value: "anime", label: "애니메이션풍" },
];
const ILLUST_STYLES = [
  { value: "watercolor", label: "수채화" },
  { value: "pen-sketch", label: "펜 스케치" },
  { value: "anime", label: "애니메이션" },
  { value: "realistic", label: "사실적" },
];

function GoodsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get("bookId") || "";
  const book = mockBooks.find((b) => b.id === bookId);
  const bookTitle = book?.title || "";

  const [step, setStep] = useState<Step>("select");
  const [goodsType, setGoodsType] = useState<GoodsType>("bookmark");

  // 책갈피 상태
  const [quote, setQuote] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [shape, setShape] = useState<"rect" | "rounded" | "flag">("rect");
  const [opacity, setOpacity] = useState(80);
  const [font, setFont] = useState(FONTS[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 스티커/일러스트 상태
  const [keyword, setKeyword] = useState("");
  const [stickerStyle, setStickerStyle] = useState("cute");
  const [illustStyle, setIllustStyle] = useState("watercolor");
  const [sceneDesc, setSceneDesc] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const typeCards = [
    { type: "bookmark" as const, label: "책갈피", icon: Bookmark, desc: "좋아하는 구절로 나만의 책갈피 만들기" },
    { type: "sticker" as const, label: "스티커", icon: Sticker, desc: "AI로 캐릭터 스티커 생성" },
    { type: "illustration" as const, label: "일러스트", icon: ImageIcon, desc: "장면을 AI 일러스트로 그리기" },
  ];

  // 책갈피 캔버스 렌더링
  const drawBookmark = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 400;
    const h = 1280;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    const alpha = opacity / 100;
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    if (shape === "rect") {
      ctx.rect(0, 0, w, h);
    } else if (shape === "rounded") {
      const r = 40;
      ctx.moveTo(r, 0);
      ctx.lineTo(w - r, 0);
      ctx.quadraticCurveTo(w, 0, w, r);
      ctx.lineTo(w, h - r);
      ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h);
      ctx.quadraticCurveTo(0, h, 0, h - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
    } else {
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(w / 2, h - 80);
      ctx.lineTo(0, h);
    }
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `bold 32px ${font}, sans-serif`;

    const lines = wrapText(ctx, quote || "구절을 입력하세요", w - 80);
    const lineHeight = 48;
    const textStartY = h / 2 - (lines.length * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, textStartY + i * lineHeight);
    });

    ctx.font = `24px ${font}, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(bookTitle, w / 2, shape === "flag" ? h - 120 : h - 60);
  }, [quote, color, shape, opacity, font, bookTitle]);

  useEffect(() => {
    if (step === "editor" && goodsType === "bookmark") {
      drawBookmark();
    }
  }, [step, goodsType, drawBookmark]);

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const chars = text.split("");
    const lines: string[] = [];
    let currentLine = "";
    for (const char of chars) {
      const testLine = currentLine + char;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `bookmark_${bookTitle}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const saveBookmark = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const thumbnail = canvas.toDataURL("image/png");
    addCreation({
      bookId,
      bookTitle,
      type: "goods",
      title: `책갈피: ${quote.slice(0, 20)}...`,
      thumbnail,
      content: quote,
    });
    router.push(`/library/${bookId}`);
  };

  const generateSticker = () => {
    if (!keyword.trim()) return;
    setIsLoadingImage(true);
    const styleMap: Record<string, string> = {
      cute: "cute kawaii cartoon sticker style, white border, simple background",
      realistic: "realistic detailed sticker, white border",
      anime: "anime style sticker, vibrant colors, white border",
    };
    const prompt = `${keyword}, ${styleMap[stickerStyle]}, high quality`;
    setGeneratedImageUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`);
  };

  const generateIllustration = () => {
    if (!sceneDesc.trim()) return;
    setIsLoadingImage(true);
    const styleMap: Record<string, string> = {
      watercolor: "watercolor painting style, soft colors, artistic",
      "pen-sketch": "pen and ink sketch style, detailed line art",
      anime: "anime illustration style, vibrant, detailed",
      realistic: "photorealistic digital painting, detailed, cinematic lighting",
    };
    const prompt = `${sceneDesc}, ${styleMap[illustStyle]}, high quality illustration`;
    setGeneratedImageUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&nologo=true`);
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement("a");
    link.download = `${goodsType}_${bookTitle}.png`;
    link.href = generatedImageUrl;
    link.target = "_blank";
    link.click();
  };

  const saveImage = () => {
    addCreation({
      bookId,
      bookTitle,
      type: "goods",
      title: goodsType === "sticker" ? `스티커: ${keyword.slice(0, 20)}` : `일러스트: ${sceneDesc.slice(0, 20)}`,
      thumbnail: generatedImageUrl,
      content: generatedImageUrl,
    });
    router.push(`/library/${bookId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-mono-010)]">
      <header className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push(`/library/${bookId}`)}
            className="p-2 rounded-lg hover:bg-[var(--color-mono-050)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--color-mono-700)]" />
          </button>
          <h1 className="text-lg font-bold text-[var(--color-mono-990)]">
            굿즈 만들기{step === "editor" && ` — ${typeCards.find((t) => t.type === goodsType)?.label}`}
          </h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        {/* 좌측 사이드바 */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-5 sticky top-24">
            <div className="w-full aspect-[3/4] bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-4">
              {book?.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Gift className="w-10 h-10 text-orange-300" />
              )}
            </div>
            <h3 className="font-bold text-[var(--color-mono-990)] text-sm">{book?.title}</h3>
            <p className="text-xs text-[var(--color-mono-400)] mt-1">{book?.author}</p>
          </div>
        </aside>

        {/* 우측 메인 */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-6 md:p-8">
            {/* Step 1: 유형 선택 */}
            {step === "select" && (
              <div className="max-w-lg mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-mono-990)]">어떤 굿즈를 만들까요?</h2>
                  <p className="text-sm text-[var(--color-mono-400)] mt-1">만들고 싶은 굿즈 유형을 선택해주세요</p>
                </div>
                <div className="space-y-4">
                  {typeCards.map((card) => (
                    <button
                      key={card.type}
                      onClick={() => { setGoodsType(card.type); setStep("editor"); setGeneratedImageUrl(""); setIsLoadingImage(false); }}
                      className="w-full p-5 border-2 border-[var(--color-mono-080)] rounded-2xl hover:border-orange-300 transition-colors text-left flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <card.icon className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--color-mono-990)] text-lg">{card.label}</p>
                        <p className="text-sm text-[var(--color-mono-400)]">{card.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 책갈피 에디터 */}
            {step === "editor" && goodsType === "bookmark" && (
              <div>
                <button onClick={() => setStep("select")} className="text-sm text-[var(--color-primary-500)] hover:underline mb-4">← 돌아가기</button>
                <div className="flex gap-8 flex-col lg:flex-row">
                  {/* 옵션 패널 */}
                  <div className="flex-1 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">구절 (최대 100자)</label>
                      <textarea
                        value={quote}
                        onChange={(e) => setQuote(e.target.value.slice(0, 100))}
                        placeholder="좋아하는 구절을 입력하세요"
                        className="w-full px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm resize-none h-24 bg-white"
                      />
                      <span className="text-xs text-[var(--color-mono-300)]">{quote.length}/100</span>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">색상</label>
                      <div className="flex gap-2.5 items-center">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? "border-[var(--color-mono-990)] scale-110" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">모양</label>
                      <div className="flex gap-2">
                        {[
                          { v: "rect" as const, l: "직사각형" },
                          { v: "rounded" as const, l: "둥근형" },
                          { v: "flag" as const, l: "깃발형" },
                        ].map((s) => (
                          <button
                            key={s.v}
                            onClick={() => setShape(s.v)}
                            className={`px-4 py-2 text-sm rounded-xl transition-colors ${shape === s.v ? "bg-orange-500 text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-700)]"}`}
                          >
                            {s.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">불투명도: {opacity}%</label>
                      <input type="range" min={30} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">폰트</label>
                      <div className="flex gap-2">
                        {FONTS.map((f) => (
                          <button
                            key={f}
                            onClick={() => setFont(f)}
                            className={`px-4 py-2 text-sm rounded-xl transition-colors ${font === f ? "bg-orange-500 text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-700)]"}`}
                            style={{ fontFamily: f }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={downloadCanvas} className="flex-1 py-3 bg-[var(--color-mono-050)] text-[var(--color-mono-700)] rounded-xl text-sm font-medium hover:bg-[var(--color-mono-080)] flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> PNG 다운로드
                      </button>
                      <button onClick={saveBookmark} className="flex-1 py-3 bg-[var(--color-primary-500)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-600)]">
                        갤러리에 저장
                      </button>
                    </div>
                  </div>

                  {/* 캔버스 미리보기 */}
                  <div className="flex items-start justify-center lg:w-48">
                    <canvas ref={canvasRef} className="border border-[var(--color-mono-080)] rounded-xl shadow-sm" style={{ width: 150, height: 480 }} />
                  </div>
                </div>
              </div>
            )}

            {/* 스티커 에디터 */}
            {step === "editor" && goodsType === "sticker" && (
              <div className="max-w-lg mx-auto">
                <button onClick={() => setStep("select")} className="text-sm text-[var(--color-primary-500)] hover:underline mb-4">← 돌아가기</button>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">키워드</label>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="예: 총균쇠 얄리 캐릭터 스티커"
                      className="w-full px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">스타일</label>
                    <div className="flex gap-2">
                      {STICKER_STYLES.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => setStickerStyle(s.value)}
                          className={`px-4 py-2 text-sm rounded-xl transition-colors ${stickerStyle === s.value ? "bg-orange-500 text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-700)]"}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!generatedImageUrl && (
                    <button
                      onClick={generateSticker}
                      disabled={!keyword.trim()}
                      className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-40 transition-colors"
                    >
                      스티커 생성
                    </button>
                  )}

                  {generatedImageUrl && (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={generatedImageUrl}
                          alt="Generated sticker"
                          className="w-72 h-72 object-contain rounded-2xl border border-[var(--color-mono-080)] shadow-sm"
                          onLoad={() => setIsLoadingImage(false)}
                          onError={() => setIsLoadingImage(false)}
                        />
                      </div>
                      {isLoadingImage && <p className="text-center text-sm text-[var(--color-mono-400)]">이미지 생성 중...</p>}
                      <div className="flex gap-3">
                        <button onClick={downloadImage} className="flex-1 py-3 bg-[var(--color-mono-050)] text-[var(--color-mono-700)] rounded-xl text-sm font-medium hover:bg-[var(--color-mono-080)] flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" /> PNG 다운로드
                        </button>
                        <button onClick={saveImage} className="flex-1 py-3 bg-[var(--color-primary-500)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-600)]">
                          갤러리에 저장
                        </button>
                      </div>
                      <button onClick={() => { setGeneratedImageUrl(""); setIsLoadingImage(false); }} className="w-full py-2.5 text-sm text-[var(--color-mono-400)] hover:text-[var(--color-mono-700)]">
                        다시 생성하기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 일러스트 에디터 */}
            {step === "editor" && goodsType === "illustration" && (
              <div className="max-w-lg mx-auto">
                <button onClick={() => setStep("select")} className="text-sm text-[var(--color-primary-500)] hover:underline mb-4">← 돌아가기</button>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">장면 묘사</label>
                    <textarea
                      value={sceneDesc}
                      onChange={(e) => setSceneDesc(e.target.value)}
                      placeholder="예: 뉴기니 해안에서 얄리와 다이아몬드가 대화하는 장면"
                      className="w-full px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm resize-none h-28 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">스타일</label>
                    <div className="flex gap-2 flex-wrap">
                      {ILLUST_STYLES.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => setIllustStyle(s.value)}
                          className={`px-4 py-2 text-sm rounded-xl transition-colors ${illustStyle === s.value ? "bg-orange-500 text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-700)]"}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!generatedImageUrl && (
                    <button
                      onClick={generateIllustration}
                      disabled={!sceneDesc.trim()}
                      className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-40 transition-colors"
                    >
                      일러스트 생성
                    </button>
                  )}

                  {generatedImageUrl && (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={generatedImageUrl}
                          alt="Generated illustration"
                          className="max-w-full max-h-[400px] object-contain rounded-2xl border border-[var(--color-mono-080)] shadow-sm"
                          onLoad={() => setIsLoadingImage(false)}
                          onError={() => setIsLoadingImage(false)}
                        />
                      </div>
                      {isLoadingImage && <p className="text-center text-sm text-[var(--color-mono-400)]">이미지 생성 중...</p>}
                      <div className="flex gap-3">
                        <button onClick={downloadImage} className="flex-1 py-3 bg-[var(--color-mono-050)] text-[var(--color-mono-700)] rounded-xl text-sm font-medium hover:bg-[var(--color-mono-080)] flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" /> PNG 다운로드
                        </button>
                        <button onClick={saveImage} className="flex-1 py-3 bg-[var(--color-primary-500)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-600)]">
                          갤러리에 저장
                        </button>
                      </div>
                      <button onClick={() => { setGeneratedImageUrl(""); setIsLoadingImage(false); }} className="w-full py-2.5 text-sm text-[var(--color-mono-400)] hover:text-[var(--color-mono-700)]">
                        다시 생성하기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function GoodsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}>
      <GoodsContent />
    </Suspense>
  );
}
