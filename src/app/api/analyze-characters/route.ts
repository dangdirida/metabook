import { NextRequest, NextResponse } from "next/server";
import { getChaptersByBookId } from "@/lib/mock-content";
import { getBookById } from "@/lib/mock-data";
import { analyzeAndSaveCharacters } from "@/lib/book-setup";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { bookId } = await req.json();
    if (!bookId) return NextResponse.json({ success: false, error: "bookId 필요" }, { status: 400 });

    const book = getBookById(bookId);
    if (!book) return NextResponse.json({ success: false, error: "책을 찾을 수 없음" }, { status: 404 });

    const chapters = getChaptersByBookId(bookId);
    const fullText = chapters.map((ch) => ch.content).join("\n\n");

    await analyzeAndSaveCharacters(bookId, book.title, fullText);

    // Return saved characters
    const snapshot = await adminDb.collection("bookCharacters").doc(bookId).collection("characters").get();
    const characters = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json({ success: true, characters, savedCount: characters.length });
  } catch (error) {
    console.error("[analyze-characters] error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
