import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(req: NextRequest) {
  const { chapterText, characters, additionalContext, bookTitle } =
    await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Step 1: Claude로 영상 프롬프트 생성
  let videoPrompt = "";

  if (!apiKey) {
    videoPrompt = `Cinematic scene from Korean novel "${bookTitle}". ${
      characters?.length ? `Characters: ${characters.join(", ")}. ` : ""
    }A dramatic moment in a lush tropical setting with vivid colors, golden hour lighting. ${
      additionalContext || ""
    } Detailed, realistic, 720p cinematic quality.`;
  } else {
    try {
      const promptRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: `Create a cinematic video prompt in English for HunyuanVideo AI. Scene from Korean novel: ${chapterText.slice(0, 500)}. Characters: ${characters?.join(", ") || "none specified"}. Style: cinematic, detailed, 720p. Additional: ${additionalContext || "none"}. Output only the video prompt, max 200 words.`,
            },
          ],
        }),
      });

      if (!promptRes.ok) {
        throw new Error("Prompt generation failed");
      }

      const promptData = await promptRes.json();
      videoPrompt =
        promptData.content?.[0]?.text ||
        `Cinematic scene from "${bookTitle}", dramatic lighting, detailed.`;
    } catch {
      videoPrompt = `Cinematic scene from Korean novel "${bookTitle}". Dramatic lighting, vivid atmosphere, 720p quality.`;
    }
  }

  // Step 2: fal.ai API로 영상 생성
  try {
    const result = await fal.subscribe("fal-ai/hunyuan-video", {
      input: {
        prompt: videoPrompt,
        resolution: "720p",
        aspect_ratio: "16:9",
        num_frames: "85" as const,
      },
    });

    const videoUrl =
      (result as { data?: { video?: { url?: string } } }).data?.video?.url ||
      (result as { video?: { url?: string } }).video?.url ||
      "";

    return NextResponse.json({
      videoUrl,
      prompt: videoPrompt,
    });
  } catch (error) {
    console.error("fal.ai error:", error);
    return NextResponse.json(
      { error: "영상 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
