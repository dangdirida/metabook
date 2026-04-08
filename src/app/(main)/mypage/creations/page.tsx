"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getCreations, deleteCreation } from "@/lib/creation-store";

interface MyItem {
  id: string; type: string; title: string;
  thumbnail?: string; thumbnailDataUrl?: string;
  createdAt: string; _source: string; _goodsId?: string;
}

export default function MyCreationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const localItems: MyItem[] = getCreations().map((c) => ({
        id: c.id, type: c.type, title: c.title, thumbnail: c.thumbnail,
        createdAt: c.createdAt, _source: "local",
      }));
      try {
        const r = await fetch("/api/goods-creations?limit=100");
        const d = await r.json();
        const goodsItems: MyItem[] = (d.items || []).map((g: { id: string; title: string; thumbnailDataUrl?: string; createdAt: string; productType?: string }) => ({
          id: `goods-${g.id}`, type: g.productType === "sticker" ? "sticker" : "goods",
          title: g.title, thumbnailDataUrl: g.thumbnailDataUrl,
          createdAt: g.createdAt || new Date().toISOString(), _source: "goods", _goodsId: g.id,
        }));
        const all = [...localItems, ...goodsItems].sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setItems(all);
      } catch { setItems(localItems); }
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (item: MyItem) => {
    if (!confirm("삭제할까요?")) return;
    if (item._source === "goods" && item._goodsId) {
      try { await fetch(`/api/goods-creations/${item._goodsId}`, { method: "DELETE" }); } catch { return; }
    } else { deleteCreation(item.id); }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft style={{ width: 20, height: 20, color: "#6b7280" }} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>내 창작물 ({items.length})</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><Loader2 style={{ width: 32, height: 32, color: "#d1d5db", animation: "spin 1s linear infinite" }} /></div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 14 }}>아직 창작물이 없어요</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {items.map((item) => {
            const thumbSrc = item.thumbnail || item.thumbnailDataUrl;
            const isGoods = item._source === "goods";
            const href = isGoods && item._goodsId ? `/goods/${item._goodsId}` : `/creations/${item.id}`;
            return (
              <div key={item.id} style={{ position: "relative", cursor: "pointer" }} onClick={() => router.push(href)}>
                <div style={{ aspectRatio: "1", borderRadius: 12, overflow: "hidden", background: "#f3f4f6", marginBottom: 8 }}>
                  {thumbSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbSrc} alt={item.title} style={{ width: "100%", height: "100%", objectFit: isGoods ? "contain" : "cover", padding: isGoods ? 8 : 0, background: isGoods ? "white" : undefined }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                      {item.type === "music" ? "🎵" : item.type === "goods" ? "🛍️" : item.type === "shortbook" ? "📖" : "🎬"}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.title}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{item.type}</div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                  style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", color: "white", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
