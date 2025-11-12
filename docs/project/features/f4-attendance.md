# F4: 출퇴근 기록

**Feature ID**: F4
**예상 기간**: 3.3주 (16.5일)
**상태**: `[status: todo]`
**담당 Phase**: Phase 1 MVP
**상위 문서**: `docs/project/phase1-plan.md`
**의존성**: F2 (매장 & 직원 관리) 완료 필요

---

## 개요

직원이 GPS 기반으로 출퇴근을 체크인/체크아웃하고, 근무 시간이 자동 계산되며, 점주가 출퇴근 기록을 조회하고 통계를 확인하는 기능을 구현한다.

### 주요 기능

- GPS 기반 출근 체크인
- 퇴근 체크아웃
- 근무 시간 자동 계산
- 출퇴근 기록 조회 (일별/주별/월별)
- 근무 통계 대시보드

---

## 관련 스펙 문서

- **PRD**: `docs/product/prd-main.md` - M4 (출퇴근 기록 시스템)
- **Tech Spec**: `docs/tech/tech-spec.md` - Section 3.4 (Attendance Module)
- **API Spec**: `docs/tech/api-spec.md` - Section 6 (Attendance API)
- **DB Schema**: `docs/tech/db-schema.md` - Section 2.5 (attendance_records)

---

## Acceptance Criteria (AC)

- **AC-F4-01**: 직원이 출근 체크인 시 attendance_records에 기록, check_in_time 저장, GPS 좌표 저장
- **AC-F4-02**: GPS 좌표가 매장 위치 50m 이내인지 검증, 벗어나면 에러 반환
- **AC-F4-03**: 퇴근 체크아웃 시 check_out_time 저장, 근무 시간(work_duration) 자동 계산
- **AC-F4-04**: 근무 시간 계산: (check_out_time - check_in_time) / 60 (분 단위)
- **AC-F4-05**: 같은 날 중복 체크인 시 에러 반환 (하루에 1번만 출근 가능)
- **AC-F4-06**: 체크아웃 없이 다음날 체크인 시 이전 기록은 'INCOMPLETE' 상태로 변경
- **AC-F4-07**: 점주는 자신의 매장 출퇴근 기록만 조회 가능 (RBAC)
- **AC-F4-08**: 직원은 자신의 출퇴근 기록만 조회 가능 (RBAC)
- **AC-F4-09**: 월별 통계: 총 근무 일수, 총 근무 시간, 평균 근무 시간 계산

---

## Step 1: UX Planning & Design (2일)

### 작업 내용

1. **사용자 여정(User Journey) 정의**
   - `docs/ux/features/attendance-flow.md` 작성
   - 직원: 앱 열기 → 출근 버튼 → GPS 권한 요청 → 위치 검증 → 체크인 완료
   - 직원: 퇴근 버튼 → 체크아웃 → 근무 시간 표시
   - 점주: 출퇴근 기록 조회 → 일별/주별/월별 필터링 → 통계 확인

2. **화면 구조(Screen Layout) 설계**
   - `docs/ux/features/attendance-screens.md` 작성
   - 화면:
     - `/attendance/check-in`: 출근 체크인 화면 (큰 버튼 + 지도)
     - `/attendance/check-out`: 퇴근 체크아웃 화면
     - `/attendance/my-records`: 내 출퇴근 기록 (직원)
     - `/stores/[id]/attendance/records`: 전체 출퇴근 기록 (점주)
     - `/stores/[id]/attendance/stats`: 근무 통계 대시보드

3. **인터랙션(Interaction) 명세**
   - GPS 권한 요청 플로우
   - 위치 검증 중 로딩 애니메이션
   - 체크인 성공 시 햅틱 피드백 + 애니메이션

### 완료 조건

- [ ] `docs/ux/features/attendance-flow.md` 작성 완료
- [ ] `docs/ux/features/attendance-screens.md` 작성 완료
- [ ] 사용자 확인 및 승인

### 관련 Command

```
/ux-plan attendance F4
```

---

## Step 2: Frontend Prototype with Mock (5일)

### 작업 내용

1. **Mock 데이터 작성**
   - `apps/web/lib/mocks/attendance.ts`
   - Mock Functions:
     - `mockCheckIn(storeId, gpsCoords)`
     - `mockCheckOut(recordId)`
     - `mockGetMyRecords(userId, dateRange)`
     - `mockGetStoreRecords(storeId, dateRange)`
     - `mockGetMonthlyStats(storeId, month)`
   - Mock GPS 좌표 검증 로직

2. **UI 컴포넌트 구현**
   - `apps/web/app/attendance/check-in/page.tsx`
   - `apps/web/app/attendance/check-out/page.tsx`
   - `apps/web/app/attendance/my-records/page.tsx`
   - `apps/web/app/stores/[id]/attendance/records/page.tsx`
   - `apps/web/app/stores/[id]/attendance/stats/page.tsx`
   - `apps/web/components/attendance/CheckInButton.tsx`
   - `apps/web/components/attendance/RecordsList.tsx`
   - `apps/web/components/attendance/StatsCard.tsx`
   - GPS API 연동 (Geolocation API)

3. **UI E2E 테스트 (Mock)**
   - `apps/web/tests/e2e/f4-attendance.spec.ts`
   - 테스트 시나리오:
     - TC-F4-01: 출근 체크인 → GPS 권한 → 위치 검증 → 성공
     - TC-F4-02: GPS 범위 초과 → 에러 표시
     - TC-F4-03: 퇴근 체크아웃 → 근무 시간 표시
     - TC-F4-04: 내 기록 조회 → 일별 목록
     - TC-F4-05: 월별 통계 → 총 근무 시간 표시

### 완료 조건

- [ ] Mock 데이터 작성 완료
- [ ] UI 컴포넌트 구현 완료
- [ ] GPS 연동 완료
- [ ] UI E2E 테스트 (Mock) 통과
- [ ] 사용자 확인 및 승인

### 관련 Command

```
/mock-ui attendance F4
```

---

## Step 3: Data Layer Design & Migration (3일)

### 작업 내용

1. **TypeORM Entity 작성**
   - `apps/api/src/entities/attendance-record.entity.ts`
   - 필드:
     - id (UUID)
     - employee_id (FK → users.id)
     - store_id (FK → stores.id)
     - check_in_time (TIMESTAMP)
     - check_out_time (TIMESTAMP, nullable)
     - check_in_gps (JSONB: { lat, lng })
     - check_out_gps (JSONB, nullable)
     - work_duration (INT, 분 단위, nullable)
     - status (ENUM: 'ACTIVE', 'COMPLETED', 'INCOMPLETE')
     - created_at, updated_at

2. **Migration 파일 생성**
   - `apps/api/src/migrations/1699700000000-CreateAttendanceRecords.ts`
   - ENUM 타입:
     ```sql
     CREATE TYPE attendance_status AS ENUM ('ACTIVE', 'COMPLETED', 'INCOMPLETE');
     ```
   - 인덱스:
     - (employee_id, check_in_time) - 직원별 출퇴근 조회 최적화
     - (store_id, check_in_time) - 매장별 출퇴근 조회 최적화

3. **Migration 실행**
   - `npm run migration:run`
   - `docs/tech/db-schema.md` 업데이트

### 완료 조건

- [ ] Entity 생성 완료
- [ ] Migration 실행 성공
- [ ] `docs/tech/db-schema.md` 업데이트

### 관련 Command

```
/design-db attendance F4
```

---

## Step 4: Backend API & Integration (6.5일)

### 작업 내용

1. **DTO 클래스 작성**
   - `apps/api/src/modules/attendance/dto/check-in.dto.ts`
   - `apps/api/src/modules/attendance/dto/check-out.dto.ts`
   - `apps/api/src/modules/attendance/dto/get-records.dto.ts`

2. **Service 구현**
   - `apps/api/src/modules/attendance/attendance.service.ts`
   - 비즈니스 로직:
     - GPS 거리 계산 (Haversine formula)
     - 근무 시간 자동 계산
     - 중복 체크인 검증
     - 월별 통계 계산 (총 근무 일수, 총/평균 근무 시간)
   - 메서드:
     - `checkIn(userId, storeId, gpsCoords)`
     - `checkOut(recordId, gpsCoords)`
     - `getMyRecords(userId, dateRange)`
     - `getStoreRecords(storeId, dateRange)`
     - `getMonthlyStats(storeId, year, month)`

3. **Controller 구현**
   - `apps/api/src/modules/attendance/attendance.controller.ts`
   - 엔드포인트:
     - `POST /attendance/check-in`: 출근 체크인
     - `POST /attendance/:id/check-out`: 퇴근 체크아웃
     - `GET /attendance/my-records`: 내 기록 조회 (JWT Guard)
     - `GET /stores/:id/attendance/records`: 매장 출퇴근 기록 (OWNER Guard)
     - `GET /stores/:id/attendance/stats`: 월별 통계 (OWNER Guard)

4. **API E2E 테스트**
   - `apps/api/test/e2e/attendance.e2e-spec.ts`
   - AC별 테스트 케이스 (AC-F4-01 ~ AC-F4-09)
   - GPS 거리 계산 로직 테스트
   - 근무 시간 계산 로직 테스트

5. **Frontend Real API Integration**
   - `apps/web/lib/api/attendance-client.ts`
   - Mock → Real API 교체
   - GPS 좌표를 실제 API로 전송

6. **UI E2E 테스트 (Real API)**
   - `npx playwright test apps/web/tests/e2e/f4-attendance.spec.ts`

### 완료 조건

- [ ] Backend API 구현 완료
- [ ] GPS 거리 계산 검증
- [ ] API E2E 테스트 통과
- [ ] Frontend Real API 통합 완료
- [ ] UI E2E 테스트 (Real API) 통과
- [ ] `docs/tech/api-spec.md` 업데이트

### 관련 Command

```
/implement-api attendance F4
```

---

## 테스트 전략

| AC ID | 설명 | API E2E | UI E2E |
|-------|------|---------|--------|
| AC-F4-01 | 출근 체크인 저장 | `attendance.e2e-spec.ts::should check in` | `f4-attendance.spec.ts::TC-F4-01` |
| AC-F4-02 | GPS 위치 검증 | `attendance.e2e-spec.ts::should validate GPS` | `f4-attendance.spec.ts::TC-F4-02` |
| AC-F4-03 | 퇴근 체크아웃 | `attendance.e2e-spec.ts::should check out` | `f4-attendance.spec.ts::TC-F4-03` |
| AC-F4-04 | 근무 시간 계산 | `attendance.e2e-spec.ts::should calculate duration` | `f4-attendance.spec.ts::TC-F4-03` |
| AC-F4-05 | 중복 체크인 방지 | `attendance.e2e-spec.ts::should prevent duplicate` | - |
| AC-F4-06 | 미완료 기록 처리 | `attendance.e2e-spec.ts::should mark incomplete` | - |
| AC-F4-07 | 점주 RBAC | `attendance.e2e-spec.ts::should restrict owner access` | - |
| AC-F4-08 | 직원 RBAC | `attendance.e2e-spec.ts::should restrict employee access` | - |
| AC-F4-09 | 월별 통계 | `attendance.e2e-spec.ts::should calculate monthly stats` | `f4-attendance.spec.ts::TC-F4-05` |

---

## Feature 완료 조건

- [ ] Step 1~4 모두 완료
- [ ] 모든 AC (AC-F4-01 ~ AC-F4-09) 검증 완료
- [ ] GPS 거리 계산 정확도 검증
- [ ] API E2E 테스트 통과
- [ ] UI E2E 테스트 (Mock & Real) 통과
- [ ] 문서 업데이트 완료
- [ ] 사용자 최종 승인

---

## 참조 문서

- **상위 계획**: `docs/project/phase1-plan.md`
- **F2 매장 관리**: `docs/project/features/f2-store-management.md`
- **PRD**: `docs/product/prd-main.md`
- **Tech Spec**: `docs/tech/tech-spec.md`
- **API Spec**: `docs/tech/api-spec.md`
- **DB Schema**: `docs/tech/db-schema.md`

---

**Last Updated**: 2025-11-12
**Status**: `[status: todo]`
**Next Step**: F2 완료 후 Step 1 시작 (F3와 병렬 진행 가능)
