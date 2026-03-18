import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { type, bookTitle, chapterText, character, endingDirection, chapterRange } =
    await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;

  let systemPrompt = "";
  if (type === "perspective") {
    systemPrompt = `당신은 소설 작가입니다. 아래 원문을 "${character}"의 시점에서 내면 묘사와 대화를 포함해 재집필하세요.
챕터 구분을 포함하고, 문학적 문체로 작성하세요. 2000자 내외로 작성하세요.
원작: "${bookTitle}" (${chapterRange})`;
  } else {
    systemPrompt = `당신은 소설 작가입니다. 아래 원문의 분기점 이후를 "${endingDirection}" 방향으로 전개되도록 3챕터 분량으로 재집필하세요.
챕터 구분을 포함하고, 문학적 문체로 작성하세요. 2000자 내외로 작성하세요.
원작: "${bookTitle}" (${chapterRange})`;
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
