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
    coverImage: "https://covers.openlibrary.org/b/isbn/8934945060-L.jpg",
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
    coverImage: "https://covers.openlibrary.org/b/isbn/8934972467-L.jpg",
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
    coverImage: "https://covers.openlibrary.org/b/isbn/8934945052-L.jpg",
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
    coverImage: "https://covers.openlibrary.org/b/isbn/8934969148-L.jpg",
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
    id: "wrong-class-president",
    title: "잘못 뽑은 반장",
    author: "이은재",
    publisher: "주니어김영사",
    genre: ["교육", "사회"],
    ageGroup: "어린이",
    coverImage: "https://image.aladin.co.kr/product/370/95/cover200/8934933704_f.jpg",
    description: "억울하게 반장이 된 로빈이 펼치는 좌충우돌 학교생활 이야기",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "",
    communityMemberCount: 203,
    creationCount: 9,
    isActive: true,
    createdAt: "2024-05-01",
  },
  {
    id: "book-eating-fox",
    title: "책 먹는 여우",
    author: "프란치스카 비어만",
    publisher: "주니어김영사",
    genre: ["교육", "인문"],
    ageGroup: "어린이",
    coverImage: "https://image.aladin.co.kr/product/30/17/cover200/8934908068_f.jpg",
    description: "책이라면 무엇이든 먹어치우는 여우의 기발하고 유쾌한 이야기",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "",
    communityMemberCount: 178,
    creationCount: 7,
    isActive: true,
    createdAt: "2024-05-15",
  },
  {
    id: "is-this-really-me",
    title: "이게 정말 나일까?",
    author: "유발 하라리",
    publisher: "주니어김영사",
    genre: ["인문", "교육"],
    ageGroup: "어린이",
    coverImage: "https://image.aladin.co.kr/product/6763/21/cover200/8934971630_f.jpg",
    description: "세계적 석학 유발 하라리가 어린이를 위해 쓴 자아 탐구 이야기",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "",
    communityMemberCount: 256,
    creationCount: 14,
    isActive: true,
    createdAt: "2024-06-01",
  },
  {
    id: "hantamae-science-16",
    title: "흔한남매 과학탐험대 16",
    author: "흔한남매",
    publisher: "주니어김영사",
    genre: ["과학", "교육"],
    ageGroup: "어린이",
    coverImage: "https://image.aladin.co.kr/product/37906/10/cover200/K712033833_f.jpg",
    description: "흔한남매와 함께 떠나는 신나는 과학 탐험! 힘과 운동 편",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "",
    communityMemberCount: 421,
    creationCount: 23,
    isActive: true,
    createdAt: "2024-06-15",
  },
  {
    id: "korean-history-joseon",
    title: "심용환의 초등 한국사 8",
    author: "심용환",
    publisher: "주니어김영사",
    genre: ["역사", "교육"],
    ageGroup: "어린이",
    coverImage: "https://image.aladin.co.kr/product/38704/97/cover200/K392136920_f.jpg",
    description: "조선에서 레벨업! 역사학자 심용환과 함께하는 초등 한국사",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "",
    communityMemberCount: 189,
    creationCount: 11,
    isActive: true,
    createdAt: "2024-07-01",
  },
  {
    id: "dragon-hero-3",
    title: "드래곤 히어로 3",
    author: "김진",
    publisher: "주니어김영사",
    genre: ["교육", "과학"],
    ageGroup: "어린이",
    coverImage: "https://image.aladin.co.kr/product/38695/22/cover200/K122136723_f.jpg",
    description: "드래곤과 함께 펼치는 스릴 넘치는 모험 판타지",
    chapters: [],
    agents: [],
    images: [],
    worldUrl: "",
    communityMemberCount: 312,
    creationCount: 18,
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
    coverImage: "https://covers.openlibrary.org/b/isbn/8934982071-L.jpg",
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
    coverImage: "https://covers.openlibrary.org/b/isbn/8934990678-L.jpg",
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
    coverImage: "https://covers.openlibrary.org/b/isbn/8934945079-L.jpg",
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
