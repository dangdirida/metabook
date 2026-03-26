import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { bookId } = await req.json();
  const userId = (session.user as { id: string; email: string; name: string; image?: string }).id;
  await setDoc(doc(db, "users", userId, "library", bookId), { bookId, addedAt: serverTimestamp() });
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string; email: string; name: string; image?: string }).id;
  const snap = await getDocs(collection(db, "users", userId, "library"));
  return NextResponse.json(snap.docs.map(d => d.data()));
}
