"use client";

import { useState, useEffect } from "react";
import { Check, X, Loader2, Inbox } from "lucide-react";

interface CreationItem {
  id: string;
  title: string;
  type: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: string;
  thumbnailUrl?: string;
  thumbnailDataUrl?: string;
  imageUrl?: string;
  productType?: string;
  bookTitle?: string;
  ogqLinked?: boolean;
  createdAt: string | null;
}

const TABS = ["대기중", "승인", "거절"] as const;
const STATUS_MAP: Record<string, string> = { "대기중": "pending", "승인": "approved", "거절": "rejected" };

export default function AdminCreationsPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("대기중");
  const [creations, setCreations] = useState<CreationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showReview, setShowReview] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setSelectedIds([]);
      try {
        const statusVal = STATUS_MAP[activeTab];

        // 일반 창작물
        const r1 = await fetch(`/api/admin/creations?status=${statusVal}&limit=50`);
        const d1 = await r1.json();

        // 굿즈 창작물
        const r2 = await fetch("/api/goods-creations?limit=50");
        const d2 = await r2.json();

        const allItems: CreationItem[] = [
          ...(d1.items || []).map((i: Record<string, unknown>) => ({
            ...i,
            thumbnailUrl: i.thumbnailUrl || i.imageUrl || "",
          })),
          ...(d2.items || [])
            .filter((i: Record<string, unknown>) => !statusVal || statusVal === "pending" ? true : i.status === statusVal)
            .map((i: Record<string, unknown>) => ({
              ...i,
              type: "goods",
              title: (i.title as string) || `${i.productType} 굿즈`,
              thumbnailUrl: (i.thumbnailDataUrl as string) || "",
              userName: (i.userId as string) || "anonymous",
            })),
        ].sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });

        setCreations(allItems);
      } catch {
        setCreations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [activeTab]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      const item = creations.find((c) => c.id === id);
      const endpoint = item?.type === "goods" ? `/api/goods-creations/${id}` : "/api/admin/creations";
      if (item?.type === "goods") {
        // 굿즈는 별도 상태 업데이트 없음 (삭제만 가능)
        return;
      }
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: action }),
      });
      setCreations((prev) => prev.filter((c) => c.id !== id));
      setShowReview(null);
    } catch {
      alert("처리에 실패했습니다.");
    }
  };

  const handleBulkAction = async (action: "approved" | "rejected") => {
    for (const id of selectedIds) {
      await handleAction(id, action);
    }
    setSelectedIds([]);
  };

  const reviewItem = creations.find((c) => c.id === showReview);

  return (
    <div>
      <h1 className="text-2xl font-bold text-mono-900 mb-6">2차 창작 심사</h1>

      {/* 탭 */}
      <div className="flex gap-1 mb-4 bg-mono-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === tab ? "bg-white text-mono-900 shadow-sm" : "text-mono-500"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* 일괄 처리 */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-primary-50 rounded-xl">
          <span className="text-sm text-primary-600">{selectedIds.length}개 선택됨</span>
          <button onClick={() => handleBulkAction("approved")}
            className="px-3 py-1 bg-primary-500 text-white text-xs rounded-lg">일괄 승인</button>
          <button onClick={() => handleBulkAction("rejected")}
            className="px-3 py-1 bg-red-300 text-white text-xs rounded-lg">일괄 거절</button>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-mono-300" />
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && creations.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <Inbox className="w-12 h-12 text-mono-200 mb-3" />
          <p className="text-[14px] text-mono-500">등록된 창작물이 없습니다</p>
        </div>
      )}

      {/* 카드 그리드 */}
      {!loading && creations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {creations.map((creation) => (
            <div key={creation.id}
              className={`bg-white rounded-xl border overflow-hidden ${selectedIds.includes(creation.id) ? "border-primary-300 ring-2 ring-primary-100" : "border-mono-200"}`}>
              <div className="aspect-square bg-mono-50 relative flex items-center justify-center cursor-pointer"
                onClick={() => setShowReview(creation.id)}>
                {creation.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={creation.thumbnailUrl} alt={creation.title} className="w-full h-full object-cover" />
                ) : (
                  <Inbox className="w-8 h-8 text-mono-300" />
                )}
                <input type="checkbox" checked={selectedIds.includes(creation.id)}
                  onChange={() => toggleSelect(creation.id)} onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 left-3 w-4 h-4 accent-primary-500" />
                {creation.type === "goods" && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] rounded-full bg-rose-50 text-rose-700">굿즈</span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-mono-900 line-clamp-1">{creation.title}</p>
                <p className="text-xs text-mono-500 mt-0.5">{creation.userName || creation.userId}</p>
                {creation.createdAt && (
                  <p className="text-[10px] text-mono-300 mt-0.5">{new Date(creation.createdAt).toLocaleDateString("ko-KR")}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleAction(creation.id, "approved")}
                    className="flex-1 py-1.5 bg-primary-500 text-white text-xs rounded-lg flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> 승인
                  </button>
                  <button onClick={() => handleAction(creation.id, "rejected")}
                    className="flex-1 py-1.5 bg-red-300 text-white text-xs rounded-lg flex items-center justify-center gap-1">
                    <X className="w-3 h-3" /> 거절
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 심사 모달 */}
      {showReview && reviewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-mono-900 mb-4">창작물 심사</h3>
            <div className="aspect-video bg-mono-100 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
              {reviewItem.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={reviewItem.thumbnailUrl} alt={reviewItem.title} className="w-full h-full object-contain" />
              ) : (
                <Inbox className="w-12 h-12 text-mono-300" />
              )}
            </div>
            <p className="text-sm font-medium text-mono-900 mb-1">{reviewItem.title}</p>
            <p className="text-xs text-mono-500 mb-4">{reviewItem.userName || reviewItem.userId}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowReview(null)}
                className="flex-1 py-3 border border-mono-200 rounded-xl text-sm">닫기</button>
              <button onClick={() => handleAction(reviewItem.id, "approved")}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl text-sm flex items-center justify-center gap-1">
                <Check className="w-4 h-4" /> 승인
              </button>
              <button onClick={() => handleAction(reviewItem.id, "rejected")}
                className="flex-1 py-3 bg-red-300 text-white rounded-xl text-sm flex items-center justify-center gap-1">
                <X className="w-4 h-4" /> 거절
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
