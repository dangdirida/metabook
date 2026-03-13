import { Book, Agent } from "@/types";

const createAgent = (
  id: string,
  bookId: string,
  name: string,
  role: Agent["role"],
  personality: string[],
  speechStyle: string
): Agent => ({
  id,
  bookId,
  name,
  role,
  avatar: `/covers/agent-${id}.jpg`,
  personality,
  speechStyle,
  forbiddenTopics: [],
  systemPrompt: "",
  isActive: true,
  feedbackStats: { likes: 0, dislikes: 0 },
});

export const mockBooks: Book[] = [
  {
    id: "guns-germs-steel",
    title: "총, 균, 쇠",
    author: "재레드 다이아몬드",
    publisher: "김영사",
    genre: ["인문", "역사", "과학"],
    ageGroup: "성인",
    coverImage: "https://covers.openlibrary.org/b/id/7884018-L.jpg",
    description: "인류 문명의 불평등은 어디서 비롯되었는가? 1만 3천 년 인류 역사의 수수께끼를 풀어낸 역작.",
    chapters: [],
    agents: [
      createAgent("a1", "guns-germs-steel", "재레드 다이아몬드", "author", ["분석적", "호기심 많은"], "해요체"),
      createAgent("a2", "guns-germs-steel", "얄리", "protagonist", ["순수한", "탐구적"], "반말"),
    ],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 342,
    creationCount: 15,
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "sapiens",
    title: "사피엔스",
    author: "유발 하라리",
    publisher: "김영사",
    genre: ["인문", "역사"],
    ageGroup: "성인",
    coverImage: "https://covers.openlibrary.org/b/id/8634250-L.jpg",
    description: "유인원에서 사이보그까지, 인류 역사의 대담하고 도발적인 대항해.",
    chapters: [],
    agents: [
      createAgent("a3", "sapiens", "유발 하라리", "author", ["도발적", "통찰력 있는"], "해요체"),
    ],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 587,
    creationCount: 28,
    isActive: true,
    createdAt: "2024-02-10",
  },
  {
    id: "cosmos",
    title: "코스모스",
    author: "칼 세이건",
    publisher: "김영사",
    genre: ["과학", "우주"],
    ageGroup: "성인",
    coverImage: "https://covers.openlibrary.org/b/id/8739161-L.jpg",
    description: "138억 년 우주의 역사를 담은 과학 에세이. 우리는 어디서 왔고 어디로 가는가.",
    chapters: [],
    agents: [
      createAgent("a4", "cosmos", "칼 세이건", "author", ["시적", "철학적"], "해요체"),
    ],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 421,
    creationCount: 22,
    isActive: true,
    createdAt: "2024-03-05",
  },
  {
    id: "thinking-fast-slow",
    title: "생각에 관한 생각",
    author: "대니얼 카너먼",
    publisher: "김영사",
    genre: ["심리학", "경제"],
    ageGroup: "성인",
    coverImage: "https://covers.openlibrary.org/b/id/8323892-L.jpg",
    description: "노벨경제학상 수상자가 밝히는 인간 사고의 두 시스템.",
    chapters: [],
    agents: [
      createAgent("a5", "thinking-fast-slow", "대니얼 카너먼", "author", ["분석적", "유머러스"], "해요체"),
    ],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 198,
    creationCount: 8,
    isActive: true,
    createdAt: "2024-04-20",
  },
  {
    id: "unstoppable-us-1",
    title: "이게 정말 나일까? 1",
    author: "유발 하라리",
    publisher: "주니어김영사",
    genre: ["인문", "교육"],
    ageGroup: "어린이",
    coverImage: "https://covers.openlibrary.org/b/id/13147242-L.jpg",
    description: "세계적 석학 유발 하라리가 어린이를 위해 쓴 인류 이야기 1권",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 312,
    creationCount: 18,
    isActive: true,
    createdAt: "2024-05-01",
  },
  {
    id: "little-prince-jr",
    title: "어린 왕자",
    author: "생텍쥐페리",
    publisher: "주니어김영사",
    genre: ["인문", "교육"],
    ageGroup: "어린이",
    coverImage: "https://covers.openlibrary.org/b/id/8525338-L.jpg",
    description: "사막에 불시착한 조종사와 작은 별에서 온 어린 왕자의 만남",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 489,
    creationCount: 31,
    isActive: true,
    createdAt: "2024-05-15",
  },
  {
    id: "diary-wimpy-kid-jr",
    title: "윔피 키드 일기",
    author: "제프 키니",
    publisher: "주니어김영사",
    genre: ["교육", "사회"],
    ageGroup: "어린이",
    coverImage: "https://covers.openlibrary.org/b/id/8355262-L.jpg",
    description: "중학교 생활의 좌충우돌 일기. 전 세계 어린이들이 사랑하는 베스트셀러",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 276,
    creationCount: 15,
    isActive: true,
    createdAt: "2024-06-01",
  },
  {
    id: "wonder-jr",
    title: "원더",
    author: "R.J. 팔라시오",
    publisher: "주니어김영사",
    genre: ["교육", "인문"],
    ageGroup: "어린이",
    coverImage: "https://covers.openlibrary.org/b/id/6425690-L.jpg",
    description: "얼굴이 다른 소년 어기의 학교생활. 친절과 용기에 대한 감동 이야기",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 358,
    creationCount: 22,
    isActive: true,
    createdAt: "2024-06-15",
  },
  {
    id: "harry-potter-jr",
    title: "해리 포터와 마법사의 돌",
    author: "J.K. 롤링",
    publisher: "주니어김영사",
    genre: ["교육", "인문"],
    ageGroup: "어린이",
    coverImage: "https://covers.openlibrary.org/b/id/10110415-L.jpg",
    description: "마법사의 세계로 떠나는 해리 포터의 첫 번째 모험",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 621,
    creationCount: 45,
    isActive: true,
    createdAt: "2024-07-01",
  },
  {
    id: "matilda-jr",
    title: "마틸다",
    author: "로알드 달",
    publisher: "주니어김영사",
    genre: ["교육", "인문"],
    ageGroup: "어린이",
    coverImage: "https://covers.openlibrary.org/b/id/8739139-L.jpg",
    description: "천재 소녀 마틸다와 나쁜 어른들의 유쾌한 대결",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 234,
    creationCount: 13,
    isActive: true,
    createdAt: "2024-07-15",
  },
  {
    id: "homo-deus",
    title: "호모 데우스",
    author: "유발 하라리",
    publisher: "김영사",
    genre: ["인문", "미래학"],
    ageGroup: "성인",
    coverImage: "https://covers.openlibrary.org/b/id/9295344-L.jpg",
    description: "사피엔스의 후속작. 인류의 미래, 신이 되려는 호모 사피엔스의 도전.",
    chapters: [],
    agents: [
      createAgent("a9", "homo-deus", "유발 하라리", "author", ["도발적", "미래지향적"], "해요체"),
    ],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 312,
    creationCount: 18,
    seriesId: "harari-series",
    seriesOrder: 2,
    isActive: true,
    createdAt: "2024-07-01",
  },
  {
    id: "21-lessons",
    title: "21세기를 위한 21가지 제언",
    author: "유발 하라리",
    publisher: "김영사",
    genre: ["인문", "사회"],
    ageGroup: "성인",
    coverImage: "https://covers.openlibrary.org/b/id/9281906-L.jpg",
    description: "지금 이 순간, 우리가 직면한 21가지 핵심 문제에 대한 하라리의 제언.",
    chapters: [],
    agents: [
      createAgent("a10", "21-lessons", "유발 하라리", "author", ["현실적", "통찰력 있는"], "해요체"),
    ],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 245,
    creationCount: 12,
    seriesId: "harari-series",
    seriesOrder: 3,
    isActive: true,
    createdAt: "2024-08-10",
  },
  {
    id: "brief-history-time",
    title: "시간의 역사",
    author: "스티븐 호킹",
    publisher: "김영사",
    genre: ["과학", "물리학"],
    ageGroup: "청소년",
    coverImage: "https://covers.openlibrary.org/b/id/8739470-L.jpg",
    description: "블랙홀, 빅뱅, 시간의 본질까지. 현대 물리학의 최전선을 안내하는 명저.",
    chapters: [],
    agents: [
      createAgent("a13", "brief-history-time", "스티븐 호킹", "author", ["유머러스", "천재적"], "해요체"),
    ],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 276,
    creationCount: 11,
    isActive: true,
    createdAt: "2024-10-15",
  },
];

export function getBookById(id: string): Book | undefined {
  return mockBooks.find((b) => b.id === id);
}

export function filterBooks(params: {
  search?: string;
  publisher?: string;
  genre?: string;
  ageGroup?: string;
  sort?: string;
}): Book[] {
  let filtered = [...mockBooks];

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.agents.some((a) => a.name.toLowerCase().includes(q))
    );
  }

  if (params.publisher) {
    filtered = filtered.filter((b) => b.publisher === params.publisher);
  }

  if (params.genre) {
    filtered = filtered.filter((b) => b.genre.includes(params.genre!));
  }

  if (params.ageGroup) {
    filtered = filtered.filter((b) => b.ageGroup === params.ageGroup);
  }

  switch (params.sort) {
    case "popular":
      filtered.sort((a, b) => b.communityMemberCount - a.communityMemberCount);
      break;
    case "creation":
      filtered.sort((a, b) => b.creationCount - a.creationCount);
      break;
    default:
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return filtered;
}
