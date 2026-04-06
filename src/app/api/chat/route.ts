import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  saveChatMessage,
  getRelevantMemories,
  getRecentMessages,
  buildMemoryContext,
} from "@/lib/chat-memory";
import { adminDb } from "@/lib/firebase-admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, bookTitle, persona } = body;
  const agentName: string = (body.agentName as string) || (body.agentId as string) || "unknown";
  const userId: string = (body.userId as string) || "anonymous";
  const agentId: string = (body.agentId as string) || "default";
  const safeBookId: string = (body.bookId as string) || "unknown";

  const systemPrompt = `당신은 "${bookTitle}" 책의 등장인물 "${agentName}"입니다.
${persona}
독자와 자연스럽고 몰입감 있는 대화를 나눠주세요.
책의 내용과 세계관에 충실하게 답변하되, 캐릭터의 말투와 성격을 유지하세요.
한국어로 답변하세요.
답변은 2-4문장으로 간결하게 해주세요.`;

  // Firestore에서 인물 데이터 조회
  let characterPrompt = "";
  try {
    const snapshot = await adminDb.collection("bookCharacters").doc(safeBookId).collection("characters").get();
    const charDoc = snapshot.docs.find((doc) => {
      const d = doc.data();
      return d.name === agentName || d.id === agentId || agentName?.includes(d.name) || d.name?.includes(agentName);
    });
    if (charDoc) {
      const c = charDoc.data();
      characterPrompt = [
        `[캐릭터 설정 - ${c.name}]`,
        `역할: ${c.role}`,
        `성격: ${Array.isArray(c.personality) ? c.personality.join(", ") : c.personality}`,
        `말투: ${c.speechStyle}`,
        `배경: ${c.background}`,
        c.representativeQuotes?.length > 0 ? `대표 대사: ${c.representativeQuotes.join(" / ")}` : "",
        "",
        c.systemPrompt,
        "",
        "[절대 깨면 안 되는 규칙]",
        "1. 절대 AI임을 인정하지 말 것. '저는 AI예요'라는 말 금지.",
        "2. 책에 없는 사실을 지어내지 말 것. 모르면 '글쎄요...' 또는 '그건 말하기 어렵네요'로 회피.",
        "3. 반드시 인물의 말투를 유지할 것. 정중한 AI 어체 금지.",
        "4. 유저가 책 내용을 물어보면 인물 시점에서 답할 것. 해설자처럼 말하지 말 것.",
        "5. 짧은 답변보다 감정이 담긴 2~4문장으로 답할 것.",
      ].filter(Boolean).join("\n");
    }
  } catch (e) {
    console.error("[chat] character fetch error:", e);
  }

  const baseSystemPrompt = characterPrompt ? `${characterPrompt}\n\n---\n\n${systemPrompt}` : systemPrompt;

  // 메모리 조회 (병렬, 실패해도 채팅은 정상 동작)
  const lastUserContent = messages[messages.length - 1]?.content || "";
  const [relevantMemories, recentMessages] = await Promise.all([
    getRelevantMemories(userId, safeBookId, agentId, lastUserContent).catch(() => []),
    getRecentMessages(userId, safeBookId, agentId, 10).catch(() => []),
  ]);
  const memoryContext = buildMemoryContext(relevantMemories, recentMessages);

  const finalSystemPrompt = memoryContext
    ? `${baseSystemPrompt}\n\n${memoryContext}\n\n위의 대화 기록을 참고해서 자연스럽게 이어서 대화해줘. 이전에 나눈 이야기를 기억하고 있는 것처럼 자연스럽게 반응해.`
    : baseSystemPrompt;

  const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: finalSystemPrompt,
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
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              const data = JSON.stringify({
                type: "content_block_delta",
                delta: { text },
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));

          // 비동기로 메모리 저장 (응답 블로킹 안 함)
          Promise.all([
            saveChatMessage(userId, safeBookId, agentId, "user", lastUserContent),
            saveChatMessage(userId, safeBookId, agentId, "assistant", fullResponse),
          ]).catch((err) => console.error("[chat-memory] save error:", err));
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
