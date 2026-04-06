import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRODUCT_PRICES: Record<string, number> = {
  phonecase: 14900,
  tumbler: 19900,
  photocard: 3900,
  bookmark: 4900,
};

const PRODUCT_NAMES: Record<string, string> = {
  phonecase: "나만의 폰케이스",
  tumbler: "나만의 텀블러",
  photocard: "나만의 포토카드",
  bookmark: "나만의 책갈피",
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { goodsId, productType, quantity = 1 } = await req.json();

    const priceKrw = PRODUCT_PRICES[productType] || 14900;
    const productName = PRODUCT_NAMES[productType] || "굿즈";
    const shippingKrw = 3000;

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "krw",
            product_data: {
              name: productName,
              description: `OGQ 나만의 ${productName} · 주문 제작`,
            },
            unit_amount: priceKrw,
          },
          quantity,
        },
        {
          price_data: {
            currency: "krw",
            product_data: { name: "배송비" },
            unit_amount: shippingKrw,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/goods/${goodsId}?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/goods/${goodsId}?payment=cancel`,
      metadata: {
        goodsId,
        productType,
        userId: session?.user?.email || "anonymous",
      },
      locale: "ko",
    });

    return NextResponse.json({ url: stripeSession.url, sessionId: stripeSession.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[stripe/checkout] error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
