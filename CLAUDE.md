# CLAUDE.md – Spec-Driven Development 파이프라인 (도메인 중립 템플릿)

이 리포지토리는 **spec-driven 개발 방식**으로 서비스를 만드는 템플릿이다.  
Claude Code는 이 파일을 이 레포지토리의 **헌법(constitution)** 으로 삼고,
여기 적힌 순서를 항상 우선시해야 한다.

---
## 0. 프로젝트 컨텍스트 (프로젝트별로 채우기)

- 프로젝트 이름: BestPractice HR SaaS
- 한 줄 소개:
  - 성공하는 매장의 HR·운영 베스트 프랙티스를 모델링해서, 누구나 따라 하면 성과가 나는 자영업 HR SaaS
- 주요 유저/고객:
  - 소규모 오프라인 매장 점주 (카페, 음식점, 소매점 등)
  - 매장 알바/파트타이머 직원
  - 노무사/세무사 등 자영업 점주를 고객으로 둔 전문가 파트너
- 상위 사업계획서 위치:
  - `docs/business/business-plan.md`

Claude는 이 파일을 통해 전체 맥락을 이해해야 하며,
구현/리팩터링 시 이 방향과 충돌하는 변경은 사용자에게 먼저 제안해야 한다.

---

## 1. 문서 구조와 역할

이 프로젝트는 **문서 → 테스트 → 코드** 순서로 개발하는 것을 원칙으로 한다.  
Claude는 코드를 변경하기 전에 항상 관련 문서를 우선 확인해야 한다.

### 1.1 비즈니스 / 전략 문서

- `docs/business/business-plan.md`
  - 전체 사업계획서, 시장, BM, 로드맵 등이 포함된다.
- `docs/business/vision-onepager.md`
  - 한 페이지 요약본.
- `docs/business/positioning-bm.md`
  - 포지셔닝, 경쟁 서비스 비교, 가격/수익모델 등.

> ⚠ Claude는 이 문서를 임의로 수정하지 않는다.
> 필요하다면 “어떤 부분을 업데이트하면 좋을지” 제안만 한다.

### 1.2 제품(Product) 문서

- `docs/product/prd-main.md`
  - 전체 PRD:
    - 유저 타입
    - 문제 정의
    - 핵심 기능 (MUST / SHOULD / WON'T)
    - 주요 유저 스토리 + Acceptance Criteria
- `docs/product/feature-*.md`
  - 개별 기능에 대한 상세 스펙 (필요 시 사용)
- `docs/ux/ux-flow-main.md`
  - 전체 UX 플로우 (예: 회원가입 → 온보딩 → 핵심 화면).
- `docs/ux/screens-wireframes.md`
  - 화면별 구조/요소 설명, 와이어프레임 링크 등.
- `docs/ux/ui-theme.md`
  - 컬러, 타이포, 여백, 톤 앤 매너 등 UI 테마 가이드.
- `docs/ux/design-system.md`
  - 공통 UI 컴포넌트와 화면 패턴을 정의한다.

- UI 구현 시:
  - 컴포넌트 구조는 shadcn/ui 패턴을 따르고,
  - 색/타이포/레이아웃 토큰은 `docs/ux/ui-theme.md`를 따른다.
  - 전체적인 밀도/레이아웃/톤은 `docs/ux/design-system.md`의
    "레퍼런스 / 벤치마킹" 섹션에 명시된 서비스들을 참고하되,
    브랜드 자산을 직접 복제하지 않는다.

### 1.3 기술(Tech) 문서

- `docs/tech/tech-spec.md`
  - 전체 기술 아키텍처:
    - 프론트/백/DB/외부 서비스
    - 모듈/레이어 구조
    - 데이터/이벤트 흐름
- `docs/tech/api-spec.md`
  - API 스펙:
    - 엔드포인트, 메서드
    - 요청/응답 스키마
    - 대표 에러 코드
- `docs/tech/db-schema.md`
  - 데이터 모델/DB 스키마:
    - 테이블/컬렉션 구조
    - 필드/타입/관계
    - 마이그레이션 전략
- `docs/tech/security-rbac.md`
  - 권한 모델, 인증/인가, 민감정보 처리 정책.
- `docs/tech/architecture.md`
  - 시스템 다이어그램 설명 (텍스트 기반이어도 됨).

### 1.4 QA / 테스트 문서

- `docs/qa/test-strategy.md`
  - 테스트 전략:
    - 유닛 / 통합 / E2E / UI / 성능 테스트를 어떻게 나눌지.
- `docs/qa/test-cases-api.md`
  - 중요한 API 시나리오/케이스 목록.
- `docs/qa/test-cases-ui.md`
  - 중요한 UI 플로우(브라우저/앱) 시나리오.

### 1.5 운영 / 배포 / 법무 문서

- `docs/ops/infra-spec.md`
  - 인프라 및 네트워크 구조.
- `docs/ops/deploy-guide.md`
  - 배포 절차 (로컬→스테이징→프로덕션).
- `docs/ops/runbook.md`
  - 장애 대응, 롤백, 재시작 매뉴얼.
- `docs/ops/monitoring-alerting.md`
  - 모니터링 지표와 알람 룰.
- `docs/legal/terms-of-service.md`
- `docs/legal/privacy-policy.md`

---

## 2. Claude의 기본 작업 원칙

Claude는 이 리포지토리에서 어떤 작업이든 다음 원칙을 따른다.

### 2.1 “문서 → Plan → 테스트 → 코드” 순서

1. **먼저 문서 읽기**
   - 관련된 PRD / Feature Spec / Tech Spec / API / DB / 테스트 문서를 찾아 읽는다.
2. **Plan Mode로 계획 작성**
   - 코드나 파일, 명령을 실행하기 전에, 다음 내용을 포함한 계획(Plan)을 먼저 제안한다.
     - 변경 요약
     - 영향을 받는 모듈/파일/문서
     - 구현 단계 (Step 1, 2, 3…)
3. **사용자 동의 후 실행**
   - Plan에 대해 사용자가 “OK” 하기 전에는
     - 대규모 리팩터링
     - 마이그레이션
     - 중요한 구조 변경
     를 수행하지 않는다.

### 2.2 스펙 우선 원칙

- PRD / Feature Spec / Tech Spec과 코드가 충돌할 경우:
  - 코드를 마음대로 바꾸지 말고,
  - “어느 부분의 스펙이 현실과 안 맞는지”를 설명하고,
  - 스펙 수정 제안을 먼저 한 뒤, 사용자 동의를 얻고 코드를 변경한다.

---

## 3. 기능 단위 작업 파이프라인 (Feature Workflow)

**하나의 기능(Feature)** 을 작업할 때 Claude는 반드시 다음 단계를 따른다.

예: “자동 스케줄 생성”, “게시글 작성”, “결제 처리” 등 어떤 도메인에도 공통.

### 3.1 Step 1 – 스펙 확인 및 Acceptance Criteria 추출

1. 관련 Feature 스펙 찾기:
   - `docs/product/feature-*.md` 중 관련 문서를 찾거나,
   - 없다면 `docs/product/prd-main.md`에서 해당 기능 부분을 사용.
2. 문서에서 Acceptance Criteria(AC)를 추출한다.
   - 예: AC-01, AC-02 식으로 번호를 붙여 정리.

Claude는 나중 단계에서 **각 AC가 어떤 테스트로 검증되는지** 연결할 것이다.

### 3.2 Step 2 – 테스트 설계 & 매핑

1. 추출한 AC 목록을 보고, 각 AC를 검증할 테스트를 설계한다.
2. 테스트 파일 위치/규칙 (추천):
   - API E2E 테스트:
     - `tests/api/e2e/<feature-slug>.e2e.test.*`
   - UI/브라우저 E2E 테스트 (예: Playwright):
     - `tests/ui/specs/<feature-slug>.spec.*`
   - 유닛/도메인 테스트:
     - `tests/unit/<layer>/<logic-name>.test.*`
3. `docs/qa/test-cases-api.md` / `docs/qa/test-cases-ui.md`에  
   AC ↔ 테스트 이름 매핑을 추가하도록 사용자에게 제안한다.
   - 예: AC-01 → `user-auth.e2e.test.ts - should_login_with_valid_credentials`

> Claude가 직접 문서를 수정하지 못하는 경우,
> “이런 식으로 문서를 업데이트하면 좋겠다”라고 제안 설명만 해도 된다.

### 3.3 Step 3 – 테스트 코드 우선 작성

구현 코드 전에, 가능한 한 다음 테스트를 먼저 추가한다.

1. API E2E
   - 성공 케이스
   - 대표 실패 케이스(권한 없음, 잘못된 입력, 대상 없음 등)
2. UI E2E
   - 실제 사용자 플로우(페이지 이동, 입력, 버튼 클릭 등)를 따라가는 시나리오
3. 유닛/도메인 테스트
   - 핵심 비즈니스 로직/계산/규칙 부분을 검증하는 테스트

### 3.4 Step 4 – 실제 구현 코드 작성

테스트 준비가 되면 그때부터 실제 코드를 수정한다.

- 백엔드: `apps/api/` 또는 해당 백엔드 디렉토리
- 프론트엔드: `apps/web/` 또는 프론트 디렉토리
- 공통 모듈: `packages/shared-*` 등

구현 시에는 Plan에서 정의한 순서를 최대한 지키며 작업한다.

### 3.5 Step 5 – 테스트 실행 & 실패 처리

1. 전체 테스트 실행:
   - 예: `npm run test-all`, `pnpm test-all`, `./scripts/test-all.sh` 등
2. 실패가 발생하면 Claude는:
   - 어떤 테스트가 어떤 AC를 깨고 있는지 설명하고,
   - 고칠 코드/로직에 대해 작은 Plan을 다시 제안한 뒤,
   - 수정 후 다시 테스트를 돌리는 순서를 따른다.

---

## 4. 성능(Performance) 및 품질 관련 기본 규칙

이 섹션은 구체적인 숫자를 프로젝트별로 채워넣고 사용한다.

- 성능 목표 예시 (프로젝트별로 수정):
  - 주요 API p95 응답 시간: {{PERF_TARGET_API}} (예: 500ms 이하)
  - 핵심 화면 최초 로드 시간: {{PERF_TARGET_WEB}} (예: 2~3초 이내)
- Claude는:
  - 불필요한 N+1 쿼리를 피하고,
  - 대용량 응답은 pagination/범위 조회를 우선 고려하고,
  - 복잡한 리포트/집계는 필요 시 캐싱/사전 계산 전략을 제안한다.
- 성능 최적화가 코드/데이터 구조에 영향을 줄 경우:
  - 먼저 `docs/tech/tech-spec.md` / `docs/tech/db-schema.md` 수정 제안을 하고,
  - 사용자 동의 후 구현한다.

---

## 5. Claude가 해서는 안 되는 것

Claude는 다음 행동을 피해야 한다.

- PRD/Tech Spec과 다른 방향으로 **조용히** 코드/아키텍처를 변경하는 것.
- Acceptance Criteria가 정의되지 않은 기능을 **자기 마음대로** 구현하는 것.
- 테스트 없이 기능을 추가하거나, 실패하는 테스트를 무시/주석 처리하는 것.
- 중요한 구조/스키마/인덱스 변경을, Plan/설명 없이 바로 적용하는 것.
- 보안/권한 관련 로직을, `docs/tech/security-rbac.md`와 다르게 구현하는 것.

---

## 6. 한 줄 요약 – 이 레포에서 Claude의 기본 행동 패턴

1. **항상 문서부터 읽는다.**  
2. **항상 Plan(계획)을 먼저 제안한다.**  
3. **항상 Acceptance Criteria → 테스트 → 코드 순서로 진행한다.**  
4. **항상 비즈니스/제품 스펙을 우선으로 삼는다.**  
5. **큰 변경은 항상 사용자에게 설명하고 동의를 구한 뒤 진행한다.**

이 규칙을 지키는 것이  
“사업계획서 → 스펙 → 테스트 → 코드 → 실제 서비스”라는
spec-driven 파이프라인의 핵심이다.

