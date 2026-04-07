import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STYLE_MAP: Record<string, string> = {
  cute: "cute chibi anime style, soft colors, simple lines, kawaii aesthetic",
  realistic: "realistic detailed illustration style, natural proportions",
  cartoon: "cartoon style, bold outlines, vibrant saturated colors",
  minimal: "minimal line art style, clean and simple, few colors",
  anime: "Japanese anime cel-shading style with vivid colors and sharp lines",
  watercolor: "soft watercolor painting style with visible brush strokes",
  pixel: "retro pixel art style, 8-bit game aesthetic",
  chibi: "super deformed chibi style with oversized head, tiny body",
  line: "clean black line drawing style, coloring book outline",
  pastel: "dreamy soft pastel color palette, muted warm tones",
  popart: "bold pop art style with halftone dots, thick outlines",
};

const SITUATION_LABELS: Record<string, string> = {
  morning: "waking up, stretching, holding coffee, sleepy face",
  work: "working at desk, typing on laptop, stressed office look",
  meal: "eating food happily, chopsticks, delicious expression",
  home: "relaxing on couch, cozy blanket, watching TV",
  night: "yawning, sleepy eyes, holding pillow, moonlight",
  happy: "jumping with joy, big smile, sparkles around",
  sad: "crying, tears streaming, hugging knees",
  angry: "furious expression, red face, steam from ears",
  love: "blushing, hearts floating, shy smile",
  tired: "exhausted, dark circles, slumping over",
  cafe: "sitting in cafe, sipping latte, reading book",
  travel: "pulling suitcase, excited face, airplane ticket",
  exercise: "jogging, sweating, energetic pose",
  study: "reading book intensely, glasses, surrounded by books",
  party: "dancing, confetti, party hat, celebrating",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "GEMINI_API_KEY not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const {
      ipId,
      situation,
      style = "cute",
      bgType = "transparent",
      caption,
      referenceImageBase64,
      character,
    } = body;

    // 명대사 로드 (캐릭터 컨텍스트용)
    let quoteContext = "";
    try {
      const quotesPath = path.join(process.cwd(), `public/sticker-data/quotes/${ipId}.json`);
      const raw = fs.readFileSync(quotesPath, "utf-8");
      const quotes = JSON.parse(raw).quotes?.slice(0, 4) || [];
      if (quotes.length > 0) {
        quoteContext = `Character personality from source material quotes: ${quotes.map((q: { text: string }) => `"${q.text}"`).join(", ")}.`;
      }
    } catch { /* no quotes file */ }

    // IP 제목 로드
    let ipTitle = "";
    try {
      const ipsPath = path.join(process.cwd(), "public/sticker-data/ips.json");
      const ipsRaw = fs.readFileSync(ipsPath, "utf-8");
      const ips = JSON.parse(ipsRaw).elements || [];
      const matched = ips.find((ip: { id: number }) => ip.id === Number(ipId));
      if (matched) ipTitle = matched.title;
    } catch { /* */ }

    const styleDesc = STYLE_MAP[style] || STYLE_MAP.cute;
    const situationDesc = SITUATION_LABELS[situation] || situation;
    const bgDesc = bgType === "transparent"
      ? "transparent background, PNG sticker style, no background elements"
      : "clean white background";

    const captionInst = caption
      ? `Include Korean Hangul caption "${caption}" drawn as sticker text integrated naturally.`
      : "Do NOT include any text, letters, or writing in the image.";

    const charDesc = character ? `Character: ${character}` : "The main character";
    const ipDesc = ipTitle ? `from "${ipTitle}"` : "";

    const prompt = `Create a single high-quality sticker illustration.
Style: ${styleDesc}.
${charDesc} ${ipDesc}.
${quoteContext}
Scene/Situation: The character is ${situationDesc}.
${bgDesc}.
${captionInst}
Requirements:
- Single character, centered, sticker-friendly composition.
- Exaggerated sticker-style expression (big eyes, dramatic emotion).
- Dynamic pose matching the situation (NOT standing neutrally).
- Clean bold outlines suitable for messaging sticker.
- Use obvious visual props/objects relevant to the situation.`;

    // Gemini API 호출
    const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [];

    if (referenceImageBase64) {
      // 참조 이미지로 캐릭터 일관성 유지
      const cleanBase64 = referenceImageBase64.includes("base64,")
        ? referenceImageBase64.split("base64,")[1]
        : referenceImageBase64;
      parts.push({ inlineData: { mimeType: "image/png", data: cleanBase64 } });
      parts.push({ text: `Use the provided image as character reference for identity consistency (same face, hairstyle, outfit). Generate a NEW pose and expression. ${prompt}` });
    } else {
      parts.push({ text: prompt });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          temperature: 0.9,
        },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[sticker/generate] Gemini API error:", response.status, errText);
      return NextResponse.json({ success: false, error: `Gemini API error ${response.status}: ${errText.slice(0, 300)}` }, { status: 500 });
    }

    const data = await response.json();
    const candidates = data.candidates?.[0]?.content?.parts || [];

    const imagePart = candidates.find(
      (p: Record<string, unknown>) => (p.inlineData as { mimeType?: string } | undefined)?.mimeType?.toString().startsWith("image/")
    );

    if (!imagePart?.inlineData) {
      return NextResponse.json({ success: false, error: "이미지가 생성되지 않았어요. 다시 시도해주세요." }, { status: 500 });
    }

    const { mimeType, data: imgBase64 } = imagePart.inlineData as { mimeType: string; data: string };

    return NextResponse.json({
      success: true,
      imageDataUrl: `data:${mimeType};base64,${imgBase64}`,
      imageBase64: imgBase64,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[sticker/generate] error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
