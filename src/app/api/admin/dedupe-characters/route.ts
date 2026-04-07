import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { bookId } = await req.json();
    const targetBookId = bookId || "lovers-lover";

    const snapshot = await adminDb
      .collection("bookCharacters")
      .doc(targetBookId)
      .collection("characters")
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "No characters found", deleted: 0 });
    }

    // name 기준으로 그룹핑
    const byName: Record<string, { id: string; analyzedAt: number }[]> = {};
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const name = (data.name as string) || doc.id;
      const analyzedAt = data.analyzedAt?.toMillis?.() || 0;
      if (!byName[name]) byName[name] = [];
      byName[name].push({ id: doc.id, analyzedAt });
    }

    // 중복된 name에서 최신 1개만 남기고 나머지 삭제
    const toDelete: string[] = [];
    for (const [name, docs] of Object.entries(byName)) {
      if (docs.length <= 1) continue;
      // analyzedAt 최신순 정렬, 첫 번째(최신) 제외하고 삭제 대상
      docs.sort((a, b) => b.analyzedAt - a.analyzedAt);
      for (let i = 1; i < docs.length; i++) {
        toDelete.push(docs[i].id);
      }
      console.log(`[dedupe] "${name}": ${docs.length}개 → 1개 유지 (${docs[0].id}), 삭제: ${docs.slice(1).map((d) => d.id).join(", ")}`);
    }

    if (toDelete.length === 0) {
      return NextResponse.json({ message: "No duplicates found", deleted: 0, total: snapshot.size });
    }

    // 삭제 실행
    const batch = adminDb.batch();
    for (const id of toDelete) {
      batch.delete(adminDb.collection("bookCharacters").doc(targetBookId).collection("characters").doc(id));
    }
    await batch.commit();

    // 남은 인물 목록 반환
    const remaining = await adminDb.collection("bookCharacters").doc(targetBookId).collection("characters").get();
    const characters = remaining.docs.map((doc) => ({ id: doc.id, name: doc.data().name }));

    return NextResponse.json({
      message: `Deduplication complete for ${targetBookId}`,
      deleted: toDelete.length,
      deletedIds: toDelete,
      remaining: characters,
      total: characters.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[dedupe-characters] error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
