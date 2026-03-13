// 사용자
export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  image?: string;
  role: "user" | "super_admin" | "book_admin" | "mod" | "reviewer";
  isJunior: boolean;
  favoriteGenres: string[];
  createdAt: string;
  updatedAt: string;
}

// 도서
export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: "김영사" | "주니어김영사";
  genre: string[];
  ageGroup: "어린이" | "청소년" | "성인";
  coverImage: string;
  description: string;
  chapters: Chapter[];
  agents: Agent[];
  images: BookImage[];
  communityMemberCount: number;
  creationCount: number;
  seriesId?: string;
  seriesOrder?: number;
  worldUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// 챕터
export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  content: string;
  images: BookImage[];
}

// 책 삽화/이미지
export interface BookImage {
  id: string;
  bookId: string;
  chapterId?: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
  worldUrl?: string;
}

// AI Agent
export interface Agent {
  id: string;
  bookId: string;
  name: string;
  role: "protagonist" | "author" | "supporting" | "world_guide" | "tutor";
  avatar: string;
  personality: string[];
  speechStyle: string;
  forbiddenTopics: string[];
  systemPrompt: string;
  isActive: boolean;
  feedbackStats: {
    likes: number;
    dislikes: number;
  };
}

// 채팅 메시지
export interface Message {
  id: string;
  agentId?: string;
  userId: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  feedback?: "like" | "dislike";
}

// 커뮤니티 메시지
export interface CommunityMessage {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: "text" | "emoji" | "image" | "creation_link";
  isPinned: boolean;
  createdAt: string;
}

// 2차 창작물
export interface Creation {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  type: CreationType;
  fileUrl: string;
  thumbnailUrl: string;
  tags: string[];
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
  likes: number;
  ogqLinked: boolean;
  ogqUrl?: string;
  createdAt: string;
}

export type CreationType =
  | "sticker"
  | "music"
  | "photo"
  | "video"
  | "webtoon"
  | "novel"
  | "webdrama"
  | "ai_agent"
  | "prompt"
  | "extension"
  | "goods";

// 굿즈
export interface Goods {
  id: string;
  bookId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  stock: number;
  isLimitedEdition: boolean;
  externalUrl: string;
  createdAt: string;
}

// QR 코드
export interface QRMapping {
  id: string;
  bookId: string;
  imageId?: string;
  chapter?: number;
  type: "book" | "image" | "chapter" | "goods";
  url: string;
  scanCount: number;
}
