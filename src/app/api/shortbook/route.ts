import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    type, bookTitle, bookAuthor, chapterText,
    character, endingDirection, chapterRange,
    writingStyle, emotionTone, outputLength, genreShift,
  } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  if (!chapterText || chapterText.trim().length < 5) {
    return NextResponse.json({ error: "챕터 내용이 없습니다." }, { status: 400 });
  }

  const lengthGuide =
    outputLength === "short" ? "1000자 내외" :
    outputLength === "long" ? "3500자 내외" : "2000자 내외";

  const writingStyleGuide =
    writingStyle === "first" ? "1인칭 독백 (나는... 형식)" :
    writingStyle === "diary" ? "내면 일기체" : "3인칭 관찰 시점";

  let prompt = "";

  if (type === "perspective") {
    prompt = `당신은 뛰어난 한국 소설 작가입니다. 반드시 순수한 한국어로만 작성하세요. 영어, 중국어, 일본어 등 다른 언어는 절대 사용하지 마세요.

원작: "${bookTitle}" (저자: ${bookAuthor}, ${chapterRange})

[원문]
${chapterText}

[재집필 조건]
- 시점 인물: ${character}
- 문체: ${writingStyleGuide}
- 감정 톤: ${emotionTone || "원작 분위기 유지"}
- 분량: ${lengthGuide}

## 챕터 제목 형식으로 2~3개 챕터로 나누어, ${character}의 내면 심리와 감정을 중심으로 완전히 새로운 시점으로 재집필해주세요. 대화문과 내면 독백을 풍부하게 포함하세요.

중요: 반드시 한국어로만 작성하세요.`;
  } else {
    prompt = `당신은 뛰어난 한국 소설 작가입니다. 반드시 순수한 한국어로만 작성하세요. 영어, 중국어, 일본어 등 다른 언어는 절대 사용하지 마세요.

원작: "${bookTitle}" (저자: ${bookAuthor}, ${chapterRange})

[원문]
${chapterText}

[재집필 조건]
- 새로운 결말 방향: ${endingDirection}
- 장르 변화: ${genreShift || "원작 장르 유지"}
- 분량: ${lengthGuide}

## 챕터 제목 형식으로 3개 챕터로 나누어, 분기점 이후를 "${endingDirection}" 방향으로 자연스럽게 전개해주세요.

중요: 반드시 한국어로만 작성하세요.`;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:streamGenerateContent?alt=sse&key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 4096 },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      return NextResponse.json({ error: `Gemini 오류: ${JSON.stringify(err)}` }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = geminiRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
                );
              }
            } catch {}
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `생성 실패: ${message}` }, { status: 500 });
  }
}
