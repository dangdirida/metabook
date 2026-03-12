import { ShoppingBag } from "lucide-react";

export default function AdminCommercePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-mono-900 mb-6">커머스 관리</h1>
      <div className="bg-white rounded-xl border border-mono-200 p-10 text-center">
        <ShoppingBag className="w-12 h-12 text-mono-300 mx-auto mb-3" />
        <p className="text-mono-500">굿즈 등록/재고 관리 (커머스 모듈)</p>
      </div>
    </div>
  );
}
