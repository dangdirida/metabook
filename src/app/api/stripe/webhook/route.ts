import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Webhook verification failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { goodsId, productType, userId } = session.metadata || {};

    // Firestore에 주문 저장
    await adminDb.collection("orders").add({
      goodsId,
      productType,
      userId,
      stripeSessionId: session.id,
      amount: session.amount_total,
      status: "paid",
      customerEmail: session.customer_details?.email || "",
      createdAt: FieldValue.serverTimestamp(),
    });

    // 굿즈 게시물 주문 수 업데이트
    if (goodsId) {
      await adminDb.collection("goodsCreations").doc(goodsId).update({
        orderCount: FieldValue.increment(1),
      });
    }
  }

  return NextResponse.json({ received: true });
}
