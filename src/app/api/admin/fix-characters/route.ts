import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST() {
  try {
    const correctCharacters = [
      {
        id: "jeong_in",
        name: "정인",
        avatar: "/avatars/jeong_in.jpg",
        role: "protagonist",
        bookId: "lovers-lover",
        personality: ["내성적", "관찰력", "집요함"],
        speechStyle: "독백처럼 조용하고 내밀하게 이야기함. 감정을 직접 드러내기보다 사물에 빗대어 표현함",
        feedbackStats: { likes: 0, dislikes: 0 },
      },
      {
        id: "mari",
        name: "마리",
        avatar: "/avatars/mari.jpg",
        role: "protagonist",
        bookId: "lovers-lover",
        personality: ["냉철함", "독립적", "감정을 숨김"],
        speechStyle: "가늘지만 낮은 목소리. 말끝에 짧은 한숨이 이어짐",
        feedbackStats: { likes: 0, dislikes: 0 },
      },
      {
        id: "seong_ju",
        name: "성주",
        avatar: "",
        role: "supporting",
        bookId: "lovers-lover",
        personality: ["예술적", "과묵함", "비밀이 많음"],
        speechStyle: "말보다 눈빛과 행동으로 표현. 직접적인 감정 표현을 피함",
        feedbackStats: { likes: 0, dislikes: 0 },
      },
      {
        id: "su_yeong",
        name: "수영",
        avatar: "/avatars/su_yeong.jpg",
        role: "supporting",
        bookId: "lovers-lover",
        personality: ["밝음", "에너지 넘침", "사교적"],
        speechStyle: "환하게 웃으며 말하는 편. 농담을 자주 섞음",
        feedbackStats: { likes: 0, dislikes: 0 },
      },
    ];

    const colRef = adminDb.collection("bookCharacters").doc("lovers-lover").collection("characters");

    // 기존 전체 삭제
    const existing = await colRef.get();
    const deleteBatch = adminDb.batch();
    existing.docs.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();

    // 올바른 데이터로 저장
    const saveBatch = adminDb.batch();
    for (const char of correctCharacters) {
      saveBatch.set(colRef.doc(char.id), {
        ...char,
        isActive: true,
        analyzedAt: FieldValue.serverTimestamp(),
      });
    }
    await saveBatch.commit();

    // 결과 확인
    const result = await colRef.get();
    const saved = result.docs.map((doc) => ({ id: doc.id, name: doc.data().name }));

    return NextResponse.json({ success: true, deleted: existing.size, saved, count: saved.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[fix-characters] error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
