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
  // ── 김영사 (7권) ──
  {
    id: "guns-germs-steel",
    title: "총, 균, 쇠",
    author: "재레드 다이아몬드",
    publisher: "김영사",
    genre: ["인문", "역사", "과학"],
    ageGroup: "성인",
    coverImage: "https://image.yes24.com/goods/1059754/XL",
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
    coverImage: "https://image.yes24.com/goods/117769712/XL",
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
    coverImage: "https://image.yes24.com/goods/68690523/XL",
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
    coverImage: "https://image.yes24.com/goods/12713439/XL",
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
    id: "homo-deus",
    title: "호모 데우스",
    author: "유발 하라리",
    publisher: "김영사",
    genre: ["인문", "미래학"],
    ageGroup: "성인",
    coverImage: "https://image.yes24.com/goods/34291508/XL",
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
    createdAt: "2024-05-01",
  },
  {
    id: "21-lessons",
    title: "21세기를 위한 21가지 제언",
    author: "유발 하라리",
    publisher: "김영사",
    genre: ["인문", "사회"],
    ageGroup: "성인",
    coverImage: "https://image.yes24.com/goods/61965312/XL",
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
    createdAt: "2024-06-10",
  },
  {
    id: "brief-history-time",
    title: "시간의 역사",
    author: "스티븐 호킹",
    publisher: "김영사",
    genre: ["과학", "물리학"],
    ageGroup: "청소년",
    coverImage: "https://image.yes24.com/goods/68916476/XL",
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
    createdAt: "2024-07-15",
  },

  // ── 주니어김영사 (6권) ──
  {
    id: "wrong-president",
    title: "잘못 뽑은 반장",
    author: "이은재",
    publisher: "주니어김영사",
    genre: ["교육", "사회"],
    ageGroup: "어린이",
    coverImage: "https://image.yes24.com/goods/3826368/XL",
    description: "골칫덩이 이로운이 반장이 되면서 벌어지는 좌충우돌 학교 이야기",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 312,
    creationCount: 18,
    isActive: true,
    createdAt: "2024-08-01",
  },
  {
    id: "wrong-deskmate",
    title: "잘못 걸린 짝",
    author: "이은재",
    publisher: "주니어김영사",
    genre: ["교육", "사회"],
    ageGroup: "어린이",
    coverImage: "https://image.yes24.com/goods/9362840/XL",
    description: "최악의 짝꿍을 만난 아이들의 유쾌하고 따뜻한 우정 이야기",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 241,
    creationCount: 11,
    isActive: true,
    createdAt: "2024-08-15",
  },
  {
    id: "book-eating-fox",
    title: "책 먹는 여우",
    author: "프란치스카 비어만",
    publisher: "주니어김영사",
    genre: ["교육", "인문"],
    ageGroup: "어린이",
    coverImage: "https://image.yes24.com/goods/294614/XL",
    description: "책이라면 뭐든 먹어치우는 여우의 기발하고 유쾌한 이야기",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 198,
    creationCount: 8,
    isActive: true,
    createdAt: "2024-09-01",
  },
  {
    id: "unstoppable-us-1",
    title: "멈출 수 없는 우리 1",
    author: "유발 하라리",
    publisher: "주니어김영사",
    genre: ["인문", "역사"],
    ageGroup: "어린이",
    coverImage: "https://image.yes24.com/goods/115040801/XL",
    description: "세계적 석학 유발 하라리가 어린이를 위해 쓴 인류 이야기 1권",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 356,
    creationCount: 22,
    isActive: true,
    createdAt: "2024-09-15",
  },
  {
    id: "sapiens-graphic-1",
    title: "사피엔스 그래픽 히스토리 1",
    author: "유발 하라리",
    publisher: "주니어김영사",
    genre: ["인문", "역사"],
    ageGroup: "청소년",
    coverImage: "https://image.yes24.com/goods/99736985/XL",
    description: "사피엔스를 만화로! 인류 역사의 대담한 통찰을 그래픽으로 만나다",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 289,
    creationCount: 16,
    isActive: true,
    createdAt: "2024-10-01",
  },
  {
    id: "hen-out-of-the-wild",
    title: "마당을 나온 암탉",
    author: "황선미",
    publisher: "주니어김영사",
    genre: ["인문", "교육"],
    ageGroup: "어린이",
    coverImage: "https://image.yes24.com/goods/95155093/XL",
    description: "좁은 양계장을 탈출한 암탉 잎싹의 자유와 모성을 그린 한국 대표 동화",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 521,
    creationCount: 34,
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
