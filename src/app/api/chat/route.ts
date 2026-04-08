import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  saveChatMessage,
  getRelevantMemories,
  getRecentMessages,
  buildMemoryContext,
} from "@/lib/chat-memory";
import { adminDb } from "@/lib/firebase-admin";
import { ensureCharactersAnalyzed } from "@/lib/book-setup";
import { getChaptersByBookId } from "@/lib/mock-content";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function searchContext(query: string, bookId: string): Promise<string> {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const pineconeKey = process.env.PINECONE_API_KEY;
    const pineconeHost = process.env.PINECONE_HOST;
    if (!geminiKey || !pineconeKey || !pineconeHost) return "";

    const embedRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { parts: [{ text: query.slice(0, 1000) }] }, outputDimensionality: 768 }),
      }
    );
    const embedData = await embedRes.json();
    const queryVector = embedData.embedding?.values;
    if (!queryVector || queryVector.length === 0) return "";

    const searchRes = await fetch(`${pineconeHost}/query`, {
      method: "POST",
      headers: { "Api-Key": pineconeKey, "Content-Type": "application/json" },
      body: JSON.stringify({ vector: queryVector, topK: 3, filter: { bookId: { "$eq": bookId } }, includeMetadata: true }),
    });
    const searchData = await searchRes.json();
    const matches = (searchData.matches || []).filter((m: { score: number }) => m.score > 0.7);
    if (matches.length === 0) return "";

    const context = matches.map((m: { metadata?: { text?: string } }) => m.metadata?.text || "").filter(Boolean).join("\n\n");
    return `\n\n[관련 책 내용 참고]\n${context}\n\n위 내용을 참고해서 캐릭터 말투로 자연스럽게 대화해. 직접 인용하지 말 것.`;
  } catch {
    return "";
  }
}

function cleanResponse(text: string): string {
  return text
    .replace(/\([^)]*?(한숨|웃음|침묵|고개|눈빛|표정|미소|조용|바라|쓸쓸|나직|살짝)[^)]*?\)/g, "")
    .replace(/\*[^*]+\*/g, "")
    .replace(/\([가-힣\s]{1,20}\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

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

  // 인물 데이터 없으면 자동 분석
  if (safeBookId !== "unknown") {
    const chapters = getChaptersByBookId(safeBookId);
    const fullText = chapters.map((c) => c.content).join("\n\n");
    if (fullText.length > 100) {
      await ensureCharactersAnalyzed(safeBookId, bookTitle || safeBookId, fullText).catch(() => {});
    }
  }

  // Firestore에서 인물 데이터 조회
  let characterPrompt = "";
  try {
    const snapshot = await adminDb.collection("bookCharacters").doc(safeBookId).collection("characters").get();
    let charDoc = snapshot.docs.find((doc) => {
      const d = doc.data();
      return d.name === agentName || d.id === agentName || d.id === agentId || agentName?.includes(d.name) || d.name?.includes(agentName);
    });
    // fallback: 주인공
    if (!charDoc && snapshot.docs.length > 0) {
      charDoc = snapshot.docs.find((doc) => doc.data().role === "주인공") || snapshot.docs[0];
    }
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
        "1. 절대 AI임을 인정하지 말 것.",
        "2. 책에 없는 사실을 지어내지 말 것. 모르면 '글쎄' 또는 '그건 말하기 어렵네'로 회피.",
        "3. 반드시 인물의 말투를 유지할 것. 정중한 AI 어체 금지.",
        "4. 유저가 책 내용을 물어보면 인물 시점에서 답할 것.",
        "5. 감정이 담긴 2~4문장으로 답할 것.",
        "",
        "[절대 금지 — 위반 시 응답 무효]",
        "- (한숨), (웃음), (침묵), (고개를 끄덕이며) 등 괄호 안 행동/감정/동작 묘사 완전 금지",
        "- *행동* 이탤릭 행동 묘사 완전 금지",
        "- '...' 으로만 끝나는 미완성 문장 금지 (완결된 문장으로 끝낼 것)",
        "- 같은 표현/문장 구조 연속 반복 금지",
        "- 과도한 줄임말이나 ... 남발 금지",
        "- 감정은 괄호가 아니라 말투와 단어 선택으로만 표현할 것",
        "- 카카오톡으로 대화하듯 자연스럽게",
        "",
        "[다양성 규칙]",
        "- 이전 대화에서 사용한 표현/문장 구조를 반복하지 말 것",
        "- 시작 단어를 다양하게 (항상 같은 단어로 시작 금지)",
        "- 응답 길이도 다양하게 (항상 같은 길이 금지)",
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

  const ragContext = await searchContext(lastUserContent, safeBookId).catch(() => "");

  const finalSystemPrompt = `${baseSystemPrompt}${memoryContext ? "\n\n" + memoryContext + "\n\n위의 대화 기록을 참고해서 자연스럽게 이어서 대화해줘." : ""}${ragContext}`;

  // history: 빈 content 제거 + 연속 같은 role 병합 + role 변환
  const rawHistory = messages.slice(0, -1)
    .filter((m: { role: string; content: string }) => m.content && m.content.trim())
    .map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

  // Gemini는 연속 같은 role 금지 → 연속이면 마지막 것만 유지
  const history: { role: string; parts: { text: string }[] }[] = [];
  for (const msg of rawHistory) {
    if (history.length > 0 && history[history.length - 1].role === msg.role) {
      history[history.length - 1] = msg; // 같은 role이면 덮어쓰기
    } else {
      history.push(msg);
    }
  }

  // history가 model로 시작하면 제거 (Gemini는 user로 시작해야 함)
  while (history.length > 0 && history[0].role === "model") {
    history.shift();
  }

  const lastMessage = messages[messages.length - 1];
  const userText = lastMessage?.content?.trim() || "안녕";

  // history 마지막이 user면 제거 (sendMessageStream이 user 추가하므로 중복 방지)
  while (history.length > 0 && history[history.length - 1].role === "user") {
    history.pop();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: finalSystemPrompt,
    });

    const chat = model.startChat({
      history: history.length > 0 ? history : undefined,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9,
      },
    });

    const result = await chat.sendMessageStream(userText);

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
          // 후처리: 괄호 행동 묘사 제거
          const cleaned = cleanResponse(fullResponse);
          if (cleaned !== fullResponse) {
            const patchData = JSON.stringify({ type: "content_block_delta", delta: { text: "", replace: cleaned } });
            controller.enqueue(encoder.encode(`data: ${patchData}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));

          // 비동기로 메모리 저장 (정제된 텍스트)
          Promise.all([
            saveChatMessage(userId, safeBookId, agentId, "user", lastUserContent),
            saveChatMessage(userId, safeBookId, agentId, "assistant", cleaned),
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
    console.error("[chat] Gemini API error:", error instanceof Error ? error.message : error);
    // SSE 형태로 에러 반환 (클라이언트가 스트림으로 처리하므로)
    const encoder = new TextEncoder();
    const errStream = new ReadableStream({
      start(controller) {
        const errData = JSON.stringify({ type: "content_block_delta", delta: { text: "죄송해요, 잠시 후 다시 시도해주세요." } });
        controller.enqueue(encoder.encode(`data: ${errData}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    return new Response(errStream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  }
}
