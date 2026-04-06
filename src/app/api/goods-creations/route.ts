import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FieldValue } from "firebase-admin/firestore";

function getPrice(productType: string): number {
  const prices: Record<string, number> = {
    phonecase: 14900,
    tumbler: 19900,
    photocard: 3900,
    bookmark: 4900,
  };
  return prices[productType] || 14900;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email || "anonymous";

    const body = await req.json();
    const { thumbnailDataUrl, productType, bookId, bookTitle, bgColor, title, price } = body;

    if (!thumbnailDataUrl || !productType || !bookId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const finalPrice = typeof price === "number" && price > 0 ? price : getPrice(productType);

    const docRef = await adminDb.collection("goodsCreations").add({
      thumbnailDataUrl,
      productType,
      bookId,
      bookTitle: bookTitle || "",
      bgColor: bgColor || null,
      title: title || `${productType} 굿즈`,
      userId,
      userEmail: userId,
      price: finalPrice,
      status: "published",
      likes: 0,
      views: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id, success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[goods-creations] POST error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const limitNum = parseInt(searchParams.get("limit") || "20");

    let snapshot;
    if (bookId) {
      snapshot = await adminDb.collection("goodsCreations")
        .where("bookId", "==", bookId)
        .limit(limitNum)
        .get();
    } else {
      snapshot = await adminDb.collection("goodsCreations")
        .limit(limitNum)
        .get();
    }

    const items = snapshot.docs
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          createdAt: d.createdAt?.toDate?.()?.toISOString() || null,
        };
      })
      .filter((item) => (item as Record<string, unknown>).status === "published")
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
        return tb - ta;
      });

    return NextResponse.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[goods-creations] GET error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
