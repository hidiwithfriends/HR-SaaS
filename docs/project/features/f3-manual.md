# F3: 5분 매뉴얼

**Feature ID**: F3
**예상 기간**: 4.2주 (21일)
**상태**: `[status: todo]`
**담당 Phase**: Phase 1 MVP
**상위 문서**: `docs/project/phase1-plan.md`
**의존성**: F2 (매장 & 직원 관리) 완료 필요

---

## 개요

점주가 5분 이내에 학습 가능한 매뉴얼을 작성하고, 직원에게 할당하며, 직원이 체크리스트를 완료하면 스킬 배지를 자동 부여하는 기능을 구현한다.

### 주요 기능

- 매뉴얼 생성 (제목, 내용, 체크리스트)
- 매뉴얼 직원 할당
- 직원 매뉴얼 학습 & 체크리스트 완료
- 스킬 배지 자동 부여
- 학습 진행률 대시보드

---

## 관련 스펙 문서

- **PRD**: `docs/product/prd-main.md` - M3 (5분 매뉴얼 시스템)
- **Tech Spec**: `docs/tech/tech-spec.md` - Section 3.3 (Manual Module)
- **API Spec**: `docs/tech/api-spec.md` - Section 5 (Manual API)
- **DB Schema**: `docs/tech/db-schema.md` - Section 2.4 (manuals, skills)
- **Business Plan**: `docs/business/business-plan.md` - 5분 매뉴얼 전략

---

## Acceptance Criteria (AC)

- **AC-F3-01**: 점주가 매뉴얼 생성 시 manuals 테이블에 저장, 체크리스트는 JSON 배열로 저장
- **AC-F3-02**: 매뉴얼 직원 할당 시 manual_assignments 테이블에 기록, 상태는 'ASSIGNED'
- **AC-F3-03**: 직원이 매뉴얼 학습 시작 시 상태 'IN_PROGRESS'로 변경, started_at 기록
- **AC-F3-04**: 직원이 모든 체크리스트 완료 시 상태 'COMPLETED', completed_at 기록
- **AC-F3-05**: 매뉴얼 완료 시 연결된 스킬이 user_skills 테이블에 자동 추가
- **AC-F3-06**: 학습 진행률은 (완료한 체크리스트 수 / 전체 체크리스트 수) * 100으로 계산
- **AC-F3-07**: 점주는 자신의 매장 매뉴얼만 조회/수정 가능 (RBAC)
- **AC-F3-08**: 직원은 자신에게 할당된 매뉴얼만 조회/학습 가능 (RBAC)

---

## Step 1: UX Planning & Design (3일)

### 작업 내용

1. **사용자 여정(User Journey) 정의**
   - `docs/ux/features/manual-flow.md` 작성
   - 점주: 매뉴얼 생성 → 체크리스트 추가 → 직원 할당 플로우
   - 직원: 매뉴얼 목록 → 학습 시작 → 체크리스트 완료 → 스킬 배지 획득 플로우

2. **화면 구조(Screen Layout) 설계**
   - `docs/ux/features/manual-screens.md` 작성
   - 화면:
     - `/stores/[id]/manuals`: 매뉴얼 목록 (점주)
     - `/stores/[id]/manuals/new`: 매뉴얼 생성 폼
     - `/stores/[id]/manuals/[manualId]`: 매뉴얼 상세 & 할당
     - `/manuals/my`: 내 매뉴얼 목록 (직원)
     - `/manuals/[id]/learn`: 매뉴얼 학습 화면 (직원)

3. **인터랙션(Interaction) 명세**
   - 체크리스트 동적 추가/삭제 UI
   - 학습 진행률 프로그레스 바
   - 스킬 배지 애니메이션

### 완료 조건

- [ ] `docs/ux/features/manual-flow.md` 작성 완료
- [ ] `docs/ux/features/manual-screens.md` 작성 완료
- [ ] 사용자 확인 및 승인

### 관련 Command

```
/ux-plan manual F3
```

---

## Step 2: Frontend Prototype with Mock (7일)

### 작업 내용

1. **Mock 데이터 작성**
   - `apps/web/lib/mocks/manuals.ts`
   - `apps/web/lib/mocks/manual-assignments.ts`
   - `apps/web/lib/mocks/skills.ts`
   - Mock Functions:
     - `mockCreateManual(storeId, data)`
     - `mockAssignManual(manualId, employeeIds)`
     - `mockStartLearning(manualId)`
     - `mockCompleteChecklist(manualId, checklistIndex)`
     - `mockGetMyManuals(userId)`
     - `mockGetProgress(manualId, userId)`

2. **UI 컴포넌트 구현**
   - `apps/web/app/stores/[id]/manuals/page.tsx`
   - `apps/web/app/stores/[id]/manuals/new/page.tsx`
   - `apps/web/app/manuals/my/page.tsx`
   - `apps/web/app/manuals/[id]/learn/page.tsx`
   - `apps/web/components/manuals/ManualForm.tsx`
   - `apps/web/components/manuals/ManualCard.tsx`
   - `apps/web/components/manuals/ChecklistProgress.tsx`
   - `apps/web/components/manuals/SkillBadge.tsx`

3. **UI E2E 테스트 (Mock)**
   - `apps/web/tests/e2e/f3-manual.spec.ts`
   - 테스트 시나리오:
     - TC-F3-01: 매뉴얼 생성 → 체크리스트 추가
     - TC-F3-02: 직원 할당 → 할당 목록 확인
     - TC-F3-03: 학습 시작 → 진행률 0%
     - TC-F3-04: 체크리스트 완료 → 진행률 100% → 스킬 배지 획득

### 완료 조건

- [ ] Mock 데이터 작성 완료
- [ ] UI 컴포넌트 구현 완료
- [ ] UI E2E 테스트 (Mock) 통과
- [ ] 사용자 확인 및 승인

### 관련 Command

```
/mock-ui manual F3
```

---

## Step 3: Data Layer Design & Migration (4일)

### 작업 내용

1. **TypeORM Entity 작성**
   - `apps/api/src/entities/manual.entity.ts`
   - `apps/api/src/entities/manual-assignment.entity.ts`
   - `apps/api/src/entities/manual-completion.entity.ts`
   - `apps/api/src/entities/skill.entity.ts`
   - `apps/api/src/entities/user-skill.entity.ts`
   - 관계:
     - Manual ↔ Store: ManyToOne
     - Manual ↔ ManualAssignment: OneToMany
     - Manual ↔ Skill: ManyToOne
     - User ↔ UserSkill: OneToMany

2. **Migration 파일 생성**
   - `apps/api/src/migrations/1699400000000-CreateManuals.ts`
   - `apps/api/src/migrations/1699500000000-CreateSkills.ts`
   - `apps/api/src/migrations/1699600000000-CreateManualAssignments.ts`
   - ENUM 타입:
     ```sql
     CREATE TYPE assignment_status AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');
     ```

3. **Migration 실행**
   - `npm run migration:run`
   - `docs/tech/db-schema.md` 업데이트

### 완료 조건

- [ ] Entity 생성 완료
- [ ] Migration 실행 성공
- [ ] `docs/tech/db-schema.md` 업데이트

### 관련 Command

```
/design-db manual F3
```

---

## Step 4: Backend API & Integration (7일)

### 작업 내용

1. **DTO 클래스 작성**
   - `apps/api/src/modules/manuals/dto/create-manual.dto.ts`
   - `apps/api/src/modules/manuals/dto/update-manual.dto.ts`
   - `apps/api/src/modules/manuals/dto/assign-manual.dto.ts`
   - `apps/api/src/modules/manuals/dto/complete-checklist.dto.ts`

2. **Service 구현**
   - `apps/api/src/modules/manuals/manuals.service.ts`
   - `apps/api/src/modules/manuals/assignments.service.ts`
   - `apps/api/src/modules/manuals/skills.service.ts`
   - 비즈니스 로직:
     - 진행률 계산 알고리즘
     - 스킬 자동 부여 로직
     - RBAC 검증

3. **Controller 구현**
   - `apps/api/src/modules/manuals/manuals.controller.ts`
   - 엔드포인트:
     - `POST /stores/:id/manuals`: 매뉴얼 생성
     - `GET /stores/:id/manuals`: 매뉴얼 목록
     - `POST /manuals/:id/assign`: 직원 할당
     - `POST /manuals/:id/start`: 학습 시작
     - `POST /manuals/:id/complete-checklist`: 체크리스트 완료
     - `GET /manuals/my`: 내 매뉴얼 (직원)
     - `GET /manuals/:id/progress`: 진행률 조회

4. **API E2E 테스트**
   - `apps/api/test/e2e/manuals.e2e-spec.ts`
   - AC별 테스트 케이스 (AC-F3-01 ~ AC-F3-08)

5. **Frontend Real API Integration**
   - `apps/web/lib/api/manuals-client.ts`
   - Mock → Real API 교체

6. **UI E2E 테스트 (Real API)**
   - `npx playwright test apps/web/tests/e2e/f3-manual.spec.ts`

### 완료 조건

- [ ] Backend API 구현 완료
- [ ] API E2E 테스트 통과
- [ ] Frontend Real API 통합 완료
- [ ] UI E2E 테스트 (Real API) 통과
- [ ] `docs/tech/api-spec.md` 업데이트

### 관련 Command

```
/implement-api manual F3
```

---

## 테스트 전략

| AC ID | 설명 | API E2E | UI E2E |
|-------|------|---------|--------|
| AC-F3-01 | 매뉴얼 생성 | `manuals.e2e-spec.ts::should create manual` | `f3-manual.spec.ts::TC-F3-01` |
| AC-F3-02 | 직원 할당 | `manuals.e2e-spec.ts::should assign to employees` | `f3-manual.spec.ts::TC-F3-02` |
| AC-F3-03 | 학습 시작 | `manuals.e2e-spec.ts::should start learning` | `f3-manual.spec.ts::TC-F3-03` |
| AC-F3-04 | 체크리스트 완료 | `manuals.e2e-spec.ts::should complete` | `f3-manual.spec.ts::TC-F3-04` |
| AC-F3-05 | 스킬 자동 부여 | `manuals.e2e-spec.ts::should grant skill` | `f3-manual.spec.ts::TC-F3-04` |
| AC-F3-06 | 진행률 계산 | `manuals.e2e-spec.ts::should calculate progress` | - |
| AC-F3-07 | 점주 RBAC | `manuals.e2e-spec.ts::should restrict owner access` | - |
| AC-F3-08 | 직원 RBAC | `manuals.e2e-spec.ts::should restrict employee access` | - |

---

## Feature 완료 조건

- [ ] Step 1~4 모두 완료
- [ ] 모든 AC (AC-F3-01 ~ AC-F3-08) 검증 완료
- [ ] API E2E 테스트 통과
- [ ] UI E2E 테스트 (Mock & Real) 통과
- [ ] 문서 업데이트 완료
- [ ] 사용자 최종 승인

---

## 참조 문서

- **상위 계획**: `docs/project/phase1-plan.md`
- **F2 매장 관리**: `docs/project/features/f2-store-management.md`
- **Business Plan**: `docs/business/business-plan.md`
- **PRD**: `docs/product/prd-main.md`
- **Tech Spec**: `docs/tech/tech-spec.md`

---

**Last Updated**: 2025-11-12
**Status**: `[status: todo]`
**Next Step**: F2 완료 후 Step 1 시작
