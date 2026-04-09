import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const taskId = new URL(req.url).searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ status: "error", error: "taskId required" }, { status: 400 });

  try {
    const doc = await adminDb.collection("musicTasks").doc(taskId).get();

    if (!doc.exists) {
      return NextResponse.json({ status: "pending", percentage: 0 });
    }

    const data = doc.data()!;

    if (data.status === "finished" || data.status === "done") {
      return NextResponse.json({
        status: "done",
        audioUrl: data.audioUrl,
        imageUrl: data.imageUrl || null,
        title: data.title || "생성된 음악",
      });
    }

    if (data.status === "failed") {
      return NextResponse.json({ status: "failed", error: "음악 생성에 실패했어요." });
    }

    return NextResponse.json({ status: "pending", percentage: 0 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ status: "error", error: msg }, { status: 500 });
  }
}
