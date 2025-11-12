# F2: 매장 & 직원 관리

**Feature ID**: F2
**예상 기간**: 2.1주 (10.5일)
**상태**: `[status: todo]`
**담당 Phase**: Phase 1 MVP
**상위 문서**: `docs/project/phase1-plan.md`
**의존성**: F1 (인증 & 유저 관리) 완료 필요

---

## 개요

점주가 매장을 생성하고, 직원을 초대하며, 직원 목록을 관리하는 기능을 구현한다.

### 주요 기능

- 매장 생성 및 설정
- 직원 초대 (이메일 기반)
- 직원 목록 조회 & 상태 관리
- 매장-직원 관계 관리

---

## 관련 스펙 문서

- **PRD**: `docs/product/prd-main.md` - M2 (매장 & 직원 관리)
- **Tech Spec**: `docs/tech/tech-spec.md` - Section 3.2 (Store & Employee Module)
- **API Spec**: `docs/tech/api-spec.md` - Section 3 (Store API), Section 4 (Employee API)
- **DB Schema**: `docs/tech/db-schema.md` - Section 2.2 (stores), 2.3 (employees)

---

## Acceptance Criteria (AC)

- **AC-F2-01**: 점주가 매장 생성 시 stores 테이블에 데이터가 저장되고, 자동으로 OWNER로 연결된다
- **AC-F2-02**: 매장명 중복 허용, 다만 동일 점주가 동일 매장명 생성 시 경고 표시
- **AC-F2-03**: 직원 초대 시 이메일로 초대 링크 발송, invites 테이블에 기록
- **AC-F2-04**: 초대받은 직원이 링크 클릭 시 회원가입 후 해당 매장에 자동 참여
- **AC-F2-05**: 점주는 자신의 매장 직원 목록만 조회 가능 (RBAC)
- **AC-F2-06**: 직원 상태 변경 (ACTIVE/INACTIVE) 시 employees 테이블 업데이트
- **AC-F2-07**: 매장 삭제 시 관련 직원 관계도 CASCADE 삭제

---

## Step 1: UX Planning & Design (2일)

### 작업 내용

1. **사용자 여정(User Journey) 정의**
   - `docs/ux/features/store-flow.md` 작성
   - 점주: 매장 생성 → 직원 초대 → 목록 확인 플로우
   - 직원: 초대 링크 클릭 → 회원가입 → 매장 참여 플로우

2. **화면 구조(Screen Layout) 설계**
   - `docs/ux/features/store-screens.md` 작성
   - 화면:
     - `/stores/new`: 매장 생성 폼
     - `/stores/[id]/employees`: 직원 목록 & 초대
     - `/stores/[id]/employees/invite`: 직원 초대 폼
     - `/stores/[id]/settings`: 매장 설정

3. **인터랙션(Interaction) 명세**
   - 폼 Validation:
     - 매장명: 필수, 2~50자
     - 주소: 필수
     - 이메일: RFC 5322 형식
   - 에러 처리 및 로딩 상태

### 완료 조건

- [ ] `docs/ux/features/store-flow.md` 작성 완료
- [ ] `docs/ux/features/store-screens.md` 작성 완료
- [ ] 사용자 확인 및 승인

### 관련 Command

```
/ux-plan store-management F2
```

---

## Step 2: Frontend Prototype with Mock (3일)

### 작업 내용

1. **Mock 데이터 작성**
   - `apps/web/lib/mocks/stores.ts`
   - `apps/web/lib/mocks/employees.ts`
   - Mock Functions:
     - `mockCreateStore(data)`
     - `mockInviteEmployee(storeId, email)`
     - `mockGetEmployees(storeId)`
     - `mockUpdateEmployeeStatus(employeeId, status)`

2. **UI 컴포넌트 구현**
   - `apps/web/app/stores/new/page.tsx`
   - `apps/web/app/stores/[id]/employees/page.tsx`
   - `apps/web/components/stores/StoreForm.tsx`
   - `apps/web/components/employees/EmployeeList.tsx`
   - `apps/web/components/employees/InviteForm.tsx`

3. **UI E2E 테스트 (Mock)**
   - `apps/web/tests/e2e/f2-store-management.spec.ts`
   - 테스트 시나리오:
     - TC-F2-01: 매장 생성 → 직원 페이지 이동
     - TC-F2-02: 직원 초대 → 초대 목록 확인
     - TC-F2-03: 직원 상태 변경 → ACTIVE/INACTIVE 토글
     - TC-F2-04: 매장 설정 수정

### 완료 조건

- [ ] Mock 데이터 작성 완료
- [ ] UI 컴포넌트 구현 완료
- [ ] UI E2E 테스트 (Mock) 통과
- [ ] 사용자 확인 및 승인

### 관련 Command

```
/mock-ui store-management F2
```

---

## Step 3: Data Layer Design & Migration (2일)

### 작업 내용

1. **TypeORM Entity 작성**
   - `apps/api/src/entities/store.entity.ts`
   - `apps/api/src/entities/employee.entity.ts`
   - `apps/api/src/entities/invite.entity.ts`
   - 관계 정의:
     - User ↔ Store: ManyToMany (employees 테이블)
     - Store ↔ Employee: OneToMany
     - Store ↔ Invite: OneToMany

2. **Migration 파일 생성**
   - `apps/api/src/migrations/1699100000000-CreateStores.ts`
   - `apps/api/src/migrations/1699200000000-CreateEmployees.ts`
   - `apps/api/src/migrations/1699300000000-CreateInvites.ts`
   - 외래키 및 CASCADE 설정

3. **Migration 실행**
   - `npm run migration:run`
   - `docs/tech/db-schema.md` 업데이트

### 완료 조건

- [ ] Entity 생성 완료
- [ ] Migration 실행 성공
- [ ] `docs/tech/db-schema.md` 업데이트

### 관련 Command

```
/design-db store-management F2
```

---

## Step 4: Backend API & Integration (3.5일)

### 작업 내용

1. **DTO 클래스 작성**
   - `apps/api/src/modules/stores/dto/create-store.dto.ts`
   - `apps/api/src/modules/stores/dto/update-store.dto.ts`
   - `apps/api/src/modules/stores/dto/invite-employee.dto.ts`

2. **Service 구현**
   - `apps/api/src/modules/stores/stores.service.ts`
   - `apps/api/src/modules/stores/employees.service.ts`
   - `apps/api/src/modules/stores/invites.service.ts`
   - 메서드:
     - `createStore(userId, dto)`
     - `inviteEmployee(storeId, email)`
     - `getEmployees(storeId)`
     - `updateEmployeeStatus(employeeId, status)`

3. **Controller 구현**
   - `apps/api/src/modules/stores/stores.controller.ts`
   - `apps/api/src/modules/stores/employees.controller.ts`
   - 엔드포인트:
     - `POST /stores`: 매장 생성
     - `GET /stores/:id/employees`: 직원 목록
     - `POST /stores/:id/employees/invite`: 직원 초대
     - `PATCH /employees/:id/status`: 직원 상태 변경

4. **API E2E 테스트**
   - `apps/api/test/e2e/stores.e2e-spec.ts`
   - AC별 테스트 케이스 (AC-F2-01 ~ AC-F2-07)

5. **Frontend Real API Integration**
   - `apps/web/lib/api/stores-client.ts`
   - `apps/web/lib/api/employees-client.ts`
   - Mock → Real API 교체

6. **UI E2E 테스트 (Real API)**
   - `NEXT_PUBLIC_USE_MOCK_API=false`
   - `npx playwright test apps/web/tests/e2e/f2-store-management.spec.ts`

### 완료 조건

- [ ] Backend API 구현 완료
- [ ] API E2E 테스트 통과
- [ ] Frontend Real API 통합 완료
- [ ] UI E2E 테스트 (Real API) 통과
- [ ] `docs/tech/api-spec.md` 업데이트

### 관련 Command

```
/implement-api store-management F2
```

---

## 테스트 전략

| AC ID | 설명 | API E2E | UI E2E |
|-------|------|---------|--------|
| AC-F2-01 | 매장 생성 시 DB 저장 | `stores.e2e-spec.ts::should create store` | `f2-store-management.spec.ts::TC-F2-01` |
| AC-F2-02 | 매장명 중복 허용 | `stores.e2e-spec.ts::should allow duplicate name` | - |
| AC-F2-03 | 직원 초대 이메일 발송 | `stores.e2e-spec.ts::should send invite email` | `f2-store-management.spec.ts::TC-F2-02` |
| AC-F2-04 | 초대 링크로 매장 참여 | `stores.e2e-spec.ts::should join store via invite` | - |
| AC-F2-05 | RBAC 직원 목록 접근 | `stores.e2e-spec.ts::should restrict access` | - |
| AC-F2-06 | 직원 상태 변경 | `stores.e2e-spec.ts::should update status` | `f2-store-management.spec.ts::TC-F2-03` |
| AC-F2-07 | CASCADE 삭제 | `stores.e2e-spec.ts::should cascade delete` | - |

---

## Feature 완료 조건

- [ ] Step 1~4 모두 완료
- [ ] 모든 AC (AC-F2-01 ~ AC-F2-07) 검증 완료
- [ ] API E2E 테스트 통과
- [ ] UI E2E 테스트 (Mock & Real) 통과
- [ ] 문서 업데이트 완료
- [ ] 사용자 최종 승인

---

## 참조 문서

- **상위 계획**: `docs/project/phase1-plan.md`
- **F1 인증**: `docs/project/features/f1-auth.md`
- **PRD**: `docs/product/prd-main.md`
- **Tech Spec**: `docs/tech/tech-spec.md`
- **API Spec**: `docs/tech/api-spec.md`

---

**Last Updated**: 2025-11-12
**Status**: `[status: todo]`
**Next Step**: F1 완료 후 Step 1 시작
