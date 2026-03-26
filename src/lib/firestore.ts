import { db } from "./firebase";
import {
  doc, setDoc, getDoc, updateDoc,
  collection, getDocs, addDoc, serverTimestamp
} from "firebase/firestore";

// 사용자 정보 저장/업데이트 (로그인 시 자동 호출)
export async function upsertUser(user: {
  id: string; email: string; name: string; image?: string;
}) {
  const ref = doc(db, "users", user.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      library: [],
    });
  } else {
    await updateDoc(ref, {
      name: user.name,
      image: user.image,
      updatedAt: serverTimestamp(),
    });
  }
}

// 사용자 서재 (책 추가)
export async function addToLibrary(userId: string, bookId: string) {
  const ref = doc(db, "users", userId, "library", bookId);
  await setDoc(ref, { bookId, addedAt: serverTimestamp() });
}

// 사용자 서재 조회
export async function getLibrary(userId: string) {
  const snap = await getDocs(collection(db, "users", userId, "library"));
  return snap.docs.map(d => d.data());
}

// 커뮤니티 채팅 저장
export async function saveChatMessage(bookId: string, message: {
  userId: string; userName: string; text: string;
}) {
  await addDoc(collection(db, "books", bookId, "chat"), {
    ...message,
    createdAt: serverTimestamp(),
  });
}

// 창작물 저장
export async function saveCreation(data: {
  userId: string; bookId: string; type: string; content: string; title: string;
}) {
  await addDoc(collection(db, "creations"), {
    ...data,
    createdAt: serverTimestamp(),
    likes: 0,
  });
}
