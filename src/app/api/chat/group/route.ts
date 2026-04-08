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

    // Firestore에서 인물 데이터 조회
    let characters: CharacterInfo[] = [];
    try {
      const snap = await adminDb.collection("bookCharacters").doc(bookId).collection("characters").get();
      characters = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || doc.id,
          role: d.role || "",
          personality: Array.isArray(d.personality) ? d.personality : [],
          speechStyle: d.speechStyle || "",
          background: d.background || "",
          systemPrompt: d.systemPrompt || "",
          avatar: d.avatar || "/avatars/default-profile.svg",
        };
      });
    } catch { /* */ }

    // 클라이언트에서 전달된 인물 정보로 폴백
    if (characters.length === 0 && clientChars) {
      characters = clientChars;
    }

    if (characters.length === 0) {
      return NextResponse.json({ error: "No characters found" }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Step 1: 연출자 AI — 누가 어떻게 응답할지 결정
    const directorPrompt = `너는 소설 속 인물들의 단체 카톡방 연출자야.
아래 규칙을 철저히 지켜서 JSON으로만 응답해. 마크다운이나 설명 없이 순수 JSON만 반환.

인물 목록: ${characters.map((c) => `${c.name}(id:${c.id})`).join(", ")}
유저 메시지: "${userMessage}"
${recentContext ? `이전 대화:\n${recentContext}` : ""}

[응답 규칙]

규칙 1: 첫 등장/첫 인사
유저가 처음 대화를 시작하거나 "안녕" 같은 첫 인사를 하면
→ 모든 인물이 각자의 방식으로 인사. 단, 전부 똑같이 인사하지 말 것.

규칙 2: 일반 대화
유저가 일반적인 말을 하면
→ 그 주제에 관심 있거나 할 말 있는 인물 1~2명만 "full" 응답
→ 나머지는 "none"(침묵) 또는 극히 드물게 "reaction"
→ 리액션은 정말 자연스러울 때만, 억지로 하지 말 것

규칙 3: 특정 인물 호명
"[이름]아", "[이름]은", "[이름]한테" 등 특정 인물을 지목하면
→ 지목된 인물만 "full" 응답
→ 나머지는 "none" 또는 아주 가끔 "reaction" (흥미로울 때만)

규칙 4: 논쟁/감정적 주제
→ 의견 다른 인물들만 응답, 관심 없는 인물은 침묵

규칙 5: 인물 간 상호작용 (10~15% 확률로만)
아래 조건 충족 시 "interject" 타입 사용 가능:
- 유저 메시지가 논쟁/갈등 주제일 때
- 한 인물의 응답이 다른 인물의 가치관과 명확히 충돌할 때
- 감정적으로 공감/위로할 상황일 때
인물 간 관계:
- 마리↔성주: 복잡한 전 연인 — 의견 충돌 가능
- 정인↔마리: 관찰자↔당사자 — 정인이 조심스럽게 끼어들 수 있음
- 수영↔정인: 친밀한 관계 — 수영이 분위기 전환/위로 가능
인물 간 대화는 2~3메시지 내로 종료. 유저를 소외시키지 말 것.

[절대 금지]
- 모든 인물이 매번 리액션하는 것
- 억지로 끼어드는 것
- 관련 없는 인물이 응답하는 것
- 인물 간 대화가 5메시지 이상 지속되는 것

[type 종류]
"full": 본격 응답 (자기 말투/성격으로 자연스럽게)
"short": 짧은 한마디 (1문장 이내)
"reaction": 이모지 1개만 (reactionEmoji 필드에 이모지)
"interject": 다른 인물 발언에 반응 (짧은 한마디, targetCharacterId 지정)
"none": 침묵 (응답 없음)

반드시 아래 JSON 형식만 반환:
{
  "responders": [
    { "characterId": "id값", "type": "full", "reactionEmoji": null },
    { "characterId": "id값", "type": "none", "reactionEmoji": null },
    { "characterId": "id값", "type": "interject", "reactionEmoji": null, "targetCharacterId": "대상id" }
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

      const charPrompt = `${character.systemPrompt || `당신은 "${character.name}"입니다.`}

지금 단체 카톡방이야. ${lengthGuide}
${interjectContext}

[절대 금지 — 위반 시 응답 무효]
- (한숨), (웃음), (침묵) 등 괄호 안 행동/감정 묘사 완전 금지
- *행동* 이탤릭 행동 묘사 완전 금지
- "..." 으로만 끝나는 미완성 문장 금지
- 같은 표현/문장 구조 반복 금지
- 이모티콘/이모지 사용 금지
- 감정은 말투와 단어 선택으로만 표현

[하지 말 것]
- 모든 사람에게 인사하기
- 길게 설명하기
- 다른 인물 이름 불필요하게 끼워넣기

[다양성]
- 시작 단어를 다양하게
- 이전 대화에서 쓴 표현 반복하지 말 것

자연스럽게 카톡 보내듯이.
말투와 성격: ${character.speechStyle} / ${character.personality.join(", ")}

유저 메시지: "${userMessage}"`;

      try {
        const replyResult = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: charPrompt }] }],
          generationConfig: {
            maxOutputTokens: responder.type === "short" ? 64 : 256,
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
