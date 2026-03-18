import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    type,
    bookTitle,
    bookAuthor,
    chapterText,
    character,
    endingDirection,
    chapterRange,
    writingStyle,
    emotionTone,
    outputLength,
    genreShift,
  } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  if (!chapterText || chapterText.trim().length < 10) {
    return NextResponse.json({ error: "챕터 내용이 없습니다." }, { status: 400 });
  }

  const lengthGuide =
    outputLength === "short" ? "1000자 내외" :
    outputLength === "long" ? "3500자 내외" : "2000자 내외";

  const writingStyleGuide =
    writingStyle === "first" ? "1인칭 독백 (나는... 형식)" :
    writingStyle === "diary" ? "내면 일기체 (날짜 없는 독백 일기)" : "3인칭 관찰 시점";

  let prompt = "";

  if (type === "perspective") {
    prompt = `당신은 뛰어난 한국 소설 작가입니다.
아래는 "${bookTitle}" (저자: ${bookAuthor})의 원문 내용입니다.

[원문]
${chapterText}

[재집필 조건]
- 시점 인물: ${character}
- 문체: ${writingStyleGuide}
- 감정 톤: ${emotionTone || "원작의 분위기 유지"}
- 분량: ${lengthGuide}
- 챕터 범위: ${chapterRange}

[요구사항]
1. 반드시 ${character}의 내면 심리, 감정, 생각을 중심으로 서술하세요
2. 원문의 핵심 사건과 플롯은 유지하되, ${character}의 시선으로 완전히 재해석하세요
3. 대화문, 내면 독백, 감각적 묘사를 풍부하게 포함하세요
4. 아래 형식으로 2~3개 챕터로 나누어 작성하세요:

## [챕터 제목]

(본문 내용)

5. 마지막에 한 줄로 이 시점 변화가 이야기에 어떤 의미를 주는지 짧게 덧붙이세요
6. 반드시 한국어로, 문학적이고 몰입감 있는 문체로 작성하세요

지금 바로 소설을 작성해주세요:`;

  } else {
    prompt = `당신은 뛰어난 한국 소설 작가입니다.
아래는 "${bookTitle}" (저자: ${bookAuthor})의 원문 내용입니다.

[원문]
${chapterText}

[재집필 조건]
- 분기점: ${chapterRange}
- 새로운 결말 방향: ${endingDirection}
- 장르 변화: ${genreShift || "원작 장르 유지"}
- 분량: ${lengthGuide}

[요구사항]
1. 원문의 세계관, 인물, 문체를 그대로 유지하세요
2. 분기점 이후부터 "${endingDirection}" 방향으로 자연스럽게 전개하세요
3. 아래 형식으로 정확히 3개 챕터로 나누어 작성하세요:

## [챕터 제목]

(본문 내용)

4. 각 챕터는 400~800자 내외로 작성하세요
5. 마지막 챕터는 이 새로운 결말이 독자에게 어떤 여운을 남기는지 느낄 수 있도록 마무리하세요
6. 반드시 한국어로, 문학적이고 몰입감 있는 문체로 작성하세요

지금 바로 소설을 작성해주세요:`;
  }

  try {
    // Gemini API 스트리밍 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Gemini API 오류: ${errText}` }, { status: response.status });
    }

    // Gemini SSE 스트림을 클라이언트로 중계
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) { controller.close(); return; }

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
            if (!data || data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
                );
              }
            } catch {
              // 파싱 실패 무시
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: `서버 오류: ${String(err)}` }, { status: 500 });
  }
}
