import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebase-admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function cleanResponse(text: string): string {
  return text
    .replace(/\([^)]*?(한숨|웃음|침묵|고개|눈빛|표정|미소|조용|바라|쓸쓸|나직|살짝)[^)]*?\)/g, "")
    .replace(/\*[^*]+\*/g, "")
    .replace(/\([가-힣\s]{1,20}\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

interface CharacterInfo {
  id: string;
  name: string;
  role: string;
  personality: string[];
  speechStyle: string;
  background: string;
  systemPrompt: string;
  avatar: string;
}

interface ResponderPlan {
  characterId: string;
  type: "full" | "short" | "reaction" | "interject" | "none";
  reactionEmoji: string | null;
  targetCharacterId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userMessage, bookId, characters: clientChars, recentContext } = await req.json();

    if (!userMessage || !bookId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 클라이언트가 보낸 초대된 인물 ID 목록
    const invitedIds = new Set(
      (clientChars as CharacterInfo[] || []).map((c: CharacterInfo) => c.id)
    );

    // Firestore에서 인물 데이터 조회 — 초대된 인물만 필터링
    let characters: CharacterInfo[] = [];
    if (invitedIds.size > 0) {
      try {
        const snap = await adminDb.collection("bookCharacters").doc(bookId).collection("characters").get();
        characters = snap.docs
          .filter((doc) => invitedIds.has(doc.id))
          .map((doc) => {
            const d = doc.data();
            // 클라이언트 데이터에서 누락된 필드 보강
            const clientChar = (clientChars as CharacterInfo[])?.find((c: CharacterInfo) => c.id === doc.id);
            return {
              id: doc.id,
              name: d.name || clientChar?.name || doc.id,
              role: d.role || clientChar?.role || "",
              personality: Array.isArray(d.personality) ? d.personality : clientChar?.personality || [],
              speechStyle: d.speechStyle || clientChar?.speechStyle || "",
              background: d.background || clientChar?.background || "",
              systemPrompt: d.systemPrompt || clientChar?.systemPrompt || "",
              avatar: d.avatar || clientChar?.avatar || "/avatars/default-profile.svg",
            };
          });
      } catch { /* */ }
    }

    // Firestore에 없으면 클라이언트 데이터 사용
    if (characters.length === 0 && clientChars) {
      characters = clientChars;
    }

    if (characters.length === 0) {
      return NextResponse.json({ error: "No characters found" }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Step 1: 연출자 AI — 누가 어떻게 응답할지 결정
    const charListStr = characters.map((c) => `- ${c.name} (id: ${c.id})`).join("\n");

    const directorPrompt = `너는 그룹 채팅방의 연출자다. JSON으로만 응답해. 마크다운/설명 없이 순수 JSON만.

현재 채팅방 참여 인물 (이 인물들만 응답 가능):
${charListStr}

⚠️ 절대 규칙: 위 목록에 없는 인물은 절대 응답하면 안 된다. characterId는 반드시 위 id 중 하나여야 한다.

유저 메시지: "${userMessage}"
${recentContext ? `이전 대화:\n${recentContext}` : ""}

[응답 규칙]
1. 첫 인사("안녕" 등): 전원 각자 방식으로 인사 (똑같이 X)
2. 일반 대화: 관련 있는 1~2명만 "full", 나머지 "none"
3. 특정 인물 호명 시: 해당 인물만 "full"
4. 논쟁/감정 주제: 의견 다른 인물들만

[절대 금지] 모든 인물이 매번 리액션 / 억지 끼어들기 / 목록에 없는 인물 응답

[type] "full"(2~3문장), "short"(1문장), "reaction"(이모지 1개), "none"(침묵)

반드시 아래 JSON만 반환:
{
  "responders": [
    { "characterId": "위_id중_하나", "type": "full", "reactionEmoji": null }
  ]
}`;

    const directorResult = await model.generateContent(directorPrompt);
    let directorText = directorResult.response.text();
    directorText = directorText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let plan: { responders: ResponderPlan[] };
    try {
      plan = JSON.parse(directorText);
    } catch {
      // 파싱 실패시 첫 번째 인물만 응답
      plan = {
        responders: characters.map((c, i) => ({
          characterId: c.id,
          type: (i === 0 ? "full" : "none") as ResponderPlan["type"],
          reactionEmoji: null,
        })),
      };
    }

    // 초대된 인물만 응답하도록 필터링
    const validCharIds = new Set(characters.map((c) => c.id));
    plan.responders = plan.responders.filter((r) => validCharIds.has(r.characterId));

    // Step 2: 계획대로 각 인물 응답 생성
    const responses: {
      characterId: string;
      characterName: string;
      avatar: string;
      type: string;
      content: string;
    }[] = [];

    for (const responder of plan.responders) {
      if (responder.type === "none") continue;

      const character = characters.find((c) => c.id === responder.characterId);
      if (!character) continue;

      if (responder.type === "reaction") {
        responses.push({
          characterId: character.id,
          characterName: character.name,
          avatar: character.avatar,
          type: "reaction",
          content: responder.reactionEmoji || "👀",
        });
        continue;
      }

      // full, short, interject 응답 생성
      const lengthGuide = responder.type === "short"
        ? "반드시 한 문장, 10자 이내로 짧게. 카톡 답장처럼."
        : responder.type === "interject"
        ? "다른 인물의 말에 반응하는 짧은 한마디. 1문장."
        : "2~3문장. 짧고 임팩트 있게.";

      const interjectContext = responder.type === "interject" && responder.targetCharacterId
        ? `방금 ${characters.find((c) => c.id === responder.targetCharacterId)?.name || "다른 인물"}이 말한 것에 대해 반응해.`
        : "";

      const CHAR_HINT: Record<string, string> = {
        jeong_in: "정인: 조용하고 문학적. 은유적 표현. 짧고 사려깊게.",
        mari: "마리: 냉정하고 간결. 감정 직접 표현 안 함. 세련되게.",
        su_yeong: "수영: 밝고 친근. 유머 가끔. 자연스럽고 활기차게.",
        seong_ju: "성주: 과묵. 짧고 명확하게. 시적 표현. 말을 흐리지 않음.",
      };

      const charPrompt = `너는 "${character.name}"이다.
${character.systemPrompt || ""}

성격: ${character.personality.join(", ")}
말투: ${character.speechStyle}
배경: ${character.background}
${CHAR_HINT[character.id] || ""}

지금 단체 카톡방이야. ${lengthGuide}
${interjectContext}

대화 규칙:
- 카카오톡처럼 자연스럽게
- 괄호 행동 묘사 절대 금지: (한숨), (웃음), (고개를 끄덕이며) 등
- *행동* 이탤릭 묘사 금지
- 이모지 남발 금지 (꼭 필요할 때 1개만)
- "..."으로만 끝나는 미완성 문장 금지
- 완성된 문장으로 끝낼 것
- 같은 표현 반복 금지
- 시작 단어 다양하게

유저 메시지: "${userMessage}"`;

      try {
        const replyResult = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: charPrompt }] }],
          generationConfig: {
            maxOutputTokens: responder.type === "short" ? 256 : 2048,
            temperature: 0.95,
          },
        });
        const replyText = cleanResponse(replyResult.response.text().trim());

        responses.push({
          characterId: character.id,
          characterName: character.name,
          avatar: character.avatar,
          type: responder.type,
          content: replyText,
        });
      } catch (e) {
        console.error(`[group-chat] ${character.name} reply error:`, e);
      }
    }

    // 응답이 하나도 없으면 첫 인물 폴백
    if (responses.length === 0 && characters.length > 0) {
      responses.push({
        characterId: characters[0].id,
        characterName: characters[0].name,
        avatar: characters[0].avatar,
        type: "short",
        content: "...",
      });
    }

    return NextResponse.json({ responses });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[chat/group] error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
