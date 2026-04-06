"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CloudUpload, Image as ImageIcon, Paintbrush, AlertTriangle,
  RotateCcw, Undo2, Redo2, FlipHorizontal, FlipVertical, Trash2, Download,
  Eye, X, Check, Loader2, Upload,
} from "lucide-react";
import { MOCKUP_CONFIGS, type MockupConfig } from "@/lib/mockup-config";
import { mockBooks } from "@/lib/mock-data";

interface UserImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  naturalW: number;
  naturalH: number;
}

interface EditorState {
  userImage: UserImage | null;
  bgColor: string;
}

const STEPS = ["제품선택", "디자인", "목업배치", "완성"] as const;

const BASE_COSTS: Record<string, number> = {
  phonecase: 8900,
  tumbler: 12900,
  photocard: 1900,
  bookmark: 2900,
};

const PRICE_PRESETS: Record<string, number[]> = {
  phonecase: [14900, 19900, 24900, 29900],
  tumbler: [19900, 24900, 29900, 34900],
  photocard: [3900, 4900, 5900, 7900],
  bookmark: [4900, 5900, 7900, 9900],
};

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productType = searchParams.get("product") || "phonecase";
  const bookId = searchParams.get("bookId") || "";
  const config: MockupConfig = MOCKUP_CONFIGS[productType] || MOCKUP_CONFIGS.phonecase;

  const [userImage, setUserImage] = useState<UserImage | null>(null);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0, ix: 0, iy: 0 });
  const [fillStatus, setFillStatus] = useState<"empty" | "partial" | "full">("empty");
  const [toast, setToast] = useState<string | null>(null);
  const [currentStep] = useState(1);

  // 배경색 Canvas 합성 결과
  const [bgLayerUrl, setBgLayerUrl] = useState<string | null>(null);

  // Preview / Save
  const [showPreview, setShowPreview] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [userPrice, setUserPrice] = useState<number>(PRICE_PRESETS[productType]?.[0] || 14900);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // bgColor 변경 시마다 canvas로 배경색+base.png 마스크 합성
  useEffect(() => {
    if (bgColor.toLowerCase() === "#ffffff" || !config.files.base) {
      setBgLayerUrl(null);
      return;
    }
    const generateBgLayer = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = config.canvasSize.width;
      canvas.height = config.canvasSize.height;
      const ctx = canvas.getContext("2d")!;

      // 1. 배경색 칠하기
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. base.png로 destination-in → 케이스 형태만 남김
      const base = new window.Image();
      base.crossOrigin = "anonymous";
      await new Promise<void>((r) => { base.onload = () => r(); base.src = config.files.base!; });
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      setBgLayerUrl(canvas.toDataURL("image/png"));
    };
    generateBgLayer();
  }, [bgColor, config]);

  // Undo/Redo
  const [history, setHistory] = useState<EditorState[]>([{ userImage: null, bgColor: "#FFFFFF" }]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const pushHistory = useCallback((state: EditorState) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIdx + 1);
      return [...sliced, state];
    });
    setHistoryIdx((i) => i + 1);
  }, [historyIdx]);

  const undo = () => { if (historyIdx > 0) { setHistoryIdx((i) => i - 1); const s = history[historyIdx - 1]; setUserImage(s.userImage); setBgColor(s.bgColor); } };
  const redo = () => { if (historyIdx < history.length - 1) { setHistoryIdx((i) => i + 1); const s = history[historyIdx + 1]; setUserImage(s.userImage); setBgColor(s.bgColor); } };
  const reset = () => { setHistoryIdx(0); const s = history[0]; setUserImage(s.userImage); setBgColor(s.bgColor); };

  // Fill check
  useEffect(() => {
    if (!userImage) { setFillStatus("empty"); return; }
    const { width: cw, height: ch } = config.canvasSize;
    const r = config.printArea;
    const rx = cw * r.x, ry = ch * r.y, rw = cw * r.w, rh = ch * r.h;
    const covers = userImage.x <= rx && userImage.y <= ry &&
      (userImage.x + userImage.width) >= (rx + rw) &&
      (userImage.y + userImage.height) >= (ry + rh);
    setFillStatus(covers ? "full" : "partial");
  }, [userImage, config]);

  // File upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setToast("파일 크기는 20MB 이하만 가능해요"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setGallery((prev) => [src, ...prev]);
      const img = new window.Image();
      img.onload = () => {
        const { width: cw, height: ch } = config.canvasSize;
        const s = Math.min(cw * 0.8 / img.width, ch * 0.8 / img.height);
        const w = img.width * s, h = img.height * s;
        const newImg: UserImage = { id: Date.now().toString(), src, x: (cw - w) / 2, y: (ch - h) / 2, width: w, height: h, scaleX: 1, scaleY: 1, naturalW: img.width, naturalH: img.height };
        setUserImage(newImg);
        pushHistory({ userImage: newImg, bgColor });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!userImage) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - userImage.x, y: e.clientY - userImage.y });
  };

  useEffect(() => {
    if (!isDragging && !resizeHandle) return;
    const onMove = (e: MouseEvent) => {
      if (isDragging && userImage) {
        setUserImage((prev) => prev ? { ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y } : null);
      }
      if (resizeHandle && userImage) {
        const dx = e.clientX - resizeStart.x, dy = e.clientY - resizeStart.y;
        const MIN = 40;
        const aspect = resizeStart.w / resizeStart.h;
        const isCorner = ["nw", "ne", "sw", "se"].includes(resizeHandle);
        let nx = resizeStart.ix, ny = resizeStart.iy, nw = resizeStart.w, nh = resizeStart.h;
        if (isCorner) {
          nw = Math.max(MIN, resizeStart.w + (resizeHandle.includes("w") ? -dx : dx));
          nh = nw / aspect;
          if (resizeHandle.includes("w")) nx = resizeStart.ix + resizeStart.w - nw;
          if (resizeHandle.includes("n")) ny = resizeStart.iy + resizeStart.h - nh;
        } else {
          if (resizeHandle.includes("e")) nw = Math.max(MIN, resizeStart.w + dx);
          if (resizeHandle.includes("w")) { const d = Math.min(dx, resizeStart.w - MIN); nx = resizeStart.ix + d; nw = resizeStart.w - d; }
          if (resizeHandle.includes("s")) nh = Math.max(MIN, resizeStart.h + dy);
          if (resizeHandle.includes("n")) { const d = Math.min(dy, resizeStart.h - MIN); ny = resizeStart.iy + d; nh = resizeStart.h - d; }
        }
        setUserImage((prev) => prev ? { ...prev, x: nx, y: ny, width: nw, height: nh } : null);
      }
    };
    const onUp = () => {
      if (isDragging || resizeHandle) pushHistory({ userImage, bgColor });
      setIsDragging(false); setResizeHandle(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isDragging, resizeHandle, dragStart, resizeStart, userImage, bgColor, pushHistory]);

  const handleResizeDown = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    if (!userImage) return;
    setResizeHandle(handle);
    setResizeStart({ x: e.clientX, y: e.clientY, w: userImage.width, h: userImage.height, ix: userImage.x, iy: userImage.y });
  };

  // Flip
  const flipH = () => { if (userImage) { const n = { ...userImage, scaleX: userImage.scaleX * -1 }; setUserImage(n); pushHistory({ userImage: n, bgColor }); } };
  const flipV = () => { if (userImage) { const n = { ...userImage, scaleY: userImage.scaleY * -1 }; setUserImage(n); pushHistory({ userImage: n, bgColor }); } };

  // Delete
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Delete" || e.key === "Backspace") { if (userImage) { setUserImage(null); pushHistory({ userImage: null, bgColor }); } } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [userImage, bgColor, pushHistory]);

  // Canvas 합성 (미리보기/저장용)
  const generateComposite = async (): Promise<string> => {
    const canvas = document.createElement("canvas");
    const { width: cw, height: ch } = config.canvasSize;
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext("2d")!;

    // 흰색 배경 채우기 (투명 → 흰색)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cw, ch);

    const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
      const img = new window.Image(); img.crossOrigin = "anonymous";
      img.onload = () => res(img); img.onerror = rej; img.src = src;
    });

    // Step 1: 배경색 + base.png 마스크 (케이스 형태로 클리핑)
    if (bgColor && config.files.base) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, cw, ch);
      const baseImg = await loadImg(config.files.base);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(baseImg, 0, 0, cw, ch);
      ctx.globalCompositeOperation = "source-over";
    }

    // Step 2: 유저 이미지 합성 (base.png로 케이스 형태 클리핑)
    if (userImage) {
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = cw; tmpCanvas.height = ch;
      const tmpCtx = tmpCanvas.getContext("2d")!;

      const uimg = await loadImg(userImage.src);
      tmpCtx.save();
      tmpCtx.translate(userImage.x + userImage.width / 2, userImage.y + userImage.height / 2);
      tmpCtx.scale(userImage.scaleX, userImage.scaleY);
      tmpCtx.drawImage(uimg, -userImage.width / 2, -userImage.height / 2, userImage.width, userImage.height);
      tmpCtx.restore();

      // base.png로 케이스 형태만 남김
      if (config.files.base) {
        const baseImg = await loadImg(config.files.base);
        tmpCtx.globalCompositeOperation = "destination-in";
        tmpCtx.drawImage(baseImg, 0, 0, cw, ch);
      }

      ctx.drawImage(tmpCanvas, 0, 0);
    }

    // Step 3: product.png 합성 (케이스 외형 — 맨 위)
    const productImg = await loadImg(config.files.product);
    ctx.drawImage(productImg, 0, 0, cw, ch);

    return canvas.toDataURL("image/png");
  };

  const handlePreview = async () => {
    setIsGeneratingPreview(true);
    try {
      const dataUrl = await generateComposite();
      setPreviewDataUrl(dataUrl);
      setShowPreview(true);
    } finally { setIsGeneratingPreview(false); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataUrl = await generateComposite();
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `OGQ-${config.name}-${Date.now()}.png`;
      link.click();
      setShowPreview(false);
      setToast("이미지가 저장됐어요!");
      setTimeout(() => setToast(null), 3000);
    } finally { setIsSaving(false); }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const dataUrl = await generateComposite();
      const bookTitle = mockBooks.find((b) => b.id === bookId)?.title || "";

      const res = await fetch("/api/goods-creations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thumbnailDataUrl: dataUrl,
          productType,
          bookId,
          bookTitle,
          bgColor,
          title: `${config.name} 굿즈`,
          price: userPrice,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "게시 실패");
      }

      const { id } = await res.json();
      setShowPreview(false);
      router.push(`/goods/${id}`);
    } catch (e) {
      console.error("게시 실패:", e);
      const msg = e instanceof Error ? e.message : "알 수 없는 오류";
      setToast(`게시에 실패했습니다: ${msg}`);
      setTimeout(() => setToast(null), 3000);
    } finally { setIsPublishing(false); }
  };

  const scale = Math.min(1, (typeof window !== "undefined" ? Math.min(window.innerWidth * 0.5, 600) : 500) / config.canvasSize.width);

  const HANDLES = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
  const handlePos = (h: string): React.CSSProperties => {
    const b: React.CSSProperties = { position: "absolute", width: 10, height: 10, background: "white", border: "2px solid var(--color-primary-500)", borderRadius: 2, zIndex: 20 };
    if (h === "nw") return { ...b, top: -5, left: -5, cursor: "nw-resize" };
    if (h === "n") return { ...b, top: -5, left: "50%", transform: "translateX(-50%)", cursor: "n-resize" };
    if (h === "ne") return { ...b, top: -5, right: -5, cursor: "ne-resize" };
    if (h === "w") return { ...b, top: "50%", left: -5, transform: "translateY(-50%)", cursor: "w-resize" };
    if (h === "e") return { ...b, top: "50%", right: -5, transform: "translateY(-50%)", cursor: "e-resize" };
    if (h === "sw") return { ...b, bottom: -5, left: -5, cursor: "sw-resize" };
    if (h === "s") return { ...b, bottom: -5, left: "50%", transform: "translateX(-50%)", cursor: "s-resize" };
    return { ...b, bottom: -5, right: -5, cursor: "se-resize" };
  };

  return (
    <div className="min-h-screen bg-[var(--color-mono-030)] flex flex-col">
      {/* 상단 바 */}
      <header className="bg-white border-b border-[var(--color-mono-080)] px-4 py-3 flex items-center gap-4 flex-shrink-0">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[var(--color-mono-050)]"><ArrowLeft className="w-5 h-5 text-[var(--color-mono-600)]" /></button>
        <span className="text-[15px] font-semibold text-[var(--color-mono-900)]">굿즈 만들기 — {config.name}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {[{ icon: RotateCcw, label: "처음", fn: reset, ok: historyIdx > 0 },
            { icon: Undo2, label: "뒤로", fn: undo, ok: historyIdx > 0 },
            { icon: Redo2, label: "앞으로", fn: redo, ok: historyIdx < history.length - 1 },
            { icon: FlipHorizontal, label: "좌우반전", fn: flipH, ok: !!userImage },
            { icon: FlipVertical, label: "상하반전", fn: flipV, ok: !!userImage },
          ].map((t) => (
            <button key={t.label} onClick={t.fn} disabled={!t.ok}
              className={`flex flex-col items-center px-2 py-1 rounded-lg text-[10px] transition-colors ${t.ok ? "text-[var(--color-mono-600)] hover:bg-[var(--color-mono-050)]" : "text-[var(--color-mono-300)]"}`}>
              <t.icon className="w-4 h-4 mb-0.5" />{t.label}
            </button>
          ))}
        </div>
      </header>

      {/* 스텝바 */}
      <div className="bg-white border-b border-[var(--color-mono-080)] px-6 py-2 flex items-center justify-center gap-3">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className={`w-8 h-0.5 ${i <= currentStep ? "bg-[var(--color-primary-500)]" : "bg-[var(--color-mono-200)]"}`} />}
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${i < currentStep ? "bg-[var(--color-primary-200)] text-[var(--color-primary-700)]" : i === currentStep ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-mono-100)] text-[var(--color-mono-400)]"}`}>
                {i < currentStep ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[11px] font-medium hidden sm:inline ${i === currentStep ? "text-[var(--color-primary-600)]" : "text-[var(--color-mono-400)]"}`}>{s}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* 메인 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 툴바 */}
        <aside className="w-20 bg-white border-r border-[var(--color-mono-080)] flex flex-col items-center py-4 gap-4 flex-shrink-0">
          {[{ id: "upload", icon: CloudUpload, label: "이미지\n올리기" },
            { id: "gallery", icon: ImageIcon, label: "이미지\n보관함" },
            { id: "bgcolor", icon: Paintbrush, label: "배경색" },
            { id: "caution", icon: AlertTriangle, label: "주의사항" },
          ].map((t) => (
            <button key={t.id} onClick={() => t.id === "upload" ? fileInputRef.current?.click() : setSelectedTool(selectedTool === t.id ? null : t.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-colors ${selectedTool === t.id ? "bg-[var(--color-primary-030)] text-[var(--color-primary-600)]" : "text-[var(--color-mono-500)] hover:bg-[var(--color-mono-050)]"}`}>
              <t.icon className="w-6 h-6" />
              <span className="text-[9px] leading-tight text-center whitespace-pre-line">{t.label}</span>
            </button>
          ))}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={handleFileUpload} />
        </aside>

        {/* 좌측 슬라이드 패널 */}
        {selectedTool === "gallery" && (
          <div className="w-56 bg-white border-r border-[var(--color-mono-080)] p-3 overflow-y-auto flex-shrink-0">
            <p className="text-xs font-semibold text-[var(--color-mono-500)] mb-3">이미지 보관함</p>
            {gallery.length === 0 ? <p className="text-[11px] text-[var(--color-mono-400)] text-center py-8">이미지를 올려주세요</p> : (
              <div className="grid grid-cols-2 gap-2">
                {gallery.map((src, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full aspect-square object-cover rounded-lg border border-[var(--color-mono-100)] cursor-pointer hover:border-[var(--color-primary-400)]"
                      onClick={() => {
                        const img = new window.Image(); img.src = src; img.onload = () => {
                          const s2 = Math.min(config.canvasSize.width * 0.8 / img.width, config.canvasSize.height * 0.8 / img.height);
                          const ni: UserImage = { id: Date.now().toString(), src, x: (config.canvasSize.width - img.width * s2) / 2, y: (config.canvasSize.height - img.height * s2) / 2, width: img.width * s2, height: img.height * s2, scaleX: 1, scaleY: 1, naturalW: img.width, naturalH: img.height };
                          setUserImage(ni); pushHistory({ userImage: ni, bgColor });
                        };
                      }} />
                    <button onClick={() => setGallery((p) => p.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {selectedTool === "bgcolor" && (
          <div className="w-56 bg-white border-r border-[var(--color-mono-080)] p-3 flex-shrink-0 space-y-3">
            <p className="text-xs font-semibold text-[var(--color-mono-500)]">배경색</p>
            <input type="color" value={bgColor} onChange={(e) => { setBgColor(e.target.value); pushHistory({ userImage, bgColor: e.target.value }); }}
              className="w-full h-12 rounded-lg cursor-pointer border border-[var(--color-mono-100)]" />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--color-mono-400)]">HEX</span>
              <input type="text" value={bgColor} onChange={(e) => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setBgColor(v); }}
                onBlur={() => pushHistory({ userImage, bgColor })}
                className="flex-1 px-2 py-1 text-[12px] font-mono border border-[var(--color-mono-100)] rounded-lg text-center" />
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {["#FFFFFF", "#000000", "#F44336", "#FF9800", "#FFEB3B", "#4CAF50", "#2196F3", "#9C27B0", "#795548", "#607D8B", "#E91E63", "#00BCD4"].map((c) => (
                <button key={c} onClick={() => { setBgColor(c); pushHistory({ userImage, bgColor: c }); }}
                  className={`w-7 h-7 rounded-md border ${bgColor === c ? "border-[var(--color-primary-500)] ring-1 ring-[var(--color-primary-300)]" : "border-[var(--color-mono-100)]"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <button onClick={() => { setBgColor("#FFFFFF"); pushHistory({ userImage, bgColor: "#FFFFFF" }); }}
              className="w-full py-1.5 text-[11px] text-[var(--color-mono-500)] hover:text-[var(--color-mono-700)] border border-[var(--color-mono-100)] rounded-lg">
              배경색 제거
            </button>
          </div>
        )}
        {selectedTool === "caution" && (
          <div className="w-56 bg-white border-r border-[var(--color-mono-080)] p-3 flex-shrink-0">
            <p className="text-xs font-semibold text-[var(--color-mono-500)] mb-3">주의사항</p>
            <ul className="text-[11px] text-[var(--color-mono-600)] space-y-2 leading-relaxed">
              <li>- 점선까지 채우면 여백 없이 인쇄됩니다</li>
              <li>- 고해상도 이미지를 권장합니다 (300dpi+)</li>
              <li>- JPG, PNG, GIF 형식 지원</li>
              <li>- 최대 파일 크기: 20MB</li>
              <li>- 저작권에 유의해주세요</li>
            </ul>
          </div>
        )}

        {/* 중앙 캔버스 */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
          <div ref={canvasRef} className="relative select-none"
            style={{ width: config.canvasSize.width * scale, height: config.canvasSize.height * scale }}>
            <div style={{ position: "relative", transform: `scale(${scale})`, transformOrigin: "top left", width: config.canvasSize.width, height: config.canvasSize.height, isolation: "isolate" }}>
              {/* L1: 배경색+base.png 마스크 합성 결과 (Canvas dataURL) */}
              {bgLayerUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bgLayerUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }} />
              )}
              {/* L2: 유저 이미지 */}
              {userImage && (
                <div className="absolute cursor-move border-2 border-dashed border-[var(--color-primary-400)]"
                  style={{ left: userImage.x, top: userImage.y, width: userImage.width, height: userImage.height, zIndex: 5 }}
                  onMouseDown={handleMouseDown}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={userImage.src} alt="" className="w-full h-full object-cover pointer-events-none"
                    style={{ transform: `scaleX(${userImage.scaleX}) scaleY(${userImage.scaleY})` }} />
                  {HANDLES.map((h) => <div key={h} style={handlePos(h)} onMouseDown={(e) => handleResizeDown(h, e)} />)}
                </div>
              )}
              {/* L3: product.png — 케이스 외형 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={config.files.product} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 10, pointerEvents: "none" }} />
              {/* L4: overlay.png — 점선 경계 */}
              {config.files.overlay && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.files.overlay} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 11, pointerEvents: "none", opacity: 0.6 }} />
              )}
            </div>
          </div>
          {/* Fill status */}
          <div className="mt-4 max-w-md w-full">
            {fillStatus === "empty" && <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-mono-050)] border border-[var(--color-mono-200)] rounded-lg text-[var(--color-mono-500)] text-sm"><CloudUpload className="w-4 h-4 flex-shrink-0" />이미지를 올려서 디자인을 시작하세요</div>}
            {fillStatus === "partial" && <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm"><AlertTriangle className="w-4 h-4 flex-shrink-0" />상품에 여백 없이 인쇄를 희망하시는 경우 점선까지 채워주세요.</div>}
            {fillStatus === "full" && <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm"><Check className="w-4 h-4 flex-shrink-0" />상품의 모든 여백이 채워졌습니다.</div>}
          </div>
        </div>

        {/* 우측 패널 */}
        <aside className="w-64 bg-white border-l border-[var(--color-mono-080)] p-4 flex flex-col gap-4 flex-shrink-0">
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--color-mono-900)] mb-1">{config.name}</h3>
            <button onClick={() => router.push(`/creation/goods?bookId=${bookId}`)}
              className="text-[12px] text-[var(--color-primary-500)] hover:underline">상품 변경</button>
          </div>
          <hr className="border-[var(--color-mono-080)]" />
          {userImage && (
            <button onClick={() => { setUserImage(null); pushHistory({ userImage: null, bgColor }); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />이미지 삭제
            </button>
          )}
          <div className="flex-1" />
          <button onClick={handlePreview} disabled={!userImage || isGeneratingPreview}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--color-mono-200)] text-[13px] font-medium text-[var(--color-mono-700)] hover:bg-[var(--color-mono-050)] disabled:opacity-40 transition-colors">
            {isGeneratingPreview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}미리보기
          </button>
          <button onClick={handleSave} disabled={!userImage || isSaving}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-primary-500)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-600)] disabled:opacity-40 transition-colors">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}저장하기
          </button>
          <button onClick={() => setShowPriceModal(true)} disabled={!userImage || isPublishing}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[var(--color-primary-500)] text-[var(--color-primary-600)] text-[13px] font-semibold hover:bg-[var(--color-primary-030)] disabled:opacity-40 transition-colors">
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}게시하기
          </button>
        </aside>
      </div>

      {/* 미리보기 모달 */}
      {showPreview && previewDataUrl && (
        <div onClick={() => setShowPreview(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "white", borderRadius: 20, padding: 28, maxWidth: 380, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, textAlign: "center", color: "#1a1a1a" }}>완성된 디자인</p>
            {/* 체크무늬 배경으로 투명 영역 표시 */}
            <div style={{
              backgroundImage: "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
              backgroundSize: "20px 20px", backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              borderRadius: 12, overflow: "hidden",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewDataUrl} alt="미리보기" style={{ width: "100%", display: "block" }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowPreview(false)}
                style={{ flex: 1, padding: "12px 0", borderRadius: 999, border: "1px solid #e0e0e0", background: "white", fontSize: 14, cursor: "pointer", color: "#666" }}>
                계속 편집
              </button>
              <button onClick={handleSave} disabled={isSaving}
                style={{ flex: 1, padding: "12px 0", borderRadius: 999, background: "#22c55e", color: "white", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 500, opacity: isSaving ? 0.5 : 1 }}>
                저장하기
              </button>
              <button onClick={() => { setShowPreview(false); setShowPriceModal(true); }} disabled={isPublishing}
                style={{ flex: 1, padding: "12px 0", borderRadius: 999, background: "var(--color-primary-500)", color: "white", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 500, opacity: isPublishing ? 0.5 : 1 }}>
                {isPublishing ? "게시 중..." : "게시하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 가격 설정 모달 */}
      {showPriceModal && (
        <div onClick={() => setShowPriceModal(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "white", borderRadius: 20, padding: 28, maxWidth: 400, width: "90%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "#111" }}>판매 가격 설정</h3>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>구매자가 지불할 가격을 직접 설정하세요.</p>

            {/* 상품 미리보기 */}
            <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 16px", backgroundColor: "#f9fafb", borderRadius: 12, marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.files.product} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{config.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>기본 제조 원가: {(BASE_COSTS[productType] || 0).toLocaleString("ko-KR")}원</div>
              </div>
            </div>

            {/* 가격 입력 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>판매 가격 (원)</label>
              <div style={{ position: "relative" }}>
                <input type="number" value={userPrice}
                  onChange={(e) => setUserPrice(parseInt(e.target.value) || 0)}
                  min={BASE_COSTS[productType] || 5000} max={999999} step={100}
                  style={{ width: "100%", padding: "14px 50px 14px 16px", border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 18, fontWeight: 700, color: "#111", outline: "none", boxSizing: "border-box" }} />
                <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#6b7280" }}>원</span>
              </div>
              {userPrice < (BASE_COSTS[productType] || 5000) && (
                <p style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>최소 {(BASE_COSTS[productType] || 5000).toLocaleString("ko-KR")}원 이상으로 설정해주세요.</p>
              )}
            </div>

            {/* 가격 프리셋 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {(PRICE_PRESETS[productType] || []).map((preset) => (
                <button key={preset} onClick={() => setUserPrice(preset)}
                  style={{ padding: "6px 14px", borderRadius: 999, border: `1.5px solid ${userPrice === preset ? "#10b981" : "#e5e7eb"}`, background: userPrice === preset ? "#f0fdf4" : "white", color: userPrice === preset ? "#10b981" : "#6b7280", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                  {preset.toLocaleString("ko-KR")}원
                </button>
              ))}
            </div>

            {/* 수익 예상 */}
            <div style={{ backgroundColor: "#f0fdf4", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, marginBottom: 8 }}>예상 수익</div>
              {[
                ["판매가", `${userPrice.toLocaleString("ko-KR")}원`],
                ["제조 원가", `- ${(BASE_COSTS[productType] || 0).toLocaleString("ko-KR")}원`],
                ["플랫폼 수수료 (10%)", `- ${Math.floor(userPrice * 0.1).toLocaleString("ko-KR")}원`],
                ["예상 정산액", `${Math.max(0, userPrice - (BASE_COSTS[productType] || 0) - Math.floor(userPrice * 0.1)).toLocaleString("ko-KR")}원`],
              ].map(([label, value], i) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", fontWeight: i === 3 ? 700 : 400, color: i === 3 ? "#16a34a" : "#374151", borderTop: i === 3 ? "1px solid #86efac" : "none", paddingTop: i === 3 ? 8 : 3, marginTop: i === 3 ? 4 : 0 }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
            </div>

            {/* 버튼 */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowPriceModal(false)}
                style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "1px solid #e5e7eb", background: "white", fontSize: 14, cursor: "pointer", color: "#6b7280" }}>
                취소
              </button>
              <button onClick={() => { setShowPriceModal(false); handlePublish(); }}
                disabled={userPrice < (BASE_COSTS[productType] || 5000) || isPublishing}
                style={{ flex: 2, padding: "13px 0", borderRadius: 12, border: "none", background: userPrice < (BASE_COSTS[productType] || 5000) ? "#d1d5db" : "#10b981", color: "white", fontSize: 14, fontWeight: 700, cursor: userPrice < (BASE_COSTS[productType] || 5000) ? "not-allowed" : "pointer" }}>
                {isPublishing ? "게시 중..." : "이 가격으로 게시하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-mono-900)] text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function GoodsEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-mono-300)]" /></div>}>
      <EditorContent />
    </Suspense>
  );
}
