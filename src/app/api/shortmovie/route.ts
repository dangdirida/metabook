import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

// POST: 영상 생성 요청 → request_id 즉시 반환 (Vercel 타임아웃 우회)
export async function POST(req: NextRequest) {
  const { chapterText, characters, additionalContext, bookTitle } = await req.json();

  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    return NextResponse.json({ error: "FAL_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  fal.config({ credentials: falKey });

  // Groq로 영상 프롬프트 생성
  let videoPrompt = "";
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const Groq = (await import("groq-sdk")).default;
      const groq = new Groq({ apiKey: groqKey });
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `Create a cinematic video prompt in English for AI video generation.
Book: "${bookTitle}"
Scene: ${chapterText?.slice(0, 300) || ""}
Characters: ${characters?.join(", ") || ""}
Additional: ${additionalContext || ""}
Output ONLY the video prompt, max 150 words, cinematic style, detailed visual description.`
        }],
        max_tokens: 200,
      });
      videoPrompt = completion.choices[0]?.message?.content?.trim() || "";
    } catch {
      videoPrompt = "";
    }
  }

  if (!videoPrompt) {
    videoPrompt = `Cinematic scene from Korean novel "${bookTitle}". ${chapterText?.slice(0, 200) || ""}. Dramatic lighting, film quality, realistic.`;
  }

  try {
    // 비동기 큐 제출 → 즉시 request_id 반환 (타임아웃 없음)
    const { request_id } = await fal.queue.submit("fal-ai/minimax-video-01", {
      input: {
        prompt: videoPrompt,
        prompt_optimizer: true,
      },
    });

    return NextResponse.json({ request_id, prompt: videoPrompt });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `요청 실패: ${msg}` }, { status: 500 });
  }
}

// GET: 상태 폴링 → COMPLETED 시 videoUrl 반환
export async function GET(req: NextRequest) {
  const request_id = req.nextUrl.searchParams.get("request_id");
  if (!request_id) {
    return NextResponse.json({ error: "request_id가 필요합니다." }, { status: 400 });
  }

  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    return NextResponse.json({ error: "FAL_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  fal.config({ credentials: falKey });

  try {
    const status = await fal.queue.status("fal-ai/minimax-video-01", {
      requestId: request_id,
      logs: false,
    });

    if (status.status === "COMPLETED") {
      const result = await fal.queue.result("fal-ai/minimax-video-01", {
        requestId: request_id,
      });
      const videoUrl =
        (result.data as { video?: { url: string } })?.video?.url || "";
      return NextResponse.json({ status: "COMPLETED", videoUrl });
    }

    return NextResponse.json({ status: status.status }); // IN_QUEUE | IN_PROGRESS
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
