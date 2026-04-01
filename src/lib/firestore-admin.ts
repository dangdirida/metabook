import { adminDb } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function upsertUserAdmin(user: {
  id: string;
  email: string;
  name: string;
  image?: string;
}) {
  const ref = adminDb.collection("users").doc(user.id);
  const snap = await ref.get();

  if (!snap.exists) {
    await ref.set({
      ...user,
      role: "user",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log("[Firestore] 신규 유저 생성:", user.email);
  } else {
    await ref.update({
      name: user.name,
      image: user.image ?? "",
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log("[Firestore] 유저 정보 업데이트:", user.email);
  }
}
