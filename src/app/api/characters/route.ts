import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getBookById } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const bookId = req.nextUrl.searchParams.get("bookId");
  if (!bookId) return NextResponse.json({ characters: [] });

  try {
    const snapshot = await adminDb.collection("bookCharacters").doc(bookId).collection("characters").get();
    if (!snapshot.empty) {
      const characters = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json({ characters });
    }
  } catch (e) {
    console.error("[api/characters] Firestore error:", e);
  }

  // Fallback to mock-data
  const book = getBookById(bookId);
  const characters = (book?.agents || []).map((a) => ({
    id: a.id, name: a.name, role: a.role,
    personality: a.personality, speechStyle: a.speechStyle,
  }));
  return NextResponse.json({ characters, source: "mock" });
}
