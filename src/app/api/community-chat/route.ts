import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  const limitNum = parseInt(searchParams.get("limit") || "50");

  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }

  try {
    // 인덱스 없이 동작하도록 단순 쿼리 + 클라이언트 정렬
    const snapshot = await adminDb
      .collection("communityChats")
      .doc(bookId)
      .collection("messages")
      .limit(limitNum)
      .get();

    const messages = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }))
      .sort((a, b) => new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime());

    return NextResponse.json({ messages });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, message, type = "text" } = await req.json();

    if (!bookId || !message?.trim()) {
      return NextResponse.json({ error: "bookId and message required" }, { status: 400 });
    }

    const userName = session.user.name || session.user.email.split("@")[0];
    const userInitial = userName.charAt(0).toUpperCase();

    const docRef = await adminDb
      .collection("communityChats")
      .doc(bookId)
      .collection("messages")
      .add({
        bookId,
        message: message.trim(),
        type,
        userId: session.user.email,
        userName,
        userInitial,
        userAvatar: session.user.image || null,
        createdAt: FieldValue.serverTimestamp(),
        likes: 0,
      });

    return NextResponse.json({
      success: true,
      message: {
        id: docRef.id,
        bookId,
        message: message.trim(),
        type,
        userId: session.user.email,
        userName,
        userInitial,
        userAvatar: session.user.image || null,
        createdAt: new Date().toISOString(),
        likes: 0,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, messageId } = await req.json();
    if (!bookId || !messageId) {
      return NextResponse.json({ error: "bookId and messageId required" }, { status: 400 });
    }

    const docRef = adminDb
      .collection("communityChats")
      .doc(bookId)
      .collection("messages")
      .doc(messageId);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (doc.data()?.userId !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
