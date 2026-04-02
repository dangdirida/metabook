import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const { messages, agentName, bookTitle, persona } = await req.json();

  const systemPrompt = `당신은 "${bookTitle}" 책의 등장인물 "${agentName}"입니다.
${persona}
독자와 자연스럽고 몰입감 있는 대화를 나눠주세요.
책의 내용과 세계관에 충실하게 답변하되, 캐릭터의 말투와 성격을 유지하세요.
한국어로 답변하세요.
답변은 2-4문장으로 간결하게 해주세요.`;

  const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.9,
      },
    });

    const result = await chat.sendMessageStream(lastMessage.content);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              const data = JSON.stringify({
                type: "content_block_delta",
                delta: { text },
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("Stream error:", err);
          const errData = JSON.stringify({
            type: "content_block_delta",
            delta: { text: "죄송해요, 응답 생성 중 오류가 발생했어요." },
          });
          controller.enqueue(encoder.encode(`data: ${errData}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return new Response(
      JSON.stringify({ error: "AI 응답 생성에 실패했어요." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
