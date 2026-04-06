"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, ShoppingCart, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

interface GoodsCreation {
  id: string;
  thumbnailDataUrl: string;
  productType: string;
  bookId: string;
  bookTitle: string;
  title: string;
  price: number;
  userId: string;
  likes: number;
  createdAt: string;
  bgColor?: string;
}

const PRODUCT_NAMES: Record<string, string> = {
  phonecase: "폰케이스",
  tumbler: "텀블러",
  photocard: "포토카드",
  bookmark: "책갈피",
};

const PRODUCT_MATERIAL: Record<string, string> = {
  phonecase: "하드 폴리카보네이트",
  tumbler: "스테인리스 스틸 보온병",
  photocard: "프리미엄 아트지 350g",
  bookmark: "프리미엄 양면 코팅지",
};

export default function GoodsDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<GoodsCreation | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "cancel" | null>(null);

  useEffect(() => {
    fetch(`/api/goods-creations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setItem(null); } else { setItem(data); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // 결제 성공/취소 URL 파라미터 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") {
      setPaymentStatus("success");
      window.history.replaceState({}, "", `/goods/${id}`);
    } else if (payment === "cancel") {
      setPaymentStatus("cancel");
      window.history.replaceState({}, "", `/goods/${id}`);
    }
  }, [id]);

  // Stripe Checkout 핸들러
  const handleCheckout = async () => {
    if (!item) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goodsId: item.id,
          productType: item.productType,
          quantity,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "결제 세션 생성 실패");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "알 수 없는 오류";
      alert("결제 준비 중 오류가 발생했습니다: " + msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-mono-030)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-mono-300)]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-mono-030)] gap-4">
        <p className="text-[var(--color-mono-500)] text-[15px]">게시물을 찾을 수 없습니다.</p>
        <button onClick={() => router.back()} className="text-[var(--color-primary-500)] text-[14px] font-medium hover:underline">돌아가기</button>
      </div>
    );
  }

  const productName = PRODUCT_NAMES[item.productType] || item.productType;
  const material = PRODUCT_MATERIAL[item.productType] || "프리미엄 소재";
  const totalPrice = item.price * quantity;

  return (
    <div className="min-h-screen bg-[var(--color-mono-030)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-[var(--color-mono-080)]" style={{ padding: "14px 20px" }}>
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-[var(--color-mono-050)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--color-mono-600)]" />
          </button>
          <span className="text-[16px] font-semibold text-[var(--color-mono-900)]">굿즈 상세</span>
        </div>
      </header>

      <div className="max-w-[600px] mx-auto" style={{ padding: "24px 20px" }}>
        {/* 결제 성공 배너 */}
        {paymentStatus === "success" && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4" style={{ padding: "16px 20px" }}>
            <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-[15px] font-bold text-emerald-700">결제가 완료되었습니다!</p>
              <p className="text-[13px] text-emerald-500">주문이 접수되었어요. 3~5 영업일 이내 배송됩니다.</p>
            </div>
          </div>
        )}

        {/* 결제 취소 배너 */}
        {paymentStatus === "cancel" && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl mb-4" style={{ padding: "16px 20px" }}>
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-[14px] font-semibold text-amber-700">결제가 취소되었습니다.</p>
          </div>
        )}

        {/* 상품 이미지 */}
        <div style={{
          backgroundColor: "white", border: "1px solid #f0f0f0",
          borderRadius: 20, overflow: "hidden", marginBottom: 24,
          display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.thumbnailDataUrl} alt={item.title}
            style={{ maxWidth: "100%", maxHeight: 500, objectFit: "contain" }} />
        </div>

        {/* 상품 정보 */}
        <div className="bg-white rounded-2xl border border-[var(--color-mono-080)]" style={{ padding: 24, marginBottom: 16 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              {productName}
            </span>
            {item.bookTitle && (
              <span className="text-[12px] text-[var(--color-mono-400)]">{item.bookTitle}</span>
            )}
          </div>
          <h1 className="text-[20px] font-bold text-[var(--color-mono-990)] mb-2">{item.title}</h1>
          <div className="text-[26px] font-extrabold text-[var(--color-mono-990)]">
            {item.price?.toLocaleString("ko-KR")}원
          </div>
          <p className="text-[12px] text-[var(--color-mono-400)] mt-1">배송비 3,000원 별도 · 3~5일 이내 배송</p>
        </div>

        {/* 수량 선택 */}
        <div className="bg-white rounded-2xl border border-[var(--color-mono-080)]" style={{ padding: 20, marginBottom: 16 }}>
          <p className="text-[14px] font-semibold text-[var(--color-mono-900)] mb-3">수량 선택</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full border border-[var(--color-mono-200)] flex items-center justify-center hover:bg-[var(--color-mono-050)] transition-colors">
              <Minus className="w-4 h-4 text-[var(--color-mono-600)]" />
            </button>
            <span className="text-[16px] font-semibold text-[var(--color-mono-900)] min-w-[24px] text-center">{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="w-9 h-9 rounded-full border border-[var(--color-mono-200)] flex items-center justify-center hover:bg-[var(--color-mono-050)] transition-colors">
              <Plus className="w-4 h-4 text-[var(--color-mono-600)]" />
            </button>
          </div>
        </div>

        {/* 상품 안내 */}
        <div className="bg-white rounded-2xl border border-[var(--color-mono-080)]" style={{ padding: 20, marginBottom: 120 }}>
          <p className="text-[14px] font-semibold text-[var(--color-mono-900)] mb-3">상품 안내</p>
          {[
            ["제조사", "OGQ Corp"],
            ["소재", material],
            ["배송", "주문 후 3~5 영업일 이내"],
            ["교환/반품", "주문 제작 상품으로 교환/반품 불가"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-[var(--color-mono-050)] last:border-0 text-[13px]">
              <span className="text-[var(--color-mono-400)]">{label}</span>
              <span className="text-[var(--color-mono-700)]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 고정 구매 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-mono-080)]" style={{ padding: "16px 20px" }}>
        <div className="max-w-[600px] mx-auto flex gap-3">
          <button onClick={() => setShowOrderModal(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-[var(--color-primary-500)] text-[var(--color-primary-600)] font-semibold transition-colors hover:bg-[var(--color-primary-030)]"
            style={{ padding: "16px 0", fontSize: 15 }}>
            <ShoppingCart className="w-5 h-5" />장바구니
          </button>
          <button onClick={() => setShowOrderModal(true)}
            className="flex-[2] rounded-2xl bg-[var(--color-primary-500)] text-white font-bold hover:bg-[var(--color-primary-600)] transition-colors"
            style={{ padding: "16px 0", fontSize: 15 }}>
            {totalPrice.toLocaleString("ko-KR")}원 구매하기
          </button>
        </div>
      </div>

      {/* 주문 모달 */}
      {showOrderModal && (
        <div onClick={() => setShowOrderModal(false)}
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-[9999]">
          <div onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-[600px]" style={{ borderRadius: "20px 20px 0 0", padding: 28 }}>
            <p className="text-[18px] font-bold text-[var(--color-mono-990)] mb-5">주문 정보</p>

            <div className="flex gap-4 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumbnailDataUrl} alt="" className="w-20 h-20 object-contain rounded-xl bg-[var(--color-mono-050)]" />
              <div>
                <p className="text-[14px] font-semibold text-[var(--color-mono-900)] mb-1">{item.title}</p>
                <p className="text-[13px] text-[var(--color-mono-400)] mb-2">{productName}</p>
                <p className="text-[16px] font-bold text-[var(--color-mono-900)]">
                  {item.price.toLocaleString("ko-KR")}원 x {quantity}개
                </p>
              </div>
            </div>

            <div className="bg-[var(--color-mono-030)] rounded-xl p-4 mb-5">
              <div className="flex justify-between mb-2 text-[14px]">
                <span className="text-[var(--color-mono-400)]">상품 금액</span>
                <span className="text-[var(--color-mono-700)]">{totalPrice.toLocaleString("ko-KR")}원</span>
              </div>
              <div className="flex justify-between mb-2 text-[14px]">
                <span className="text-[var(--color-mono-400)]">배송비</span>
                <span className="text-[var(--color-mono-700)]">3,000원</span>
              </div>
              <div className="flex justify-between font-bold text-[16px] border-t border-[var(--color-mono-100)] pt-3 mt-1">
                <span>총 결제금액</span>
                <span className="text-[var(--color-primary-500)]">{(totalPrice + 3000).toLocaleString("ko-KR")}원</span>
              </div>
            </div>

            <button onClick={handleCheckout} disabled={isCheckingOut}
              className="w-full rounded-2xl text-white font-bold transition-colors"
              style={{
                padding: "16px 0", fontSize: 16,
                background: isCheckingOut ? "#9ca3af" : "var(--color-primary-500)",
                cursor: isCheckingOut ? "not-allowed" : "pointer",
              }}>
              {isCheckingOut ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />결제 준비 중...
                </span>
              ) : "결제하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
