import { Book, BookImage } from "@/types";

function makeImages(bookId: string): BookImage[] {
  return [
    { id: "ch1-img1", bookId, chapterId: "ch1", url: "https://cdn.marble.worldlabs.ai/a9736615-827d-4f2b-9b95-a1b8525f1ac5/5c555f6e-5176-44a3-afce-1a1c8380623a_dust_mpi/thumbnail.webp", alt: "뉴기니 해안의 풍경", caption: "뉴기니 해안의 풍경", order: 1, worldUrl: "https://marble.worldlabs.ai/world/a9736615-827d-4f2b-9b95-a1b8525f1ac5" },
    { id: "ch1-img2", bookId, chapterId: "ch1", url: "https://cdn.marble.worldlabs.ai/d270eda7-56b6-419b-ac04-b7bf0b9ccd00/08b712e2-1c94-4f31-823a-30d65f7efc23_dust_mpi/thumbnail.webp", alt: "얄리와의 만남", caption: "얄리와의 만남", order: 2, worldUrl: "https://marble.worldlabs.ai/world/d270eda7-56b6-419b-ac04-b7bf0b9ccd00" },
    { id: "ch2-img1", bookId, chapterId: "ch2", url: "https://cdn.marble.worldlabs.ai/1c3e0221-ba4a-479a-b80a-b72bd64fd558/5eeaf8f7-215b-4025-b4c1-f988075b2225_dust_mpi/thumbnail.webp", alt: "문명의 경계", caption: "문명의 경계", order: 3, worldUrl: "https://marble.worldlabs.ai/world/1c3e0221-ba4a-479a-b80a-b72bd64fd558" },
    { id: "ch2-img2", bookId, chapterId: "ch2", url: "https://cdn.marble.worldlabs.ai/91f34581-0c18-491c-bd2b-9b5078e73df6/e22f9af5-7540-436f-9711-4e4e8e7aecbb_dust_mpi/thumbnail.webp", alt: "역사의 갈림길", caption: "역사의 갈림길", order: 4, worldUrl: "https://marble.worldlabs.ai/world/91f34581-0c18-491c-bd2b-9b5078e73df6" },
    { id: "ch3-img1", bookId, chapterId: "ch3", url: "https://cdn.marble.worldlabs.ai/234ae08a-7dee-491b-86f3-f9014113c2f2/5adbde74-5227-433d-8523-6b0a837a4802_dust_mpi/thumbnail.webp", alt: "고대 사원의 흔적", caption: "고대 사원의 흔적", order: 5, worldUrl: "https://marble.worldlabs.ai/world/234ae08a-7dee-491b-86f3-f9014113c2f2" },
    { id: "ch3-img2", bookId, chapterId: "ch3", url: "https://cdn.marble.worldlabs.ai/4e5ea988-46fd-4e6a-abd7-3d99cb65619c/1a4adcb6-0d7c-432f-8088-4a10c25b3148_dust_mpi/thumbnail.webp", alt: "탐험의 끝에서", caption: "탐험의 끝에서", order: 6, worldUrl: "https://marble.worldlabs.ai/world/4e5ea988-46fd-4e6a-abd7-3d99cb65619c" },
  ];
}

export const mockBooks: Book[] = [
  // === 김영사 ===
  {
    id: "lovers-lover",
    title: "애인의 애인에게",
    author: "백영옥",
    publisher: "김영사",
    genre: ["소설", "문학"],
    ageGroup: "성인",
    coverImage: "/covers/gy-1.png",
    description: "희망 없이 사람을 사랑하는 일이 가능할까 — 10년 만에 선보이는 백영옥 장편소설 완결판",
    chapters: [],
    agents: [],
    images: makeImages("lovers-lover"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 341,
    creationCount: 19,
    isActive: true,
    createdAt: "2024-11-01",
  },
  {
    id: "pain-encyclopedia",
    title: "통증 아플 때 꺼내 보는 백과",
    author: "김학조",
    publisher: "김영사",
    genre: ["건강", "의학"],
    ageGroup: "성인",
    coverImage: "/covers/gy-2.png",
    description: "진통제와 수술 없이 바로 잡는다 — 20년 경력 한의사가 알려주는 내 몸의 신호 읽는 법",
    chapters: [],
    agents: [],
    images: makeImages("pain-encyclopedia"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 412,
    creationCount: 24,
    isActive: true,
    createdAt: "2024-10-15",
  },
  {
    id: "dont-know-myself",
    title: "나도 아직 나를 모른다",
    author: "허지원",
    publisher: "김영사",
    genre: ["심리학", "자기계발"],
    ageGroup: "성인",
    coverImage: "/covers/gy-3.png",
    description: "뇌과학과 임상심리학이 무너진 마음에게 건네는 따뜻한 말 — 15만 부 기념 리커버 에디션",
    chapters: [],
    agents: [],
    images: makeImages("dont-know-myself"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 587,
    creationCount: 38,
    isActive: true,
    createdAt: "2024-09-01",
  },
  {
    id: "what-moves-me",
    title: "무엇이 나를 움직이게 하는가",
    author: "한자경",
    publisher: "김영사",
    genre: ["인문", "철학"],
    ageGroup: "성인",
    coverImage: "/covers/gy-4.png",
    description: "수불 스님 간화선 집중수행 체험기 — 깊은 질문과 함께하는 철학적 수행의 여정",
    chapters: [],
    agents: [],
    images: makeImages("what-moves-me"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 276,
    creationCount: 16,
    isActive: true,
    createdAt: "2024-08-20",
  },
  {
    id: "difficult-people",
    title: "까다로운 사람과 함께 일하는 법",
    author: "라이언 리크",
    publisher: "김영사",
    genre: ["자기계발", "경영"],
    ageGroup: "성인",
    coverImage: "/covers/gy-5.jpg",
    description: "거의 모든 사람과 효과적으로 협력하기 위한 전략 — HOW TO WORK WITH COMPLICATED PEOPLE",
    chapters: [],
    agents: [],
    images: makeImages("difficult-people"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 398,
    creationCount: 27,
    isActive: true,
    createdAt: "2024-12-01",
  },
  {
    id: "black-comedy",
    title: "블랙코미디",
    author: "여러 작가",
    publisher: "김영사",
    genre: ["문학", "에세이"],
    ageGroup: "성인",
    coverImage: "/covers/gy-6.jpg",
    description: "RHYME & REASON 3 — Poetic Essay, Play, Comic을 아우르는 블랙코미디 앤솔로지",
    chapters: [],
    agents: [],
    images: makeImages("black-comedy"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 198,
    creationCount: 11,
    isActive: true,
    createdAt: "2025-01-10",
  },
  {
    id: "weather-interview",
    title: "날씨와 인터뷰하는 법",
    author: "김세현",
    publisher: "김영사",
    genre: ["에세이", "환경"],
    ageGroup: "성인",
    coverImage: "/covers/gy-7.jpg",
    description: "기상전문기자의 예측불허 인생 예보기 — 이상기후 앞에 선 기상전문기자의 초조하고도 설레는 마음",
    chapters: [],
    agents: [],
    images: makeImages("weather-interview"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 312,
    creationCount: 18,
    isActive: true,
    createdAt: "2025-02-01",
  },

  // === 주니어김영사 ===
  {
    id: "dragon-hero-3",
    title: "드래곤 히어로 3: 불의 계승자",
    author: "이재문",
    publisher: "주니어김영사",
    genre: ["판타지", "어린이"],
    ageGroup: "어린이",
    coverImage: "/covers/jr-1.jpg",
    description: "드래곤과 함께 성장하는 소년의 불꽃 같은 모험! 짜릿한 어린이 판타지 시리즈 3탄",
    chapters: [],
    agents: [],
    images: makeImages("dragon-hero-3"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 289,
    creationCount: 15,
    isActive: true,
    createdAt: "2025-01-15",
  },
  {
    id: "big-pumpkin-house",
    title: "세상에서 가장 큰 호박집",
    author: "이분희",
    publisher: "주니어김영사",
    genre: ["동화", "어린이"],
    ageGroup: "어린이",
    coverImage: "/covers/jr-2.png",
    description: "세상에서 가장 큰 호박으로 만든 집에서 펼쳐지는 유쾌하고 따뜻한 동물 친구들의 이야기",
    chapters: [],
    agents: [],
    images: makeImages("big-pumpkin-house"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 198,
    creationCount: 9,
    isActive: true,
    createdAt: "2024-10-01",
  },
  {
    id: "science-level-up-4",
    title: "탁주쪼꼬의 과학 레벨업 4: 힘과 소리",
    author: "탁주쪼꼬",
    publisher: "주니어김영사",
    genre: ["학습만화", "어린이"],
    ageGroup: "어린이",
    coverImage: "/covers/jr-3.png",
    description: "유튜브 1700만 조회! 탁주쪼꼬가 알려주는 신나는 과학 — 힘과 소리의 원리를 만화로 쉽게!",
    chapters: [],
    agents: [],
    images: makeImages("science-level-up-4"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 356,
    creationCount: 22,
    isActive: true,
    createdAt: "2025-01-20",
  },
  {
    id: "became-a-child",
    title: "어린이가 되고 말았어",
    author: "강약수",
    publisher: "주니어김영사",
    genre: ["그림책", "어린이"],
    ageGroup: "어린이",
    coverImage: "/covers/jr-4.png",
    description: "어느 날 갑자기 어린이가 되고 만 어른의 눈으로 바라본 어린이의 세계 — 유쾌한 그림책",
    chapters: [],
    agents: [],
    images: makeImages("became-a-child"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 167,
    creationCount: 7,
    isActive: true,
    createdAt: "2024-11-15",
  },
  {
    id: "yokai-bus-5",
    title: "기묘동 99번 요괴버스 5: 사라진 그림자의 세계",
    author: "재돌",
    publisher: "주니어김영사",
    genre: ["판타지", "어린이"],
    ageGroup: "어린이",
    coverImage: "/covers/jr-5.png",
    description: "기묘동 99번 버스를 타면 요괴 세계로! 사라진 그림자의 비밀을 파헤치는 짜릿한 어린이 판타지",
    chapters: [],
    agents: [],
    images: makeImages("yokai-bus-5"),
    worldUrl: "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a",
    communityMemberCount: 241,
    creationCount: 12,
    isActive: true,
    createdAt: "2025-02-10",
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
