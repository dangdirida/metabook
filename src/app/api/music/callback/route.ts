import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== "metabook-secret-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    console.log("[music/callback] Apiframe webhook:", JSON.stringify(data).slice(0, 500));

    const taskId = data?.task_id;
    if (!taskId) return NextResponse.json({ ok: true });

    const song = data?.songs?.[0];

    await adminDb.collection("musicTasks").doc(taskId).set({
      status: data?.status || "finished",
      audioUrl: song?.audio_url || null,
      imageUrl: song?.image_url || null,
      title: song?.title || "생성된 음악",
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[music/callback] error:", e);
    return NextResponse.json({ ok: true });
  }
}
