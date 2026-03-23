import { NextRequest, NextResponse } from "next/server";

// mock 응답 생성 — agentName, bookTitle, persona, userMessage 기반 분기
function getMockResponse(
  agentName: string,
  bookTitle: string,
  persona: string,
  userMessage: string
): string {
  const personaFirstSentence = persona.split(/[.!?]/)[0]?.trim() || "";
  const isGreeting = /안녕|hi|hello|반가|처음/.test(userMessage.toLowerCase());
  const isQuestion = /\?|뭐|어떻게|왜|언제|어디|누구|알려|무엇|설명/.test(
    userMessage
  );

  if (isGreeting) {
    return `안녕하세요! 저는 "${bookTitle}"의 캐릭터 ${agentName}입니다. ${personaFirstSentence}. 무엇이 궁금하신가요?`;
  }

  if (isQuestion) {
    return `좋은 질문이에요! "${bookTitle}"에서 그 부분은 정말 흥미로운 주제인데요. ${personaFirstSentence ? personaFirstSentence + "인 저로서는, " : ""}이 이야기 속에서 그 답을 찾아보면 꽤 깊은 의미가 있답니다. 더 구체적으로 알고 싶은 부분이 있으면 말씀해주세요!`;
  }

  return `그 말씀에 공감해요. "${bookTitle}"을 읽다 보면 정말 많은 생각이 들죠. ${personaFirstSentence ? personaFirstSentence + "인 저도 " : "저도 "}비슷한 감정을 느낄 때가 있어요. 더 이야기 나눠볼까요?`;
}

// 글자 단위 mock 스트리밍 응답 생성
function createMockStream(content: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for (const char of content) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content: char })}\n\n`)
        );
        await new Promise((r) => setTimeout(r, 20));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

export async function POST(req: NextRequest) {
  const { messages, agentName, bookTitle, persona } = await req.json();
  const userMessage =
    messages?.filter((m: { role: string }) => m.role === "user").pop()
      ?.content || "";
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // API 키 없으면 바로 mock fallback
  if (!apiKey) {
    const mockContent = getMockResponse(
      agentName,
      bookTitle,
      persona || "",
      userMessage
    );
    return new NextResponse(createMockStream(mockContent), {
      headers: SSE_HEADERS,
    });
  }

  // Claude API 연동 시도
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
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    });

    // API 실패(크레딧 부족, 인증 오류 등) → mock fallback
    if (!response.ok) {
      const mockContent = getMockResponse(
        agentName,
        bookTitle,
        persona || "",
        userMessage
      );
      return new NextResponse(createMockStream(mockContent), {
        headers: SSE_HEADERS,
      });
    }

    // API 스트림 전달
    return new NextResponse(response.body, { headers: SSE_HEADERS });
  } catch {
    // 네트워크 오류 등 → mock fallback
    const mockContent = getMockResponse(
      agentName,
      bookTitle,
      persona || "",
      userMessage
    );
    return new NextResponse(createMockStream(mockContent), {
      headers: SSE_HEADERS,
    });
  }
}
