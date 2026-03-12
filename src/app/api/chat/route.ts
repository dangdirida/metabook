import { NextRequest, NextResponse } from "next/server";

// Claude API 스트리밍 대화
export async function POST(req: NextRequest) {
  const { messages, agentName, bookTitle, persona } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // API 키 없으면 목업 응답
  if (!apiKey) {
    const mockResponses: Record<string, string[]> = {
      얄리: [
        "안녕! 나는 뉴기니에서 온 얄리야. 네가 궁금한 게 있으면 뭐든 물어봐.",
        "화물에 대해 물어봤던 그날을 아직도 기억해. 왜 우리는 그런 것들을 만들지 못했을까? 그건 정말 중요한 질문이었지.",
        "재레드가 내 질문에 답을 찾아준 건 정말 감사한 일이야. 그 답은 인종 차이가 아니라 환경의 차이였어.",
      ],
      "재레드 다이아몬드": [
        "안녕하세요. 저는 생물지리학자 재레드 다이아몬드입니다. 어떤 이야기가 궁금하세요?",
        "얄리의 질문은 제 인생을 바꿔놓았어요. 왜 대륙마다 문명 발전 속도가 달랐는지, 그 답을 찾는 데 수십 년이 걸렸죠.",
        "문명의 차이는 인종이 아니라 지리에서 비롯됩니다. 각 대륙이 가진 동식물, 대륙의 축 방향이 핵심이에요.",
      ],
    };

    const responses = mockResponses[agentName] || [
      `안녕하세요! 저는 ${agentName}입니다. ${bookTitle}에 대해 이야기해볼까요?`,
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];

    // 스트리밍 시뮬레이션
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (const char of response) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: char })}\n\n`));
          await new Promise((r) => setTimeout(r, 20));
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

  // Claude API 연동
  const systemPrompt = `당신은 "${bookTitle}"이라는 책의 캐릭터 "${agentName}"입니다.
${persona || ""}

규칙:
- 항상 캐릭터의 말투와 성격을 유지하세요
- 책의 세계관과 내용에 충실하세요
- 책에 없는 사실을 지어내지 마세요
- 친절하고 대화적인 톤을 유지하세요
- 응답은 한국어로 해주세요`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    // 스트림 전달
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "AI 응답 생성 실패" },
      { status: 500 }
    );
  }
}
