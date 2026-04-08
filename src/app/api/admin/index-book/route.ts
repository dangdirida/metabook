import { NextRequest, NextResponse } from "next/server";
import { getChaptersByBookId } from "@/lib/mock-content";

function chunkText(text: string, size = 500, overlap = 100): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  return chunks.filter((c) => c.trim().length > 50);
}

async function embedText(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text: text.slice(0, 2000) }] }, outputDimensionality: 768 }),
    }
  );
  if (!res.ok) {
    console.error(`[embedText] HTTP ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.embedding?.values || [];
}

async function upsertToPinecone(vectors: { id: string; values: number[]; metadata: Record<string, string | number> }[], host: string, apiKey: string) {
  for (let i = 0; i < vectors.length; i += 100) {
    const batch = vectors.slice(i, i + 100);
    await fetch(`${host}/vectors/upsert`, {
      method: "POST",
      headers: { "Api-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ vectors: batch }),
    });
  }
}

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const pineconeKey = process.env.PINECONE_API_KEY;
  const pineconeHost = process.env.PINECONE_HOST;
  if (!geminiKey || !pineconeKey || !pineconeHost) {
    return NextResponse.json({ error: "환경변수 누락" }, { status: 503 });
  }

  try {
    const { bookId } = await req.json();
    const chapters = getChaptersByBookId(bookId);

    const vectors: { id: string; values: number[]; metadata: Record<string, string | number> }[] = [];
    let totalChunks = 0;

    console.log(`[index-book] ${bookId}: ${chapters.length} chapters found`);

    for (const chapter of chapters) {
      if (!chapter.content || chapter.content.length < 50) {
        console.log(`[index-book] ch${chapter.number}: skipped (${chapter.content?.length || 0} chars)`);
        continue;
      }
      const chunks = chunkText(chapter.content);
      console.log(`[index-book] ch${chapter.number}: ${chunks.length} chunks (${chapter.content.length} chars)`);

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await embedText(chunks[i], geminiKey);
        if (embedding.length === 0) {
          console.log(`[index-book] ch${chapter.number}-chunk${i}: embedding failed`);
          continue;
        }

        vectors.push({
          id: `${bookId}-ch${chapter.number}-chunk${i}`,
          values: embedding,
          metadata: {
            bookId,
            chapterNumber: chapter.number,
            chapterTitle: chapter.title,
            text: chunks[i].slice(0, 500),
            characters: (chapter.characters || []).join(","),
            type: "chapter",
          },
        });
        totalChunks++;
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    await upsertToPinecone(vectors, pineconeHost, pineconeKey);
    console.log(`[index-book] ${bookId}: ${totalChunks} chunks indexed`);

    return NextResponse.json({ success: true, bookId, totalChunks });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[index-book] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
