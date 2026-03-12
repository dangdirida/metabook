"use client";

import { useState } from "react";
import { Check, X, Palette } from "lucide-react";
import { mockCreations } from "@/lib/mock-creations";

const TABS = ["대기중", "승인", "거절"];

export default function AdminCreationsPage() {
  const [activeTab, setActiveTab] = useState("대기중");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showReview, setShowReview] = useState<string | null>(null);

  const statusMap: Record<string, string> = {
    대기중: "pending",
    승인: "approved",
    거절: "rejected",
  };

  const filtered = mockCreations.filter(
    (c) => activeTab === "대기중" ? true : c.status === statusMap[activeTab]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-mono-900 mb-6">2차 창작 심사</h1>

      {/* 탭 */}
      <div className="flex gap-1 mb-4 bg-mono-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === tab ? "bg-white text-mono-900 shadow-sm" : "text-mono-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 일괄 처리 */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-primary-50 rounded-xl">
          <span className="text-sm text-primary-600">{selectedIds.length}개 선택됨</span>
          <button
            onClick={() => setSelectedIds([])}
            className="px-3 py-1 bg-primary-500 text-white text-xs rounded-lg"
          >
            일괄 승인
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="px-3 py-1 bg-red-300 text-white text-xs rounded-lg"
          >
            일괄 거절
          </button>
        </div>
      )}

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((creation) => (
          <div
            key={creation.id}
            className={`bg-white rounded-xl border overflow-hidden ${
              selectedIds.includes(creation.id)
                ? "border-primary-300 ring-2 ring-primary-100"
                : "border-mono-200"
            }`}
          >
            <div
              className="aspect-square bg-gradient-to-br from-mono-100 to-mono-200 relative flex items-center justify-center cursor-pointer"
              onClick={() => setShowReview(creation.id)}
            >
              <Palette className="w-8 h-8 text-mono-300" />
              <input
                type="checkbox"
                checked={selectedIds.includes(creation.id)}
                onChange={() => toggleSelect(creation.id)}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 left-3 w-4 h-4 accent-primary-500"
              />
              {/* OGQ 연동 상태 배지 */}
              <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] rounded-full ${
                creation.ogqLinked
                  ? "bg-primary-50 text-primary-700"
                  : "bg-mono-100 text-mono-500"
              }`}>
                {creation.ogqLinked ? "연동완료" : "미연동"}
              </span>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-mono-900 line-clamp-1">{creation.title}</p>
              <p className="text-xs text-mono-500 mt-0.5">{creation.userName}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowReview(creation.id)}
                  className="flex-1 py-1.5 bg-primary-500 text-white text-xs rounded-lg flex items-center justify-center gap-1"
                >
                  <Check className="w-3 h-3" /> 승인
                </button>
                <button className="flex-1 py-1.5 bg-red-300 text-white text-xs rounded-lg flex items-center justify-center gap-1">
                  <X className="w-3 h-3" /> 거절
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 심사 모달 */}
      {showReview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-mono-900 mb-4">창작물 심사</h3>
            <div className="aspect-video bg-mono-100 rounded-xl flex items-center justify-center mb-4">
              <Palette className="w-12 h-12 text-mono-300" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReview(null)}
                className="flex-1 py-3 border border-mono-200 rounded-xl text-sm"
              >
                닫기
              </button>
              <button
                onClick={() => setShowReview(null)}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl text-sm flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" /> 승인
              </button>
              <button
                onClick={() => setShowReview(null)}
                className="flex-1 py-3 bg-red-300 text-white rounded-xl text-sm flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" /> 거절
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
