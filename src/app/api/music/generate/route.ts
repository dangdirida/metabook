import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt, genre, moods, duration, withLyrics } = await req.json();

  const sunoApiKey = process.env.SUNO_API_KEY;

  if (!sunoApiKey) {
    return NextResponse.json({
      success: false,
      message: "Suno API 키가 설정되지 않았어요. .env.local에 SUNO_API_KEY를 추가해주세요.",
      mock: true,
      data: {
        title: `${genre} - AI Generated`,
        audioUrl: null,
        duration,
        style: `${genre} ${moods.join(" ")}`,
      },
    });
  }

  try {
    // TODO: Suno API 실제 연동
    // const response = await fetch("https://studio-api.suno.ai/api/generate/v2/", {
    //   method: "POST",
    //   headers: { "Authorization": `Bearer ${sunoApiKey}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     prompt: `${prompt} [genre: ${genre}] [mood: ${moods.join(", ")}]`,
    //     make_instrumental: !withLyrics,
    //     wait_audio: false,
    //   })
    // })
    // const data = await response.json()

    return NextResponse.json({ success: true, mock: false });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
