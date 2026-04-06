import { Pinecone } from "@pinecone-database/pinecone";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// ── 타입 ──────────────────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

interface PineconeMetadata {
  [key: string]: string;
  userId: string;
  bookId: string;
  agentId: string;
  role: string;
  content: string;
  createdAt: string;
}

// ── Pinecone 싱글톤 ────────────────────────────────────────
let _pinecone: Pinecone | null = null;
function getPinecone() {
  if (!_pinecone) _pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  return _pinecone;
}
function getIndex() {
  return getPinecone().index<PineconeMetadata>(process.env.PINECONE_INDEX_NAME!);
}

// ── Gemini text-embedding-004 호출 ────────────────────────
async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text }] },
      }),
    }
  );
  if (!res.ok) throw new Error(`Embedding API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.embedding.values as number[];
}

// ── Firestore 경로 헬퍼 (Admin SDK) ─────────────────────────
function messagesCol(userId: string, bookId: string, agentId: string) {
  const docId = `${userId}__${bookId}__${agentId}`;
  return adminDb.collection("chatMemory").doc(docId).collection("messages");
}

// ── 1. 메시지 저장 (Pinecone + Firestore 병렬) ─────────────
export async function saveChatMessage(
  userId: string,
  bookId: string,
  agentId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const vectorId = `${userId}__${bookId}__${agentId}__${Date.now()}__${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const [embedding] = await Promise.all([
    generateEmbedding(content),
    messagesCol(userId, bookId, agentId).add({
      role,
      content,
      userId,
      bookId,
      agentId,
      createdAt: FieldValue.serverTimestamp(),
    }),
  ]);

  await getIndex().upsert({
    records: [
      {
        id: vectorId,
        values: embedding,
        metadata: { userId, bookId, agentId, role, content, createdAt: now },
      },
    ],
  });
}

// ── 2. 의미 유사 과거 대화 검색 (RAG) ─────────────────────
export async function getRelevantMemories(
  userId: string,
  bookId: string,
  agentId: string,
  currentMessage: string,
  topK = 5
): Promise<ChatMessage[]> {
  const embedding = await generateEmbedding(currentMessage);
  const results = await getIndex().query({
    vector: embedding,
    topK,
    filter: { userId, bookId, agentId },
    includeMetadata: true,
  });
  return (results.matches ?? [])
    .filter((m) => (m.score ?? 0) > 0.75)
    .map((m) => ({
      role: m.metadata!.role as "user" | "assistant",
      content: m.metadata!.content,
      createdAt: new Date(m.metadata!.createdAt),
    }));
}

// ── 3. 최근 대화 N개 (시간순) ─────────────────────────────
export async function getRecentMessages(
  userId: string,
  bookId: string,
  agentId: string,
  msgLimit = 10
): Promise<ChatMessage[]> {
  const snap = await messagesCol(userId, bookId, agentId)
    .orderBy("createdAt", "desc")
    .limit(msgLimit)
    .get();
  return snap.docs
    .map((doc) => {
      const d = doc.data();
      return {
        role: d.role as "user" | "assistant",
        content: d.content as string,
        createdAt: d.createdAt?.toDate?.() ?? new Date(),
      };
    })
    .reverse();
}

// ── 4. 시스템 프롬프트에 주입할 메모리 컨텍스트 생성 ────────
export function buildMemoryContext(
  relevant: ChatMessage[],
  recent: ChatMessage[]
): string {
  const parts: string[] = [];
  if (relevant.length > 0) {
    parts.push(
      "## 이전 대화에서 관련된 기억\n" +
        relevant.map((m) => `[${m.role === "user" ? "독자" : "나"}]: ${m.content}`).join("\n")
    );
  }
  if (recent.length > 0) {
    parts.push(
      "## 최근 대화 흐름\n" +
        recent.map((m) => `[${m.role === "user" ? "독자" : "나"}]: ${m.content}`).join("\n")
    );
  }
  return parts.join("\n\n");
}
