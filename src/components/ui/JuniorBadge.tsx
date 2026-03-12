"use client";

import { Shield } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function JuniorBadge() {
  const { isJunior } = useUserStore();

  if (!isJunior) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
      <Shield className="w-3 h-3" />
      주니어 모드
    </span>
  );
}
