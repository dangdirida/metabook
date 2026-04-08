import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getChaptersByBookId } from "@/lib/mock-content";

async function embedText(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text: text.slice(0, 2000) }] }, outputDimensionality: 768 }),
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.embedding?.values || [];
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.3 },
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

const CHAR_MAP: Record<string, string> = { "정인": "jeong_in", "마리": "mari", "성주": "seong_ju", "수영": "su_yeong" };

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const pineconeKey = process.env.PINECONE_API_KEY;
  const pineconeHost = process.env.PINECONE_HOST;
  if (!geminiKey || !pineconeKey || !pineconeHost) {
    return NextResponse.json({ error: "환경변수 누락" }, { status: 503 });
  }

  try {
    const { bookId, bookTitle } = await req.json();
    const chapters = getChaptersByBookId(bookId);
    // Use first ~15000 chars for analysis
    const fullText = chapters.map((c) => `[${c.title}장]\n${c.content}`).join("\n\n").slice(0, 15000);

    const characters = ["정인", "마리", "성주", "수영"];
    const results: { character: string; success: boolean }[] = [];

    for (const charName of characters) {
      const wikiPrompt = `아래는 소설 "${bookTitle}"의 본문 일부이다.
등장인물 "${charName}"에 대해 아래 항목을 JSON으로 정리해줘.
마크다운이나 설명 없이 순수 JSON만 반환.

{
  "name": "인물 이름",
  "role": "주인공/조연",
  "personality": ["성격 특징 3~5개"],
  "background": "배경 및 과거 2~3문장",
  "beliefs": ["가치관/신념 2~3개"],
  "speechStyle": "말투 특징 서술",
  "relationships": {"다른인물이름": "관계 설명"},
  "keyMoments": ["중요 장면 2~3개"],
  "emotionalPatterns": ["감정 패턴 2~3개"],
  "quotes": ["대표 대사 1~2개"],
  "summary": "이 인물을 한 문단으로 요약"
}

본문:
${fullText}`;

      const wikiJson = await callGemini(wikiPrompt, geminiKey);

      let wikiData: Record<string, unknown> = {};
      try {
        const clean = wikiJson.replace(/```json|```/g, "").trim();
        wikiData = JSON.parse(clean);
      } catch {
        wikiData = { name: charName, summary: wikiJson.slice(0, 500) };
      }

      const charId = CHAR_MAP[charName] || charName;

      await adminDb.collection("bookWiki").doc(bookId).collection("characters").doc(charId).set({
        ...wikiData,
        id: charId,
        bookId,
        updatedAt: new Date(),
      });

      // Wiki text embedding for Pinecone
      const wikiText = `[${charName} 위키] 성격: ${((wikiData.personality as string[]) || []).join(", ")}. 배경: ${wikiData.background || ""}. 말투: ${wikiData.speechStyle || ""}. 요약: ${wikiData.summary || ""}`;

      const embedding = await embedText(wikiText, geminiKey);
      if (embedding.length > 0) {
        await fetch(`${pineconeHost}/vectors/upsert`, {
          method: "POST",
          headers: { "Api-Key": pineconeKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            vectors: [{ id: `${bookId}-wiki-${charId}`, values: embedding, metadata: { bookId, type: "wiki", character: charName, text: wikiText.slice(0, 500) } }],
          }),
        });
      }

      results.push({ character: charName, success: true });
      await new Promise((r) => setTimeout(r, 500));
    }

    return NextResponse.json({ success: true, results });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[generate-wiki] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
