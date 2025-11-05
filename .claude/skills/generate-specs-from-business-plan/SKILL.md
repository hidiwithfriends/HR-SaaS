---
name: generate-specs-from-business-plan
description: >
  docs/business/business-plan.md를 읽고,
  Vision One-pager, 포지셔닝/BM, PRD, Tech Spec, API Spec, DB Schema 문서를
  v0.1 초안으로 한 번에 생성할 때 사용하는 스킬.
---

# generate-specs-from-business-plan

## 목적

이 스킬은 이 레포지토리의 `docs/business/business-plan.md` 파일에 있는
사업계획서를 분석해서, 아래 6개의 문서 초안을 한 번에 생성하거나 갱신하기 위한 것이다.

생성/갱신 대상 파일:

1. `docs/business/vision-onepager.md`
2. `docs/business/positioning-bm.md`
3. `docs/product/prd-main.md`
4. `docs/tech/tech-spec.md`
5. `docs/tech/api-spec.md`
6. `docs/tech/db-schema.md`
7. `docs/ux/ux-flow-main.md`
8. `docs/ux/ui-theme.md`

이 스킬은 **사업계획서 원문을 사람이 다시 요약/정리하지 않아도**  
해당 내용을 기반으로 위 문서들을 v0.1 상태까지 자동으로 도출하는 것을 목표로 한다.

## 입력

- 별도의 인자를 받지 않는다고 가정한다.
- 항상 이 레포지토리의 `docs/business/business-plan.md`를
  최상위 비즈니스 문서로 사용한다.

## 출력 형식

반드시 아래 형식을 그대로 사용해야 한다.

    --- FILE: docs/business/vision-onepager.md
    (여기에 vision-onepager 내용)

    --- FILE: docs/business/positioning-bm.md
    (여기에 positioning-bm 내용)

    --- FILE: docs/product/prd-main.md
    (여기에 prd-main 내용)

    --- FILE: docs/tech/tech-spec.md
    (여기에 tech-spec 내용)

    --- FILE: docs/tech/api-spec.md
    (여기에 api-spec 내용)

    --- FILE: docs/tech/db-schema.md
    (여기에 db-schema 내용)

    --- FILE: docs/ux/ux-flow-main.md
    (전체 핵심 UX 플로우)

    --- FILE: docs/ux/ui-theme.md
    (브랜드 키워드, 컬러/타이포/톤 가이드)

규칙:

- `--- FILE: <경로>` 줄 바로 아래부터 해당 파일의 Markdown 내용을 쓴다.
- 각 파일 블록 사이에는 빈 줄을 최소 한 줄 이상 넣는다.
- 경로는 이 레포지토리의 루트 기준 상대 경로로 쓴다.

## 각 파일에 기대하는 내용 (요약 가이드)

- **docs/business/vision-onepager.md**
  - 서비스 비전/목적/타겟/핵심 가치 제안을 1페이지로 요약.

- **docs/business/positioning-bm.md**
  - 포지셔닝, 경쟁 비교, 차별점, BM/가격 전략 정리.

- **docs/product/prd-main.md**
  - 유저 타입, 문제 정의, 기능(MUST/SHOULD/WON'T), 유저 스토리, Acceptance Criteria.

- **docs/tech/tech-spec.md**
  - 프론트/백/DB/외부 서비스, 모듈/레이어 구조, 주요 데이터·요청 흐름.

- **docs/tech/api-spec.md**
  - 엔드포인트 목록, 요청/응답 스키마, 에러 코드.

- **docs/tech/db-schema.md**
  - 테이블/엔티티, 필드/타입/관계, 인덱스, 마이그레이션 초안.

- **docs/ux/ux-flow-main.md**
  - `docs/business/business-plan.md`의 **타겟 유저, 마케팅 메시지, 핵심 기능** 부분을 기반으로
    이 서비스에서 가장 중요한 UX 플로우를 정의한다.
  - 포함할 것:
    - 주요 유저 타입별 대표 플로우
      - 예: 점주 – 회원가입 → 매장 등록 → 첫 온보딩(매뉴얼/근무 설정) → 대시보드 확인
      - 예: 알바생 – 초대 수락 → 계정 생성 → 교육/매뉴얼 보기 → 출퇴근 기록
      - 예: 파트너 – 파트너 등록 → 점주 계정 연결 → 리포트/자문 화면 진입
    - 각 플로우를 단계별로 번호를 매겨 서술
    - 각 플로우가 왜 중요한지 한 줄 설명
  - 레이아웃이 아니라, **“유저 여정(저니)” 중심으로 작성한다.**

- **docs/ux/ui-theme.md**
  - `docs/business/business-plan.md`의 **브랜드/마케팅 메시지/타겟 고객** 부분을 기반으로
    UI 분위기와 테마 가이드를 정의한다.
  - 포함할 것:
    1. 브랜드 키워드  
       - 예: “데이터 기반”, “신뢰”, “따뜻한 상생” 등
    2. 톤 앤 매너  
       - 말투(존댓말/반존대), 문구 스타일(친근/차분/전문적 등)
    3. 색상 팔레트(개략)  
       - Primary / Secondary / Accent / Error / Background 정도
    4. 타이포그래피  
       - 제목/본문/설명용 폰트 크기, 두께, 사용 예시
    5. 레이아웃/컴포넌트 느낌  
       - 카드/버튼/입력창의 모서리 둥근 정도, 여백, 그림자 세기 등
  - 이 문서는 디자이너와 프론트엔드 개발자가 **같은 분위기로 화면을 만들 수 있게 하는 기준**을 제공해야 한다.


## 동작 방법 (에이전트 내부 지침)

1. `docs/business/business-plan.md` 전체를 읽고 서비스 비전/전략을 이해한다.
2. 그 내용을 바탕으로 위 6개 파일에 들어갈 내용을 구성한다.
3. 출력은 항상 “출력 형식” 섹션의 `--- FILE: ...` 블록들로만 한다.
4. 불필요한 설명은 줄이고, 실제 구현에 바로 사용할 수 있는 정보(유저 스토리, AC, API/DB 필드)를 우선한다.

