import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ profile: null });

  const doc = await adminDb.collection("users").doc(session.user.email).get();
  return NextResponse.json({ profile: doc.exists ? doc.data() : null });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, avatar } = await req.json();

  await adminDb.collection("users").doc(session.user.email).set({
    name: name || session.user.name,
    avatar: avatar || session.user.image || null,
    email: session.user.email,
    updatedAt: new Date(),
  }, { merge: true });

  return NextResponse.json({ success: true });
}
