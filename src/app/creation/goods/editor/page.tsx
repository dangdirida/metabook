"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CloudUpload, Image as ImageIcon, Paintbrush, AlertTriangle,
  RotateCcw, Undo2, Redo2, FlipHorizontal, FlipVertical, Trash2, Download,
  Eye, Save, X, Check, Loader2,
} from "lucide-react";
import { MOCKUP_CONFIGS, type MockupConfig } from "@/lib/mockup-config";

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

const COLORS = [
  "#FFFFFF", "#000000", "#F44336", "#E91E63", "#9C27B0", "#673AB7",
  "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50",
  "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722",
  "#795548", "#607D8B",
];

const STEPS = ["제품선택", "디자인", "목업배치", "완성"] as const;

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
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [currentStep] = useState(1); // 0-indexed: 1 = 디자인

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);

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
        const scale = Math.min(cw * 0.8 / img.width, ch * 0.8 / img.height);
        const w = img.width * scale, h = img.height * scale;
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
        let nx = resizeStart.ix, ny = resizeStart.iy, nw = resizeStart.w, nh = resizeStart.h;
        if (resizeHandle.includes("e")) nw = Math.max(MIN, resizeStart.w + dx);
        if (resizeHandle.includes("w")) { const d = Math.min(dx, resizeStart.w - MIN); nx = resizeStart.ix + d; nw = resizeStart.w - d; }
        if (resizeHandle.includes("s")) nh = Math.max(MIN, resizeStart.h + dy);
        if (resizeHandle.includes("n")) { const d = Math.min(dy, resizeStart.h - MIN); ny = resizeStart.iy + d; nh = resizeStart.h - d; }
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

  // Export
  const handleSave = async () => {
    const canvas = exportCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width: cw, height: ch } = config.canvasSize;
    canvas.width = cw; canvas.height = ch;
    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, cw, ch);

    const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
      const img = new window.Image(); img.crossOrigin = "anonymous";
      img.onload = () => res(img); img.onerror = rej; img.src = src;
    });

    try {
      if (config.files.base) { const base = await loadImg(config.files.base); ctx.drawImage(base, 0, 0, cw, ch); }
      if (userImage) {
        const uimg = await loadImg(userImage.src);
        ctx.save();
        ctx.translate(userImage.x + userImage.width / 2, userImage.y + userImage.height / 2);
        ctx.scale(userImage.scaleX, userImage.scaleY);
        ctx.drawImage(uimg, -userImage.width / 2, -userImage.height / 2, userImage.width, userImage.height);
        ctx.restore();
      }
      const prod = await loadImg(config.files.product);
      ctx.drawImage(prod, 0, 0, cw, ch);
    } catch { /* fallback */ }

    const link = document.createElement("a");
    link.download = `${config.name}_design.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setToast("이미지가 저장됐어요!");
    setTimeout(() => setToast(null), 3000);
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
          <div className="w-56 bg-white border-r border-[var(--color-mono-080)] p-3 flex-shrink-0">
            <p className="text-xs font-semibold text-[var(--color-mono-500)] mb-3">배경색</p>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {COLORS.map((c) => (
                <button key={c} onClick={() => { setBgColor(c); pushHistory({ userImage, bgColor: c }); }}
                  className={`w-8 h-8 rounded-lg border-2 ${bgColor === c ? "border-[var(--color-primary-500)] scale-110" : "border-[var(--color-mono-100)]"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <input type="color" value={bgColor} onChange={(e) => { setBgColor(e.target.value); pushHistory({ userImage, bgColor: e.target.value }); }}
              className="w-full h-10 rounded-lg cursor-pointer" />
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
          <div ref={canvasRef} className="relative select-none shadow-lg rounded-xl overflow-hidden"
            style={{ width: config.canvasSize.width * scale, height: config.canvasSize.height * scale }}>
            {/* 배경색 */}
            <div className="absolute inset-0" style={{ backgroundColor: bgColor, transform: `scale(${scale})`, transformOrigin: "top left", width: config.canvasSize.width, height: config.canvasSize.height }}>
              {/* Base */}
              {config.files.base && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.files.base} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
              )}
              {/* User image */}
              {userImage && (
                <div className="absolute cursor-move border-2 border-dashed border-[var(--color-primary-400)]"
                  style={{ left: userImage.x, top: userImage.y, width: userImage.width, height: userImage.height }}
                  onMouseDown={handleMouseDown}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={userImage.src} alt="" className="w-full h-full object-cover pointer-events-none"
                    style={{ transform: `scaleX(${userImage.scaleX}) scaleY(${userImage.scaleY})` }} />
                  {HANDLES.map((h) => <div key={h} style={handlePos(h)} onMouseDown={(e) => handleResizeDown(h, e)} />)}
                </div>
              )}
              {/* Product overlay */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={config.files.product} alt="" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
              {/* Dotted overlay */}
              {config.files.overlay && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.files.overlay} alt="" className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60" />
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
          <button onClick={() => setShowPreview(true)} disabled={!userImage}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--color-mono-200)] text-[13px] font-medium text-[var(--color-mono-700)] hover:bg-[var(--color-mono-050)] disabled:opacity-40 transition-colors">
            <Eye className="w-4 h-4" />미리보기
          </button>
          <button onClick={handleSave} disabled={!userImage}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-primary-500)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-600)] disabled:opacity-40 transition-colors">
            <Download className="w-4 h-4" />저장하기
          </button>
        </aside>
      </div>

      {/* Preview modal */}
      {showPreview && userImage && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[var(--color-mono-900)]">미리보기</h3>
              <button onClick={() => setShowPreview(false)} className="p-1 rounded-lg hover:bg-[var(--color-mono-050)]"><X className="w-4 h-4" /></button>
            </div>
            <div className="relative bg-[var(--color-mono-050)] rounded-xl overflow-hidden" style={{ aspectRatio: `${config.canvasSize.width}/${config.canvasSize.height}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={config.files.thumbnail} alt="미리보기" className="w-full h-full object-contain" />
            </div>
            <button onClick={handleSave} className="w-full mt-4 py-3 rounded-xl bg-[var(--color-primary-500)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-600)]">
              <Download className="w-4 h-4 inline mr-1" />저장하기
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-mono-900)] text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Hidden export canvas */}
      <canvas ref={exportCanvasRef} className="hidden" />
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
