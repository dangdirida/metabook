import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { bookId } = await req.json();
  const userId = (session.user as any).id;
  const ref = doc(db, "books", bookId, "likes", userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return NextResponse.json({ liked: false });
  } else {
    await setDoc(ref, { userId, createdAt: serverTimestamp() });
    return NextResponse.json({ liked: true });
  }
}
