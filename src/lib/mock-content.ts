export interface ChapterContent {
  id: string;
  number: number;
  title: string;
  content: string;
  images: { id: string; caption: string }[];
  characters: string[];
}

// 책별 챕터 데이터 매핑
const bookChaptersMap: Record<string, ChapterContent[]> = {
  "lovers-lover": [
    {
      id: "ll-ch1", number: 1, title: "그 사람의 향기",
      characters: ["수연", "재현", "지은"],
      images: [{ id: "ll-ch1-img1", caption: "카페에서의 만남" }],
      content: `수연은 창밖의 빗줄기를 바라보며 커피잔을 감싸 쥐었다. 따뜻한 세라믹의 온기가 손끝을 타고 올라왔지만, 마음속 빈자리는 채워지지 않았다.

재현과 헤어진 지 석 달. 그 시간이 짧다면 짧고 길다면 긴 시간이었다. 문제는 재현이 이미 다른 사람 곁에 있다는 것이었다. 지은이라는 이름의 그 여자.

"희망 없이 사람을 사랑하는 일이 가능할까."

수연은 혼잣말처럼 중얼거렸다. 카페의 소음 속에서 그 말은 어디에도 닿지 못하고 흩어졌다. 하지만 수연은 알고 있었다. 이미 답을 알고 있으면서도 질문을 멈출 수 없는 것이 사랑이라는 것을.

재현의 눈빛이 떠올랐다. 마지막으로 만났을 때, 미안함과 확신이 뒤섞인 그 복잡한 눈빛. 수연은 그 눈빛에서 이미 끝을 읽었지만, 마음은 그것을 받아들이기를 거부했다.`,
    },
    {
      id: "ll-ch2", number: 2, title: "편지",
      characters: ["수연", "재현", "지은"],
      images: [{ id: "ll-ch2-img1", caption: "책상 위의 편지" }],
      content: `지은에게 편지를 쓰기로 결심한 건 새벽 세 시였다. 잠이 오지 않아 뒤척이다가, 수연은 책상 앞에 앉았다.

"당신에게 원망이 있는 건 아닙니다."

첫 문장을 쓰고 나자 눈물이 났다. 진심이었다. 지은을 미워할 수 없었다. 사랑은 빼앗기는 것이 아니라 옮겨가는 것이었다. 재현의 마음이 옮겨간 곳에 지은이 있었을 뿐.

수연은 펜을 놓았다가 다시 들었다. 쓰고 지우고, 지우고 쓰기를 반복했다. 이 편지가 지은에게 닿을지, 닿아야 하는 것인지도 알 수 없었다. 다만 써야 했다. 자신의 감정을 어딘가에 놓아두어야 했다.

"다만 한 가지, 그 사람을 부디 잘 사랑해주세요. 그건 내가 하지 못한 일이니까요."

창밖이 서서히 밝아왔다. 수연은 완성된 편지를 접어 서랍 안에 넣었다. 보내지 않을 편지였다. 하지만 그것만으로도 마음이 조금은 가벼워졌다.`,
    },
    {
      id: "ll-ch3", number: 3, title: "우연한 마주침",
      characters: ["수연", "재현", "지은"],
      images: [{ id: "ll-ch3-img1", caption: "거리에서의 재회" }],
      content: `서점에서 지은을 만난 건 정말 우연이었다. 수연은 신간 코너를 둘러보다가 익숙한 향수 냄새를 맡았다. 재현이 즐겨 쓰던 그 향수.

고개를 돌리자 지은이 있었다. 혼자였다. 지은도 수연을 알아보았는지 잠깐 멈칫했다. 어색한 침묵이 두 사람 사이를 채웠다.

"안녕하세요." 지은이 먼저 말을 걸었다. 예상보다 부드러운 목소리였다.

"네, 안녕하세요." 수연의 목소리는 떨리지 않았다. 놀랍게도.

두 사람은 서점 한편에 서서 짧은 대화를 나눴다. 재현의 이야기는 하지 않았다. 대신 책 이야기를 했다. 같은 작가를 좋아한다는 것을 알게 되었다.

돌아오는 길, 수연은 생각했다. 재현이 이 사람을 좋아한 이유를 조금은 이해할 수 있을 것 같다고. 그리고 그 생각이 아프지 않다는 것에 또 한 번 놀랐다.`,
    },
  ],
  "pain-encyclopedia": [
    {
      id: "pe-ch1", number: 1, title: "통증의 언어",
      characters: ["김학조 원장", "환자 민수"],
      images: [{ id: "pe-ch1-img1", caption: "한의원 진료실" }],
      content: `통증은 몸이 보내는 편지입니다. 20년간 한의사로 환자들을 만나면서 제가 깨달은 첫 번째 진실입니다.

민수 씨가 제 진료실 문을 열고 들어왔을 때, 그는 오른쪽 어깨를 움켜쥐고 있었습니다. "원장님, 어깨가 6개월째 아파요. 정형외과에서는 이상 없다고 하는데..."

저는 어깨가 아니라 그의 생활 전체를 물었습니다. 하루에 몇 시간 컴퓨터를 하는지, 어떤 자세로 자는지, 스트레스를 받으면 어디가 먼저 반응하는지.

통증의 원인은 아픈 곳에 있지 않은 경우가 대부분입니다. 어깨 통증의 진짜 원인이 목에 있고, 무릎 통증의 원인이 골반 틀어짐에 있고, 두통의 원인이 소화기에 있는 경우를 저는 매일 봅니다.

민수 씨의 어깨 통증 역시 마찬가지였습니다. 진짜 원인은 흉추의 미세한 틀어짐이었고, 그것은 매일 같은 자세로 8시간씩 모니터를 바라보는 습관에서 비롯된 것이었습니다.`,
    },
    {
      id: "pe-ch2", number: 2, title: "진통제 없이 살기",
      characters: ["김학조 원장", "환자 은지"],
      images: [{ id: "pe-ch2-img1", caption: "자가 치료 동작" }],
      content: `은지 씨는 매일 진통제를 두 알씩 먹고 있었습니다. 편두통 때문이었죠. "진통제 없이는 하루도 못 버텨요"라고 그녀는 말했습니다.

진통제는 통증 신호를 차단할 뿐, 원인을 해결하지 않습니다. 마치 화재경보기가 울릴 때 경보기를 끄는 것과 같습니다. 불은 여전히 타고 있는데 말이죠.

저는 은지 씨에게 세 가지를 제안했습니다. 첫째, 목 뒤 풍지혈을 하루 세 번 지압할 것. 둘째, 취침 전 30분간 스마트폰을 보지 말 것. 셋째, 아침에 일어나면 목을 좌우로 천천히 스트레칭할 것.

2주 후 은지 씨는 진통제를 이틀에 한 알로 줄였습니다. 한 달 후에는 일주일에 한 번만 먹었습니다. 두 달 후에는 완전히 끊었습니다.

몸은 스스로 치유하는 힘을 가지고 있습니다. 우리가 할 일은 그 힘이 작동할 수 있는 환경을 만들어주는 것입니다.`,
    },
    {
      id: "pe-ch3", number: 3, title: "몸의 지도",
      characters: ["김학조 원장"],
      images: [{ id: "pe-ch3-img1", caption: "경락도" }],
      content: `우리 몸에는 보이지 않는 지도가 있습니다. 동양의학에서는 이를 경락이라 부르고, 현대의학에서는 근막 연결선이라 설명합니다. 이름은 다르지만 가리키는 것은 같습니다.

발바닥의 통증이 허리와 연결되어 있고, 손목의 저림이 목 디스크의 신호일 수 있습니다. 몸은 하나의 네트워크입니다. 한 곳이 막히면 다른 곳에서 증상이 나타납니다.

제가 환자들에게 항상 하는 말이 있습니다. "아픈 곳을 만지지 마시고, 아프게 만드는 곳을 찾으세요."

통증은 적이 아닙니다. 통증은 우리 몸이 보내는 가장 정직한 신호입니다. 그 신호를 읽는 법을 배우면, 우리는 진통제 없이도 건강한 삶을 살 수 있습니다.`,
    },
  ],
  "dont-know-myself": [
    {
      id: "dkm-ch1", number: 1, title: "나를 모른다는 것",
      characters: ["허지원 교수", "내담자 현우"],
      images: [{ id: "dkm-ch1-img1", caption: "상담실의 풍경" }],
      content: `"저는 제가 누군지 모르겠어요."

현우 씨가 상담실 소파에 앉아 말했습니다. 서른두 살, 대기업 마케팅팀에서 일하는 그는 누가 봐도 성공적인 삶을 살고 있었습니다. 하지만 그의 눈에는 깊은 혼란이 서려 있었습니다.

뇌과학은 흥미로운 사실을 알려줍니다. 우리가 '나'라고 부르는 것은 고정된 실체가 아니라, 뇌의 여러 영역이 만들어내는 동적인 패턴입니다. 전전두엽이 만드는 '계획하는 나'와 편도체가 만드는 '반응하는 나'는 종종 충돌합니다.

현우 씨의 혼란도 바로 이것이었습니다. 회사에서의 나, 연인 앞에서의 나, 부모님 앞에서의 나가 모두 다른 사람 같다는 것. 하지만 그것은 문제가 아닙니다. 그것이 인간입니다.

"나를 모른다는 것을 아는 것, 그것이 자기 이해의 시작입니다." 저는 현우 씨에게 말했습니다.`,
    },
    {
      id: "dkm-ch2", number: 2, title: "감정의 뇌과학",
      characters: ["허지원 교수", "내담자 현우"],
      images: [{ id: "dkm-ch2-img1", caption: "뇌의 감정 회로" }],
      content: `감정은 비합리적인 것이 아닙니다. 감정은 뇌가 수백만 년 동안 진화시킨 생존 시스템입니다.

현우 씨는 자신이 "감정적"이라는 것을 부끄러워했습니다. 특히 분노를 느낄 때 자신을 미성숙하다고 판단했죠. 하지만 분노는 경계가 침범당했다는 뇌의 경보입니다.

편도체가 위협을 감지하면 0.02초 만에 반응합니다. 이것은 대뇌피질이 상황을 분석하는 것보다 훨씬 빠릅니다. 우리가 "왜 화가 났는지 모르겠는데 일단 화가 나"라고 느끼는 이유가 바로 이것입니다.

중요한 것은 감정을 억누르는 것이 아니라, 감정이 보내는 메시지를 읽는 것입니다. 불안은 "준비하라"는 신호이고, 슬픔은 "회복이 필요하다"는 신호이며, 분노는 "경계를 지켜라"는 신호입니다.

"감정을 느끼는 것과 감정에 휘둘리는 것은 다릅니다." 이 구분을 배우는 것이 정서 조절의 핵심입니다.`,
    },
    {
      id: "dkm-ch3", number: 3, title: "무너진 마음을 위하여",
      characters: ["허지원 교수"],
      images: [{ id: "dkm-ch3-img1", caption: "회복의 여정" }],
      content: `마음이 무너지는 경험은 누구에게나 찾아옵니다. 문제는 무너짐 자체가 아니라, 무너진 후 자신을 대하는 방식입니다.

많은 사람들이 힘들 때 자신을 가장 가혹하게 대합니다. "왜 이것도 못 이겨내지", "다른 사람들은 다 잘 하는데" 같은 내면의 비난이 상처 위에 상처를 더합니다.

뇌과학 연구에 따르면 자기 비난은 스트레스 호르몬인 코르티솔을 증가시키고, 자기 연민은 옥시토신과 엔도르핀을 활성화합니다. 같은 상황에서 자신에게 따뜻한 말을 건네는 것만으로도 뇌의 회복 시스템이 작동하기 시작합니다.

15만 명의 독자가 이 책에서 위로를 찾았다고 합니다. 하지만 제가 정말 전하고 싶은 메시지는 위로가 아닙니다. 당신은 생각보다 강하고, 뇌는 생각보다 유연하며, 회복은 생각보다 가능하다는 과학적 사실입니다.`,
    },
  ],
  "dragon-hero-3": [
    {
      id: "dh-ch1", number: 1, title: "불꽃의 각성",
      characters: ["리안", "화룡 이그니스", "마법사 엘더"],
      images: [{ id: "dh-ch1-img1", caption: "드래곤과 소년" }],
      content: `리안의 손바닥에서 불꽃이 피어올랐다. 작고 여린 불씨였지만, 이그니스의 눈이 번쩍 빛났다.

"드디어 각성했구나, 꼬마." 화룡 이그니스가 거대한 몸을 웅크리며 말했다. 뜨거운 숨결이 리안의 머리카락을 흩날렸다.

리안은 열두 살, 드래곤 기사단의 막내 수습생이었다. 다른 아이들은 이미 드래곤과 교감하고 불의 기운을 다루고 있었지만, 리안에게는 아무 일도 일어나지 않았다. 3년간이나.

"이그니스, 이게 진짜야?" 리안이 떨리는 목소리로 물었다. 손바닥 위의 불꽃이 동그랗게 춤추고 있었다.

"불의 계승자만이 피울 수 있는 불꽃이다." 이그니스의 목소리가 동굴 벽을 울렸다. "하지만 각성은 시작일 뿐이야. 이 힘을 다루려면 네 마음이 흔들리지 않아야 한다."

마법사 엘더가 동굴 입구에 나타났다. "서둘러야 합니다. 어둠의 군단이 북쪽 경계를 넘었습니다."`,
    },
    {
      id: "dh-ch2", number: 2, title: "시련의 숲",
      characters: ["리안", "화룡 이그니스", "소녀 미라"],
      images: [{ id: "dh-ch2-img1", caption: "마법의 숲" }],
      content: `시련의 숲은 드래곤 기사단의 전통적인 시험장이었다. 숲 속에는 환영을 만들어내는 고대 마법이 깔려 있어, 들어간 자의 가장 깊은 두려움을 현실로 보여주었다.

리안은 혼자 숲에 들어섰다. 이그니스도 엘더도 함께할 수 없었다. 이것은 오직 계승자만의 시험이었다.

안개가 짙어졌다. 갑자기 어둠 속에서 익숙한 목소리가 들렸다. "넌 자격이 없어." 그것은 리안 자신의 목소리였다. "3년이나 각성 못 한 주제에."

리안의 손이 떨렸다. 하지만 이그니스가 해준 말을 떠올렸다. '불꽃은 두려움을 태우는 것이 아니라, 두려움 속에서도 빛나는 것이다.'

손바닥에서 불꽃이 피어올랐다. 작지만 단단한 빛이 안개를 밀어냈다. 그때, 숲 속에서 또 다른 누군가가 나타났다. 은빛 머리카락의 소녀, 미라. "도와줄까?" 그녀가 미소를 지었다.`,
    },
    {
      id: "dh-ch3", number: 3, title: "불의 계승",
      characters: ["리안", "화룡 이그니스", "소녀 미라", "마법사 엘더"],
      images: [{ id: "dh-ch3-img1", caption: "최후의 대결" }],
      content: `어둠의 군단이 드래곤 계곡까지 밀려왔다. 하늘이 검은 연기로 뒤덮이고, 대지가 흔들렸다. 리안은 이그니스의 등 위에서 아래를 내려다보았다.

"무섭지 않냐?" 이그니스가 물었다.

"무서워." 리안이 솔직하게 대답했다. "하지만 도망치지 않을 거야."

리안은 두 손을 모았다. 손바닥 사이에서 불꽃이 태어났다. 처음 각성했을 때의 작은 불씨가 아니었다. 시련의 숲을 통과하며 단단해진, 뜨겁지만 안정적인 불꽃이었다.

이그니스의 불과 리안의 불이 하나로 합쳐졌다. 황금빛 불꽃이 어둠의 군단을 향해 쏟아져 내렸다. 그것은 파괴의 불이 아닌 정화의 불이었다. 어둠을 태우되 생명은 해치지 않는 불의 계승자만의 능력.

전투가 끝난 후, 엘더가 리안에게 말했다. "이제 넌 진정한 드래곤 기사다." 미라가 옆에서 웃었고, 이그니스가 하늘을 향해 포효했다.`,
    },
  ],
};

// 기본 챕터 (bookId에 매칭되는 데이터가 없을 때 사용)
const defaultChapters: ChapterContent[] = [
  {
    id: "ch1",
    number: 1,
    title: "얄리의 질문",
    characters: ["얄리", "재레드 다이아몬드"],
    images: [
      { id: "ch1-img1", caption: "뉴기니 해안의 풍경" },
      { id: "ch1-img2", caption: "얄리와의 만남" },
    ],
    content: `1972년 7월, 나는 뉴기니 해안을 따라 걷고 있었다. 열대의 습한 공기가 피부에 달라붙었고, 멀리서 파도 소리가 들려왔다.

그때 얄리가 내게 다가왔다. 그는 현지 정치인으로, 카리스마 넘치는 눈빛과 강인한 체격의 소유자였다. 얄리는 해변을 함께 걸으며 서양 문명에 대한 깊은 관심을 보였다.

"당신네 백인들은 그렇게 많은 화물을 발전시켜 뉴기니에 가져왔는데," 얄리가 물었다. "어째서 우리 흑인들은 그런 화물을 만들지 못한 거요?"

이 단순해 보이는 질문이 나의 연구 인생을 바꿔놓았다. 재레드 다이아몬드로서 나는 이 질문에 과학적으로 답하고 싶었다. 왜 각 대륙의 문명 발전 속도는 달랐을까?

대답은 인종의 우열이 아니라, 지리와 환경에 있었다. 각 대륙이 가진 야생 동식물, 대륙의 축 방향, 그리고 지리적 장벽이 문명의 발전 속도를 결정했다.

얄리의 질문은 단순한 호기심이 아니었다. 그것은 인류 역사의 가장 큰 수수께끼를 관통하는 질문이었다.`,
  },
  {
    id: "ch2",
    number: 2,
    title: "식량 생산의 힘",
    characters: ["얄리", "재레드 다이아몬드"],
    images: [
      { id: "ch2-img1", caption: "비옥한 초승달 지대의 밀밭" },
      { id: "ch2-img2", caption: "고대 농경의 시작" },
    ],
    content: `약 1만 1천 년 전, 인류 역사에 가장 중요한 전환점이 찾아왔다. 바로 식량 생산의 시작이다.

비옥한 초승달 지대에서 밀과 보리가 재배되기 시작했다. 얄리의 조상들이 살던 뉴기니에서도 농업이 독립적으로 발생했지만, 결정적 차이가 있었다.

재레드 다이아몬드가 주목한 것은 이것이었다. 비옥한 초승달 지대에는 재배에 적합한 야생 곡물이 풍부했다. 밀, 보리, 완두콩, 렌즈콩 — 이 식물들은 자연 상태에서도 열량이 높았고, 재배가 비교적 쉬웠다.

반면 뉴기니의 야생 식물은 대부분 열량이 낮고 재배가 어려웠다. 얄리의 조상들이 게을렀거나 무능해서가 아니다. 환경이 달랐을 뿐이다.

식량 생산은 연쇄 반응을 일으켰다. 잉여 식량이 생기자 모든 사람이 농사를 짓지 않아도 되었다. 일부는 도공이 되고, 일부는 대장장이가 되고, 일부는 군인이 되었다. 전문화와 분업이 시작된 것이다.

이것이 문명의 시작이었다. 그리고 이 모든 것의 출발점은 각 대륙이 가진 야생 동식물의 차이였다.`,
  },
  {
    id: "ch3",
    number: 3,
    title: "가축화의 비밀",
    characters: ["얄리", "재레드 다이아몬드"],
    images: [
      { id: "ch3-img1", caption: "가축화된 동물들" },
      { id: "ch3-img2", caption: "유라시아 대륙의 가축" },
    ],
    content: `인류가 가축화에 성공한 대형 포유류는 전 세계에 단 14종뿐이다. 그리고 그 중 13종이 유라시아 대륙 출신이었다.

얄리에게 이 사실을 설명하면, 그는 아마 고개를 끄덕일 것이다. 왜 아프리카에서는 얼룩말을 길들이지 못했을까? 왜 아메리카에서는 들소를 가축으로 만들지 못했을까?

재레드 다이아몬드는 "안나 카레니나 원칙"을 제시한다. 톨스토이의 명언 "행복한 가정은 모두 비슷하고, 불행한 가정은 저마다의 이유로 불행하다"처럼, 가축화에 성공하려면 모든 조건이 충족되어야 한다.

동물이 가축화되려면 다음 조건을 모두 만족해야 한다:
• 성장 속도가 빨라야 한다
• 사육 환경에서 번식이 가능해야 한다
• 성격이 온순해야 한다
• 공황 반응이 적어야 한다
• 사회적 위계 구조가 있어야 한다

유라시아 대륙은 운이 좋았다. 소, 말, 양, 돼지, 염소 — 이 동물들이 가축화의 모든 조건을 우연히 충족했기 때문이다. 이것은 유라시아인의 능력이 아니라, 생물지리학적 행운이었다.

가축은 식량만 제공한 것이 아니다. 말은 군사력과 이동 수단을 제공했고, 소는 농업 혁명을 가속했다. 그리고 가축과 가까이 사는 사람들은 동물 유래 질병에 대한 면역력을 키웠다. 이것이 훗날 아메리카 정복에서 결정적 역할을 하게 된다.`,
  },
];

// bookId로 챕터 가져오기 (없으면 기본 챕터 반환)
export function getChaptersByBookId(bookId: string): ChapterContent[] {
  return bookChaptersMap[bookId] || defaultChapters;
}

// 하위 호환: 기존 코드에서 사용하던 export
export const mockChapters = defaultChapters;

export function getChapterByNumber(num: number, bookId?: string): ChapterContent | undefined {
  const chapters = bookId ? getChaptersByBookId(bookId) : defaultChapters;
  return chapters.find((ch) => ch.number === num);
}
,
  "what-moves-me": [
    { id: "wmm-ch1", number: 1, title: "\uc54c\ub9ac\uc758 \uc9c8\ubb38", characters: [], images: [{ id: "wmm-ch1-img1", caption: "\ub274\uae30\ub2c8 \ud574\uc548\uc758 \ud48d\uacbd" }], content: "1972\ub144 7\uc6d4, \ub098\ub294 \ub274\uae30\ub2c8 \ud574\uc548\uc744 \ub530\ub77c \uac77\uace0 \uc788\uc5c8\ub2e4." },
    { id: "wmm-ch2", number: 2, title: "\ubb38\uba85\uc758 \ubc1c\uc790\ucchwi", characters: [], images: [{ id: "wmm-ch2-img1", caption: "\uc218\ub3c4\uc6d0\uc758 \uc544\uce68" }], content: "\uc9c8\ubb38\uc740 \uc5ec\uc804\ud788 \uacf5\uae30 \uc18d\uc5d0 \ub5a0 \uc788\uc5c8\ub2e4." },
    { id: "wmm-ch3", number: 3, title: "\uc2a4\ud399\uc758 \ud2b8\ub77c\uc6b0\ub9c8", characters: [], images: [{ id: "wmm-ch3-img1", caption: "\uba85\uc0c1\uc758 \uc21c\uac04" }], content: "\uacb0\uad6d \ub2f5\uc740 \uc548\uc5d0 \uc788\uc5c8\ub2e4." }
  ],
  "difficult-people": [
    { id: "dp-ch1", number: 1, title: "\uc65c \uc5b4\ub825\uac8c \ub290\ub07c\ub294\uac00", characters: [], images: [{ id: "dp-ch1-img1", caption: "\ud68c\uc758\uc2e4 \ud48d\uacbd" }], content: "\ubaa8\ub4e0 \uc9c1\uc7a5\uc5d0\ub294 \ub2e4\ub8e8\uae30 \ud798\ub4e0 \uc0ac\ub78c\uc774 \uc788\ub2e4." },
    { id: "dp-ch2", number: 2, title: "\ucda9\ub3cc\uc758 \uc2ec\ub9ac\ud559", characters: [], images: [{ id: "dp-ch2-img1", caption: "\ud300 \ud611\uc5c5 \uc7a5\uba74" }], content: "\uac08\ub4f1\uc758 \uadfc\ubcf8\uc5d0\ub294 \uc11c\ub85c \ub2e4\ub978 \uac00\uce58\uad00\uc774 \uc788\ub2e4." },
    { id: "dp-ch3", number: 3, title: "\uad00\uacc4\ub97c \ubc14\uafb8\ub294 \uae30\uc220", characters: [], images: [{ id: "dp-ch3-img1", caption: "\ub300\ud654\uc758 \uc21c\uac04" }], content: "\uc774\ud574\uc640 \uc874\uc911\uc774 \ubaa8\ub4e0 \uac83\uc744 \ubc14\uafbc\ub2e4." }
  ],
  "black-comedy": [
    { id: "bc-ch1", number: 1, title: "\uc6c3\uc74c\uacfc \uc2ac\ud514", characters: [], images: [{ id: "bc-ch1-img1", caption: "\ucf54\ubbf8\ub514 \ud074\ub7fd" }], content: "\uc6c3\uc74c\uc740 \uac00\uc7a5 \uc5b4\ub450\uc6b4 \uace7\uc5d0\uc11c \ud53c\uc5b4\ub09c\ub2e4." },
    { id: "bc-ch2", number: 2, title: "\ube14\ub799 \ucf54\ubbf8\ub514\uc758 \uade0\ud615", characters: [], images: [{ id: "bc-ch2-img1", caption: "\ubb34\ub300 \uc704\uc758 \uc870\uba85" }], content: "\ud48d\uc790\ub294 \ud604\uc2e4\uc744 \uac70\uc6b8\uc5d0 \ube44\uccd0\ub2e4." },
    { id: "bc-ch3", number: 3, title: "\ub9c8\uc9c0\ub9c9 \uc655\ub300", characters: [], images: [{ id: "bc-ch3-img1", caption: "\uc6c3\uc74c\uacfc \ub208\ubb3c" }], content: "\uc6c3\uc74c\uc18d\uc5d0 \ub208\ubb3c\uc774 \uc788\ub2e4." }
  ],
  "weather-interview": [
    { id: "wi-ch1", number: 1, title: "\ube44\uc640 \uc778\ud130\ubdf0", characters: [], images: [{ id: "wi-ch1-img1", caption: "\ube44 \uc624\ub294 \ucc3d\uac00" }], content: "\ub0a0\uc528\ub294 \uc5b8\uc81c\ub098 \uc815\uc9c1\ud558\ub2e4." },
    { id: "wi-ch2", number: 2, title: "\uad6c\ub984\uc758 \ub9d0", characters: [], images: [{ id: "wi-ch2-img1", caption: "\uad6c\ub984 \uc0ac\uc774\ub85c" }], content: "\ud558\ub298\uc740 \ub9e4\uc77c \ub2e4\ub978 \uc774\uc57c\uae30\ub97c \ud55c\ub2e4." },
    { id: "wi-ch3", number: 3, title: "\ub9d1\uc740 \ub0a0\uc758 \uc57d\uc18d", characters: [], images: [{ id: "wi-ch3-img1", caption: "\ub9d1\uc740 \ud558\ub298" }], content: "\ub9d1\uc740 \ub0a0\uc740 \uc5b8\uc81c\ub098 \ub3cc\uc544\uc628\ub2e4." }
  ],
  "big-pumpkin-house": [
    { id: "bph-ch1", number: 1, title: "\ud638\ubc15 \uc9d1\uc758 \ube44\ubc00", characters: [], images: [{ id: "bph-ch1-img1", caption: "\ud070 \ud638\ubc15 \uc9d1" }], content: "\ub9c8\uc744 \uc5b4\ub514\uc5d0\ub3c4 \ubcfc \uc218 \uc788\ub294 \ucee4\ub2e4\ub780 \ud638\ubc15\uc9d1\uc774 \uc788\uc5c8\ub2e4." },
    { id: "bph-ch2", number: 2, title: "\ub9c8\uc744 \uc0ac\ub78c\ub4e4", characters: [], images: [{ id: "bph-ch2-img1", caption: "\ub9c8\uc744 \uad11\uc7a5" }], content: "\ub9c8\uc744 \uc0ac\ub78c\ub4e4\uc740 \uc11c\ub85c\ub97c \ub3c4\uc654\ub2e4." },
    { id: "bph-ch3", number: 3, title: "\ud638\ubc15\uc758 \uc120\ubb3c", characters: [], images: [{ id: "bph-ch3-img1", caption: "\uc218\ud655\uc758 \uacc4\uc808" }], content: "\ud638\ubc15\uc740 \ubaa8\ub450\uc5d0\uac8c \ub098\ub204\uc5b4\uc84c\ub2e4." }
  ],
  "science-level-up-4": [
    { id: "slu-ch1", number: 1, title: "\ud798\uc774\ub780 \ubb34\uc5c7\uc778\uac00", characters: [], images: [{ id: "slu-ch1-img1", caption: "\uacfc\ud559 \uc2e4\ud5d8\uc2e4" }], content: "\ud798\uc740 \ubb3c\uccb4\ub97c \uc6c0\uc9c1\uc774\uac8c \ud558\ub294 \ub2a5\ub825\uc774\ub2e4." },
    { id: "slu-ch2", number: 2, title: "\uc18c\ub9ac\uc758 \ube44\ubc00", characters: [], images: [{ id: "slu-ch2-img1", caption: "\ud798\uacfc \uc6b4\ub3d9" }], content: "\uc18c\ub9ac\ub294 \uacf5\uae30\uc758 \ub5a8\ub9bc\uc774\ub2e4." },
    { id: "slu-ch3", number: 3, title: "\uc5d0\ub108\uc9c0\uc758 \ubcc0\ud658", characters: [], images: [{ id: "slu-ch3-img1", caption: "\uc18c\ub9ac\uc758 \uc138\uacc4" }], content: "\uc5d0\ub108\uc9c0\ub294 \uc0c8\ub85c\uc6b4 \ud615\ud0dc\ub85c \ubcc0\ud55c\ub2e4." }
  ],
  "became-a-child": [
    { id: "bac-ch1", number: 1, title: "\uc5b4\ub978\uc774 \uc5b4\ub9b0\uc774\uac00 \ub418\ub2e4", characters: [], images: [{ id: "bac-ch1-img1", caption: "\uc5b4\ub9b0\uc774 \ub208\ub192\uc774" }], content: "\uc5b4\ub290 \ub0a0 \uc544\uce68 \uc77c\uc5b4\ub098\ubcf4\ub2c8 \ub9f8\uc2a4\uac00 \ub2ec\ub77c\uc838 \uc788\uc5c8\ub2e4." },
    { id: "bac-ch2", number: 2, title: "\uc5b4\ub9b0\uc774\uc758 \uc138\uacc4", characters: [], images: [{ id: "bac-ch2-img1", caption: "\ub180\uc774\ud130" }], content: "\ubaa8\ub4e0 \uac83\uc774 \ud06c\uace0 \uc2e0\uae30\ud558\uac8c \ub3d9\uc774\ub2e4." },
    { id: "bac-ch3", number: 3, title: "\ub2e4\uc2dc \uc5b4\ub978\uc73c\ub85c", characters: [], images: [{ id: "bac-ch3-img1", caption: "\uc11c\ub85c\ub2e4\ub978 \uc138\uacc4" }], content: "\uc5b4\ub978\uc758 \ub208\uc73c\ub85c \ubcf4\ub294 \ub2e4\ub978 \ud48d\uacbd\uc774 \ud3bc\uccd0\uc84c\ub2e4." }
  ],
  "yokai-bus-5": [
    { id: "yb-ch1", number: 1, title: "\uc694\uad34\ubc84\uc2a4\uc758 \ube44\ubc00", characters: [], images: [{ id: "yb-ch1-img1", caption: "\uc694\uad34 \ubc84\uc2a4" }], content: "\ub108\uc800\ub141\ud558\uac8c \uc6c0\uc9c1\uc774\ub294 \ubc84\uc2a4\uc5d0 \uc62c\ub790\ub2e4." },
    { id: "yb-ch2", number: 2, title: "\uc2e0\ube44\ub85c\uc6b4 \uc2b9\uac1d\ub4e4", characters: [], images: [{ id: "yb-ch2-img1", caption: "\uc2e0\ube44\ub85c\uc6b4 \uc5ec\ud589" }], content: "\uc694\uad34\ub4e4\uc740 \uc800\ub9c8\ub2e4\uc758 \uc774\uc57c\uae30\ub97c \uac16\uace0 \uc788\uc5c8\ub2e4." },
    { id: "yb-ch3", number: 3, title: "\uc0ac\ub77c\uc9c4 \uadf8\ub9bc\uc790\uc758 \uc138\uacc4", characters: [], images: [{ id: "yb-ch3-img1", caption: "\uc0ac\ub77c\uc9c4 \uadf8\ub9bc\uc790" }], content: "\uadf8\ub9bc\uc790\ub97c \ucc3e\uc544 \uba40\ub9ac \ub5a0\ub09c \uc5ec\ud589\uc774 \uc2dc\uc791\ub418\uc5c8\ub2e4." }
  ]
};
