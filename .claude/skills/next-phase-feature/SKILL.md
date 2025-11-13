---
name: next-phase-feature
description: >
  docs/project/phase<N>-plan.md를 읽고,
  해당 Phase에서 [status: todo] 인 기능 중
  다음으로 구현할 기능을 추천하는 스킬.
---

# next-phase-feature

## 목적

이 스킬은 사용자가 "지금 작업 중인 Phase 번호"를 알려주면,

- `docs/project/phase<N>-plan.md` 문서에서
- 기능 헤더(F1, F2, F3 …)를 읽고
- 그 중 `[status: todo]` 인 기능들만 골라
- ID 숫자 오름차순(F1, F2, F3…) 기준으로

**다음으로 작업할 기능 1개를 추천**하는 것을 목표로 한다.

예:

- Phase 1 → `docs/project/phase1-plan.md`
- Phase 2 → `docs/project/phase2-plan.md`


## 입력

- 사용자는 프롬프트에서 자연어로 **Phase 번호**를 알려준다.

예시 입력:

- "지금 Phase 1이야. 다음 기능 골라줘."
- "Phase 2 기준으로 다음 작업 대상 기능 추천해줘."

Claude는 여기서 `phase_number`를 추출해 사용한다.

> Phase 번호를 명시하지 않으면, 기본값으로 **Phase 1**을 사용한다.


## 참조 파일 규칙

- Phase N에 대해서는 아래 파일을 읽는다.

  - `docs/project/phase<N>-plan.md`

  예:
  - Phase 1 → `docs/project/phase1-plan.md`
  - Phase 2 → `docs/project/phase2-plan.md`


## phase<N>-plan.md 헤더 형식 가정

각 기능 헤더는 다음과 같은 형식이라고 가정한다.

```text
F1. 인증 & 유저 관리 (2.4주) [status: done]
F2. 매장 & 직원 관리 (2.1주) [status: todo]
F3. 5분 매뉴얼 (4.2주) [status: todo]
F4. 출퇴근 기록 (3.3주) [status: todo]
```


## Mock-First 워크플로우 체크리스트

Feature 구현 시 다음 4단계를 따른다. (from `CLAUDE.md` Section 3)

### Step 1: UX Planning & Design

**실행 커맨드**: `/ux-plan <feature-name>`

**체크리스트**:
- [ ] PRD/Tech Spec 문서에서 해당 Feature의 AC 추출
- [ ] 사용자 여정(User Journey) 정의
- [ ] 각 화면의 주요 UI 요소 나열
- [ ] AC가 화면에 어떻게 매핑되는지 확인
- [ ] ❌ 구현 세부사항을 UX 단계에서 결정하지 않음
- [ ] ❌ DB 스키마나 API를 먼저 생각하지 않음

**생성 파일**:
- `docs/ux/features/<feature-name>-flow.md`
- `docs/ux/features/<feature-name>-screens.md`

**완료 조건**: 사용자가 UX 문서를 검토하고 승인함

---

### Step 2: Frontend Prototype with Mock Data

**실행 커맨드**: `/mock-ui <feature-name>`

**체크리스트**:
- [ ] Step 1에서 정의한 화면 구조대로 Next.js 페이지/컴포넌트 작성
- [ ] Mock 데이터 생성 (`apps/web/lib/mocks/<feature-name>.ts`)
- [ ] Mock Provider 패턴으로 API Client 분리
- [ ] `docs/ux/ui-theme.md` 스타일 가이드 준수
- [ ] Playwright E2E 테스트 작성 (Mock 데이터 기반)
- [ ] 브라우저에서 실제 사용자 플로우 수동 테스트
- [ ] ❌ Real API가 없어도 완전히 동작하는 UI 구현
- [ ] ❌ "나중에 API 연결하면 된다" 마인드

**생성 파일**:
- `apps/web/app/<feature-path>/page.tsx`
- `apps/web/components/<feature>/*.tsx`
- `apps/web/lib/mocks/<feature-name>.ts`
- `apps/web/lib/api/<feature-name>-client.ts` (Mock Provider 패턴)
- `apps/web/tests/e2e/<feature-name>.spec.ts`

**완료 조건**:
- Playwright 테스트 모두 통과
- **사용자가 브라우저에서 UI를 직접 보고 승인함**

---

### Step 3: Data Layer Design & Migration

**실행 커맨드**: `/design-db <feature-name>`

**체크리스트**:
- [ ] Step 2의 Mock 데이터 구조 분석
- [ ] TypeORM Entity 클래스 작성
- [ ] 필드/타입/관계 정의
- [ ] Migration 파일 생성
- [ ] `npm run migration:run` 실행
- [ ] (MCP 구축 후) DB에 테이블 존재 확인
- [ ] ❌ Mock 데이터와 다른 구조로 Entity 설계하지 않음
- [ ] ❌ "나중에 필요할 것 같은" 필드 추가 금지

**생성 파일**:
- `apps/api/src/entities/<feature-name>.entity.ts`
- `apps/api/src/migrations/<timestamp>-Create<FeatureName>.ts`

**완료 조건**:
- Migration 실행 성공
- **사용자가 스키마를 검토하고 승인함**

---

### Step 4: Backend API & Integration

**실행 커맨드**: `/implement-api <feature-name>`

**체크리스트**:
- [ ] `docs/tech/api-spec.md` 기반 Controller 작성
- [ ] Service 레이어 비즈니스 로직 구현
- [ ] API E2E 테스트 작성 (`apps/api/test/e2e/<feature-name>.e2e-spec.ts`)
- [ ] API E2E 테스트 모두 통과 확인
- [ ] Frontend의 Mock Provider를 Real API Provider로 전환
- [ ] 환경변수로 Mock/Real 전환 가능하도록 설정
- [ ] Playwright 통합 테스트 재실행 (Real API 사용)
- [ ] ❌ API 설계를 문서 없이 임의로 변경하지 않음
- [ ] ❌ Frontend 코드를 대폭 수정하지 않음 (Provider 전환만)

**생성 파일**:
- `apps/api/src/modules/<feature>/<feature>.controller.ts`
- `apps/api/src/modules/<feature>/<feature>.service.ts`
- `apps/api/src/modules/<feature>/dto/*.dto.ts`
- `apps/api/test/e2e/<feature-name>.e2e-spec.ts`

**완료 조건**:
- API E2E 테스트 모두 통과
- Playwright 통합 테스트 모두 통과 (Real API 사용)
- **사용자가 최종 결과를 확인하고 승인함**

---

**상세 가이드**: `CLAUDE.md` Section 3 참조

