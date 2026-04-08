"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

const SITUATION_CATEGORIES = [
  { group: "일상", items: [
    { value: "morning", label: "아침" }, { value: "work", label: "직장" },
    { value: "meal", label: "식사" }, { value: "home", label: "집콕" }, { value: "night", label: "밤" },
  ]},
  { group: "감정", items: [
    { value: "happy", label: "기쁨" }, { value: "sad", label: "슬픔" },
    { value: "angry", label: "화남" }, { value: "love", label: "설렘" }, { value: "tired", label: "피곤" },
  ]},
  { group: "상황", items: [
    { value: "cafe", label: "카페" }, { value: "travel", label: "여행" },
    { value: "exercise", label: "운동" }, { value: "study", label: "공부" }, { value: "party", label: "파티" },
  ]},
];

const STYLES = [
  { value: "cute", label: "귀여운" },
  { value: "realistic", label: "사실적" },
  { value: "cartoon", label: "만화풍" },
  { value: "minimal", label: "미니멀" },
];

const CHARACTER_MAP: Record<string, string[]> = {
  "슬램덩크": ["강백호", "서태웅", "채치수", "정대만", "안선생"],
  "원피스": ["루피", "조로", "나미", "상디", "우솝"],
  "어린왕자": ["어린왕자", "여우", "장미", "뱀"],
  "해리포터": ["해리", "론", "헤르미온느", "덤블도어"],
  "애인의 애인에게": ["정인", "마리", "성주", "수영"],
};

interface IpItem { id: number; title: string; author: string; status: string; }

const pill = (active: boolean): React.CSSProperties => ({
  padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
  border: `1.5px solid ${active ? "#10b981" : "#e5e7eb"}`,
  background: active ? "#ecfdf5" : "white",
  color: active ? "#065f46" : "#374151",
  fontWeight: active ? 500 : 400,
});

const sectionLabel: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginBottom: 10 };
const divider: React.CSSProperties = { height: 1, background: "#f3f4f6", margin: "16px 0" };

function StickerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get("bookId") || "";

  const [ips, setIps] = useState<IpItem[]>([]);
  const [selectedIp, setSelectedIp] = useState<IpItem | null>(null);
  const [selectedSituations, setSelectedSituations] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("cute");
  const [bgType, setBgType] = useState<"transparent" | "white">("transparent");
  const [generating, setGenerating] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [results, setResults] = useState<{ imageDataUrl?: string; description?: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedChar, setSelectedChar] = useState("");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const characters = selectedIp ? CHARACTER_MAP[selectedIp.title] || [] : [];

  useEffect(() => {
    fetch("/api/sticker/ips")
      .then((r) => r.json())
      .then((d) => {
        if (d.elements) {
          const active = d.elements.filter((ip: IpItem) => ip.status === "ACTIVE");
          setIps(active);
          const matched = active.find((ip: IpItem) => ip.title.includes("애인") && bookId === "lovers-lover");
          if (matched) setSelectedIp(matched);
          else if (active.length > 0) setSelectedIp(active[0]);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSituation = (val: string) => {
    setSelectedSituations((prev) => prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]);
  };

  const handleGenerate = async () => {
    if (!selectedIp || selectedSituations.length === 0) return;
    setGenerating(true); setResults([]); setDoneCount(0); setError(null);

    const totalSlots = 24;
    const slots: string[] = [];
    for (let i = 0; i < totalSlots; i++) slots.push(selectedSituations[i % selectedSituations.length]);

    let anchorBase64: string | null = null;
    const generated: { imageDataUrl?: string; description?: string }[] = [];

    for (let i = 0; i < slots.length; i++) {
      const situationLabel = SITUATION_CATEGORIES.flatMap((c) => c.items).find((s) => s.value === slots[i]);
      try {
        const fetchRes: Response = await fetch("/api/sticker/generate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ipId: selectedIp.id, situation: slots[i], style: selectedStyle, bgType, referenceImageBase64: anchorBase64 || undefined, character: selectedChar || undefined }),
        });
        const resData: { success: boolean; imageDataUrl?: string; imageBase64?: string } = await fetchRes.json();
        if (resData.success && resData.imageDataUrl) {
          if (!anchorBase64 && resData.imageBase64) anchorBase64 = resData.imageBase64;
          generated.push({ imageDataUrl: resData.imageDataUrl, description: situationLabel?.label });
          setResults([...generated]);
        }
      } catch { /* continue */ }
      setDoneCount(i + 1);
    }
    if (generated.length === 0) setError("스티커 생성에 실패했어요. GEMINI_API_KEY를 확인해주세요.");
    setGenerating(false);
  };

  const handlePublish = async () => {
    if (!selectedThumbnail || !selectedIp) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/creations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sticker",
          title: `${selectedIp.title} 스티커팩`,
          bookId,
          bookTitle: selectedIp.title,
          imageUrl: selectedThumbnail,
          character: selectedChar || null,
          style: selectedStyle,
          situations: selectedSituations,
          count: results.length,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "게시 실패");
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "게시 실패");
      setShowPublishModal(false);
      alert("게시물이 등록되었어요!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "알 수 없는 오류";
      console.error("publish error:", e);
      alert(`게시에 실패했어요: ${msg}`);
    } finally {
      setPublishing(false);
    }
  };

  const canGenerate = !generating && !!selectedIp && selectedSituations.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* 헤더 */}
      <header style={{ background: "white", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 10, padding: "12px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer" }}>
            <ArrowLeft style={{ width: 20, height: 20, color: "#6b7280" }} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>스티커 만들기</span>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {/* 서브 헤딩 */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827", margin: 0 }}>스티커 만들기</h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>책 속 인물로 나만의 AI 스티커팩을 만들어보세요</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
          {/* 좌측 옵션 카드 */}
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #f0f0f0", padding: 20 }}>
            {/* IP */}
            <div style={sectionLabel}>원작 IP</div>
            <select value={selectedIp?.id || ""} onChange={(e) => { setSelectedIp(ips.find((ip) => ip.id === Number(e.target.value)) || null); setSelectedChar(""); }}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111827", background: "white", cursor: "pointer", appearance: "none" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
              <option value="" disabled>IP를 선택하세요</option>
              {ips.map((ip) => <option key={ip.id} value={ip.id}>{ip.title} — {ip.author}</option>)}
            </select>

            {/* 인물 */}
            {characters.length > 0 && (<>
              <div style={divider} />
              <div style={sectionLabel}>인물 선택</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button onClick={() => setSelectedChar("")} style={pill(selectedChar === "")}>지정 안함</button>
                {characters.map((c) => <button key={c} onClick={() => setSelectedChar(c)} style={pill(selectedChar === c)}>{c}</button>)}
              </div>
            </>)}

            {/* 상황 */}
            <div style={divider} />
            <div style={sectionLabel}>
              상황 선택{selectedSituations.length > 0 && <span style={{ marginLeft: 8, color: "#10b981", fontSize: 11, fontWeight: 500 }}>{selectedSituations.length}개</span>}
            </div>
            {SITUATION_CATEGORIES.map((cat) => (
              <div key={cat.group} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 6, letterSpacing: "0.04em" }}>{cat.group}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {cat.items.map((s) => <button key={s.value} onClick={() => toggleSituation(s.value)} style={pill(selectedSituations.includes(s.value))}>{s.label}</button>)}
                </div>
              </div>
            ))}

            {/* 그림체 */}
            <div style={divider} />
            <div style={sectionLabel}>그림체</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {STYLES.map((s) => <button key={s.value} onClick={() => setSelectedStyle(s.value)} style={pill(selectedStyle === s.value)}>{s.label}</button>)}
            </div>

            {/* 배경 */}
            <div style={divider} />
            <div style={sectionLabel}>배경</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setBgType("transparent")} style={pill(bgType === "transparent")}>투명</button>
              <button onClick={() => setBgType("white")} style={pill(bgType === "white")}>흰색</button>
            </div>

            {/* 생성 버튼 */}
            <div style={{ marginTop: 20 }}>
              <button onClick={handleGenerate} disabled={!canGenerate}
                style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: canGenerate ? "linear-gradient(135deg, #10b981, #059669)" : "#e5e7eb", color: canGenerate ? "white" : "#9ca3af", fontSize: 15, fontWeight: 600, cursor: canGenerate ? "pointer" : "not-allowed", letterSpacing: "0.01em" }}>
                {generating ? `생성 중... (${doneCount}/24)` : "24종 스티커 생성 시작"}
              </button>
            </div>
            {error && <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fef2f2", color: "#dc2626", fontSize: 13 }}>{error}</div>}
          </div>

          {/* 우측 결과 카드 */}
          <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #f0f0f0", padding: 24, minHeight: 480, display: "flex", flexDirection: "column" }}>
            {/* 빈 상태 */}
            {results.length === 0 && !generating && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#9ca3af" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f9fafb", border: "1.5px dashed #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎨</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>인물과 상황을 선택하고 시작하세요</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>24종 스티커가 자동으로 생성됩니다</div>
              </div>
            )}

            {/* 생성 중 (결과 없을 때) */}
            {generating && results.length === 0 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <style>{`@keyframes sticker-spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#10b981", animation: "sticker-spin 1s linear infinite" }} />
                <div style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>AI가 스티커를 그리고 있어요</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{doneCount} / 24장 완료</div>
                <div style={{ width: 200, height: 4, background: "#f3f4f6", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(doneCount / 24) * 100}%`, background: "#10b981", borderRadius: 2, transition: "width 0.3s ease" }} />
                </div>
              </div>
            )}

            {/* 결과 */}
            {results.length > 0 && (<>
              {/* 생성 중 프로그레스 */}
              {generating && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "8px 12px", background: "#f0fdf4", borderRadius: 8 }}>
                  <Loader2 style={{ width: 16, height: 16, color: "#10b981", animation: "sticker-spin 1s linear infinite" }} />
                  <span style={{ fontSize: 13, color: "#065f46", fontWeight: 500 }}>{doneCount}/24장 생성 중...</span>
                  <div style={{ flex: 1, height: 4, background: "#d1fae5", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(doneCount / 24) * 100}%`, background: "#10b981", borderRadius: 2, transition: "width 0.3s" }} />
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                {results.map((item, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", border: "1px solid #f0f0f0", background: "#fafafa" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageDataUrl} alt={item.description || `스티커 ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
              {!generating && (
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "white", color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>전체 다운로드</button>
                  <button onClick={() => { setSelectedThumbnail(null); setShowPublishModal(true); }} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>창작물로 게시하기</button>
                </div>
              )}
            </>)}
          </div>
        </div>
      </div>

      {/* 썸네일 선택 + 게시 모달 */}
      {showPublishModal && (
        <div onClick={() => setShowPublishModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: 28, width: 520, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#111827" }}>썸네일 선택</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>창작물 목록에 표시될 대표 이미지를 선택해주세요</div>
              </div>
              <button onClick={() => setShowPublishModal(false)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f3f4f6", color: "#6b7280", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 24 }}>
              {results.map((item, i) => (
                <div key={i} onClick={() => setSelectedThumbnail(item.imageDataUrl || null)}
                  style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: selectedThumbnail === item.imageDataUrl ? "2.5px solid #10b981" : "2px solid transparent", background: "white", boxSizing: "border-box" as const, transition: "all 0.15s" }}>
                  <div style={{ width: "100%", height: "100%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageDataUrl} alt={`스티커 ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                  {selectedThumbnail === item.imageDataUrl && (
                    <div style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700 }}>✓</div>
                  )}
                </div>
              ))}
            </div>

            {selectedThumbnail && (
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", background: "#f9fafb", borderRadius: 12, marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: 10, background: "white", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 4 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedThumbnail} alt="선택된 썸네일" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>선택된 썸네일</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>창작물 목록에 이 이미지가 표시됩니다</div>
                </div>
              </div>
            )}

            <button onClick={handlePublish} disabled={!selectedThumbnail || publishing}
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: !selectedThumbnail || publishing ? "#e5e7eb" : "linear-gradient(135deg, #10b981, #059669)", color: !selectedThumbnail || publishing ? "#9ca3af" : "white", fontSize: 15, fontWeight: 600, cursor: !selectedThumbnail || publishing ? "not-allowed" : "pointer" }}>
              {publishing ? "게시 중..." : "게시하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StickerPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 style={{ width: 32, height: 32, animation: "sticker-spin 1s linear infinite", color: "#d1d5db" }} /></div>}>
      <StickerContent />
    </Suspense>
  );
}
