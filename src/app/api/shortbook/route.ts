import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  const {
    type, bookTitle, bookAuthor, chapterText,
    character, endingDirection, chapterRange,
    writingStyle, emotionTone, outputLength, genreShift,
  } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY가 설정되지 않았습니다." }, { status: 500 });
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

  let systemPrompt = "";
  let userPrompt = "";

  if (type === "perspective") {
    systemPrompt = `당신은 뛰어난 한국 소설 작가입니다. 반드시 순수한 한국어로만 작성하세요. 영어, 중국어, 일본어 등 다른 언어는 절대 사용하지 마세요. 한국어가 아닌 단어가 포함되면 안 됩니다. 주어진 원문을 특정 인물의 시점에서 문학적으로 재집필합니다. ## 챕터 제목 형식으로 2~3개 챕터로 나누어 작성하세요.`;
    userPrompt = `원작: "${bookTitle}" (저자: ${bookAuthor}, ${chapterRange})

[원문]
${chapterText}

[재집필 조건]
- 시점 인물: ${character}
- 문체: ${writingStyleGuide}
- 감정 톤: ${emotionTone || "원작 분위기 유지"}
- 분량: ${lengthGuide}

${character}의 내면 심리와 감정을 중심으로, 원문의 핵심 사건을 유지하면서 완전히 새로운 시점으로 재집필해주세요. 대화문과 내면 독백을 풍부하게 포함하세요.

중요: 반드시 한국어로만 작성하세요. 영어, 중국어, 일본어, 기타 외국어 단어를 절대 포함하지 마세요.`;
  } else {
    systemPrompt = `당신은 뛰어난 한국 소설 작가입니다. 반드시 순수한 한국어로만 작성하세요. 영어, 중국어, 일본어 등 다른 언어는 절대 사용하지 마세요. 한국어가 아닌 단어가 포함되면 안 됩니다. 주어진 원문의 분기점 이후를 새로운 방향으로 재집필합니다. ## 챕터 제목 형식으로 3개 챕터로 나누어 작성하세요.`;
    userPrompt = `원작: "${bookTitle}" (저자: ${bookAuthor}, ${chapterRange})

[원문]
${chapterText}

[재집필 조건]
- 새로운 결말 방향: ${endingDirection}
- 장르 변화: ${genreShift || "원작 장르 유지"}
- 분량: ${lengthGuide}

분기점 이후를 "${endingDirection}" 방향으로 자연스럽게 전개해주세요. 원작의 세계관과 인물을 유지하면서 새로운 이야기를 만들어주세요.

중요: 반드시 한국어로만 작성하세요. 영어, 중국어, 일본어, 기타 외국어 단어를 절대 포함하지 마세요.`;
  }

  try {
    const groq = new Groq({ apiKey });

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
        { role: "assistant", content: "네, 순수한 한국어로만 작성하겠습니다.\n\n" },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
            );
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
