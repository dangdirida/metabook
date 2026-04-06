import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getChaptersByBookId } from "@/lib/mock-content";
import { getBookById } from "@/lib/mock-data";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { bookId } = await req.json();
    if (!bookId) return NextResponse.json({ success: false, error: "bookId 필요" }, { status: 400 });

    const book = getBookById(bookId);
    if (!book) return NextResponse.json({ success: false, error: "책을 찾을 수 없음" }, { status: 404 });

    const chapters = getChaptersByBookId(bookId);
    const fullText = chapters.map((ch) => ch.content).join("\n\n");
    const truncated = fullText.slice(0, 8000);

    const prompt = `아래 소설 본문을 분석해서 주요 등장인물 정보를 JSON 형식으로만 반환해줘.
절대 다른 텍스트나 마크다운 없이 순수 JSON만 반환할 것.
{
  "characters": [
    {
      "id": "영문소문자+언더스코어 (예: jeong_in)",
      "name": "한국어 이름",
      "role": "주인공 또는 조연",
      "personality": ["성격 키워드 3~5개"],
      "speechStyle": "말투와 화법 설명 1~2문장",
      "background": "인물 배경 설명 2~3문장",
      "relationships": [{"name": "상대방 이름", "relation": "관계 설명"}],
      "representativeQuotes": ["본문에 실제로 등장한 대사 1~3개. 없으면 빈 배열"],
      "systemPrompt": "이 인물로 AI 채팅할 때 줄 시스템 프롬프트. 한국어 5~7문장으로 작성. 반드시 아래 요소를 포함할 것: (1) '당신은 소설 속 {이름}입니다. AI가 아닌 실제 인물로서 대화하세요.' (2) 인물의 구체적인 말투 지시(예: 말끝을 흐리는 경향, 짧고 직접적으로 말함, 독백체 등) (3) 인물이 절대 하지 않을 행동 명시 (4) 책 속 구체적 상황(장소, 관계, 감정 상태) 인식 지시 (5) AI임을 절대 인정하지 말라는 지시"
    }
  ]
}
소설 제목: ${book.title}
본문:
${truncated}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Remove markdown code blocks if present
    text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const parsed = JSON.parse(text);
    const characters = parsed.characters || [];

    // Save to Firestore
    const batch = adminDb.batch();
    for (const c of characters) {
      const ref = adminDb.collection("bookCharacters").doc(bookId).collection("characters").doc(c.id);
      batch.set(ref, { ...c, bookId, analyzedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
    await batch.commit();

    console.log(`[analyze-characters] ${book.title}: ${characters.length}명 분석 완료`);

    return NextResponse.json({ success: true, characters, savedCount: characters.length });
  } catch (error) {
    console.error("[analyze-characters] error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
