"use client";

interface CreationThumbnailProps {
  item: {
    id: string;
    type: string;
    title?: string;
    bookTitle?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    thumbnailDataUrl?: string;
    thumbnail?: string;
    duration?: number;
    genre?: string;
    moods?: string[];
    productType?: string;
  };
}

function seedRandom(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) { hash = ((hash << 5) - hash) + seed.charCodeAt(i); hash |= 0; }
  return min + Math.abs(hash) % (max - min + 1);
}

export default function CreationThumbnail({ item }: CreationThumbnailProps) {
  const imgSrc = item.imageUrl || item.thumbnailUrl || item.thumbnailDataUrl || item.thumbnail;

  // 음악
  if (item.type === "music") {
    const mins = seedRandom(item.id, 1, 5);
    const secs = String(seedRandom(item.id + "s", 0, 59)).padStart(2, "0");
    return (
      <div style={{ width: "100%", aspectRatio: "1", position: "relative", overflow: "hidden", borderRadius: "inherit", background: "linear-gradient(160deg, #0f0f2e 0%, #1a1a5c 50%, #0a0a2e 100%)" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 200 200">
          {[[20,30],[80,15],[150,40],[170,80],[140,160],[60,170],[30,120],[100,90],[45,65],[160,130]].map(([cx,cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 1.5 : 1} fill="white" opacity={0.3 + (i % 4) * 0.15} />
          ))}
          <path d="M0 160 Q40 140 80 155 Q120 170 160 150 Q180 140 200 155 L200 200 L0 200 Z" fill="white" opacity="0.04" />
          <path d="M0 175 Q50 155 100 168 Q150 182 200 168 L200 200 L0 200 Z" fill="white" opacity="0.06" />
          {[55,70,85,100,115,130,145].map((x, i) => { const h = [20,40,28,55,35,45,22][i]; return <rect key={i} x={x-2} y={100-h/2} width="4" height={h} rx="2" fill="white" opacity={0.12 + i * 0.02} />; })}
        </svg>
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: "55%", height: "55%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", fontSize: 14, opacity: 0.5, color: "white", letterSpacing: 4 }}>♩ ♪ ♩</div>
        <div style={{ position: "absolute", inset: "24px 12px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "white", textAlign: "center", lineHeight: 1.5, wordBreak: "keep-all", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{item.title}</div>
          {item.bookTitle && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{item.bookTitle}</div>}
        </div>
        <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.85)", fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 3 }}>
          {item.duration ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, "0")}` : `${mins}:${secs}`}
        </div>
      </div>
    );
  }

  // 영상
  if (item.type === "video") {
    const videoSecs = seedRandom(item.id, 5, 20);
    return (
      <div style={{ width: "100%", aspectRatio: "1", position: "relative", overflow: "hidden", borderRadius: "inherit", background: "#111" }}>
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 200 200">
            <defs><linearGradient id={`vbg-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1a0a2e" /><stop offset="50%" stopColor="#2d1060" /><stop offset="100%" stopColor="#0a0a1a" /></linearGradient></defs>
            <rect width="200" height="200" fill={`url(#vbg-${item.id})`} />
            <ellipse cx="100" cy="75" rx="22" ry="26" fill="white" opacity="0.08" />
            <path d="M55 200 Q60 130 100 125 Q140 130 145 200 Z" fill="white" opacity="0.06" />
            <rect x="0" y="140" width="200" height="60" fill="black" opacity="0.3" />
          </svg>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(255,255,255,0.2)", zIndex: 2 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><polygon points="5,2 14,8 5,14" /></svg>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 8px 6px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "white", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.title}</div>
        </div>
        <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.65)", color: "white", fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 3, zIndex: 3 }}>
          {item.duration ? `0:${String(item.duration).padStart(2, "0")}` : `0:${String(videoSecs).padStart(2, "0")}`}
        </div>
      </div>
    );
  }

  // 숏북
  if (item.type === "shortbook") {
    return (
      <div style={{ width: "100%", aspectRatio: "1", position: "relative", overflow: "hidden", borderRadius: "inherit", backgroundColor: "#fffef7", border: "1px solid #e8e4d9" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 200 200" preserveAspectRatio="none">
          {[40,56,72,88,104,120,136,152,168].map((y, i) => <line key={i} x1="0" y1={y} x2="200" y2={y} stroke="#e8e4d9" strokeWidth="0.8" />)}
          <line x1="28" y1="0" x2="28" y2="200" stroke="#fca5a5" strokeWidth="1.2" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 20px", zIndex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1f2937", textAlign: "center", lineHeight: 1.6, wordBreak: "keep-all", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{item.title}</div>
          {item.bookTitle && <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 6, textAlign: "center" }}>— {item.bookTitle}</div>}
        </div>
      </div>
    );
  }

  // 굿즈/스티커
  if (item.type === "goods" || item.type === "sticker" || item.productType) {
    return (
      <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", borderRadius: "inherit", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt={item.title || ""} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
        ) : (
          <div style={{ fontSize: 32 }}>🛍️</div>
        )}
      </div>
    );
  }

  // 기본: 이미지 있으면 표시, 없으면 아이콘
  if (imgSrc) {
    return (
      <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", borderRadius: "inherit" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", aspectRatio: "1", background: "#f3f4f6", borderRadius: "inherit", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎨</div>
  );
}
