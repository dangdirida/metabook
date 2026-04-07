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

중요 규칙:
- 동일 인물은 반드시 하나로 통합할 것. 예: 이정인이 서술자이면서 등장인물이어도 하나의 객체만 생성.
- id는 반드시 소문자+언더스코어로 고유하게 생성. 같은 이름이면 무조건 같은 id.
- 최종 characters 배열에 같은 이름의 인물이 2개 이상 있으면 안 됨.
- 주요 등장인물만 추출. 단역이나 이름 없는 인물 제외.
- 인물은 최대 6명까지만.

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
      "representativeQuotes": ["실제 본문 대사 1~2개. 없으면 빈 배열"],
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
  const rawCharacters = parsed.characters || [];

  // 중복 제거 (id 또는 name 기준)
  const uniqueCharacters = rawCharacters.filter(
    (char: { id: string; name: string }, index: number, self: { id: string; name: string }[]) =>
      index === self.findIndex((c) => c.id === char.id || c.name === char.name)
  );

  const AVATAR_MAP: Record<string, string> = {
    jeong_in: "/avatars/jeong_in.jpg",
    jeongin: "/avatars/jeong_in.jpg",
    mari: "/avatars/mari.jpg",
    mary: "/avatars/mari.jpg",
    su_yeong: "/avatars/su_yeong.jpg",
    kim_su_young: "/avatars/su_yeong.jpg",
    sooyoung_kim: "/avatars/su_yeong.jpg",
  };

  // 기존 Firestore 인물 조회 (name 기준 중복 방지)
  const existingSnap = await adminDb.collection("bookCharacters").doc(bookId).collection("characters").get();
  const existingByName: Record<string, string> = {};
  existingSnap.docs.forEach((doc) => {
    const name = doc.data().name as string;
    if (name) existingByName[name] = doc.id;
  });

  const batch = adminDb.batch();
  const savedNames = new Set<string>();

  for (const c of uniqueCharacters) {
    if (savedNames.has(c.name)) continue; // 이번 배치 내 중복 스킵
    savedNames.add(c.name);

    const avatar = AVATAR_MAP[c.id] || "/avatars/default-profile.svg";
    // 같은 name이 이미 있으면 해당 doc을 update, 없으면 새 doc 생성
    const docId = existingByName[c.name] || c.id;
    const ref = adminDb.collection("bookCharacters").doc(bookId).collection("characters").doc(docId);
    batch.set(ref, { ...c, id: docId, avatar, bookId, analyzedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
  await batch.commit();
  console.log(`[book-setup] ${bookTitle}: ${uniqueCharacters.length}명 분석 완료 (중복 제거 후)`);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < Math.min(str.length, 1000); i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
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
    const hasCharacters = bookDoc.exists && savedHash;

    if (hasCharacters && savedHash === currentHash) {
      return; // 본문 동일 → 기존 데이터 사용
    }

    console.log(`[book-setup] ${bookId} 본문 변경 감지 → 인물 재분석 시작`);

    // 기존 characters 서브컬렉션 전체 삭제
    const existingChars = await adminDb.collection("bookCharacters").doc(bookId).collection("characters").get();
    await Promise.all(existingChars.docs.map((d) => d.ref.delete()));

    // 재분석 실행
    await analyzeAndSaveCharacters(bookId, bookTitle, fullText);

    // 새 해시 저장
    await adminDb.collection("bookCharacters").doc(bookId).set(
      { contentHash: currentHash, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.error("[book-setup] ensureCharactersAnalyzed error:", e);
  }
}
