"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Bookmark, Sticker, Image as ImageIcon, Download, Gift, Loader2,
  AlignLeft, AlignCenter, AlignRight, Smartphone, Square, Coffee, CreditCard,
  Upload, X, CheckCircle, Save,
} from "lucide-react";
import { mockBooks } from "@/lib/mock-data";
import { addCreation } from "@/lib/creation-store";

type GoodsType = "bookmark" | "sticker" | "illustration" | "phone-case" | "cushion" | "tumbler" | "photocard";
type Step = "select" | "editor" | "mockup" | "done";
type ResizeHandle = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";

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

const PRODUCT_META: Record<string, { canvasWidth: number; canvasHeight: number }> = {
  "phone-case": { canvasWidth: 300, canvasHeight: 520 },
  cushion: { canvasWidth: 400, canvasHeight: 400 },
  tumbler: { canvasWidth: 280, canvasHeight: 480 },
  photocard: { canvasWidth: 260, canvasHeight: 360 },
};

const STEP_LABELS: Record<Step, string> = { select: "제품 선택", editor: "디자인", mockup: "목업 배치", done: "완성" };
const STEPS: Step[] = ["select", "editor", "mockup", "done"];

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
  const [fontSize, setFontSize] = useState<number>(32);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 스티커/일러스트
  const [keyword, setKeyword] = useState("");
  const [stickerStyle, setStickerStyle] = useState("cute");
  const [illustStyle, setIllustStyle] = useState("watercolor");
  const [sceneDesc, setSceneDesc] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // 새 제품 모드
  const [designMode, setDesignMode] = useState<"custom" | "photo">("custom");
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

  // 목업 배치
  const [designPos, setDesignPos] = useState({ x: 50, y: 80 });
  const [designSize, setDesignSize] = useState({ width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mockupRef = useRef<HTMLDivElement>(null);

  // 완성
  const [finalImage, setFinalImage] = useState<string | null>(null);

  const isNewProduct = ["phone-case", "cushion", "tumbler", "photocard"].includes(goodsType);
  const productMeta = PRODUCT_META[goodsType] || { canvasWidth: 300, canvasHeight: 400 };

  const typeCards = [
    { type: "bookmark" as GoodsType, label: "책갈피", icon: Bookmark, desc: "좋아하는 구절로 나만의 책갈피" },
    { type: "sticker" as GoodsType, label: "스티커", icon: Sticker, desc: "AI로 캐릭터 스티커 생성" },
    { type: "illustration" as GoodsType, label: "일러스트", icon: ImageIcon, desc: "장면을 AI 일러스트로" },
    { type: "phone-case" as GoodsType, label: "폰케이스", icon: Smartphone, desc: "나만의 폰케이스 디자인" },
    { type: "cushion" as GoodsType, label: "쿠션", icon: Square, desc: "포근한 나만의 쿠션" },
    { type: "tumbler" as GoodsType, label: "텀블러", icon: Coffee, desc: "매일 쓰는 나만의 텀블러" },
    { type: "photocard" as GoodsType, label: "포토카드", icon: CreditCard, desc: "책 속 인물 포토카드" },
  ];

  // 책갈피 캔버스
  const drawBookmark = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = 400; const h = 1280;
    canvas.width = w; canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.save(); ctx.beginPath();
    if (shape === "rect") { ctx.rect(0, 0, w, h); }
    else if (shape === "rounded") { const r = 80; ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r); ctx.lineTo(w, h - r); ctx.quadraticCurveTo(w, h, w - r, h); ctx.lineTo(r, h); ctx.quadraticCurveTo(0, h, 0, h - r); ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); }
    else { ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h - 60); ctx.lineTo(w / 2, h - 120); ctx.lineTo(0, h - 60); }
    ctx.closePath(); ctx.clip();
    if (bgImage && bgImageRef.current) {
      ctx.globalAlpha = opacity / 100;
      const img = bgImageRef.current; const ir = img.width / img.height; const cr = w / h;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (ir > cr) { sw = img.height * cr; sx = (img.width - sw) / 2; } else { sh = img.width / cr; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      ctx.globalAlpha = 0.35; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
    } else { ctx.globalAlpha = opacity / 100; ctx.fillStyle = color; ctx.fillRect(0, 0, w, h); }
    ctx.globalAlpha = 1;
    const ff = font === "Noto Serif KR" ? "'Noto Serif KR', serif" : font === "Noto Sans KR" ? "'Noto Sans KR', sans-serif" : "'Pretendard', sans-serif";
    ctx.fillStyle = "#fff"; ctx.textBaseline = "middle";
    const ax = textAlign === "left" ? 40 : textAlign === "right" ? w - 40 : w / 2; ctx.textAlign = textAlign;
    const rawLines = (quote || "구절을 입력하세요").split("\n"); const wl: string[] = [];
    for (const raw of rawLines) { if (!raw.trim()) { wl.push(""); continue; } ctx.font = `${fontSize}px ${ff}`; const mw = w - 80; let cur = "";
      for (const ch of raw) { const t = cur + ch; if (ctx.measureText(t).width > mw && cur) { wl.push(cur); cur = ch; } else { cur = t; } } if (cur) wl.push(cur); }
    const lh = fontSize * 1.6; const th = wl.length * lh; const sy2 = h / 2 - th / 2 + lh / 2;
    ctx.font = `${fontSize}px ${ff}`; wl.forEach((l, i) => { ctx.fillText(l, ax, sy2 + i * lh); });
    ctx.font = `18px ${ff}`; ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.textAlign = "center";
    ctx.fillText(bookTitle, w / 2, shape === "flag" ? h - 160 : h - 60); ctx.restore();
  }, [quote, color, shape, opacity, font, fontSize, textAlign, bgImage, bookTitle]);

  useEffect(() => { if (step === "editor" && goodsType === "bookmark") drawBookmark(); }, [step, goodsType, drawBookmark]);

  const downloadCanvas = () => { const c = canvasRef.current; if (!c) return; const a = document.createElement("a"); a.download = `bookmark_${bookTitle}.png`; a.href = c.toDataURL("image/png"); a.click(); };
  const saveBookmark = () => { const c = canvasRef.current; if (!c) return; const t = c.toDataURL("image/png"); addCreation({ bookId, bookTitle, type: "goods", title: `책갈피: ${quote.slice(0, 20)}...`, thumbnail: t, content: quote }); router.push(`/library/${bookId}`); };

  const generateSticker = () => { if (!keyword.trim()) return; setIsLoadingImage(true); const sm: Record<string, string> = { cute: "cute kawaii cartoon sticker style, white border", realistic: "realistic detailed sticker, white border", anime: "anime style sticker, vibrant colors, white border" }; setGeneratedImageUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(`${keyword}, ${sm[stickerStyle]}, high quality`)}?width=512&height=512&nologo=true`); };
  const generateIllustration = () => { if (!sceneDesc.trim()) return; setIsLoadingImage(true); const sm: Record<string, string> = { watercolor: "watercolor painting style", "pen-sketch": "pen and ink sketch style", anime: "anime illustration style", realistic: "photorealistic digital painting" }; setGeneratedImageUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(`${sceneDesc}, ${sm[illustStyle]}, high quality`)}?width=768&height=768&nologo=true`); };
  const downloadImage = () => { if (!generatedImageUrl) return; const a = document.createElement("a"); a.download = `${goodsType}_${bookTitle}.png`; a.href = generatedImageUrl; a.target = "_blank"; a.click(); };
  const saveImage = () => { addCreation({ bookId, bookTitle, type: "goods", title: goodsType === "sticker" ? `스티커: ${keyword.slice(0, 20)}` : `일러스트: ${sceneDesc.slice(0, 20)}`, thumbnail: generatedImageUrl, content: generatedImageUrl }); router.push(`/library/${bookId}`); };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation(); e.preventDefault();
    const startX = e.clientX; const startY = e.clientY;
    const sp = { ...designPos }; const ss = { ...designSize }; const MIN = 60;
    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - startX; const dy = me.clientY - startY;
      let nx = sp.x, ny = sp.y, nw = ss.width, nh = ss.height;
      if (handle.includes("e")) nw = Math.max(MIN, ss.width + dx);
      if (handle.includes("w")) { const d = Math.min(dx, ss.width - MIN); nx = sp.x + d; nw = ss.width - d; }
      if (handle.includes("s")) nh = Math.max(MIN, ss.height + dy);
      if (handle.includes("n")) { const d = Math.min(dy, ss.height - MIN); ny = sp.y + d; nh = ss.height - d; }
      nx = Math.max(0, Math.min(nx, productMeta.canvasWidth - MIN));
      ny = Math.max(0, Math.min(ny, productMeta.canvasHeight - MIN));
      setDesignPos({ x: nx, y: ny }); setDesignSize({ width: nw, height: nh });
    };
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove); document.addEventListener("mouseup", onUp);
  };

  const handleResizeTouchStart = (e: React.TouchEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    const t = e.touches[0]; const startX = t.clientX; const startY = t.clientY;
    const sp = { ...designPos }; const ss = { ...designSize }; const MIN = 60;
    const onMove = (te: TouchEvent) => {
      const tt = te.touches[0]; const dx = tt.clientX - startX; const dy = tt.clientY - startY;
      let nx = sp.x, ny = sp.y, nw = ss.width, nh = ss.height;
      if (handle.includes("e")) nw = Math.max(MIN, ss.width + dx);
      if (handle.includes("w")) { const d = Math.min(dx, ss.width - MIN); nx = sp.x + d; nw = ss.width - d; }
      if (handle.includes("s")) nh = Math.max(MIN, ss.height + dy);
      if (handle.includes("n")) { const d = Math.min(dy, ss.height - MIN); ny = sp.y + d; nh = ss.height - d; }
      nx = Math.max(0, Math.min(nx, productMeta.canvasWidth - MIN));
      ny = Math.max(0, Math.min(ny, productMeta.canvasHeight - MIN));
      setDesignPos({ x: nx, y: ny }); setDesignSize({ width: nw, height: nh });
    };
    const onEnd = () => { document.removeEventListener("touchmove", onMove); document.removeEventListener("touchend", onEnd); };
    document.addEventListener("touchmove", onMove, { passive: false }); document.addEventListener("touchend", onEnd);
  };

  const CURSOR_MAP: Record<ResizeHandle, string> = { nw: "nw-resize", n: "n-resize", ne: "ne-resize", w: "w-resize", e: "e-resize", sw: "sw-resize", s: "s-resize", se: "se-resize" };
  const HANDLE_POS = (h: ResizeHandle): React.CSSProperties => {
    const base: React.CSSProperties = { position: "absolute", width: 10, height: 10, backgroundColor: "white", border: "2px solid var(--color-primary-500)", borderRadius: 2, zIndex: 10, cursor: CURSOR_MAP[h] };
    if (h === "nw") return { ...base, top: -5, left: -5 };
    if (h === "n") return { ...base, top: -5, left: "50%", transform: "translateX(-50%)" };
    if (h === "ne") return { ...base, top: -5, right: -5 };
    if (h === "w") return { ...base, top: "50%", left: -5, transform: "translateY(-50%)" };
    if (h === "e") return { ...base, top: "50%", right: -5, transform: "translateY(-50%)" };
    if (h === "sw") return { ...base, bottom: -5, left: -5 };
    if (h === "s") return { ...base, bottom: -5, left: "50%", transform: "translateX(-50%)" };
    return { ...base, bottom: -5, right: -5 };
  };

  const handleCompleteMockup = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = productMeta.canvasWidth; canvas.height = productMeta.canvasHeight;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#f4f4f4"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (designMode === "photo" && uploadedPhoto) {
      const img = new Image(); img.src = uploadedPhoto;
      await new Promise((r) => { img.onload = r; });
      ctx.drawImage(img, designPos.x, designPos.y, designSize.width, designSize.height);
    } else if (canvasRef.current) {
      ctx.drawImage(canvasRef.current, designPos.x, designPos.y, designSize.width, designSize.height);
    }
    setFinalImage(canvas.toDataURL("image/png")); setStep("done");
  };

  const selectedLabel = typeCards.find((t) => t.type === goodsType)?.label || "굿즈";

  return (
    <div className="min-h-screen bg-[var(--color-mono-010)]">
      <header className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => step === "select" ? router.push(`/library/${bookId}`) : setStep(step === "done" ? "mockup" : step === "mockup" ? "editor" : "select")}
            className="p-2 rounded-lg hover:bg-[var(--color-mono-050)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--color-mono-700)]" />
          </button>
          <h1 className="text-lg font-bold text-[var(--color-mono-990)]">굿즈 만들기</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mb-6 max-w-lg mx-auto">
          {STEPS.map((s, i) => {
            const ci = STEPS.indexOf(step); const done = i < ci; const active = s === step;
            return (
              <React.Fragment key={s}>
                {i > 0 && <div className={`flex-1 h-0.5 ${done ? "bg-[var(--color-primary-500)]" : "bg-[var(--color-mono-100)]"}`} />}
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${active ? "bg-[var(--color-primary-500)] text-white" : done ? "bg-[var(--color-primary-200)] text-[var(--color-primary-700)]" : "bg-[var(--color-mono-100)] text-[var(--color-mono-400)]"}`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className={`text-[11px] font-medium hidden sm:inline ${active ? "text-[var(--color-primary-600)]" : "text-[var(--color-mono-400)]"}`}>{STEP_LABELS[s]}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* STEP 1: 제품 선택 */}
        {step === "select" && (
          <div className="max-w-lg mx-auto space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-mono-990)]">어떤 굿즈를 만들까요?</h2>
            <div className="grid grid-cols-2 gap-3">
              {typeCards.map((card) => (
                <button key={card.type} onClick={() => { setGoodsType(card.type); setStep("editor"); setGeneratedImageUrl(""); setIsLoadingImage(false); setUploadedPhoto(null); setDesignMode("custom"); }}
                  className="p-4 border-2 border-[var(--color-mono-080)] rounded-2xl hover:border-[var(--color-primary-300)] transition-colors text-left">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-050)] flex items-center justify-center mb-3"><card.icon className="w-5 h-5 text-[var(--color-primary-600)]" /></div>
                  <p className="font-bold text-[var(--color-mono-990)] text-[14px]">{card.label}</p>
                  <p className="text-[12px] text-[var(--color-mono-400)] mt-0.5">{card.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: 에디터 — 새 제품 */}
        {step === "editor" && isNewProduct && (
          <div className="max-w-lg mx-auto space-y-5">
            <button onClick={() => setStep("select")} className="text-sm text-[var(--color-primary-500)] hover:underline">← 돌아가기</button>
            <div className="flex gap-2">
              {([{ key: "custom", label: "직접 디자인" }, { key: "photo", label: "사진만 삽입" }] as const).map((m) => (
                <button key={m.key} onClick={() => setDesignMode(m.key)}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium border-2 transition-colors ${designMode === m.key ? "border-[var(--color-primary-500)] bg-[var(--color-primary-030)] text-[var(--color-primary-700)]" : "border-[var(--color-mono-080)] text-[var(--color-mono-600)]"}`}>
                  {m.label}
                </button>
              ))}
            </div>

            {designMode === "photo" ? (
              <div>
                {!uploadedPhoto ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[var(--color-mono-200)] rounded-2xl cursor-pointer hover:border-[var(--color-primary-400)] hover:bg-[var(--color-primary-030)] transition-colors">
                    <Upload className="w-8 h-8 text-[var(--color-mono-400)] mb-2" /><p className="text-[13px] font-medium text-[var(--color-mono-600)]">사진을 업로드하세요</p><p className="text-[11px] text-[var(--color-mono-400)] mt-1">JPG, PNG 지원</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => setUploadedPhoto(ev.target?.result as string); r.readAsDataURL(f); }} />
                  </label>
                ) : (
                  <div className="relative"><img src={uploadedPhoto} alt="업로드" className="w-full rounded-2xl object-cover max-h-72" /><button onClick={() => setUploadedPhoto(null)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"><X className="w-4 h-4" /></button></div>
                )}
                <button onClick={() => uploadedPhoto && setStep("mockup")} disabled={!uploadedPhoto}
                  className={`w-full mt-4 py-4 rounded-2xl text-[15px] font-bold transition-colors ${uploadedPhoto ? "bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]" : "bg-[var(--color-mono-100)] text-[var(--color-mono-400)] cursor-not-allowed"}`}>
                  다음 — 목업에 배치하기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[13px] text-[var(--color-mono-500)]">텍스트와 색상으로 디자인하세요 (책갈피 에디터와 동일)</p>
                <textarea value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="텍스트를 입력하세요" className="w-full px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm resize-none h-24 bg-white" />
                <div className="flex gap-2.5">{PRESET_COLORS.map((c) => (<button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-[var(--color-mono-990)] scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />))}<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" /></div>
                <button onClick={() => setStep("mockup")} className="w-full py-4 rounded-2xl bg-[var(--color-primary-500)] text-white text-[15px] font-bold hover:bg-[var(--color-primary-600)] transition-colors">다음 — 목업에 배치하기</button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: 에디터 — 기존 책갈피 */}
        {step === "editor" && goodsType === "bookmark" && (
          <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-6 md:p-8">
            <button onClick={() => setStep("select")} className="text-sm text-[var(--color-primary-500)] hover:underline mb-4">← 돌아가기</button>
            <div className="flex gap-8 flex-col lg:flex-row">
              <div className="flex-1 space-y-5">
                <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">구절</label><textarea value={quote} onChange={(e) => setQuote(e.target.value)} placeholder={"좋아하는 구절을 입력하세요\n줄바꿈도 가능해요"} className="w-full px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm resize-none h-28 bg-white" /></div>
                <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">텍스트 정렬</label><div className="flex gap-2">{[{ v: "left" as const, icon: AlignLeft, label: "왼쪽" }, { v: "center" as const, icon: AlignCenter, label: "가운데" }, { v: "right" as const, icon: AlignRight, label: "오른쪽" }].map((a) => (<button key={a.v} onClick={() => setTextAlign(a.v)} className={`flex-1 py-2 rounded-xl text-sm border flex items-center justify-center gap-1.5 transition-colors ${textAlign === a.v ? "border-[var(--color-primary-500)] bg-[var(--color-primary-050)] text-[var(--color-primary-700)]" : "border-[var(--color-mono-080)] text-[var(--color-mono-600)]"}`}><a.icon className="w-4 h-4" />{a.label}</button>))}</div></div>
                <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">배경색</label><div className="flex gap-2.5 items-center">{PRESET_COLORS.map((c) => (<button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? "border-[var(--color-mono-990)] scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />))}<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" /></div></div>
                <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">배경 이미지 (선택)</label><div className="flex gap-2 items-center"><button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm rounded-xl border border-[var(--color-mono-080)] text-[var(--color-mono-600)] hover:bg-[var(--color-mono-050)] flex items-center gap-2"><ImageIcon className="w-4 h-4" />갤러리에서 가져오기</button>{bgImage && <button onClick={() => { setBgImage(null); bgImageRef.current = null; }} className="px-3 py-2 text-sm rounded-xl border border-red-200 text-red-500 hover:bg-red-50">제거</button>}<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { const d = ev.target?.result as string; setBgImage(d); const img = new window.Image(); img.onload = () => { bgImageRef.current = img; }; img.src = d; }; r.readAsDataURL(f); }} /></div>{bgImage && <div className="mt-2 w-16 h-20 rounded-lg overflow-hidden border border-[var(--color-mono-080)]"><img src={bgImage} alt="배경" className="w-full h-full object-cover" /></div>}</div>
                <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">모양</label><div className="flex gap-2">{[{ v: "rect" as const, l: "직사각형" }, { v: "rounded" as const, l: "둥근형" }, { v: "flag" as const, l: "깃발형" }].map((s) => (<button key={s.v} onClick={() => setShape(s.v)} className={`px-4 py-2 text-sm rounded-xl transition-colors ${shape === s.v ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-700)]"}`}>{s.l}</button>))}</div></div>
                <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">불투명도: {opacity}%</label><input type="range" min={30} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" /></div>
                <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">폰트</label><div className="flex gap-2">{FONTS.map((f) => (<button key={f} onClick={() => setFont(f)} className={`px-4 py-2 text-sm rounded-xl transition-colors ${font === f ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-700)]"}`} style={{ fontFamily: f }}>{f}</button>))}</div></div>
                <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">글자 크기: {fontSize}px</label><div className="flex gap-2">{[{ v: 24, l: "작게" }, { v: 32, l: "보통" }, { v: 42, l: "크게" }, { v: 54, l: "아주 크게" }].map((s) => (<button key={s.v} onClick={() => setFontSize(s.v)} className={`flex-1 py-2 rounded-xl text-sm border transition-colors ${fontSize === s.v ? "border-[var(--color-primary-500)] bg-[var(--color-primary-050)] text-[var(--color-primary-700)] font-medium" : "border-[var(--color-mono-080)] text-[var(--color-mono-600)]"}`}>{s.l}</button>))}</div></div>
                <div className="flex gap-3">
                  <button onClick={downloadCanvas} className="flex-1 py-3 bg-[var(--color-mono-050)] text-[var(--color-mono-700)] rounded-xl text-sm font-medium hover:bg-[var(--color-mono-080)] flex items-center justify-center gap-2"><Download className="w-4 h-4" /> 다운로드</button>
                  <button onClick={saveBookmark} className="flex-1 py-3 bg-[var(--color-primary-500)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-600)]">갤러리에 저장</button>
                </div>
              </div>
              <div className="flex items-start justify-center lg:w-48"><canvas ref={canvasRef} className="border border-[var(--color-mono-080)] rounded-xl shadow-sm" style={{ width: 150, height: 480 }} /></div>
            </div>
          </div>
        )}

        {/* STEP 2: 에디터 — 스티커 */}
        {step === "editor" && goodsType === "sticker" && (
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[var(--color-mono-080)] p-6">
            <button onClick={() => setStep("select")} className="text-sm text-[var(--color-primary-500)] hover:underline mb-4">← 돌아가기</button>
            <div className="space-y-5">
              <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">키워드</label><input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="예: 총균쇠 얄리 캐릭터 스티커" className="w-full px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm bg-white" /></div>
              <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">스타일</label><div className="flex gap-2">{STICKER_STYLES.map((s) => (<button key={s.value} onClick={() => setStickerStyle(s.value)} className={`px-4 py-2 text-sm rounded-xl transition-colors ${stickerStyle === s.value ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-700)]"}`}>{s.label}</button>))}</div></div>
              {!generatedImageUrl && <button onClick={generateSticker} disabled={!keyword.trim()} className="w-full py-3.5 bg-[var(--color-primary-500)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-600)] disabled:opacity-40 transition-colors">스티커 생성</button>}
              {generatedImageUrl && (<div className="space-y-4"><div className="flex justify-center"><img src={generatedImageUrl} alt="Sticker" className="w-72 h-72 object-contain rounded-2xl border border-[var(--color-mono-080)] shadow-sm" onLoad={() => setIsLoadingImage(false)} onError={() => setIsLoadingImage(false)} /></div>{isLoadingImage && <p className="text-center text-sm text-[var(--color-mono-400)]">생성 중...</p>}<div className="flex gap-3"><button onClick={downloadImage} className="flex-1 py-3 bg-[var(--color-mono-050)] text-[var(--color-mono-700)] rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Download className="w-4 h-4" />다운로드</button><button onClick={saveImage} className="flex-1 py-3 bg-[var(--color-primary-500)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-600)]">갤러리에 저장</button></div><button onClick={() => { setGeneratedImageUrl(""); setIsLoadingImage(false); }} className="w-full py-2.5 text-sm text-[var(--color-mono-400)]">다시 생성하기</button></div>)}
            </div>
          </div>
        )}

        {/* STEP 2: 에디터 — 일러스트 */}
        {step === "editor" && goodsType === "illustration" && (
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[var(--color-mono-080)] p-6">
            <button onClick={() => setStep("select")} className="text-sm text-[var(--color-primary-500)] hover:underline mb-4">← 돌아가기</button>
            <div className="space-y-5">
              <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">장면 묘사</label><textarea value={sceneDesc} onChange={(e) => setSceneDesc(e.target.value)} placeholder="예: 뉴기니 해안에서 얄리와 다이아몬드가 대화하는 장면" className="w-full px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm resize-none h-28 bg-white" /></div>
              <div><label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">스타일</label><div className="flex gap-2 flex-wrap">{ILLUST_STYLES.map((s) => (<button key={s.value} onClick={() => setIllustStyle(s.value)} className={`px-4 py-2 text-sm rounded-xl transition-colors ${illustStyle === s.value ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-700)]"}`}>{s.label}</button>))}</div></div>
              {!generatedImageUrl && <button onClick={generateIllustration} disabled={!sceneDesc.trim()} className="w-full py-3.5 bg-[var(--color-primary-500)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-600)] disabled:opacity-40 transition-colors">일러스트 생성</button>}
              {generatedImageUrl && (<div className="space-y-4"><div className="flex justify-center"><img src={generatedImageUrl} alt="Illustration" className="max-w-full max-h-[400px] object-contain rounded-2xl border border-[var(--color-mono-080)] shadow-sm" onLoad={() => setIsLoadingImage(false)} onError={() => setIsLoadingImage(false)} /></div>{isLoadingImage && <p className="text-center text-sm text-[var(--color-mono-400)]">생성 중...</p>}<div className="flex gap-3"><button onClick={downloadImage} className="flex-1 py-3 bg-[var(--color-mono-050)] text-[var(--color-mono-700)] rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Download className="w-4 h-4" />다운로드</button><button onClick={saveImage} className="flex-1 py-3 bg-[var(--color-primary-500)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-600)]">갤러리에 저장</button></div><button onClick={() => { setGeneratedImageUrl(""); setIsLoadingImage(false); }} className="w-full py-2.5 text-sm text-[var(--color-mono-400)]">다시 생성하기</button></div>)}
            </div>
          </div>
        )}

        {/* STEP 3: 목업 배치 */}
        {step === "mockup" && (
          <div className="flex flex-col lg:flex-row gap-8 items-start max-w-4xl mx-auto">
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[var(--color-mono-700)] mb-3">디자인 위치를 조정해보세요</p>
              <div className="relative inline-block select-none bg-[var(--color-mono-050)] rounded-2xl overflow-hidden" ref={mockupRef}
                style={{ width: productMeta.canvasWidth, height: productMeta.canvasHeight }}>
                <div className="absolute cursor-move border-2 border-dashed border-[var(--color-primary-400)]"
                  style={{ left: designPos.x, top: designPos.y, width: designSize.width, height: designSize.height }}
                  onMouseDown={(e) => { if ((e.target as HTMLElement).dataset.handle) return; setIsDragging(true); setDragStart({ x: e.clientX - designPos.x, y: e.clientY - designPos.y }); }}
                  onTouchStart={(e) => { if ((e.target as HTMLElement).dataset.handle) return; const t = e.touches[0]; setIsDragging(true); setDragStart({ x: t.clientX - designPos.x, y: t.clientY - designPos.y }); }}>
                  <div className="w-full h-full overflow-hidden">
                    {designMode === "photo" && uploadedPhoto ? (
                      <img src={uploadedPhoto} alt="디자인" className="w-full h-full object-cover pointer-events-none" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[12px] text-[var(--color-mono-500)]" style={{ backgroundColor: color }}>
                        <span className="text-white text-center px-2">{quote || "디자인 미리보기"}</span>
                      </div>
                    )}
                  </div>
                  {(["nw","n","ne","w","e","sw","s","se"] as ResizeHandle[]).map((h) => (
                    <div key={h} data-handle={h} style={HANDLE_POS(h)}
                      onMouseDown={(e) => handleResizeMouseDown(e, h)}
                      onTouchStart={(e) => handleResizeTouchStart(e, h)} />
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-[var(--color-mono-400)] mt-2 text-center">점선 영역을 드래그해서 위치를 조정하세요</p>
            </div>
            <div className="w-72 flex-shrink-0 space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-[var(--color-mono-080)]">
                <p className="text-[12px] font-semibold text-[var(--color-mono-600)] mb-3">위치 / 크기</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ label: "X", value: Math.round(designPos.x), fn: (v: number) => setDesignPos((p) => ({ ...p, x: v })) },
                    { label: "Y", value: Math.round(designPos.y), fn: (v: number) => setDesignPos((p) => ({ ...p, y: v })) },
                    { label: "너비", value: Math.round(designSize.width), fn: (v: number) => setDesignSize((s) => ({ ...s, width: v })) },
                    { label: "높이", value: Math.round(designSize.height), fn: (v: number) => setDesignSize((s) => ({ ...s, height: v })) },
                  ].map((c) => (
                    <div key={c.label}><p className="text-[10px] text-[var(--color-mono-400)] mb-1">{c.label}</p><input type="number" value={c.value} onChange={(e) => c.fn(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-[var(--color-mono-100)] text-[13px] text-center outline-none focus:border-[var(--color-primary-400)]" /></div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-[var(--color-mono-080)]">
                <p className="text-[12px] font-semibold text-[var(--color-mono-600)] mb-3">빠른 정렬</p>
                <div className="grid grid-cols-3 gap-2">
                  {[{ l: "좌측", a: () => setDesignPos((p) => ({ ...p, x: 10 })) }, { l: "가운데", a: () => setDesignPos((p) => ({ ...p, x: (productMeta.canvasWidth - designSize.width) / 2 })) }, { l: "우측", a: () => setDesignPos((p) => ({ ...p, x: productMeta.canvasWidth - designSize.width - 10 })) },
                    { l: "상단", a: () => setDesignPos((p) => ({ ...p, y: 10 })) }, { l: "중앙", a: () => setDesignPos((p) => ({ ...p, y: (productMeta.canvasHeight - designSize.height) / 2 })) }, { l: "하단", a: () => setDesignPos((p) => ({ ...p, y: productMeta.canvasHeight - designSize.height - 10 })) },
                  ].map((b) => (<button key={b.l} onClick={b.a} className="py-2 rounded-lg text-[11px] font-medium bg-[var(--color-mono-050)] text-[var(--color-mono-600)] hover:bg-[var(--color-primary-030)] hover:text-[var(--color-primary-700)] transition-colors">{b.l}</button>))}
                </div>
              </div>
              <button onClick={handleCompleteMockup} className="w-full py-4 rounded-2xl bg-[var(--color-primary-500)] text-white text-[15px] font-bold hover:bg-[var(--color-primary-600)] transition-colors shadow-sm">완성하기</button>
              <button onClick={() => setStep("editor")} className="w-full py-3 rounded-2xl border border-[var(--color-mono-100)] text-[13px] font-medium text-[var(--color-mono-600)] hover:bg-[var(--color-mono-030)] transition-colors">← 디자인 수정</button>
            </div>
          </div>
        )}

        {/* STEP 4: 완성 */}
        {step === "done" && (
          <div className="flex flex-col items-center py-12 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-030)] flex items-center justify-center mb-6"><CheckCircle className="w-8 h-8 text-[var(--color-primary-500)]" /></div>
            <h2 className="text-[20px] font-bold text-[var(--color-mono-990)] mb-2">{selectedLabel} 완성!</h2>
            <p className="text-[13px] text-[var(--color-mono-500)] mb-8">나만의 {selectedLabel}이 완성됐어요</p>
            {finalImage && <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-mono-080)]"><img src={finalImage} alt="완성" style={{ maxWidth: 300, maxHeight: 400, objectFit: "contain" }} /></div>}
            <div className="flex gap-3 w-full">
              <a href={finalImage || "#"} download={`${selectedLabel}_design.png`} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--color-mono-050)] text-[var(--color-mono-700)] rounded-xl font-medium text-[13px] hover:bg-[var(--color-mono-080)] transition-colors"><Download className="w-4 h-4" />다운로드</a>
              <button onClick={() => { addCreation({ bookId, bookTitle, type: "goods", title: `${bookTitle} ${selectedLabel}`, thumbnail: finalImage || "", content: finalImage || "" }); router.push(`/library/${bookId}`); }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--color-primary-500)] text-white rounded-xl font-medium text-[13px] hover:bg-[var(--color-primary-600)] transition-colors"><Save className="w-4 h-4" />갤러리 저장</button>
            </div>
            <button onClick={() => setStep("select")} className="mt-4 text-[12px] text-[var(--color-mono-400)] hover:text-[var(--color-mono-700)] transition-colors">다른 굿즈 만들기</button>
          </div>
        )}
      </div>

      {/* 드래그 전역 이벤트 */}
      {isDragging && step === "mockup" && (
        <div className="fixed inset-0 z-50 cursor-move"
          onMouseMove={(e) => { setDesignPos({ x: Math.max(0, Math.min(e.clientX - dragStart.x, productMeta.canvasWidth - designSize.width)), y: Math.max(0, Math.min(e.clientY - dragStart.y, productMeta.canvasHeight - designSize.height)) }); }}
          onMouseUp={() => setIsDragging(false)}
          onTouchMove={(e) => { const t = e.touches[0]; setDesignPos({ x: Math.max(0, Math.min(t.clientX - dragStart.x, productMeta.canvasWidth - designSize.width)), y: Math.max(0, Math.min(t.clientY - dragStart.y, productMeta.canvasHeight - designSize.height)) }); }}
          onTouchEnd={() => setIsDragging(false)} />
      )}
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
