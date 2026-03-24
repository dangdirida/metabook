export interface ChapterContent {
  id: string;
  number: number;
  title: string;
  content: string;
  images: { id: string; caption: string }[];
  characters: string[];
}

const bookChaptersMap: Record<string, ChapterContent[]> = {
  "lovers-lover": [
    { id: "ll-ch1", number: 1, title: "그 사람의 향기", characters: ["수연","재현","지은"], images: [{ id: "ll-ch1-img1", caption: "카페에서의 만남" }], content: "수연은 창밖의 빗줄기를 바라보며 커피잔을 감싸 쥐었다." },
    { id: "ll-ch2", number: 2, title: "별 끄테", characters: ["수연","재현"], images: [{ id: "ll-ch2-img1", caption: "책상 위의 편지" }], content: "재현에게서 편지가 왔다." },
    { id: "ll-ch3", number: 3, title: "재회", characters: ["수연","재현","지은"], images: [{ id: "ll-ch3-img1", caption: "거리에서의 재회" }], content: "그들은 다시 만났다." }
  ],
  "pain-encyclopedia": [
    { id: "pe-ch1", number: 1, title: "통증의 신호", characters: [], images: [{ id: "pe-ch1-img1", caption: "한의원 진료실" }], content: "우리 몸은 메시지를 보낸다." },
    { id: "pe-ch2", number: 2, title: "지유의 길", characters: [], images: [{ id: "pe-ch2-img1", caption: "자가 치료 동작" }], content: "스스로 치유할 수 있다." },
    { id: "pe-ch3", number: 3, title: "맹공의 비밀", characters: [], images: [{ id: "pe-ch3-img1", caption: "경락도" }], content: "동양의학의 지혜가 담겨 있다." }
  ],
  "dont-know-myself": [
    { id: "dkm-ch1", number: 1, title: "나를 몰라서", characters: [], images: [{ id: "dkm-ch1-img1", caption: "상담실의 풍경" }], content: "자신을 이해하는 여정이 시작된다." },
    { id: "dkm-ch2", number: 2, title: "감정의 반응", characters: [], images: [{ id: "dkm-ch2-img1", caption: "뇌의 감정 회로" }], content: "우리의 감정은 뇌에서 비롯된다." },
    { id: "dkm-ch3", number: 3, title: "회복의 시작", characters: [], images: [{ id: "dkm-ch3-img1", caption: "회복의 여정" }], content: "진정한 나를 찾아가는 과정이다." }
  ],
  "what-moves-me": [
    { id: "wmm-ch1", number: 1, title: "알리의 질문", characters: [], images: [{ id: "wmm-ch1-img1", caption: "뉴기니 해안의 풍경" }], content: "1972년 7월, 나는 뉴기니 해안을 따라 걷고 있었다." },
    { id: "wmm-ch2", number: 2, title: "문명의 발자취", characters: [], images: [{ id: "wmm-ch2-img1", caption: "수도원의 아침" }], content: "질문은 여전히 공기 속에 떠 있었다." },
    { id: "wmm-ch3", number: 3, title: "스펙의 트라우마", characters: [], images: [{ id: "wmm-ch3-img1", caption: "명상의 순간" }], content: "결국 답은 안에 있었다." }
  ],
  "difficult-people": [
    { id: "dp-ch1", number: 1, title: "왜 어렵게 느끼는가", characters: [], images: [{ id: "dp-ch1-img1", caption: "회의실 풍경" }], content: "모든 직장에는 다루기 힘든 사람이 있다." },
    { id: "dp-ch2", number: 2, title: "충돌의 심리학", characters: [], images: [{ id: "dp-ch2-img1", caption: "팀 협업 장면" }], content: "갈등의 근본에는 서로 다른 가치관이 있다." },
    { id: "dp-ch3", number: 3, title: "관계를 바꾸는 기술", characters: [], images: [{ id: "dp-ch3-img1", caption: "대화의 순간" }], content: "이해와 존중이 모든 것을 바꾼다." }
  ],
  "black-comedy": [
    { id: "bc-ch1", number: 1, title: "웃음과 슬픔", characters: [], images: [{ id: "bc-ch1-img1", caption: "코미디 클럽" }], content: "웃음은 가장 어두운 곳에서 피어난다." },
    { id: "bc-ch2", number: 2, title: "블랙 코미디의 균형", characters: [], images: [{ id: "bc-ch2-img1", caption: "무대 위의 조명" }], content: "풍자는 현실을 거울에 비춰다." },
    { id: "bc-ch3", number: 3, title: "마지막 왕대", characters: [], images: [{ id: "bc-ch3-img1", caption: "웃음과 눈물" }], content: "웃음 속에 눈물이 있다." }
  ],
  "weather-interview": [
    { id: "wi-ch1", number: 1, title: "비와 인터뷰", characters: [], images: [{ id: "wi-ch1-img1", caption: "비 오는 창가" }], content: "날씨는 언제나 정직하다." },
    { id: "wi-ch2", number: 2, title: "구름의 말", characters: [], images: [{ id: "wi-ch2-img1", caption: "구름 사이로" }], content: "하늘은 매일 다른 이야기를 한다." },
    { id: "wi-ch3", number: 3, title: "맑은 날의 약속", characters: [], images: [{ id: "wi-ch3-img1", caption: "맑은 하늘" }], content: "맑은 날은 언제나 돌아온다." }
  ],
  "dragon-hero-3": [
    { id: "dh-ch1", number: 1, title: "드래곤과 소년", characters: [], images: [{ id: "dh-ch1-img1", caption: "드래곤과 소년" }], content: "소년은 드래곤을 만났다." },
    { id: "dh-ch2", number: 2, title: "마법의 숲", characters: [], images: [{ id: "dh-ch2-img1", caption: "마법의 숲" }], content: "마법의 숲에서 훈련이 시작되었다." },
    { id: "dh-ch3", number: 3, title: "최후의 대결", characters: [], images: [{ id: "dh-ch3-img1", caption: "최후의 대결" }], content: "운명의 대결이 시작되었다." }
  ],
  "big-pumpkin-house": [
    { id: "bph-ch1", number: 1, title: "호박 집의 비밀", characters: [], images: [{ id: "bph-ch1-img1", caption: "큰 호박 집" }], content: "어디에도 볼 수 있는 커다란 호박집이 있었다." },
    { id: "bph-ch2", number: 2, title: "마을 사람들", characters: [], images: [{ id: "bph-ch2-img1", caption: "마을 광장" }], content: "마을 사람들은 서로를 도왔다." },
    { id: "bph-ch3", number: 3, title: "호박의 선물", characters: [], images: [{ id: "bph-ch3-img1", caption: "수확의 계절" }], content: "호박은 모두에게 나누어졌다." }
  ],
  "science-level-up-4": [
    { id: "slu-ch1", number: 1, title: "힘이란 무엇인가", characters: [], images: [{ id: "slu-ch1-img1", caption: "과학 실험실" }], content: "힘은 물체를 움직이게 하는 능력이다." },
    { id: "slu-ch2", number: 2, title: "소리의 비밀", characters: [], images: [{ id: "slu-ch2-img1", caption: "힘과 운동" }], content: "소리는 공기의 떨림이다." },
    { id: "slu-ch3", number: 3, title: "에너지의 변환", characters: [], images: [{ id: "slu-ch3-img1", caption: "소리의 세계" }], content: "에너지는 새로운 형태로 변한다." }
  ],
  "became-a-child": [
    { id: "bac-ch1", number: 1, title: "어른이 어린이가 되다", characters: [], images: [{ id: "bac-ch1-img1", caption: "어린이 눈높이" }], content: "어느 날 아침 일어나보니 맨스가 달라져 있었다." },
    { id: "bac-ch2", number: 2, title: "어린이의 세계", characters: [], images: [{ id: "bac-ch2-img1", caption: "놀이터" }], content: "모든 것이 크고 신기하게 동이다." },
    { id: "bac-ch3", number: 3, title: "다시 어른으로", characters: [], images: [{ id: "bac-ch3-img1", caption: "서로다른 세계" }], content: "어른의 눈으로 보는 다른 풍경이 펼쳐졌다." }
  ],
  "yokai-bus-5": [
    { id: "yb-ch1", number: 1, title: "요괴버스의 비밀", characters: [], images: [{ id: "yb-ch1-img1", caption: "요괴 버스" }], content: "너저분하게 움직이는 버스에 올랐다." },
    { id: "yb-ch2", number: 2, title: "신비로운 승객들", characters: [], images: [{ id: "yb-ch2-img1", caption: "신비로운 여행" }], content: "요괴들은 저마다의 이야기를 갖고 있었다." },
    { id: "yb-ch3", number: 3, title: "사라진 그림자의 세계", characters: [], images: [{ id: "yb-ch3-img1", caption: "사라진 그림자" }], content: "그림자를 찾아 멀리 떠난 여행이 시작되었다." }
  ]
};

export const defaultChapters: ChapterContent[] = bookChaptersMap["lovers-lover"];

export function getChaptersByBookId(bookId: string): ChapterContent[] {
  return bookChaptersMap[bookId] || defaultChapters;
}

export const mockChapters = defaultChapters;

export function getChapterByNumber(num: number, bookId?: string): ChapterContent | undefined {
  const chapters = bookId ? getChaptersByBookId(bookId) : defaultChapters;
  return chapters.find((ch) => ch.number === num);
}
