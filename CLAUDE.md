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

### 1.6 프로젝트 관리 문서

- `docs/project/roadmap.md`
  - 전체 Phase 개요 (Phase 1~N)
  - 각 Phase별 목표, 기간, 주요 기능 목록
  - Phase 간 의존성 및 주요 마일스톤
  - 리스크 & 완화 전략

- `docs/project/phase<N>-plan.md`
  - 해당 Phase의 전체 개요 및 Feature 목록
  - 개발 원칙 (UI-First Mock-Driven Development)
  - 4단계 프로세스 설명
  - Feature 간 의존성
  - 전체 타임라인
  - 각 Feature의 상세 계획은 `docs/project/features/` 참조

- `docs/project/features/f<N>-<name>.md`
  - 각 Feature의 상세 실행 계획
  - 각 Feature는 4단계 구현 절차를 따른다:
    1. **Step 1: UX Planning & Design**
       - `docs/ux/features/<name>-flow.md` 사용자 여정 정의
       - `docs/ux/features/<name>-screens.md` 화면 구조 작성
       - 인터랙션 명세
       - 관련 Command: `/ux-plan <feature-name> <feature-id>`
    2. **Step 2: Frontend Prototype with Mock**
       - Mock 데이터 생성 (`apps/web/lib/mocks/`)
       - Next.js 페이지/컴포넌트 구현 (shadcn/ui)
       - UI E2E 테스트 작성 (Mock 기반)
       - 관련 Command: `/mock-ui <feature-name> <feature-id>`
    3. **Step 3: Data Layer Design & Migration**
       - Mock 데이터 구조 → DB 스키마 변환
       - TypeORM Entity 작성
       - Migration 파일 생성 및 실행
       - 관련 Command: `/design-db <feature-name> <feature-id>`
    4. **Step 4: Backend API & Integration**
       - NestJS Controller/Service 구현
       - API E2E 테스트 작성
       - Frontend Mock → Real API 전환
       - UI E2E 테스트 (Real API) 실행
       - 관련 Command: `/implement-api <feature-name> <feature-id>`
  - 각 Feature 헤더는 다음 형식을 따른다:
    - `# F1: 인증 & 유저 관리`
    - **Feature ID**, **예상 기간**, **상태** 메타데이터 포함
    - `[status: todo]`, `[status: in_progress]`, `[status: completed]`

> ⚠ Phase 계획 문서 작성 시점:
> - **Phase 1**: 프로젝트 시작 시 roadmap.md와 함께 생성
> - **Phase 2+**: 이전 Phase 완료 직전에 상세 계획 작성
> - 각 Phase는 이전 Phase의 Feature가 모두 `completed` 상태일 때 시작
> - Feature별 상세 문서는 `docs/project/features/` 디렉토리에 별도 파일로 관리

---

## 2. Claude의 기본 작업 원칙

Claude는 이 리포지토리에서 어떤 작업이든 다음 원칙을 따른다.

### 2.1 "문서 → Plan → TDD 사이클" 순서

1. **먼저 문서 읽기**
   - 관련된 PRD / Feature Spec / Tech Spec / API / DB / 테스트 문서를 찾아 읽는다.
2. **Plan Mode로 계획 작성**
   - 코드나 파일, 명령을 실행하기 전에, 다음 내용을 포함한 계획(Plan)을 먼저 제안한다.
     - 변경 요약
     - 영향을 받는 모듈/파일/문서
     - 구현 단계 (Step 1, 2, 3…)
3. **TDD(Test-Driven Development) 사이클 적용**
   - 모든 기능 구현은 **Red-Green-Refactor 사이클**을 따른다:
     - 🔴 **RED**: 실패하는 테스트를 먼저 작성하고 실행하여 실패 확인
     - 🟢 **GREEN**: 테스트를 통과시키는 최소한의 코드 작성
     - 🔵 **REFACTOR**: 테스트는 그대로 두고 코드 품질 개선
   - 상세한 TDD 가이드는 `docs/qa/test-strategy.md` 참조
4. **사용자 동의 후 실행**
   - Plan에 대해 사용자가 "OK" 하기 전에는
     - 대규모 리팩터링
     - 마이그레이션
     - 중요한 구조 변경
     를 수행하지 않는다.

### 2.2 스펙 우선 원칙

- PRD / Feature Spec / Tech Spec과 코드가 충돌할 경우:
  - 코드를 마음대로 바꾸지 말고,
  - "어느 부분의 스펙이 현실과 안 맞는지"를 설명하고,
  - 스펙 수정 제안을 먼저 한 뒤, 사용자 동의를 얻고 코드를 변경한다.

### 2.3 작업 시작 전 프로젝트 진행 상황 확인

Claude는 새로운 세션을 시작하거나 작업을 시작하기 전에,
항상 **현재 프로젝트 진행 상황을 먼저 확인**해야 한다.

1. **세션 시작 시:**
   - `/next` 커맨드를 실행하여 현재 Phase/Feature 상태를 파악한다.
   - project-progress 스킬이 roadmap.md와 phaseN-plan.md를 분석하여
     다음 작업을 추천해준다.

2. **작업 선택:**
   - 사용자가 명시적으로 다른 작업을 요청하지 않는 한,
     project-progress가 추천한 작업을 우선적으로 진행한다.
   - 추천된 작업의 Step (1~4) 순서를 따라 진행한다.

3. **작업 완료 후:**
   - Feature의 Step을 완료했을 때, phaseN-plan.md의 해당 Feature 상태를 업데이트한다.
   - Feature 전체가 완료되면 `[status: completed]`로 변경한다.
   - Phase 전체가 완료되면 roadmap.md의 Phase 상태를 `[status: done]`으로 변경한다.

4. **상태 태그 규칙:**
   - Feature-level: `[status: todo]`, `[status: in-progress]`, `[status: completed]`
   - Phase-level: `[status: planned]`, `[status: in-progress]`, `[status: done]`

이 규칙을 통해 Claude는 항상 프로젝트의 현재 위치를 파악하고,
체계적으로 다음 작업을 진행할 수 있다.

### 2.4 Mock-First 개발 원칙

Claude는 다음 순서로 기능을 개발한다:

1. **UX 설계가 먼저** (Backend 전에 Frontend)
   - 사용자와 빠르게 검증
   - 요구사항 변경에 유연하게 대응
   - 실제 사용자 플로우를 먼저 경험

2. **Mock 데이터로 Frontend 완성**
   - 백엔드 없이 UI/UX 검증
   - Playwright로 사용자 플로우 테스트
   - 디자인 시스템 적용 확인

3. **Mock → Real API 전환 최소화**
   - API Client 레이어 분리 (`apps/web/lib/api/`)
   - Mock Provider 패턴 사용
   - 환경변수로 Mock/Real 전환

4. **Agent 자율 실행 원칙**
   - Agent는 코드 생성 → 테스트 → 검증까지 자율 수행
   - Claude는 결과 확인 후 사용자에게 보고
   - 테스트 실패 시 재시도 전략 적용
   - **중요**: Agent가 생성한 코드는 사용자 승인 후에만 다음 단계 진행

### 2.5 Command → Skill → Agent 실행 경로

이 프로젝트는 **3계층 실행 구조**를 사용한다:

#### 계층 구조
1. **Commands** (`.claude/commands/*.md`)
   - 슬래시 커맨드 (예: `/ux-plan`, `/mock-ui`, `/design-db`, `/implement-api`)
   - 사용자가 직접 실행하는 진입점
   - Feature 이름과 번호를 파라미터로 받음

2. **Skills** (`.claude/skills/*/SKILL.md`)
   - 체크리스트 기반 구현 가이드
   - 사람이 읽을 수 있는 단계별 설명
   - 예시 코드와 결정 규칙 포함

3. **Agent Prompts** (`.claude/agents/*.md`)
   - 완전 자동 실행을 위한 상세 스펙
   - Phase별 작업 순서, 에러 처리, 검증 로직
   - 향후 자율 실행용 (현재 미사용)

#### 실행 모드

**현재 (Manual Mode)**:
```
사용자: /ux-plan attendance-checkin F4
  ↓
Claude: `ux-planning-guide` 스킬 읽기
  ↓
Claude: 스킬의 체크리스트를 따라 단계별 실행
  ↓
Claude: 각 단계 완료 후 사용자 확인 요청
```

**향후 (Agent Mode)**:
```
사용자: /ux-plan attendance-checkin F4
  ↓
Claude: `.claude/agents/step1-ux-planning-agent.md` 읽기
  ↓
Claude: Agent Prompt에 따라 완전 자동 실행
  ↓
Claude: 최종 결과만 사용자에게 보고
```

#### Command 파일 구조
각 Command는 다음 구조를 따른다:
- **실행 방식**: Manual/Agent Mode 설명
- **사용 예시**: 파라미터 포함 예시
- **작업 내용**: Skill 참조 및 단계 목록
- **완료 조건**: 체크리스트

#### Skill vs Agent Prompt
- **Skill**: 사람이 읽고 따라 할 수 있는 가이드 (현재 사용)
- **Agent Prompt**: 기계가 읽고 자동 실행할 수 있는 스펙 (향후 사용)

---

## 3. 기능 단위 작업 파이프라인 (Feature Workflow)

**하나의 기능(Feature)** 을 작업할 때 Claude는 반드시 다음 4단계를 따른다.

예: "매장 관리", "근태 체크인", "급여 계산" 등 어떤 도메인에도 공통.

### 3.1 Step 1: UX Planning & Design

**목표**: 사용자 여정과 화면 구조를 정의

**입력 문서**:
- `docs/business/business-plan.md` - 비즈니스 요구사항
- `docs/product/prd-main.md` - Acceptance Criteria (AC)

**작성할 문서**:
- `docs/ux/ux-flow-main.md` - 사용자 여정 (예: 로그인 → 메인 → 상세)
- `docs/ux/screens-wireframes.md` - 각 화면의 와이어프레임 및 UI 요소
- `docs/ux/ui-theme.md` - 컬러/타이포/톤앤매너

**실행 방법**:
```bash
/ux-plan <feature-name>
```

**Agent 동작**:
- `ux-agent` 실행 (general-purpose Agent 사용)
- 입력 문서 읽기 및 분석
- 화면 플로우 검증
- AC와 화면 매핑 확인
- 완료도 보고서 생성

**완료 조건**:
- [ ] 모든 화면의 User Journey가 명확히 정의됨
- [ ] 각 화면의 주요 UI 요소가 나열됨 (버튼, 폼, 테이블 등)
- [ ] PRD의 AC가 화면에 매핑됨
- [ ] 사용자가 문서를 검토하고 승인함

---

### 3.2 Step 2: Frontend Prototype with Mock Data

**목표**: 실제 동작하는 UI를 Mock 데이터로 구현하고 검증

**입력 문서**:
- `docs/ux/ux-flow-main.md`
- `docs/ux/screens-wireframes.md`
- `docs/ux/ui-theme.md`

**자동 생성 파일**:
- `apps/web/lib/mock/<feature>.ts` - Mock 데이터 (realistic)
- `apps/web/app/<feature>/page.tsx` - Next.js 14 App Router 페이지
- `apps/web/components/<feature>/` - UI 컴포넌트 (shadcn/ui)
- `apps/web/tests/<feature>.spec.ts` - Playwright E2E 테스트

**실행 방법**:
```bash
/mock-ui <feature-name>
```

**Agent 동작**:
- `frontend-agent` 실행
- UX 문서에서 필요한 데이터 구조 추출
- Realistic한 Mock 데이터 생성
- Next.js 페이지/컴포넌트 생성 (shadcn/ui 사용)
- UI Theme 적용 (컬러, 타이포, 여백)
- Playwright E2E 테스트 작성
- `npm run dev` 실행 후 `npx playwright test` 실행
- 테스트 결과 보고

**완료 조건**:
- [ ] 모든 화면이 브라우저에서 렌더링됨
- [ ] Mock 데이터로 사용자 플로우 테스트 통과
- [ ] UI가 `ui-theme.md` 스타일 가이드를 따름
- [ ] **사용자가 UI를 검토하고 승인함** ← 중요!

---

### 3.3 Step 3: Data Layer Design & Migration

**목표**: Mock 데이터 구조를 분석해서 실제 DB 스키마 생성

**입력 파일**:
- `apps/web/lib/mock/<feature>.ts` - Mock 데이터
- `docs/tech/db-schema.md` - 기존 스키마 (있다면)

**자동 생성 파일**:
- `docs/tech/db-schema.md` - 스키마 문서 업데이트
- `apps/api/src/entities/<entity>.entity.ts` - TypeORM Entity 클래스
- `apps/api/src/migrations/<timestamp>-Add<Entity>.ts` - Migration 파일

**실행 방법**:
```bash
/design-db <feature-name>
```

**Agent 동작**:
- `database-agent` 실행
- Mock 데이터 구조 분석
- TypeScript 타입 → PostgreSQL 타입 변환
- 관계(relation) 추론 (OneToMany, ManyToOne, ManyToMany)
- TypeORM Entity 작성
- Migration 파일 생성
- `npm run migration:run` 실행
- (향후 MCP 사용) DB 스키마 검증

**완료 조건**:
- [ ] Entity 클래스 생성됨
- [ ] Migration 실행 성공
- [ ] (MCP 구축 후) DB에 테이블 존재 확인
- [ ] **사용자가 스키마를 검토하고 승인함**

---

### 3.4 Step 4: Backend API & Integration

**목표**: API를 구현하고 Frontend를 Real API에 연결

**입력 문서/파일**:
- `docs/tech/api-spec.md` - API 명세
- `apps/api/src/entities/` - Entity 클래스들
- `apps/web/lib/mock/<feature>.ts` - Frontend 요구사항

**자동 생성 파일**:
- `apps/api/src/modules/<feature>/<feature>.controller.ts`
- `apps/api/src/modules/<feature>/<feature>.service.ts`
- `apps/api/src/modules/<feature>/dto/*.dto.ts` - DTO 클래스
- `apps/api/test/e2e/<feature>.e2e-spec.ts` - API E2E 테스트
- `apps/web/lib/api/<feature>-api.ts` - Real API Client

**실행 방법**:
```bash
/implement-api <feature-name>
```

**Agent 동작**:
- `backend-agent` 실행
- API 스펙 읽기
- Controller/Service/DTO 생성
- API E2E 테스트 작성
- `npm run test:e2e` 실행 (API 테스트)
- Frontend API Client 생성
- Frontend에서 Mock → Real API로 전환
  - `lib/mock/<feature>.ts` 사용 → `lib/api/<feature>-api.ts` 사용
- `npx playwright test` 실행 (통합 테스트)
- 결과 보고

**완료 조건**:
- [ ] API E2E 테스트 모두 통과
- [ ] Frontend가 Real API 사용
- [ ] Playwright 통합 테스트 모두 통과
- [ ] **사용자가 최종 결과를 확인하고 승인함**

---

### 3.5 Feature 완료 처리

모든 Step이 완료되면:
1. `docs/project/phase<N>-plan.md`의 Feature 상태를 `[status: completed]`로 변경
2. Git commit 생성 (사용자 요청 시)
3. 다음 Feature로 진행

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

### 5.1 문서 및 프로세스 위반
- PRD/Tech Spec과 다른 방향으로 **조용히** 코드/아키텍처를 변경하는 것.
- Acceptance Criteria가 정의되지 않은 기능을 **자기 마음대로** 구현하는 것.
- 중요한 구조/스키마/인덱스 변경을, Plan/설명 없이 바로 적용하는 것.
- 보안/권한 관련 로직을, `docs/tech/security-rbac.md`와 다르게 구현하는 것.

### 5.2 TDD 원칙 위반
- **테스트 없이 기능을 추가하는 것** (RED Phase 생략)
- **실패하는 테스트를 무시하거나 주석 처리하는 것**
- **테스트 실패 확인 없이 바로 구현 시작하는 것** (RED → GREEN 단계 건너뛰기)
- **테스트와 구현을 동시에 작성하는 것** (TDD 순서 무시)
- **REFACTOR Phase에서 새 기능을 추가하는 것** (리팩터링 ≠ 기능 추가)
- **리팩터링 중 테스트가 깨졌는데 "나중에 고치자"고 넘어가는 것**
- **GREEN Phase에서 과도한 최적화나 "미래 대비" 코드를 추가하는 것**

### 5.3 TDD 안티패턴
- **"일단 구현하고 나중에 테스트 추가"** → 절대 안 됨
- **"테스트가 너무 어려워서 생략"** → 테스트하기 쉬운 설계로 변경해야 함
- **"이건 간단해서 테스트 불필요"** → 간단할수록 테스트 작성도 쉬움
- **"프로토타입이라 테스트 생략"** → 프로토타입도 TDD로 작성하면 더 빠름

---

## 6. 한 줄 요약 – 이 레포에서 Claude의 기본 행동 패턴

1. **항상 문서부터 읽는다.**
2. **항상 Plan(계획)을 먼저 제안한다.**
3. **항상 Red-Green-Refactor 사이클을 따른다.**
4. **항상 Acceptance Criteria → 실패하는 테스트 → 최소 구현 → 리팩터링 순서로 진행한다.**
5. **항상 비즈니스/제품 스펙을 우선으로 삼는다.**
6. **큰 변경은 항상 사용자에게 설명하고 동의를 구한 뒤 진행한다.**

이 규칙을 지키는 것이
"사업계획서 → 스펙 → 테스트(RED) → 구현(GREEN) → 리팩터링(REFACTOR) → 실제 서비스"라는
**TDD 기반 spec-driven 파이프라인**의 핵심이다.

