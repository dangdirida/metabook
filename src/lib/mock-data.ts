import { Book, BookImage, Agent } from "@/types";

// lovers-lover 기준 실제 marble worldUrl (6개)
const W1 = "https://marble.worldlabs.ai/world/a9736615-827d-4f2b-9b95-a1b8525f1ac5";
const W2 = "https://marble.worldlabs.ai/world/d270eda7-56b6-419b-ac04-b7bf0b9ccd00";
const W3 = "https://marble.worldlabs.ai/world/1c3e0221-ba4a-479a-b80a-b72bd64fd558";
const W4 = "https://marble.worldlabs.ai/world/91f34581-0c18-491c-bd2b-9b5078e73df6";
const W5 = "https://marble.worldlabs.ai/world/234ae08a-7dee-491b-86f3-f9014113c2f2";
const W6 = "https://marble.worldlabs.ai/world/4e5ea988-46fd-4e6a-abd7-3d99cb65619c";
const BOOK_WORLD = "https://marble.worldlabs.ai/world/dc2c65e4-68d3-4210-a01e-7a54cc9ded2a";

const MARBLE_IMAGES = [
  { url: "https://cdn.marble.worldlabs.ai/a9736615-827d-4f2b-9b95-a1b8525f1ac5/5c555f6e-5176-44a3-afce-1a1c8380623a_dust_mpi/thumbnail.webp", worldUrl: W1 },
  { url: "https://cdn.marble.worldlabs.ai/d270eda7-56b6-419b-ac04-b7bf0b9ccd00/08b712e2-1c94-4f31-823a-30d65f7efc23_dust_mpi/thumbnail.webp", worldUrl: W2 },
  { url: "https://cdn.marble.worldlabs.ai/1c3e0221-ba4a-479a-b80a-b72bd64fd558/5eeaf8f7-215b-4025-b4c1-f988075b2225_dust_mpi/thumbnail.webp", worldUrl: W3 },
  { url: "https://cdn.marble.worldlabs.ai/91f34581-0c18-491c-bd2b-9b5078e73df6/e22f9af5-7540-436f-9711-4e4e8e7aecbb_dust_mpi/thumbnail.webp", worldUrl: W4 },
  { url: "https://cdn.marble.worldlabs.ai/234ae08a-7dee-491b-86f3-f9014113c2f2/5adbde74-5227-433d-8523-6b0a837a4802_dust_mpi/thumbnail.webp", worldUrl: W5 },
  { url: "https://cdn.marble.worldlabs.ai/4e5ea988-46fd-4e6a-abd7-3d99cb65619c/1a4adcb6-0d7c-432f-8088-4a10c25b3148_dust_mpi/thumbnail.webp", worldUrl: W6 },
];

const BOOK_PREFIX: Record<string, string> = {
  "lovers-lover": "ll",
  "pain-encyclopedia": "pe",
  "dont-know-myself": "dkm",
  "what-moves-me": "wmm",
  "difficult-people": "dp",
  "black-comedy": "bc",
  "weather-interview": "wi",
  "dragon-hero-3": "dh",
  "big-pumpkin-house": "bph",
  "science-level-up-4": "slu",
  "became-a-child": "bac",
  "yokai-bus-5": "yb",
};

function makeImages(bookId: string): BookImage[] {
  const prefix = BOOK_PREFIX[bookId] || bookId;
  const chapterMap = [
    { ch: "ch1", imgs: [0, 1] },
    { ch: "ch2", imgs: [2, 3] },
    { ch: "ch3", imgs: [4, 5] },
  ];
  const result: BookImage[] = [];
  let order = 1;
  for (const { ch, imgs } of chapterMap) {
    for (let i = 0; i < imgs.length; i++) {
      const m = MARBLE_IMAGES[imgs[i]];
      result.push({
        id: `${prefix}-${ch}-img${i + 1}`,
        bookId,
        chapterId: ch,
        url: m.url,
        alt: "",
        caption: "",
        order: order++,
        worldUrl: m.worldUrl,
      });
    }
  }
  return result;
}

// ── 각 책별 고유 인물 데이터 ──

const AGENTS_LOVERS_LOVER: Agent[] = [
  { id: "jeong_in", bookId: "lovers-lover", name: "정인", role: "protagonist", avatar: "", personality: ["내성적", "관찰력", "집요함"], speechStyle: "독백처럼 조용하고 내밀하게 이야기함. 감정을 직접 드러내기보다 사물에 빗대어 표현함", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "mari", bookId: "lovers-lover", name: "마리", role: "supporting", avatar: "", personality: ["정돈됨", "강박적", "절박함"], speechStyle: "가늘지만 낮은 목소리. 말끝에 짧은 한숨이 이어짐", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "seong_ju", bookId: "lovers-lover", name: "성주", role: "supporting", avatar: "", personality: ["예술적", "과묵함", "비밀이 많음"], speechStyle: "말보다 눈빛과 행동으로 표현. 직접적인 감정 표현을 피함", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "su_yeong", bookId: "lovers-lover", name: "수영", role: "supporting", avatar: "", personality: ["밝음", "에너지 넘침", "사교적"], speechStyle: "환하게 웃으며 말하는 편. 농담을 자주 섞음", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

const AGENTS_PAIN_ENCYCLOPEDIA: Agent[] = [
  { id: "pe-a1", bookId: "pain-encyclopedia", name: "김학조 한의사", role: "author", avatar: "", personality: ["전문적", "친절함", "꼼꼼함"], speechStyle: "20년 경력 한의사답게 쉽고 친절하게 설명하는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "pe-a2", bookId: "pain-encyclopedia", name: "통증 상담사", role: "supporting", avatar: "", personality: ["공감능력", "경청", "격려"], speechStyle: "환자의 아픔에 공감하며 따뜻하게 조언하는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "pe-a3", bookId: "pain-encyclopedia", name: "재활 코치", role: "supporting", avatar: "", personality: ["활기참", "동기부여", "실용적"], speechStyle: "운동 코치처럼 명쾌하고 힘차게 격려하는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

const AGENTS_DONT_KNOW_MYSELF: Agent[] = [
  { id: "dkm-a1", bookId: "dont-know-myself", name: "허지원 심리학자", role: "author", avatar: "", personality: ["과학적", "따뜻함", "통찰력"], speechStyle: "뇌과학과 임상심리학을 쉽게 풀어주는 전문가 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "dkm-a2", bookId: "dont-know-myself", name: "내면의 나", role: "protagonist", avatar: "", personality: ["불안함", "혼란스러움", "성장 중"], speechStyle: "자신을 이해하려는 혼란스럽지만 솔직한 독백 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "dkm-a3", bookId: "dont-know-myself", name: "상담사 선생님", role: "supporting", avatar: "", personality: ["차분함", "전문성", "수용적"], speechStyle: "판단 없이 경청하고 조용히 질문을 던지는 상담사 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "dkm-a4", bookId: "dont-know-myself", name: "뇌과학자", role: "supporting", avatar: "", personality: ["논리적", "호기심", "분석적"], speechStyle: "뇌와 감정의 관계를 흥미롭게 설명하는 과학자 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

const AGENTS_WHAT_MOVES_ME: Agent[] = [
  { id: "wmm-a1", bookId: "what-moves-me", name: "수불 스님", role: "protagonist", avatar: "", personality: ["평온함", "심오함", "자비"], speechStyle: "선(禪)의 언어로 짧고 깊은 화두를 던지는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "wmm-a2", bookId: "what-moves-me", name: "한자경 철학자", role: "author", avatar: "", personality: ["철학적", "사색적", "예리함"], speechStyle: "깊은 철학적 사유를 담은 학자의 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "wmm-a3", bookId: "what-moves-me", name: "수행자", role: "supporting", avatar: "", personality: ["구도자", "겸손함", "진지함"], speechStyle: "깨달음을 향해 나아가는 진지하고 겸손한 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

const AGENTS_DIFFICULT_PEOPLE: Agent[] = [
  { id: "dp-a1", bookId: "difficult-people", name: "라이언 리크", role: "author", avatar: "", personality: ["실용적", "분석적", "유머러스"], speechStyle: "비즈니스 코치처럼 명쾌하고 실용적인 조언을 하는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "dp-a2", bookId: "difficult-people", name: "완벽주의 동료", role: "supporting", avatar: "", personality: ["까다로움", "꼼꼼함", "높은 기준"], speechStyle: "기준이 높고 디테일에 집착하는 완벽주의자 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "dp-a3", bookId: "difficult-people", name: "조직 심리 전문가", role: "supporting", avatar: "", personality: ["중립적", "통찰력", "전략적"], speechStyle: "조직 내 관계를 분석하며 중립적으로 조언하는 전문가 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "dp-a4", bookId: "difficult-people", name: "갈등 조정자", role: "supporting", avatar: "", personality: ["평화로움", "공감", "균형감"], speechStyle: "갈등 상황에서 양측을 이해하며 균형 잡힌 시각을 제시하는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

const AGENTS_BLACK_COMEDY: Agent[] = [
  { id: "bc-a1", bookId: "black-comedy", name: "블랙코미디 내레이터", role: "protagonist", avatar: "", personality: ["냉소적", "위트", "날카로움"], speechStyle: "날카로운 유머와 아이러니로 세상을 비틀어 보는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "bc-a2", bookId: "black-comedy", name: "시인 K", role: "supporting", avatar: "", personality: ["시적", "몽환적", "감성"], speechStyle: "시어로 감정을 표현하는 시적이고 몽환적인 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "bc-a3", bookId: "black-comedy", name: "극작가 L", role: "supporting", avatar: "", personality: ["극적", "과장됨", "예술적"], speechStyle: "모든 상황을 드라마틱하게 묘사하는 극작가 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

const AGENTS_WEATHER_INTERVIEW: Agent[] = [
  { id: "wi-a1", bookId: "weather-interview", name: "김세현 기자", role: "author", avatar: "", personality: ["예리함", "호기심", "열정"], speechStyle: "기상전문기자답게 날씨와 기후를 생생하게 전달하는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "wi-a2", bookId: "weather-interview", name: "태풍 마에미", role: "supporting", avatar: "", personality: ["격렬함", "압도적", "자연의 힘"], speechStyle: "자연 현상이 직접 말하듯 강렬하고 웅장한 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "wi-a3", bookId: "weather-interview", name: "기후 과학자", role: "supporting", avatar: "", personality: ["우려", "사실적", "경고"], speechStyle: "이상기후의 심각성을 데이터로 설명하는 냉정한 과학자 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

const AGENTS_DRAGON_HERO: Agent[] = [
  { id: "dh-a1", bookId: "dragon-hero-3", name: "카이", role: "protagonist", avatar: "/avatars/kai.png", personality: ["용감함", "열정적", "성장 중"], speechStyle: "어린 영웅답게 씩씩하고 열정적인 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "dh-a2", bookId: "dragon-hero-3", name: "이그니스(드래곤)", role: "supporting", avatar: "", personality: ["강력함", "충직함", "고귀함"], speechStyle: "오랜 역사를 가진 드래곤답게 위엄 있고 간결한 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "dh-a3", bookId: "dragon-hero-3", name: "마법사 루나", role: "supporting", avatar: "", personality: ["신비로움", "지혜", "장난기"], speechStyle: "고대 마법 지식을 가진 신비로운 말투, 가끔 수수께끼 같은 표현", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "dh-a4", bookId: "dragon-hero-3", name: "어둠의 군주 모르다스", role: "antagonist", avatar: "", personality: ["냉혹함", "야망", "카리스마"], speechStyle: "세상을 지배하려는 악당답게 위협적이고 카리스마 넘치는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

const AGENTS_BIG_PUMPKIN: Agent[] = [
  { id: "bph-a1", bookId: "big-pumpkin-house", name: "호박 할아버지", role: "protagonist", avatar: "/avatars/grandpa.png", personality: ["따뜻함", "지혜로움", "느긋함"], speechStyle: "할아버지처럼 천천히 따뜻하게 이야기하는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "bph-a2", bookId: "big-pumpkin-house", name: "토끼 콩이", role: "supporting", avatar: "", personality: ["활발함", "호기심", "밝음"], speechStyle: "귀엽고 활발한 어린 토끼답게 톡톡 튀는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "bph-a3", bookId: "big-pumpkin-house", name: "곰 두리", role: "supporting", avatar: "/avatars/bear-duri.png", personality: ["듬직함", "먹보", "순수함"], speechStyle: "느리지만 듬직하고 솔직한 곰의 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

const AGENTS_SCIENCE_LEVEL_UP: Agent[] = [
  { id: "slu-a1", bookId: "science-level-up-4", name: "탁주쪼꼬", role: "protagonist", avatar: "/avatars/takjuzzo.png", personality: ["에너지 넘침", "유머러스", "열정"], speechStyle: "유튜버답게 신나고 재미있게 과학을 설명하는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "slu-a2", bookId: "science-level-up-4", name: "과학 박사님", role: "supporting", avatar: "", personality: ["꼼꼼함", "정확함", "친절함"], speechStyle: "어린이에게 과학을 쉽게 설명하는 친절한 박사 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "slu-a3", bookId: "science-level-up-4", name: "꼬마 탐험가 지우", role: "supporting", avatar: "/avatars/jiu.png", personality: ["궁금증 폭발", "엉뚱함", "용감함"], speechStyle: "무엇이든 궁금한 어린이답게 질문이 많은 밝은 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

const AGENTS_BECAME_A_CHILD: Agent[] = [
  { id: "bac-a1", bookId: "became-a-child", name: "어른이 된 어린이", role: "protagonist", avatar: "/avatars/adult-child.png", personality: ["혼란스러움", "재발견", "유머"], speechStyle: "어른의 시각으로 어린이 세계를 재발견하며 놀라워하는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "bac-a2", bookId: "became-a-child", name: "옆집 꼬마 소율이", role: "supporting", avatar: "", personality: ["순수함", "당돌함", "논리적(어린이식)"], speechStyle: "어린이만의 순수하고 당돌한 논리로 말하는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

const AGENTS_YOKAI_BUS: Agent[] = [
  { id: "yb-a1", bookId: "yokai-bus-5", name: "차이", role: "protagonist", avatar: "/avatars/chai.png", personality: ["호기심", "용감함", "의리"], speechStyle: "모험을 즐기는 씩씩한 어린이 탐정 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "yb-a2", bookId: "yokai-bus-5", name: "요괴버스 운전기사", role: "supporting", avatar: "", personality: ["신비로움", "과묵함", "비밀 많음"], speechStyle: "모든 것을 알고 있지만 조금씩만 알려주는 신비로운 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "yb-a3", bookId: "yokai-bus-5", name: "구미호 선생님", role: "supporting", avatar: "", personality: ["요염함", "지혜로움", "장난기"], speechStyle: "요괴답게 의미심장하고 장난기 있는 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
  { id: "yb-a4", bookId: "yokai-bus-5", name: "그림자 도깨비", role: "antagonist", avatar: "", personality: ["장난스러움", "교활함", "변덕"], speechStyle: "사라졌다 나타났다 하며 수수께끼 같은 말을 하는 도깨비 말투", forbiddenTopics: [], systemPrompt: "", isActive: true, feedbackStats: { likes: 0, dislikes: 0 } },
];

// ── 도서 목록 ──

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
    section: "정인",
    chapters: [],
    agents: AGENTS_LOVERS_LOVER,
    images: makeImages("lovers-lover"),
    worldUrl: BOOK_WORLD,
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
    agents: AGENTS_PAIN_ENCYCLOPEDIA,
    images: makeImages("pain-encyclopedia"),
    worldUrl: BOOK_WORLD,
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
    agents: AGENTS_DONT_KNOW_MYSELF,
    images: makeImages("dont-know-myself"),
    worldUrl: BOOK_WORLD,
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
    agents: AGENTS_WHAT_MOVES_ME,
    images: makeImages("what-moves-me"),
    worldUrl: BOOK_WORLD,
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
    agents: AGENTS_DIFFICULT_PEOPLE,
    images: makeImages("difficult-people"),
    worldUrl: BOOK_WORLD,
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
    agents: AGENTS_BLACK_COMEDY,
    images: makeImages("black-comedy"),
    worldUrl: BOOK_WORLD,
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
    agents: AGENTS_WEATHER_INTERVIEW,
    images: makeImages("weather-interview"),
    worldUrl: BOOK_WORLD,
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
    agents: AGENTS_DRAGON_HERO,
    images: makeImages("dragon-hero-3"),
    worldUrl: BOOK_WORLD,
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
    agents: AGENTS_BIG_PUMPKIN,
    images: makeImages("big-pumpkin-house"),
    worldUrl: BOOK_WORLD,
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
    agents: AGENTS_SCIENCE_LEVEL_UP,
    images: makeImages("science-level-up-4"),
    worldUrl: BOOK_WORLD,
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
    agents: AGENTS_BECAME_A_CHILD,
    images: makeImages("became-a-child"),
    worldUrl: BOOK_WORLD,
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
    agents: AGENTS_YOKAI_BUS,
    images: makeImages("yokai-bus-5"),
    worldUrl: BOOK_WORLD,
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
