import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeAndSaveCharacters(
  bookId: string,
  bookTitle: string,
  fullText: string
): Promise<void> {
  const truncated = fullText.slice(0, 6000);

  const prompt = `소설 "${bookTitle}"의 본문을 분석해서 주요 등장인물을 JSON으로만 반환해줘.
마크다운이나 설명 없이 순수 JSON만 반환.
{
  "characters": [
    {
      "id": "영문소문자_언더스코어",
      "name": "한국어 이름",
      "role": "주인공 또는 조연",
      "personality": ["성격 키워드 3~5개"],
      "speechStyle": "말투 설명. 구체적인 예시 포함.",
      "background": "인물 배경 2~3문장",
      "relationships": [{"name": "상대방", "relation": "관계"}],
      "representativeQuotes": ["실제 본문 대사"],
      "systemPrompt": "당신은 소설 속 {이름}입니다. [구체적 말투 지시]. [절대 AI임을 밝히지 말 것]. [책 내용 모를 때 회피 방법]. [감정 표현 방식]을 5~7문장으로."
    }
  ]
}
본문 (앞 6000자):
${truncated}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  const parsed = JSON.parse(text);
  const characters = parsed.characters || [];

  const AVATAR_MAP: Record<string, string> = {
    jeong_in: "/avatars/jeong_in.jpg",
    mari: "/avatars/mari.jpg",
    su_yeong: "/avatars/su_yeong.jpg",
  };

  const batch = adminDb.batch();
  for (const c of characters) {
    const avatar = AVATAR_MAP[c.id] || "/avatars/default-profile.svg";
    const ref = adminDb.collection("bookCharacters").doc(bookId).collection("characters").doc(c.id);
    batch.set(ref, { ...c, avatar, bookId, analyzedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  await batch.commit();
  console.log(`[book-setup] ${bookTitle}: ${characters.length}명 분석 완료`);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < Math.min(str.length, 500); i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

export async function ensureCharactersAnalyzed(
  bookId: string,
  bookTitle: string,
  fullText: string
): Promise<void> {
  try {
    const currentHash = simpleHash(fullText);
    const bookDoc = await adminDb.collection("bookCharacters").doc(bookId).get();
    const savedHash = bookDoc.data()?.contentHash;

    if (bookDoc.exists && savedHash === currentHash) {
      return; // 본문 동일 → 기존 데이터 사용
    }

    console.log(`[book-setup] 본문 변경 감지 (${bookId}) → 인물 재분석 시작`);

    // 기존 characters 삭제
    if (bookDoc.exists) {
      const chars = await adminDb.collection("bookCharacters").doc(bookId).collection("characters").get();
      await Promise.all(chars.docs.map((d) => d.ref.delete()));
    }

    // 재분석 실행
    await analyzeAndSaveCharacters(bookId, bookTitle, fullText);

    // 해시 저장
    await adminDb.collection("bookCharacters").doc(bookId).set(
      { contentHash: currentHash, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.error("[book-setup] ensureCharactersAnalyzed error:", e);
  }
}
