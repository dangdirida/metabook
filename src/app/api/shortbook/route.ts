import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { type, bookTitle, chapterText, character, endingDirection, chapterRange } =
    await req.json();

  if (!chapterText || chapterText.trim().length < 10) {
    return NextResponse.json({ error: "챕터 내용이 없습니다" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  let systemPrompt = "";
  if (type === "perspective") {
    systemPrompt = `당신은 창의적인 소설 작가입니다.
아래는 "${bookTitle}"의 원문입니다. 이 내용을 "${character}"의 시점에서 새롭게 재집필해주세요.

요구사항:
- ${character}의 내면 심리, 감정, 생각을 중심으로 서술
- 원문의 핵심 사건과 플롯은 유지하되, 시점과 감정선을 완전히 바꾸기
- 대화문과 내면 독백을 풍부하게 포함
- 챕터 구분(## 제목) 포함
- 문학적이고 몰입감 있는 문체로 2000~3000자 작성
- 한국어로 작성
원작 구간: ${chapterRange}`;
  } else {
    systemPrompt = `당신은 창의적인 소설 작가입니다.
아래는 "${bookTitle}"의 원문입니다. 분기점 이후 이야기를 "${endingDirection}" 방향으로 재집필해주세요.

요구사항:
- 원문의 세계관, 인물, 문체를 그대로 유지
- "${endingDirection}"이라는 방향으로 자연스럽게 이야기 전개
- 챕터 구분(## 챕터 제목) 3개로 나누어 작성
- 각 챕터 500~800자 내외
- 결말이 납득 가능하고 감동적으로 마무리
- 한국어로 작성
원작 구간: ${chapterRange}`;
  }

  if (!apiKey) {
    // Mock response
    const mockText =
      type === "perspective"
        ? `## ${character}의 시선으로\n\n### 1장\n\n나는 해변을 걸으며 그 낯선 사람을 바라보았다. ${character}로서 나는 이 순간이 얼마나 중요한지 직감했다...\n\n그의 눈빛에서 나는 호기심을 읽었다. 마치 우리의 세계를 처음 발견한 아이처럼. 하지만 나도 그에게 물어보고 싶은 것이 있었다.\n\n"당신네는 어떻게 그 많은 것들을 만들어냈소?"\n\n이 질문은 오랫동안 내 마음속에 있었다. 단순한 호기심이 아니었다. 우리도 똑같은 사람인데, 왜 결과가 이렇게 달라졌을까?\n\n### 2장\n\n대답을 듣고 나는 고개를 끄덕였다. 환경의 차이라... 그것은 내가 예상하지 못한 답이었다. 우리의 땅에는 가축으로 길들일 수 있는 동물이 없었고, 대규모로 재배할 수 있는 작물도 달랐다.\n\n하지만 그것이 우리의 잘못은 아니었다. 이 사실이 나를 자유롭게 했다.`
        : `## 다른 결말: ${endingDirection}\n\n### 분기점 이후 1장\n\n역사의 물줄기가 다른 방향으로 흘렀다면 어떻게 되었을까? ${endingDirection}의 세계에서는 모든 것이 달랐다.\n\n### 2장\n\n새로운 질서가 형성되기 시작했다. 기존의 힘의 균형은 완전히 뒤바뀌었고, 세계 지도는 우리가 아는 것과는 전혀 다른 모습이 되었다.\n\n### 3장\n\n그리하여 세계는 완전히 새로운 모습으로 변모했다. ${endingDirection}라는 전환점은 이후 수천 년의 역사를 근본적으로 바꿔놓았다.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const chars = mockText.split("");
        for (const char of chars) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ content: char })}\n\n`
            )
          );
          await new Promise((r) => setTimeout(r, 15));
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
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `원문:\n${chapterText}`,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "숏북 생성 실패" },
      { status: 500 }
    );
  }
}
