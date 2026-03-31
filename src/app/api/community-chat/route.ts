import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, orderBy, query, limit, serverTimestamp } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { bookId, text } = await req.json();
  if (!bookId || !text) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const doc = await addDoc(collection(db, "books", bookId, "chat"), {
    userId: (session.user as { id: string; email: string; name: string; image?: string }).id,
    userName: session.user.name,
    userImage: session.user.image,
    text,
    createdAt: serverTimestamp(),
  });
  return NextResponse.json({ id: doc.id });
}

export async function GET(req: NextRequest) {
  const bookId = req.nextUrl.searchParams.get("bookId");
  if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
  const q = query(collection(db, "books", bookId, "chat"), orderBy("createdAt", "desc"), limit(50));
  const snap = await getDocs(q);
  const messages = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.()?.toISOString() }));
  return NextResponse.json(messages.reverse());
}
