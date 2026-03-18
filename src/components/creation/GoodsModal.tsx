"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Download, Bookmark, Sticker, Image as ImageIcon } from "lucide-react";
import { addCreation } from "@/lib/creation-store";

interface Props {
  bookTitle: string;
  bookId: string;
  onClose: () => void;
  onSaved: () => void;
}

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

export default function GoodsModal({ bookTitle, bookId, onClose, onSaved }: Props) {
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
    { type: "bookmark" as const, label: "책갈피", icon: Bookmark, desc: "내가 좋아하는 구절로 책갈피 만들기" },
    { type: "sticker" as const, label: "스티커", icon: Sticker, desc: "AI로 캐릭터 스티커 생성" },
    { type: "illustration" as const, label: "일러스트", icon: ImageIcon, desc: "장면을 AI 일러스트로 그리기" },
  ];

  // 책갈피 캔버스 렌더링
  const drawBookmark = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 200;
    const h = 640;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    // 배경색 + 투명도
    const alpha = opacity / 100;
    ctx.globalAlpha = alpha;

    // 모양 클리핑
    ctx.beginPath();
    if (shape === "rect") {
      ctx.rect(0, 0, w, h);
    } else if (shape === "rounded") {
      const r = 20;
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
      // 깃발형 (하단 V컷)
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(w / 2, h - 40);
      ctx.lineTo(0, h);
    }
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 1;

    // 텍스트
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `bold 16px ${font}, sans-serif`;

    const lines = wrapText(ctx, quote || "구절을 입력하세요", w - 40);
    const lineHeight = 24;
    const textStartY = h / 2 - (lines.length * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, textStartY + i * lineHeight);
    });

    // 하단 책 제목
    ctx.font = `12px ${font}, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(bookTitle, w / 2, shape === "flag" ? h - 60 : h - 30);
  }, [quote, color, shape, opacity, font, bookTitle]);

  useEffect(() => {
    if (step === "editor" && goodsType === "bookmark") {
      drawBookmark();
    }
  }, [step, goodsType, drawBookmark]);

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split("");
    const lines: string[] = [];
    let currentLine = "";

    for (const char of words) {
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
    onSaved();
    onClose();
  };

  // 스티커 생성
  const generateSticker = () => {
    if (!keyword.trim()) return;
    setIsLoadingImage(true);
    const styleMap: Record<string, string> = {
      cute: "cute kawaii cartoon sticker style, white border, simple background",
      realistic: "realistic detailed sticker, white border",
      anime: "anime style sticker, vibrant colors, white border",
    };
    const prompt = `${keyword}, ${styleMap[stickerStyle]}, high quality`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
    setGeneratedImageUrl(url);
  };

  // 일러스트 생성
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
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&nologo=true`;
    setGeneratedImageUrl(url);
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
      title:
        goodsType === "sticker"
          ? `스티커: ${keyword.slice(0, 20)}`
          : `일러스트: ${sceneDesc.slice(0, 20)}`,
      thumbnail: generatedImageUrl,
      content: generatedImageUrl,
    });
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-mono-200">
          <h2 className="text-lg font-bold text-mono-900">
            굿즈 만들기{step === "editor" && ` - ${typeCards.find((t) => t.type === goodsType)?.label}`}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-mono-100 rounded-lg">
            <X className="w-5 h-5 text-mono-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Step 1: 유형 선택 */}
          {step === "select" && (
            <div className="space-y-3">
              <p className="text-sm text-mono-600 mb-4">어떤 굿즈를 만들까요?</p>
              {typeCards.map((card) => (
                <button
                  key={card.type}
                  onClick={() => {
                    setGoodsType(card.type);
                    setStep("editor");
                    setGeneratedImageUrl("");
                    setIsLoadingImage(false);
                  }}
                  className="w-full p-4 border-2 border-mono-200 rounded-xl hover:border-orange-400 transition-colors text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <card.icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-mono-900">{card.label}</p>
                    <p className="text-sm text-mono-500">{card.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 책갈피 에디터 */}
          {step === "editor" && goodsType === "bookmark" && (
            <div className="flex gap-5 flex-col md:flex-row">
              {/* 옵션 패널 */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">구절 (최대 100자)</label>
                  <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value.slice(0, 100))}
                    placeholder="좋아하는 구절을 입력하세요"
                    className="w-full px-3 py-2 border border-mono-200 rounded-lg text-sm resize-none h-20"
                  />
                  <span className="text-xs text-mono-400">{quote.length}/100</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">색상</label>
                  <div className="flex gap-2 items-center">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-full border-2 ${color === c ? "border-mono-900 scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">모양</label>
                  <div className="flex gap-2">
                    {[
                      { v: "rect" as const, l: "직사각형" },
                      { v: "rounded" as const, l: "둥근형" },
                      { v: "flag" as const, l: "깃발형" },
                    ].map((s) => (
                      <button
                        key={s.v}
                        onClick={() => setShape(s.v)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          shape === s.v ? "bg-orange-500 text-white" : "bg-mono-100 text-mono-700"
                        }`}
                      >
                        {s.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">
                    불투명도: {opacity}%
                  </label>
                  <input
                    type="range"
                    min={30}
                    max={100}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-mono-700 mb-1">폰트</label>
                  <div className="flex gap-2">
                    {FONTS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFont(f)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          font === f ? "bg-orange-500 text-white" : "bg-mono-100 text-mono-700"
                        }`}
                        style={{ fontFamily: f }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={downloadCanvas}
                    className="flex-1 py-2.5 bg-mono-100 text-mono-700 rounded-xl text-sm hover:bg-mono-200 flex items-center justify-center gap-1"
                  >
                    <Download className="w-4 h-4" /> PNG 다운로드
                  </button>
                  <button
                    onClick={saveBookmark}
                    className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600"
                  >
                    갤러리에 저장
                  </button>
                </div>
              </div>

              {/* 미리보기 */}
              <div className="flex items-start justify-center">
                <canvas
                  ref={canvasRef}
                  className="border border-mono-200 rounded-lg"
                  style={{ width: 125, height: 400 }}
                />
              </div>
            </div>
          )}

          {/* 스티커 에디터 */}
          {step === "editor" && goodsType === "sticker" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">키워드</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="예: 총균쇠 얄리 캐릭터 스티커"
                  className="w-full px-3 py-2 border border-mono-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">스타일</label>
                <div className="flex gap-2">
                  {STICKER_STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStickerStyle(s.value)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        stickerStyle === s.value
                          ? "bg-orange-500 text-white"
                          : "bg-mono-100 text-mono-700 hover:bg-mono-200"
                      }`}
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
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-40 transition-colors"
                >
                  스티커 생성
                </button>
              )}

              {generatedImageUrl && (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImageUrl}
                      alt="Generated sticker"
                      className="w-64 h-64 object-contain rounded-xl border border-mono-200"
                      onLoad={() => setIsLoadingImage(false)}
                      onError={() => setIsLoadingImage(false)}
                    />
                  </div>
                  {isLoadingImage && (
                    <p className="text-center text-sm text-mono-500">이미지 생성 중...</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={downloadImage}
                      className="flex-1 py-2.5 bg-mono-100 text-mono-700 rounded-xl text-sm hover:bg-mono-200 flex items-center justify-center gap-1"
                    >
                      <Download className="w-4 h-4" /> PNG 다운로드
                    </button>
                    <button
                      onClick={saveImage}
                      className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600"
                    >
                      갤러리에 저장
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setGeneratedImageUrl("");
                      setIsLoadingImage(false);
                    }}
                    className="w-full py-2 text-sm text-mono-500 hover:text-mono-700"
                  >
                    다시 생성하기
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 일러스트 에디터 */}
          {step === "editor" && goodsType === "illustration" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">장면 묘사</label>
                <textarea
                  value={sceneDesc}
                  onChange={(e) => setSceneDesc(e.target.value)}
                  placeholder="예: 뉴기니 해안에서 얄리와 다이아몬드가 대화하는 장면"
                  className="w-full px-3 py-2 border border-mono-200 rounded-lg text-sm resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-mono-700 mb-1">스타일</label>
                <div className="flex gap-2 flex-wrap">
                  {ILLUST_STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setIllustStyle(s.value)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        illustStyle === s.value
                          ? "bg-orange-500 text-white"
                          : "bg-mono-100 text-mono-700 hover:bg-mono-200"
                      }`}
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
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-40 transition-colors"
                >
                  일러스트 생성
                </button>
              )}

              {generatedImageUrl && (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImageUrl}
                      alt="Generated illustration"
                      className="max-w-full max-h-96 object-contain rounded-xl border border-mono-200"
                      onLoad={() => setIsLoadingImage(false)}
                      onError={() => setIsLoadingImage(false)}
                    />
                  </div>
                  {isLoadingImage && (
                    <p className="text-center text-sm text-mono-500">이미지 생성 중...</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={downloadImage}
                      className="flex-1 py-2.5 bg-mono-100 text-mono-700 rounded-xl text-sm hover:bg-mono-200 flex items-center justify-center gap-1"
                    >
                      <Download className="w-4 h-4" /> PNG 다운로드
                    </button>
                    <button
                      onClick={saveImage}
                      className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600"
                    >
                      갤러리에 저장
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setGeneratedImageUrl("");
                      setIsLoadingImage(false);
                    }}
                    className="w-full py-2 text-sm text-mono-500 hover:text-mono-700"
                  >
                    다시 생성하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
