import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type, title, bookId, bookTitle,
      imageUrl, images, audioUrl,
      genre, moods, style, situations,
      character, count, duration,
    } = body;

    if (!type || !title) {
      return NextResponse.json({ error: "type and title required" }, { status: 400 });
    }

    const userName = session.user.name || session.user.email.split("@")[0];

    const docRef = await adminDb.collection("creations").add({
      type,
      title,
      bookId: bookId || null,
      bookTitle: bookTitle || null,
      imageUrl: imageUrl || null,
      images: images || [],
      audioUrl: audioUrl || null,
      genre: genre || null,
      moods: moods || [],
      style: style || null,
      situations: situations || [],
      character: character || null,
      count: count || null,
      duration: duration || null,
      userId: session.user.email,
      userName,
      userAvatar: session.user.image || null,
      status: "approved",
      likes: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[creations] POST error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const limitNum = parseInt(searchParams.get("limit") || "50");

    let snapshot;
    if (bookId) {
      snapshot = await adminDb.collection("creations")
        .where("bookId", "==", bookId)
        .limit(limitNum)
        .get();
    } else {
      snapshot = await adminDb.collection("creations")
        .limit(limitNum)
        .get();
    }

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

    return NextResponse.json({ items }, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
