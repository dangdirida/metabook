import { Book, BookImage, Agent } from "@/types";

const MARBLE_IMAGES = [
  {
    suffix: "img1",
    url: "https://cdn.marble.worldlabs.ai/a9736615-827d-4f2b-9b95-a1b8525f1ac5/5c555f6e-5176-44a3-afce-1a1c8380623a_dust_mpi/thumbnail.webp",
    worldUrl: "https://marble.worldlabs.ai/world/a9736615-827d-4f2b-9b95-a1b8525f1ac5",
  },
  {
    suffix: "img2",
    url: "https://cdn.marble.worldlabs.ai/d270eda7-56b6-419b-ac04-b7bf0b9ccd00/08b712e2-1c94-4f31-823a-30d65f7efc23_dust_mpi/thumbnail.webp",
    worldUrl: "https://marble.worldlabs.ai/world/d270eda7-56b6-419b-ac04-b7bf0b9ccd00",
  },
  {
    suffix: "img3",
    url: "https://cdn.marble.worldlabs.ai/1c3e0221-ba4a-479a-b80a-b72bd64fd558/5eeaf8f7-215b-4025-b4c1-f988075b2225_dust_mpi/thumbnail.webp",
    worldUrl: "https://marble.worldlabs.ai/world/1c3e0221-ba4a-479a-b80a-b72bd64fd558",
  },
  {
    suffix: "img4",
    url: "https://cdn.marble.worldlabs.ai/91f34581-0c18-491c-bd2b-9b5078e73df6/e22f9af5-7540-436f-9711-4e4e8e7aecbb_dust_mpi/thumbnail.webp",
    worldUrl: "https://marble.worldlabs.ai/world/91f34581-0c18-491c-bd2b-9b5078e73df6",
  },
  {
    suffix: "img5",
    url: "https://cdn.marble.worldlabs.ai/234ae08a-7dee-491b-86f3-f9014113c2f2/5adbde74-5227-433d-8523-6b0a837a4802_dust_mpi/thumbnail.webp",
    worldUrl: "https://marble.worldlabs.ai/world/234ae08a-7dee-491b-86f3-f9014113c2f2",
  },
  {
    suffix: "img6",
    url: "https://cdn.marble.worldlabs.ai/4e5ea988-46fd-4e6a-abd7-3d99cb65619c/1a4adcb6-0d7c-432f-8088-4a10c25b3148_dust_mpi/thumbnail.webp",
    worldUrl: "https://marble.worldlabs.ai/world/4e5ea988-46fd-4e6a-abd7-3d99cb65619c",
  },
];

function makeImages(bookId: string): BookImage[] {
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
        id: `ll-${ch}-img${i + 1}`,
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

function makeAgents(bookId: string): Agent[] {
  return [
    {
      id: `${bookId}-a1`, bookId, name: "재레드 다이아몬드", role: "author", avatar: "",
      personality: ["논리적", "학문적", "호기심 넘침"],
      speechStyle: "차분하고 분석적인 말투로 설명하듯 이야기함",
      forbiddenTopics: [], systemPrompt: "", isActive: true,
      feedbackStats: { likes: 0, dislikes: 0 },
    },
    {
      id: `${bookId}-a2`, bookId, name: "얄리", role: "supporting", avatar: "",
      personality: ["호기심 많음", "직설적", "따뜻함"],
      speechStyle: "순박하고 직접적인 말투, 진심 어린 질문을 던짐",
      forbiddenTopics: [], systemPrompt: "", isActive: true,
      feedbackStats: { likes: 0, dislikes: 0 },
    },
  ];
}

// ── 책별 커스텀 이미지 ──

const peImages: BookImage[] = [
  { id: "pe-1", bookId: "pain-encyclopedia", chapterId: "ch1", url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800", alt: "의료 진찰", caption: "통증의 원인을 찾아가는 첫 걸음", order: 1, worldUrl: "https://marble.worldlabs.ai/world/b1a2c3d4-1111-4aaa-b000-111111111101" },
  { id: "pe-2", bookId: "pain-encyclopedia", chapterId: "ch1", url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800", alt: "한방 침술", caption: "동양의학으로 바라본 통증 치료", order: 2, worldUrl: "https://marble.worldlabs.ai/world/b1a2c3d4-1111-4aaa-b000-111111111102" },
  { id: "pe-3", bookId: "pain-encyclopedia", chapterId: "ch2", url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800", alt: "스트레칭하는 사람", caption: "일상 속 통증 관리 스트레칭", order: 3, worldUrl: "https://marble.worldlabs.ai/world/b1a2c3d4-1111-4aaa-b000-111111111103" },
  { id: "pe-4", bookId: "pain-encyclopedia", chapterId: "ch2", url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800", alt: "의학 서적", caption: "20년 경력 한의사의 임상 기록", order: 4, worldUrl: "https://marble.worldlabs.ai/world/b1a2c3d4-1111-4aaa-b000-111111111104" },
  { id: "pe-5", bookId: "pain-encyclopedia", chapterId: "ch3", url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800", alt: "요가 명상", caption: "몸과 마음의 균형 회복", order: 5, worldUrl: "https://marble.worldlabs.ai/world/b1a2c3d4-1111-4aaa-b000-111111111105" },
];

const dkmImages: BookImage[] = [
  { id: "dkm-1", bookId: "dont-know-myself", chapterId: "ch1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", alt: "거울 속 자화상", caption: "나를 바라보는 첫 번째 시선", order: 1, worldUrl: "https://marble.worldlabs.ai/world/c2b3a4d5-2222-4bbb-c000-222222222201" },
  { id: "dkm-2", bookId: "dont-know-myself", chapterId: "ch1", url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800", alt: "뇌 과학 이미지", caption: "뇌과학이 밝혀낸 마음의 구조", order: 2, worldUrl: "https://marble.worldlabs.ai/world/c2b3a4d5-2222-4bbb-c000-222222222202" },
  { id: "dkm-3", bookId: "dont-know-myself", chapterId: "ch2", url: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800", alt: "창가의 사색", caption: "무너진 마음에게 건네는 따뜻한 말", order: 3, worldUrl: "https://marble.worldlabs.ai/world/c2b3a4d5-2222-4bbb-c000-222222222203" },
  { id: "dkm-4", bookId: "dont-know-myself", chapterId: "ch2", url: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800", alt: "일기를 쓰는 손", caption: "자기 이해를 위한 글쓰기", order: 4, worldUrl: "https://marble.worldlabs.ai/world/c2b3a4d5-2222-4bbb-c000-222222222204" },
  { id: "dkm-5", bookId: "dont-know-myself", chapterId: "ch3", url: "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=800", alt: "해질녘 실루엣", caption: "있는 그대로의 나를 받아들이는 순간", order: 5, worldUrl: "https://marble.worldlabs.ai/world/c2b3a4d5-2222-4bbb-c000-222222222205" },
];

const wmmImages: BookImage[] = [
  { id: "wmm-1", bookId: "what-moves-me", chapterId: "ch1", url: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800", alt: "명상하는 스님", caption: "간화선 수행의 시작", order: 1, worldUrl: "https://marble.worldlabs.ai/world/d3c4b5a6-3333-4ccc-d000-333333333301" },
  { id: "wmm-2", bookId: "what-moves-me", chapterId: "ch1", url: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800", alt: "고요한 사찰", caption: "깊은 질문이 시작되는 곳", order: 2, worldUrl: "https://marble.worldlabs.ai/world/d3c4b5a6-3333-4ccc-d000-333333333302" },
  { id: "wmm-3", bookId: "what-moves-me", chapterId: "ch2", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", alt: "산속 풍경", caption: "자연 속에서 발견하는 철학적 깨달음", order: 3, worldUrl: "https://marble.worldlabs.ai/world/d3c4b5a6-3333-4ccc-d000-333333333303" },
  { id: "wmm-4", bookId: "what-moves-me", chapterId: "ch3", url: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800", alt: "일출 풍경", caption: "수행 끝에 찾은 내면의 빛", order: 4, worldUrl: "https://marble.worldlabs.ai/world/d3c4b5a6-3333-4ccc-d000-333333333304" },
];

const dpImages: BookImage[] = [
  { id: "dp-1", bookId: "difficult-people", chapterId: "ch1", url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800", alt: "악수하는 두 사람", caption: "협업의 시작은 이해에서부터", order: 1, worldUrl: "https://marble.worldlabs.ai/world/e4d5c6b7-4444-4ddd-e000-444444444401" },
  { id: "dp-2", bookId: "difficult-people", chapterId: "ch1", url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800", alt: "회의실 토론", caption: "까다로운 동료와의 회의 전략", order: 2, worldUrl: "https://marble.worldlabs.ai/world/e4d5c6b7-4444-4ddd-e000-444444444402" },
  { id: "dp-3", bookId: "difficult-people", chapterId: "ch2", url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800", alt: "팀 협업", caption: "갈등을 성장의 기회로 바꾸는 법", order: 3, worldUrl: "https://marble.worldlabs.ai/world/e4d5c6b7-4444-4ddd-e000-444444444403" },
  { id: "dp-4", bookId: "difficult-people", chapterId: "ch3", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800", alt: "팀워크", caption: "거의 모든 사람과 효과적으로 협력하기", order: 4, worldUrl: "https://marble.worldlabs.ai/world/e4d5c6b7-4444-4ddd-e000-444444444404" },
];

const bcImages: BookImage[] = [
  { id: "bc-1", bookId: "black-comedy", chapterId: "ch1", url: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800", alt: "극장 무대", caption: "블랙코미디의 무대가 열리다", order: 1, worldUrl: "https://marble.worldlabs.ai/world/f5e6d7c8-5555-4eee-f000-555555555501" },
  { id: "bc-2", bookId: "black-comedy", chapterId: "ch1", url: "https://images.unsplash.com/photo-1474649107449-ea4f014b7e9f?w=800", alt: "타자기와 원고", caption: "Poetic Essay — 시적 산문의 세계", order: 2, worldUrl: "https://marble.worldlabs.ai/world/f5e6d7c8-5555-4eee-f000-555555555502" },
  { id: "bc-3", bookId: "black-comedy", chapterId: "ch2", url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800", alt: "그래피티 아트", caption: "Comic — 풍자와 웃음의 경계", order: 3, worldUrl: "https://marble.worldlabs.ai/world/f5e6d7c8-5555-4eee-f000-555555555503" },
  { id: "bc-4", bookId: "black-comedy", chapterId: "ch3", url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800", alt: "추상 예술", caption: "Rhyme & Reason — 운율과 이성 사이", order: 4, worldUrl: "https://marble.worldlabs.ai/world/f5e6d7c8-5555-4eee-f000-555555555504" },
];

const wiImages: BookImage[] = [
  { id: "wi-1", bookId: "weather-interview", chapterId: "ch1", url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800", alt: "폭풍우 구름", caption: "이상기후의 시대, 하늘을 읽다", order: 1, worldUrl: "https://marble.worldlabs.ai/world/a6b7c8d9-6666-4fff-a000-666666666601" },
  { id: "wi-2", bookId: "weather-interview", chapterId: "ch1", url: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800", alt: "맑은 하늘", caption: "예측불허 날씨와의 대화", order: 2, worldUrl: "https://marble.worldlabs.ai/world/a6b7c8d9-6666-4fff-a000-666666666602" },
  { id: "wi-3", bookId: "weather-interview", chapterId: "ch2", url: "https://images.unsplash.com/photo-1561484930-998b6a7b22e8?w=800", alt: "기상 관측소", caption: "기상전문기자의 현장 취재", order: 3, worldUrl: "https://marble.worldlabs.ai/world/a6b7c8d9-6666-4fff-a000-666666666603" },
  { id: "wi-4", bookId: "weather-interview", chapterId: "ch2", url: "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=800", alt: "무지개", caption: "폭풍 뒤에 찾아오는 희망의 무지개", order: 4, worldUrl: "https://marble.worldlabs.ai/world/a6b7c8d9-6666-4fff-a000-666666666604" },
  { id: "wi-5", bookId: "weather-interview", chapterId: "ch3", url: "https://images.unsplash.com/photo-1527482937786-6f4571e741d0?w=800", alt: "석양과 구름", caption: "초조하고도 설레는 기상캐스터의 마음", order: 5, worldUrl: "https://marble.worldlabs.ai/world/a6b7c8d9-6666-4fff-a000-666666666605" },
];

const dhImages: BookImage[] = [
  { id: "dh-1", bookId: "dragon-hero-3", chapterId: "ch1", url: "https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=800", alt: "불꽃과 용", caption: "불의 계승자, 드래곤과의 만남", order: 1, worldUrl: "https://marble.worldlabs.ai/world/b7c8d9e0-7777-4aaa-b000-777777777701" },
  { id: "dh-2", bookId: "dragon-hero-3", chapterId: "ch1", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800", alt: "판타지 성", caption: "모험이 시작되는 드래곤의 성", order: 2, worldUrl: "https://marble.worldlabs.ai/world/b7c8d9e0-7777-4aaa-b000-777777777702" },
  { id: "dh-3", bookId: "dragon-hero-3", chapterId: "ch2", url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800", alt: "신비로운 숲", caption: "시련의 숲을 지나는 소년 영웅", order: 3, worldUrl: "https://marble.worldlabs.ai/world/b7c8d9e0-7777-4aaa-b000-777777777703" },
  { id: "dh-4", bookId: "dragon-hero-3", chapterId: "ch3", url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800", alt: "화산과 용암", caption: "최종 결전 — 불꽃의 각성", order: 4, worldUrl: "https://marble.worldlabs.ai/world/b7c8d9e0-7777-4aaa-b000-777777777704" },
];

const bphImages: BookImage[] = [
  { id: "bph-1", bookId: "big-pumpkin-house", chapterId: "ch1", url: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=800", alt: "거대한 호박", caption: "세상에서 가장 큰 호박의 발견", order: 1, worldUrl: "https://marble.worldlabs.ai/world/c8d9e0f1-8888-4bbb-c000-888888888801" },
  { id: "bph-2", bookId: "big-pumpkin-house", chapterId: "ch1", url: "https://images.unsplash.com/photo-1601628828688-632f38a5a7d0?w=800", alt: "가을 풍경", caption: "호박이 자라던 따뜻한 가을 마을", order: 2, worldUrl: "https://marble.worldlabs.ai/world/c8d9e0f1-8888-4bbb-c000-888888888802" },
  { id: "bph-3", bookId: "big-pumpkin-house", chapterId: "ch2", url: "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=800", alt: "동물 친구들", caption: "호박집에 모여든 동물 친구들", order: 3, worldUrl: "https://marble.worldlabs.ai/world/c8d9e0f1-8888-4bbb-c000-888888888803" },
  { id: "bph-4", bookId: "big-pumpkin-house", chapterId: "ch3", url: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=800", alt: "따뜻한 집", caption: "유쾌하고 따뜻한 호박집의 하루", order: 4, worldUrl: "https://marble.worldlabs.ai/world/c8d9e0f1-8888-4bbb-c000-888888888804" },
];

const sluImages: BookImage[] = [
  { id: "slu-1", bookId: "science-level-up-4", chapterId: "ch1", url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800", alt: "과학 실험", caption: "힘의 원리를 알아보는 실험실", order: 1, worldUrl: "https://marble.worldlabs.ai/world/d9e0f1a2-9999-4ccc-d000-999999999901" },
  { id: "slu-2", bookId: "science-level-up-4", chapterId: "ch1", url: "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?w=800", alt: "음파 시각화", caption: "소리는 어떻게 전달될까?", order: 2, worldUrl: "https://marble.worldlabs.ai/world/d9e0f1a2-9999-4ccc-d000-999999999902" },
  { id: "slu-3", bookId: "science-level-up-4", chapterId: "ch2", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800", alt: "뉴턴의 요람", caption: "작용과 반작용 — 힘의 법칙", order: 3, worldUrl: "https://marble.worldlabs.ai/world/d9e0f1a2-9999-4ccc-d000-999999999903" },
  { id: "slu-4", bookId: "science-level-up-4", chapterId: "ch3", url: "https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=800", alt: "스피커와 소리", caption: "소리의 세계를 탐험하다", order: 4, worldUrl: "https://marble.worldlabs.ai/world/d9e0f1a2-9999-4ccc-d000-999999999904" },
];

const bacImages: BookImage[] = [
  { id: "bac-1", bookId: "became-a-child", chapterId: "ch1", url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800", alt: "놀이터의 어린이", caption: "갑자기 어린이가 되어버린 어른", order: 1, worldUrl: "https://marble.worldlabs.ai/world/e0f1a2b3-aaaa-4ddd-e000-aaaaaaaaa01" },
  { id: "bac-2", bookId: "became-a-child", chapterId: "ch1", url: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800", alt: "크레파스와 그림", caption: "어린이의 눈으로 본 세상의 색깔", order: 2, worldUrl: "https://marble.worldlabs.ai/world/e0f1a2b3-aaaa-4ddd-e000-aaaaaaaaa02" },
  { id: "bac-3", bookId: "became-a-child", chapterId: "ch2", url: "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=800", alt: "비눗방울", caption: "작은 것에서 발견하는 커다란 기쁨", order: 3, worldUrl: "https://marble.worldlabs.ai/world/e0f1a2b3-aaaa-4ddd-e000-aaaaaaaaa03" },
  { id: "bac-4", bookId: "became-a-child", chapterId: "ch3", url: "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800", alt: "그림책 읽는 아이", caption: "유쾌한 어린이 세계의 비밀", order: 4, worldUrl: "https://marble.worldlabs.ai/world/e0f1a2b3-aaaa-4ddd-e000-aaaaaaaaa04" },
];

const ybImages: BookImage[] = [
  { id: "yb-1", bookId: "yokai-bus-5", chapterId: "ch1", url: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800", alt: "안개 낀 거리", caption: "기묘동 99번 버스가 나타나는 밤", order: 1, worldUrl: "https://marble.worldlabs.ai/world/f1a2b3c4-bbbb-4eee-f000-bbbbbbbbb01" },
  { id: "yb-2", bookId: "yokai-bus-5", chapterId: "ch1", url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800", alt: "어둠 속의 불빛", caption: "요괴 세계로 향하는 비밀 노선", order: 2, worldUrl: "https://marble.worldlabs.ai/world/f1a2b3c4-bbbb-4eee-f000-bbbbbbbbb02" },
  { id: "yb-3", bookId: "yokai-bus-5", chapterId: "ch2", url: "https://images.unsplash.com/photo-1604076913837-52ab5f7c1ac4?w=800", alt: "그림자", caption: "사라진 그림자의 비밀을 쫓다", order: 3, worldUrl: "https://marble.worldlabs.ai/world/f1a2b3c4-bbbb-4eee-f000-bbbbbbbbb03" },
  { id: "yb-4", bookId: "yokai-bus-5", chapterId: "ch2", url: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800", alt: "일본식 등불", caption: "요괴들의 축제가 열리는 밤", order: 4, worldUrl: "https://marble.worldlabs.ai/world/f1a2b3c4-bbbb-4eee-f000-bbbbbbbbb04" },
  { id: "yb-5", bookId: "yokai-bus-5", chapterId: "ch3", url: "https://images.unsplash.com/photo-1518562923427-7a3e1b4c2e8d?w=800", alt: "신비로운 문", caption: "그림자 세계의 마지막 관문", order: 5, worldUrl: "https://marble.worldlabs.ai/world/f1a2b3c4-bbbb-4eee-f000-bbbbbbbbb05" },
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
    chapters: [],
    agents: makeAgents("lovers-lover"),
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
    agents: makeAgents("pain-encyclopedia"),
    images: peImages,
    worldUrl: "https://marble.worldlabs.ai/world/b1a2c3d4-1111-4aaa-b000-111111111100",
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
    agents: makeAgents("dont-know-myself"),
    images: dkmImages,
    worldUrl: "https://marble.worldlabs.ai/world/c2b3a4d5-2222-4bbb-c000-222222222200",
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
    agents: makeAgents("what-moves-me"),
    images: wmmImages,
    worldUrl: "https://marble.worldlabs.ai/world/d3c4b5a6-3333-4ccc-d000-333333333300",
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
    agents: makeAgents("difficult-people"),
    images: dpImages,
    worldUrl: "https://marble.worldlabs.ai/world/e4d5c6b7-4444-4ddd-e000-444444444400",
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
    agents: makeAgents("black-comedy"),
    images: bcImages,
    worldUrl: "https://marble.worldlabs.ai/world/f5e6d7c8-5555-4eee-f000-555555555500",
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
    agents: makeAgents("weather-interview"),
    images: wiImages,
    worldUrl: "https://marble.worldlabs.ai/world/a6b7c8d9-6666-4fff-a000-666666666600",
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
    agents: makeAgents("dragon-hero-3"),
    images: dhImages,
    worldUrl: "https://marble.worldlabs.ai/world/b7c8d9e0-7777-4aaa-b000-777777777700",
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
    agents: makeAgents("big-pumpkin-house"),
    images: bphImages,
    worldUrl: "https://marble.worldlabs.ai/world/c8d9e0f1-8888-4bbb-c000-888888888800",
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
    agents: makeAgents("science-level-up-4"),
    images: sluImages,
    worldUrl: "https://marble.worldlabs.ai/world/d9e0f1a2-9999-4ccc-d000-999999999900",
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
    agents: makeAgents("became-a-child"),
    images: bacImages,
    worldUrl: "https://marble.worldlabs.ai/world/e0f1a2b3-aaaa-4ddd-e000-aaaaaaaaa00",
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
    agents: makeAgents("yokai-bus-5"),
    images: ybImages,
    worldUrl: "https://marble.worldlabs.ai/world/f1a2b3c4-bbbb-4eee-f000-bbbbbbbbb00",
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
