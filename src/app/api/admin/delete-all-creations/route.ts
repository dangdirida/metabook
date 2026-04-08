import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST() {
  try {
    const results: Record<string, number> = {};

    // 1. creations 컬렉션 전체 삭제
    const snap1 = await adminDb.collection("creations").get();
    if (snap1.size > 0) {
      const batch1 = adminDb.batch();
      snap1.docs.forEach((doc) => batch1.delete(doc.ref));
      await batch1.commit();
    }
    results.creations = snap1.size;

    // 2. goodsCreations 컬렉션 전체 삭제
    const snap2 = await adminDb.collection("goodsCreations").get();
    if (snap2.size > 0) {
      const batch2 = adminDb.batch();
      snap2.docs.forEach((doc) => batch2.delete(doc.ref));
      await batch2.commit();
    }
    results.goodsCreations = snap2.size;

    return NextResponse.json({
      success: true,
      deleted: results,
      total: results.creations + results.goodsCreations,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
