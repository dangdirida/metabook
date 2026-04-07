import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const limitNum = parseInt(searchParams.get("limit") || "50");

    const snapshot = await adminDb
      .collection("creations")
      .where("status", "==", status)
      .limit(limitNum)
      .get();

    const items = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      }))
      .sort((a, b) => {
        const ta = (a as Record<string, unknown>).createdAt ? new Date((a as Record<string, unknown>).createdAt as string).getTime() : 0;
        const tb = (b as Record<string, unknown>).createdAt ? new Date((b as Record<string, unknown>).createdAt as string).getTime() : 0;
        return tb - ta;
      });

    return NextResponse.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    await adminDb.collection("creations").doc(id).update({
      status,
      reviewedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
