"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Bell,
  Star,
  X,
} from "lucide-react";
import { getGoodsByBookId } from "@/lib/mock-goods";
import { getBookById } from "@/lib/mock-data";
import type { Goods } from "@/types";

export default function ShopPage() {
  const { bookId } = useParams();
  const router = useRouter();
  const goods = getGoodsByBookId(bookId as string);
  const book = getBookById(bookId as string);
  const [selectedGoods, setSelectedGoods] = useState<Goods | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [email, setEmail] = useState("");

  if (goods.length === 0) {
    return (
      <div className="min-h-screen bg-mono-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-mono-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-mono-700">아직 굿즈가 없어요</p>
          <button onClick={() => router.back()} className="mt-4 text-primary-500 text-sm">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mono-50">
      <header className="bg-white border-b border-mono-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-mono-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-mono-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-mono-900">{book?.title} 굿즈</h1>
            <p className="text-xs text-mono-500">{goods.length}개 상품</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {goods.map((g) => (
            <div
              key={g.id}
              className={`bg-white rounded-2xl border border-mono-200 overflow-hidden hover:shadow-lg transition-shadow ${
                g.stock === 0 ? "opacity-70" : ""
              }`}
            >
              <div
                className={`aspect-square bg-gradient-to-br from-mono-100 to-mono-200 relative flex items-center justify-center cursor-pointer ${
                  g.stock === 0 ? "grayscale" : ""
                }`}
                onClick={() => setSelectedGoods(g)}
              >
                <ShoppingBag className="w-12 h-12 text-mono-300" />
                {g.isLimitedEdition && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-red-300 text-white text-xs rounded-full font-medium">
                    <Star className="w-3 h-3" /> 한정판
                  </span>
                )}
                {g.stock === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">품절</span>
                  </div>
                )}
                {g.stock > 0 && g.stock < 50 && (
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-accent-orange/90 text-white text-xs rounded-full">
                    {g.stock}개 남음
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-mono-900 line-clamp-1">{g.name}</p>
                <p className="text-sm text-mono-500 mt-1 line-clamp-2">{g.description}</p>
                <p className="text-lg font-bold text-primary-600 mt-2">
                  {g.price.toLocaleString()}원
                </p>
                {g.stock > 0 ? (
                  <button
                    onClick={() => window.open(g.externalUrl, "_blank")}
                    className="w-full mt-3 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> 바로 구매
                  </button>
                ) : (
                  <button
                    onClick={() => setShowNotifyModal(true)}
                    className="w-full mt-3 py-2.5 border border-mono-200 text-mono-600 rounded-xl text-sm font-medium hover:bg-mono-50 flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" /> 재입고 알림
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 상세 모달 */}
      {selectedGoods && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="aspect-video bg-gradient-to-br from-mono-100 to-mono-200 relative flex items-center justify-center rounded-t-2xl">
              <ShoppingBag className="w-16 h-16 text-mono-300" />
              <button
                onClick={() => setSelectedGoods(null)}
                className="absolute top-3 right-3 p-2 bg-white/80 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-mono-900">{selectedGoods.name}</h3>
              <p className="text-lg font-bold text-primary-600 mt-1">
                {selectedGoods.price.toLocaleString()}원
              </p>
              <p className="text-mono-600 mt-3">{selectedGoods.description}</p>
              {selectedGoods.stock > 0 ? (
                <button
                  onClick={() => window.open(selectedGoods.externalUrl, "_blank")}
                  className="w-full mt-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> 바로 구매
                </button>
              ) : (
                <p className="mt-4 text-center text-mono-500">현재 품절입니다</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 재입고 알림 모달 */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-mono-900 mb-4">재입고 알림</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              className="w-full px-4 py-3 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNotifyModal(false)}
                className="flex-1 py-2.5 border border-mono-200 rounded-xl text-sm"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowNotifyModal(false);
                  setEmail("");
                }}
                className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600"
              >
                알림 신청
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
