# OGQ Global Brand System — GLOBAL_CLAUDE.md
> OGQ 관련 모든 사이트/프로젝트 제작 시 항상 이 파일을 참조할 것.
> 실제 OGQ Storybook(Chromatic)에서 확인된 공식 값 기준.
> 출처: https://694b598e846547353c4cce0c-xnanqvnjdk.chromatic.com
> ⚠️ 아직 확인 안 된 항목은 섹션 6에 별도 표시됨.

---

## 1. OGQ 브랜드 개요

- **서비스명**: OGQ Market (ogq.kr / ogq.me)
- **로고**: OGQ 워드마크 (그린 계열 Primary 컬러 기반, 심플한 산세리프)
- **포지셔닝**: 크리에이터가 스티커·이모티콘·배경화면·폰트 등 디지털 콘텐츠를 판매하는 글로벌 IP 마켓플레이스
- **핵심 가치**: 창작자 중심 / 팬과의 연결 / IP 확장 / 글로벌
- **주요 유저**: 크리에이터(작가) / 팬(구매자·사용자) / 플랫폼 어드민

---

## 2. 컬러 시스템 ✅ Storybook 확인 완료

> Foundation > Colors 에서 직접 확인한 공식 hex 값.

### 2-1. Primary — 그린 계열 (메인 브랜드 컬러)

```css
:root {
  --color-primary-100: #b5e5d7;
  --color-primary-200: #9bdfcc;
  --color-primary-300: #71dec1;
  --color-primary-400: #58dab1;
  --color-primary-500: #32d29d;  /* ★ 핵심 Primary. CTA·강조에 사용 */
  --color-primary-600: #00c389;
  --color-primary-700: #00b57f;
  --color-primary-800: #00996e;
  --color-primary-900: #007a58;
  --color-primary-990: #006147;

  --color-primary-010: #f5fdfb;  /* 밝은 배경 */
  --color-primary-050: #dff4ea;
  --color-primary-080: #cbecdf;
}
```

### 2-2. Mono — 그레이스케일

```css
:root {
  --color-mono-100: #d8cfdf;
  --color-mono-200: #a7b6b9;
  --color-mono-300: #89989c;
  --color-mono-400: #7d8d92;
  --color-mono-500: #76888f;
  --color-mono-600: #6c7e84;
  --color-mono-700: #57767b;
  --color-mono-800: #425052;
  --color-mono-900: #262d2e;
  --color-mono-990: #040606;  /* 거의 검정 */

  --color-mono-010: #fcfdfd;  /* 거의 흰색 — 라이트 배경 기본 */
  --color-mono-030: #f9fbfb;
  --color-mono-050: #f4f6f6;
  --color-mono-080: #eef1f1;
}
```

### 2-3. Secondary — 퍼플 계열

```css
:root {
  --color-secondary-100: #d2cbf9;
  --color-secondary-200: #bfb0f2;
  --color-secondary-300: #a793ec;
  --color-secondary-400: #947be5;
  --color-secondary-500: #7e5ae2;  /* ★ 핵심 Secondary */
  --color-secondary-600: #703fe4;
  --color-secondary-700: #5b1dcd;
  --color-secondary-800: #4917a6;
  --color-secondary-900: #37117e;
  --color-secondary-990: #290d5e;

  --color-secondary-010: #fbfbfe;
  --color-secondary-030: #f8f6fe;
  --color-secondary-050: #ebe8fc;
  --color-secondary-080: #e0dafb;
}
```

### 2-4. Accent Red

```css
:root {
  --color-red-100: #ffd0d3;
  --color-red-200: #e33861;
  --color-red-300: #e21235;  /* ★ 에러 / 위험 / 삭제 */

  --color-red-030: #ffeeef;
  --color-red-050: #ffe2e4;
}
```

### 2-5. Accent Blue

```css
:root {
  --color-blue-100: #a4d9ff;
  --color-blue-200: #75c2fa;
  --color-blue-300: #1384d7;  /* ★ 정보 / 링크 */
  --color-blue-400: #3b7cf3;

  --color-blue-030: #f0f8ff;
  --color-blue-050: #d9ecfe;
}
```

### 2-6. 컬러 사용 가이드

| 용도 | 토큰 | hex |
|------|------|-----|
| 메인 CTA / 강조 | `--color-primary-500` | #32d29d |
| Hover 상태 | `--color-primary-600` | #00c389 |
| 기본 텍스트 (라이트) | `--color-mono-990` | #040606 |
| 보조 텍스트 | `--color-mono-600` | #6c7e84 |
| 기본 배경 (라이트) | `--color-mono-010` | #fcfdfd |
| 구분선 / 보더 | `--color-mono-050` | #f4f6f6 |
| 에러 / 삭제 | `--color-red-300` | #e21235 |
| 정보 / 링크 | `--color-blue-300` | #1384d7 |
| 보조 액션 / 배지 | `--color-secondary-500` | #7e5ae2 |

---

## 3. 컴포넌트 목록 ✅ Storybook 확인 완료

> Foundation > Storybook 사이드바에서 직접 확인된 공식 컴포넌트 목록.

### 3-1. Components (구성 요소)

| 한국어명 | 영문 컴포넌트명 | 확인된 하위 variants |
|---------|--------------|-------------------|
| 배지 | Badge | CreatorType (`label` prop) / Grade (`grade`: "pro"\|"partner"\|"normal") |
| 단추 | Button | ButtonOutline / ButtonSolid |
| 체크박스 | Checkbox | Number / Round / Square |
| 칩 | Chip | ChipFilter / ChipFollow / ChipInput / ChipTag |
| 아이콘버튼 | IconButton | IconButtonDim / IconButtonOutline / IconButtonShadow |
| 입력 | Input | — |
| 상표 | Label | — |
| 라디오 | Radio | — |
| 선택하다 | Select | Playground / All Variants / Interactive / Search Highlight / 서브컴포넌트 |
| 스위치 | Switch | — |
| 텍스트버튼 | TextButton | TextNewWindow / TextShortcut / TextUnderline |

### 3-2. Foundation (기반)

| 한국어명 | 영문명 | 내용 |
|---------|--------|------|
| 그래픽 | Graphic | 일러스트·그래픽 에셋 |
| 아이콘 | Iconography | 아이콘 시스템 |
| 그림 물감 | Colors | Primary / Mono / Secondary / Red / Blue |

### 3-3. 각 스토리 공통 구조
모든 컴포넌트는 아래 하위 스토리를 가짐:
```
Docs             — 사용법 문서
Playground       — 직접 조작 테스트
All Variants     — 전체 variant 일람
Size Comparison  — 사이즈별 비교
Follow States    — 상태별 (hover/focus/disabled/active) 비교
```

---

## 4. 아이콘 시스템 ✅ Storybook 확인 완료

> Foundation > Iconography 기준. Vue 컴포넌트 기반으로 구현됨.
> 모든 아이콘은 `color`, `size` props를 공통으로 가짐. color 기본값은 `"currentColor"`.

### 4-1. 아이콘 그룹 전체 목록

| 그룹 | 설명 | 기본 크기 | stroke |
|------|------|----------|--------|
| **Line** | 가장 기본이 되는 범용 라인 아이콘 | 24px | **1.5px** |
| **Act** | 액션 가능한 버튼형 아이콘 | 24px | — |
| **Arrow** | 화살표 방향 아이콘 | 24px | — |
| **Editor** | 편집기 툴바 아이콘 | 24px | 1.5px |
| **Etc** | 기타 특수 용도 아이콘 | 24px | — |
| **Fill System** | 채움(fill) 시스템 아이콘 | 24px | 내부 1.5px |
| **Line2** | Bold 라인 아이콘 (강조용) | 24px | **2px** |
| **Mini** | 소형 아이콘 | **12px** (기본) | 1.5px |
| **Navi** | 네비게이션 전용 아이콘 | **24px** | 1.5px |
| **Noti** | 알림 관련 아이콘 | **24px** | — |
| **ProjectBadge** | 프로젝트 배지 전용 아이콘 | **18px** | — |
| **SNS** | SNS 플랫폼 아이콘 | **24px** | — |

### 4-1-1. Line 아이콘 공통 구조 ✅ Storybook 확인 완료
> 가장 기본이 되는 24×24 형태 line 아이콘. stroke 굵기 1.5px.
> 베이스 컴포넌트: `IconBase`. 개별 아이콘은 `Icon{Name}` 형태.

```vue
<!-- 공통 Props -->
<!-- size  : number | string (기본값 24) — 아이콘 크기(px) -->
<!-- color : string (기본값 "currentColor") — 아이콘 색상 -->

<!-- 지원 사이즈 (모든 Line 아이콘 공통) -->
<IconDownload :size="16" />
<IconDownload :size="20" />
<IconDownload :size="24" />   <!-- 기본 -->
<IconDownload :size="32" />
<IconDownload :size="40" />
<IconDownload :size="48" />

<!-- 컬러 적용 패턴 (모든 Line 아이콘 공통) -->
<IconDownload :size="24" color="var(--color-mono-900)" />    <!-- 기본 텍스트 -->
<IconDownload :size="24" color="var(--color-primary-600)" /> <!-- 활성/강조 -->
<IconDownload :size="24" color="var(--color-red-300)" />     <!-- 위험/삭제 -->
<IconDownload :size="24" color="var(--color-mono-400)" />    <!-- 비활성 -->
```

### 4-1-2. Line 아이콘 전체 목록 (27종) ✅ Storybook 확인 완료

```vue
<IconAdd          :size="24" />   <!-- 추가(+) -->
<IconAttach       :size="24" />   <!-- 첨부 -->
<IconAudit        :size="24" />   <!-- 감사/검토 -->
<IconBlock        :size="24" />   <!-- 차단 -->
<IconCalendar     :size="24" />   <!-- 캘린더 -->
<IconCheck        :size="24" />   <!-- 체크(✓) -->
<IconClose        :size="24" />   <!-- 닫기(X) -->
<IconComment      :size="24" />   <!-- 댓글 -->
<IconDownload     :size="24" />   <!-- 다운로드 -->
<IconEdit         :size="24" />   <!-- 편집 -->
<IconExclamation  :size="24" />   <!-- 느낌표 -->
<IconFilter       :size="24" />   <!-- 필터 -->
<IconInfo         :size="24" />   <!-- 정보(i) -->
<IconMoreVertical :size="24" />   <!-- 더보기(⋮) -->
<IconProfile      :size="24" />   <!-- 프로필 -->
<IconProject      :size="24" />   <!-- 프로젝트 -->
<IconReceipt      :size="24" />   <!-- 영수증 -->
<IconRefresh      :size="24" />   <!-- 새로고침 -->
<IconReview       :size="24" />   <!-- 리뷰 -->
<IconSearch       :size="24" />   <!-- 검색 -->
<IconSell         :size="24" />   <!-- 판매 -->
<IconSetting      :size="24" />   <!-- 설정 -->
<IconShare        :size="24" />   <!-- 공유 -->
<IconShortcut     :size="24" />   <!-- 바로가기 -->
<IconUpload       :size="24" />   <!-- 업로드 -->
<IconView         :size="24" />   <!-- 보기 -->
<IconWon          :size="24" />   <!-- 원(₩) -->
```


```vue
<!-- 사용 가능한 아이콘 -->
<IconCheckMini  :size="12" />   <!-- Check -->
<IconAddMini    :size="12" />   <!-- Add -->
<IconDeleteMini :size="12" />   <!-- Delete -->

<!-- 지원 사이즈 -->
:size="12"   <!-- 기본 -->
:size="16"
:size="20"
```

### 4-3. Navi 아이콘 (24×24px, 네비게이션 전용)
```vue
<!-- 네비게이션 바에서 사용 -->
<IconNaviDashboard  :size="24" />
<IconNaviContents   :size="24" />
<IconNaviSales      :size="24" />
<IconNaviAdjustment :size="24" />
<IconNaviLike       :size="24" />

<!-- 컬러 적용 예시 -->
<IconNaviDashboard :size="24" color="var(--color-mono-900)" />    <!-- 기본 -->
<IconNaviDashboard :size="24" color="var(--color-primary-600)" /> <!-- 활성 -->
<IconNaviDashboard :size="24" color="var(--color-red-300)" />     <!-- 위험 -->
<IconNaviDashboard :size="24" color="var(--color-mono-400)" />    <!-- 비활성 -->
```
> 설명: 24×24 형태 line 아이콘, stroke 굵기 1.5px

### 4-4. Noti 아이콘 (알림 상태 아이콘)
```vue
<!-- Props -->
<!-- type*: NotiIconType (필수) -->
<!-- size: number (기본값 24) -->
<!-- color: string (기본값 "currentColor") -->

<IconNoti type="notification" :size="24" />
<IconNoti type="alarm"        :size="24" />
<IconNoti type="message"      :size="24" />
<IconNoti type="drawer"       :size="24" />
```
> 설명: 아이콘의 상태를 선택할 수 있는 형태의 아이콘

### 4-5. ProjectBadge 아이콘 (18×18px 기준)
```vue
<!-- 프로젝트 배지에 사용. currentColor 사용 -->
<IconProjectBadgeFeature />
<IconProjectBadgeAchieve />
<IconProjectBadgeAward   />
<IconProjectBadgeCertify />
<IconProjectBadgePopular />

<!-- 지원 사이즈 -->
:size="12"
:size="18"   <!-- 기본 -->
:size="24"
:size="32"
```

### 4-6. SNS 아이콘
```vue
<!-- 컴포넌트명: IconSns -->
<!-- sns props로 플랫폼 지정 -->
<!-- color="color" → 브랜드 컬러 / color="gray" → 회색 / color="black" → 검정 -->

<IconSns sns="naver"            color="color" />
<IconSns sns="naver-blog"       color="color" />
<IconSns sns="naver-cafe"       color="color" />
<IconSns sns="naver-smartstore" color="color" />
<IconSns sns="google"           color="color" />
<IconSns sns="facebook"         color="color" />
<IconSns sns="facebook-background" color="color" />
<IconSns sns="instagram"        color="color" />
<IconSns sns="youtube"          color="color" />
<IconSns sns="twitter-x"        color="color" />
<IconSns sns="linkedin"         color="color" />
<IconSns sns="behance"          color="color" />
<IconSns sns="dribbble"         color="color" />
<IconSns sns="soundcloud"       color="color" />
<IconSns sns="notefolio"        color="color" />
<IconSns sns="soop"             color="color" />
<IconSns sns="web"              color="color" />
```

### 4-7. Act 아이콘 (액션 가능한 버튼형 아이콘)
> 버튼 역할을 하는 액션이 가능한 아이콘. 각 아이콘마다 상태 제어 prop명이 다름에 주의.

```vue
<!-- IconActLike — 별 아이콘 (찜/좋아요) -->
<!-- prop: type -->
<IconActLike type="stroke" />   <!-- 비활성 (별 테두리) -->
<IconActLike type="fill" />     <!-- 활성 (별 채움) -->

<!-- IconActWish — 하트 아이콘 (위시리스트) -->
<!-- prop: variant -->
<IconActWish variant="stroke" />   <!-- 비활성 (하트 테두리) -->
<IconActWish variant="fill" />     <!-- 채움 -->
<IconActWish variant="active" />   <!-- 활성 상태 -->
<IconActWish variant="hover" />    <!-- 호버 상태 -->

<!-- IconActMoodboard — 북마크 아이콘 (무드보드 저장) -->
<!-- prop: active (boolean) -->
<IconActMoodboard :active="false" />   <!-- inactive (북마크 테두리) -->
<IconActMoodboard :active="true" />    <!-- active (북마크 채움) -->
```
> ⚠️ prop명 주의: `IconActLike`는 `type`, `IconActWish`는 `variant`, `IconActMoodboard`는 `:active`(boolean) 사용

### 4-8. Arrow 아이콘 (24×24px)
> 방향 화살표 아이콘. props 조합으로 다양한 스타일 표현 가능.

```vue
<!-- Props -->
<!-- direction : ArrowDirection — "up" | "down" | "left" | "right" (기본값: "down") -->
<!-- bar       : boolean — 화살표 위에 바(선) 추가 (기본값: false) -->
<!-- stroke    : ArrowStroke — "1.5" | "2" (기본값: "1.5") -->
<!-- circle    : boolean — 원형 배경 스타일. true이면 bar·stroke 무시 (기본값: false) -->
<!-- size      : number — (기본값: 24) -->

<!-- 기본 사용법 -->
<IconArrow :bar="false" :circle="false" direction="down" :size="24" stroke="1.5" />

<!-- All Directions — 방향만 변경 -->
<IconArrow direction="up" />
<IconArrow direction="down" />
<IconArrow direction="left" />
<IconArrow direction="right" />

<!-- With Bar — 상단 바 추가 -->
<IconArrow direction="up"    :bar="true" />
<IconArrow direction="down"  :bar="true" />
<IconArrow direction="left"  :bar="true" />
<IconArrow direction="right" :bar="true" />

<!-- Circle Style — 원형 배경 (bar·stroke 무시됨) -->
<IconArrow direction="up"    :circle="true" />
<IconArrow direction="down"  :circle="true" />
<IconArrow direction="left"  :circle="true" />
<IconArrow direction="right" :circle="true" />

<!-- Stroke Width -->
<IconArrow direction="down" stroke="1.5" />   <!-- 기본 (가는 선) -->
<IconArrow direction="down" stroke="2" />      <!-- 굵은 선 -->
```

### 4-9. Editor 아이콘 (24×24px, line 타입, stroke 1.5px)
> 에디터(글쓰기/편집) UI에서 사용되는 툴바 아이콘.
> `type` prop이 필수이며 `EditorIconType`으로 타입 정의됨.

```vue
<!-- Props -->
<!-- type* : EditorIconType (필수) -->
<!-- size  : number (기본값 24) -->
<!-- color : string (기본값 "currentColor") -->

<!-- 기본 사용법 -->
<IconEditor color="currentColor" :size="24" type="bold" />

<!-- 전체 type 목록 -->
<IconEditor type="text" />        <!-- 텍스트 -->
<IconEditor type="textcolor" />   <!-- 텍스트 색상 -->
<IconEditor type="bold" />        <!-- 굵게 (B) -->
<IconEditor type="italic" />      <!-- 기울임 (I) -->
<IconEditor type="underline" />   <!-- 밑줄 (U) -->
<IconEditor type="leftalign" />   <!-- 왼쪽 정렬 -->
<IconEditor type="centeralign" /> <!-- 가운데 정렬 -->
<IconEditor type="rightalign" />  <!-- 오른쪽 정렬 -->
<IconEditor type="img" />         <!-- 이미지 1장 -->
<IconEditor type="imgs" />        <!-- 이미지 여러장 -->
<IconEditor type="video" />       <!-- 동영상 -->
<IconEditor type="music" />       <!-- 음악 -->
<IconEditor type="embed" />       <!-- 임베드 (</>)  -->
<IconEditor type="link" />        <!-- 링크 -->
<IconEditor type="camera" />      <!-- 카메라 -->
<IconEditor type="trash" />       <!-- 삭제 -->
```

### 4-10. Etc 아이콘 (기타 — 특수 용도)
> 일반 아이콘과 달리 **상태(state)를 props로 직접 제어**하는 특수 아이콘 모음.

```vue
<!-- Zoom: zoom-in prop으로 방향 제어 -->
<IconEtcZoom :zoom-in="false" />   <!-- zoom out -->
<IconEtcZoom :zoom-in="true" />    <!-- zoom in -->

<!-- Eye: show prop으로 표시/숨김 제어 -->
<IconEtcEye :show="true" />    <!-- 눈 열림 (show) -->
<IconEtcEye :show="false" />   <!-- 눈 닫힘 (hide) -->

<!-- Check: checked prop으로 선택 상태 제어 -->
<IconEtcCheck :checked="false" />   <!-- unchecked (회색) -->
<IconEtcCheck :checked="true" />    <!-- checked (초록) -->

<!-- Follow: follow + hover 조합으로 4가지 상태 표현 -->
<IconEtcFollow :follow="false" :hover="false" />   <!-- unfollow -->
<IconEtcFollow :follow="false" :hover="true" />    <!-- unfollow hover -->
<IconEtcFollow :follow="true"  :hover="false" />   <!-- following -->
<IconEtcFollow :follow="true"  :hover="true" />    <!-- following hover -->

<!-- Lock / Time: props 없음, 단순 아이콘 -->
<IconEtcLock />   <!-- 자물쇠 -->
<IconEtcTime />   <!-- 시계/시간 -->

<!-- Upload: type prop으로 스타일 선택 -->
<IconEtcUpload type="stroke" />   <!-- 아웃라인 스타일 -->
<IconEtcUpload type="fill" />     <!-- 채움 스타일 -->

<!-- Platform: OGQ 생태계 플랫폼 아이콘 -->
<IconEtcPlatform type="ogq" />     <!-- OGQ -->
<IconEtcPlatform type="naver" />   <!-- Naver -->
<IconEtcPlatform type="soop" />    <!-- SOOP -->
```


### 4-12. Line2 아이콘 (24×24px, 2px stroke)
> 일반 Line 아이콘보다 stroke가 굵은 Bold 스타일. 강조가 필요한 UI에 사용.

```vue
<IconCloseBold    :size="24" />   <!-- Close(X) -->
<IconCheckBold    :size="24" />   <!-- Check(✓) -->
<IconRefreshBold  :size="24" />   <!-- Refresh -->
<IconDownloadBold :size="24" />   <!-- Download -->
<IconShortcutBold :size="24" />   <!-- Shortcut -->
<IconCommentBold  :size="24" />   <!-- Comment -->
```

### 4-13. Fill System 아이콘 (24×24px, fill 스타일, 내부 stroke 1.5px)
> 시스템 알림·상태 표시에 사용되는 fill 아이콘.
> `IconFillClose`, `IconFillExclamation`은 `variant` prop으로 error 상태 표현 가능.

```vue
<!-- 전체 아이콘 목록 -->
<IconFillCheck       :size="24" />
<IconFillClose       :size="24" />
<IconFillExclamation :size="24" />
<IconFillInfo        :size="24" />
<IconFillQuestion    :size="24" />
<IconFillPlus        :size="24" />
<IconFillMinus       :size="24" />

<!-- error variant 지원 (IconFillClose, IconFillExclamation만 해당) -->
<IconFillClose       :size="24" variant="default" />  <!-- 기본 -->
<IconFillClose       :size="24" variant="error" />    <!-- 에러 (빨간색) -->
<IconFillExclamation :size="24" variant="default" />
<IconFillExclamation :size="24" variant="error" />    <!-- 에러 (빨간색) -->
```

---

## 5. 그래픽 에셋 (Graphic) ✅ Storybook 확인 완료

> Foundation > Graphic 기준.
> 그래픽은 아이콘과 달리 **color/size props 없음** — 고정 크기 컬러 일러스트 에셋.

### 5-1. Graphic Fill (48×48px 고정, 컬러 일러스트)
> "그래픽 fill 변형은 48×48 고정 크기의 컬러 일러스트 아이콘입니다."
> props 없이 컴포넌트명만으로 사용. 빈 상태(empty), 상태 표시, 카테고리 분류 등에 활용.

```vue
<!-- 전체 목록 (33종) — props 없이 그냥 사용 -->

<!-- 기간/판매 관련 -->
<GraphicFill3mthNew />          <!-- 3개월 신규 -->
<GraphicFill3mthSell />         <!-- 3개월 판매 -->
<GraphicFillReleaseNew />       <!-- 신규 릴리즈 -->
<GraphicFillSpecialProduct />   <!-- 스페셜 상품 -->
<GraphicFillSell />             <!-- 판매 -->

<!-- 콘텐츠 타입 -->
<GraphicFillContents />         <!-- 콘텐츠 -->
<GraphicFillContentsNum />      <!-- 콘텐츠 (숫자) -->
<GraphicFillContentsSix />      <!-- 콘텐츠 6종 -->
<GraphicFillImage />            <!-- 이미지 -->
<GraphicFillMusic />            <!-- 음악 -->
<GraphicFillColoring />         <!-- 컬러링 -->
<GraphicFillBroadcast />        <!-- 방송 -->
<GraphicFillStickerAnimation /> <!-- 스티커 (애니메이션) -->
<GraphicFillStickerDefault />   <!-- 스티커 (기본) -->
<GraphicFillStickerSell />      <!-- 스티커 (판매) -->

<!-- 사용자/팬 관련 -->
<GraphicFillFans />             <!-- 팬 -->
<GraphicFillPublicity />        <!-- 홍보 -->
<GraphicFillSearch />           <!-- 검색 -->

<!-- 감정/상태 -->
<GraphicFillGood />             <!-- 좋음 😊 -->
<GraphicFillNormal />           <!-- 보통 🙂 -->
<GraphicFillBad />              <!-- 나쁨 😠 -->
<GraphicFillWorry />            <!-- 걱정 😟 -->
<GraphicFillFirework />         <!-- 불꽃 🎉 -->

<!-- 정책/규정 -->
<GraphicFillCopyright />        <!-- 저작권 -->
<GraphicFillPolitics />         <!-- 정책 -->
<GraphicFillPolitics1 />        <!-- 정책 1 -->
<GraphicFillPolitics2 />        <!-- 정책 2 -->
<GraphicFillPoliticsGray />     <!-- 정책 (비활성) -->
<GraphicFillCharges />          <!-- 요금/청구 -->

<!-- 경고/안내 -->
<GraphicFillWarning />          <!-- 경고 (컬러) ⚠️ -->
<GraphicFillWarningGray />      <!-- 경고 (회색) -->
<GraphicFillQnA />              <!-- Q&A -->
<GraphicFillQnA1 />             <!-- Q&A 1 -->
<GraphicFillQnA2 />             <!-- Q&A 2 -->
```

> ⚠️ Graphic > Empty 섹션은 추후 확인 예정

### 5-2. Graphic Empty (빈 상태 일러스트, stroke 2px)
> OGQ 라이브러리 내에서 사용되는 일러스트형 아이콘. stroke 굵기 2px.
> Graphic Fill과 달리 **`size` prop으로 크기 조절 가능**.
> 빈 상태(empty state) UI에서 사용.

```vue
<!-- Props -->
<!-- size : number — 그래픽 크기(px), 기본값 60 -->

<!-- 지원 사이즈 -->
<GraphicEmptyWarning :size="32" />
<GraphicEmptyWarning :size="48" />
<GraphicEmptyWarning :size="60" />    <!-- 기본 -->
<GraphicEmptyWarning :size="80" />
<GraphicEmptyWarning :size="120" />

<!-- 전체 목록 (3종) -->
<GraphicEmptyWarning :size="80" />   <!-- 경고/주의 (느낌표 원형) -->
<GraphicEmptyImage   :size="80" />   <!-- 이미지 없음 -->
<GraphicEmptyComment :size="80" />   <!-- 댓글/메시지 없음 -->
```



### 버튼 계층
```
Primary Button  → 주요 CTA            color: --color-primary-500
Secondary       → 보조 액션
TextButton      → 인라인 텍스트 링크형
IconButton Dim  → 배경 있는 아이콘 버튼 (FAB, 이미지 오버레이)
IconButton Outline → 테두리형
IconButton Shadow  → 그림자형
```

### IconButtonDim ✅ Storybook 확인 완료
> 어두운 반투명 배경의 원형 아이콘 버튼. 주로 FAB(Floating Action Button) 또는 이미지 위 오버레이 버튼으로 사용.

```vue
<!-- Props -->
<!-- size     : "24" | "32" | "48" (기본 "48") ※ 40 사이즈 없음 -->
<!-- disabled : boolean (기본 false) -->

<!-- Size별 버튼/아이콘 크기 -->
<!-- 48 → 버튼 48px / 아이콘 20px -->
<!-- 32 → 버튼 32px / 아이콘 16px -->
<!-- 24 → 버튼 24px / 아이콘 12px -->

<!-- 기본 사용법 (default 슬롯에 아이콘 컴포넌트 삽입) -->
<IconButtonDim size="48">
  <IconActHeartWhite :size="20" />
</IconButtonDim>

<!-- disabled -->
<IconButtonDim size="48" disabled>
  <IconActHeartWhite :size="20" />
</IconButtonDim>

<!-- On Image 패턴 (이미지 우상단 오버레이) -->
<div style="position: relative; width: 300px; height: 200px; border-radius: 12px; overflow: hidden;">
  <img src="..." style="width: 100%; height: 100%; object-fit: cover;" />
  <div style="position: absolute; top: 12px; right: 12px;">
    <IconButtonDim size="32">
      <IconActHeartWhite :size="16" />
    </IconButtonDim>
  </div>
</div>
```
> **States**: default → hover(배경 더 어두워짐) → disabled
> **Events**: `@click` (MouseEvent)

### IconButtonOutline ✅ Storybook 확인 완료
> 테두리가 있는 원형 아이콘 버튼.
> ⚠️ **click 이벤트는 '좋아요' 기능에만 적용**되어 있습니다.

```vue
<!-- Props -->
<!-- size     : "24" | "32" | "40" | "48" (기본 "48") -->
<!-- disabled : boolean (기본 false) -->

<!-- Size별 버튼/아이콘 크기 -->
<!-- 48 → 버튼 48px / 아이콘 20px -->
<!-- 40 → 버튼 40px / 아이콘 18px -->
<!-- 32 → 버튼 32px / 아이콘 16px -->
<!-- 24 → 버튼 24px / 아이콘 12px -->

<!-- 기본 사용법 -->
<IconButtonOutline size="48">
  <IconActHeartBlack :size="20" />
</IconButtonOutline>

<!-- Active 상태 (좋아요 활성화) -->
<IconButtonOutline size="48">
  <IconActHeartBlack :size="20" :active="true" />
</IconButtonOutline>

<!-- disabled -->
<IconButtonOutline size="48" disabled>
  <IconActHeartBlack :size="20" />
</IconButtonOutline>
```
> **States**: Default → Active Icon(아이콘에 :active="true") → Disabled
> hover: 배경색 변화 / click: scale 효과

### IconButtonShadow ✅ Storybook 확인 완료
> 그림자가 있는 원형 아이콘 버튼. 주로 FAB(Floating Action Button)에 사용.

```vue
<!-- Props -->
<!-- size     : "24" | "32" | "40" | "48" (기본 "48") -->
<!-- disabled : boolean (기본 false) -->

<!-- Size별 버튼/아이콘 크기 (Outline과 동일) -->
<!-- 48→20px / 40→18px / 32→16px / 24→12px -->

<!-- 기본 사용법 -->
<IconButtonShadow size="48">
  <IconActHeartBlack :size="20" />
</IconButtonShadow>

<!-- Active 상태 -->
<IconButtonShadow size="48">
  <IconActHeartBlack :size="20" :active="true" />
</IconButtonShadow>

<!-- disabled -->
<IconButtonShadow size="48" disabled>
  <IconActHeartBlack :size="20" />
</IconButtonShadow>
```
> **States**: Default → Active Icon → Disabled
> hover: 그림자 강화 / click: scale 효과

### ButtonOutline ✅ Storybook 확인 완료
> 테두리만 있는 투명 배경 버튼 컴포넌트.

```vue
<!-- Props -->
<!-- shape     : "box" | "capsule" (기본 "box") -->
<!--   box     : 사각형 버튼 (border-radius: 4px), sizes: 32~64 -->
<!--   capsule : 완전히 둥근 버튼, sizes: 32~48 -->
<!-- hierarchy : "primary" | "secondary" (기본 "primary") -->
<!--   primary   : 확인 버튼 역할 -->
<!--   secondary : 이미지/dim 위에 노출 시. Box=인풋 전환 버튼, Capsule=일반 보조 -->
<!-- size      : "32" | "40" | "48" | "56" | "64" (기본 "48") -->
<!--   ※ capsule은 32/40/48만 지원 -->
<!-- disabled  : boolean (기본 false) -->
<!-- loading   : boolean (기본 false) — 로딩 시 ··· 표시 -->
<!-- stretch   : boolean (기본 false) — 전체 너비 사용 -->

<!-- Size별 폰트 크기 (box 기준) -->
<!-- 64 → height 64px, font 18px (box only) -->
<!-- 56 → height 56px, font 16px (box only) -->
<!-- 48 → height 48px, font 14px -->
<!-- 40 → height 40px, font 14px -->
<!-- 32 → height 32px, font 12px -->

<!-- 기본 사용법 -->
<ButtonOutline hierarchy="primary" shape="box" size="48" />

<!-- 캡슐형 -->
<ButtonOutline hierarchy="primary" shape="capsule" size="48" />

<!-- 상태 -->
<ButtonOutline hierarchy="primary" disabled>Primary Disabled</ButtonOutline>
<ButtonOutline hierarchy="primary" loading>Primary Loading</ButtonOutline>

<!-- 아이콘 포함 (#icon 슬롯 사용) -->
<ButtonOutline hierarchy="primary">
  <template #icon>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </template>
  Add Item
</ButtonOutline>

<!-- 전체 너비 -->
<ButtonOutline hierarchy="primary" :stretch="true">Full Width</ButtonOutline>

<!-- Events -->
<!-- @click : MouseEvent -->
```
> **secondary는 어두운 배경에서 사용** — `<div style="background: #333">` 위에 배치

### 칩(Chip) 용도 구분
```
ChipFilter  → 카테고리·필터 선택
ChipFollow  → 팔로우·구독 상태 표시
ChipInput   → 입력 후 태그 생성
ChipTag     → 읽기 전용 태그 표시
```

### Checkbox 3종
```vue
<!-- CheckboxNumber: 체크 시 선택 순번(숫자)이 표시됨 -->
<!-- 복수 항목을 순서대로 선택할 때 사용 -->
<CheckboxNumber
  v-model:checked="checked"
  :disabled="false"
  :number="1"
  :size="20"
/>

<!-- CheckboxRound: 원형 체크박스 (체크 시 체크마크 표시) -->
<!-- 일반적인 단일/복수 선택에 사용 -->
<CheckboxRound
  v-model:checked="checked"
  :disabled="false"
  :size="20"
/>

<!-- CheckboxSquare: 사각형 체크박스 (다중 선택 가능한 옵션에 사용) -->
<!-- prop: v-model:checked (boolean), disabled, size -->
<!-- 지원 사이즈: Small(16) / Medium(20) / Large(24) -->
<CheckboxSquare v-model:checked="checked" :disabled="false" :size="20" />
<CheckboxSquare :checked="true"  :disabled="false" :size="16" />   <!-- Small -->
<CheckboxSquare :checked="true"  :disabled="false" :size="20" />   <!-- Medium (기본) -->
<CheckboxSquare :checked="true"  :disabled="false" :size="24" />   <!-- Large -->
```

> **공통 States**: checked(true/false) × disabled(true/false) 2×2 조합으로 4가지 상태
> **이벤트**: `@update:checked` — boolean 반환

---

## 5. 타이포그래피 & 스페이싱

> ⚠️ Storybook Typography 페이지 미확인. 추후 스크린샷 추가 시 업데이트 예정.
> 아래는 OGQ UI 관찰 기반 추정값.

```css
:root {
  --font-primary: 'Pretendard', 'Noto Sans KR', sans-serif;
  --font-weight-regular:  400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;
}
```

---

## 6. 아직 확인이 필요한 항목

> 스크린샷 추가 제공 시 이 파일을 업데이트할 것.

- [ ] Typography 상세 (폰트명, 사이즈 스케일, line-height)
- [ ] 스페이싱 토큰 (4px 기반 여부 등)
- [ ] 그림자(Shadow/Elevation) 토큰
- [ ] 반응형 브레이크포인트
- [ ] Graphic 컴포넌트 에셋 목록
- [x] Iconography — Mini / Navi / Noti / ProjectBadge / SNS 완료 ✅
- [ ] Badge 전체 variants
- [ ] Button 전체 사이즈 & states
- [ ] Input states (default / focus / error / disabled)

---

## 7. 코드 작성 공통 규칙

### 네이밍 컨벤션
```
kebab-case   → 파일명            (creator-studio.jsx)
PascalCase   → React 컴포넌트   (CharacterCard.jsx)
camelCase    → 변수/함수         (fetchCharacterData)
UPPER_SNAKE  → 상수              (API_BASE_URL)
```

### CSS 변수 사용 원칙
```css
/* ✅ 올바른 방법 — 토큰 사용 */
.btn-primary { background-color: var(--color-primary-500); }
.text-error  { color: var(--color-red-300); }

/* ❌ 잘못된 방법 — 하드코딩 */
.btn-primary { background-color: #32d29d; }
```

### 주석 언어
- 한국 프로젝트: 한국어 주석 우선
- 글로벌 공개 코드: 영어 주석

### UX 텍스트 톤 (해요체 기준)
```
빈 상태  → "아직 아무것도 없어요. 첫 번째를 만들어볼까요? ✨"
성공     → "완료되었어요! 🎉"
오류     → "앗, 잠깐 문제가 생겼어요. 다시 시도해주세요."
로딩     → "잠깐만요, 처리 중이에요..."
기조     → 따뜻하고 친근하되 프로페셔널 / 반말 금지 / 해요체
```

---

## 8. 업데이트 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-06 | 최초 생성 (추정값 기반) |
| 2026-03-06 | Storybook 스크린샷 5장 기반으로 실제 컬러 토큰 전면 업데이트 (Primary / Mono / Secondary / Red / Blue), 컴포넌트 목록 추가 |
