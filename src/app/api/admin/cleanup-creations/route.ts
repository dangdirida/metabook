import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST() {
  try {
    const snapshot = await adminDb.collection("creations").get();

    const toDelete = snapshot.docs.filter((doc) => {
      const type = doc.data().type;
      return type === "webtoon" || type === "novel";
    });

    if (toDelete.length === 0) {
      return NextResponse.json({ success: true, deleted: 0, message: "No webtoon/novel creations found" });
    }

    const batch = adminDb.batch();
    toDelete.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return NextResponse.json({
      success: true,
      deleted: toDelete.length,
      ids: toDelete.map((d) => d.id),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
