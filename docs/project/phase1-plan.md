# Phase 1 MVP 개발 계획

**버전:** v1.0
**작성일:** 2025-11-05
**목표:** MVP 출시 (회원가입/로그인 + 매장 기본 설정 + 핵심 기능 1~2개)
**예상 기간:** 12주

---

## 0. Phase 1 범위 정의

### MVP에 포함할 기능
**F1. 인증 & 유저 관리**
- 회원가입 (점주), 로그인, JWT 인증
- 역할 기반 접근 제어 (RBAC)

**F2. 매장 & 직원 관리**
- 매장 생성, 직원 초대, 직원 목록 조회

**F3. 5분 매뉴얼 (핵심 기능 1)**
- 매뉴얼 생성·조회·할당
- 직원 매뉴얼 학습 & 체크리스트 완료
- 스킬 배지 자동 부여

**F4. 출퇴근 기록 (핵심 기능 2)**
- GPS 기반 출퇴근 체크인/체크아웃
- 근무 시간 자동 계산
- 출퇴근 기록 조회

### MVP에서 제외
- AI 스케줄링 (Phase 2)
- 급여 계산 (Phase 2)
- 스케줄 관리 (Phase 2)
- 인재 매칭 (Phase 3)
- Best Practice 모델 (Phase 3)

---

## 1. 개발 원칙 (CLAUDE.md 기반)

### 1.1 작업 순서
```
1. 관련 스펙 문서 확인
2. Acceptance Criteria (AC) 추출
3. 테스트 설계 & AC 매핑
4. 테스트 코드 작성 (TDD)
5. 구현 코드 작성
6. 테스트 실행 & 검증
```

### 1.2 문서 우선
- 코드 변경 전 항상 PRD/Tech Spec/API Spec 확인
- 스펙과 충돌 시 문서 수정 제안 → 승인 후 코드 변경

### 1.3 테스트 커버리지
- API E2E 테스트: 모든 엔드포인트
- UI E2E 테스트: 주요 유저 플로우
- 유닛 테스트: 핵심 비즈니스 로직

---

## 2. Phase 1 기능별 개발 계획

---

## F1. 인증 & 유저 관리

### 관련 스펙 문서
- **PRD:** `docs/product/prd-main.md` - M1 (회원가입 & 인증)
- **Tech Spec:** `docs/tech/tech-spec.md` - Section 4 (Auth & Authorization)
- **API Spec:** `docs/tech/api-spec.md` - Section 2 (Auth API)
- **DB Schema:** `docs/tech/db-schema.md` - Section 2.1 (users 테이블)

### Acceptance Criteria (AC)
이 기능은 PRD에 명시적 AC가 없으므로 다음과 같이 정의:

- **AC-AUTH-01:** 점주가 이메일/비밀번호로 회원가입 시 users, stores 테이블에 데이터가 저장된다
- **AC-AUTH-02:** 이메일 중복 시 `EMAIL_ALREADY_EXISTS` 에러가 반환된다
- **AC-AUTH-03:** 로그인 시 유효한 JWT Access Token(24h), Refresh Token(30d)이 발급된다
- **AC-AUTH-04:** 잘못된 비밀번호 입력 시 `INVALID_CREDENTIALS` 에러가 반환된다
- **AC-AUTH-05:** OWNER 역할은 자신의 매장에만 접근 가능하다 (RBAC)

### 구현 순서

#### Step 1: DB 스키마 & 마이그레이션
**담당:** Backend
**예상 시간:** 2일

**작업:**
1. PostgreSQL 15 설치 (Docker Compose)
2. TypeORM/Prisma 설정
3. ENUM 타입 생성:
   ```sql
   CREATE TYPE user_role AS ENUM ('OWNER', 'EMPLOYEE', 'MANAGER', 'PARTNER', 'ADMIN');
   CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
   ```
4. `users` 테이블 마이그레이션 작성
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     name VARCHAR(100) NOT NULL,
     phone VARCHAR(20),
     role user_role NOT NULL,
     status user_status NOT NULL DEFAULT 'ACTIVE',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   CREATE UNIQUE INDEX idx_users_email ON users(email);
   ```
5. `stores` 테이블 마이그레이션 (F2와 공통)
6. 마이그레이션 실행 및 검증

**완료 기준:**
- `npm run migration:run` 성공
- `users`, `stores` 테이블 생성 확인

---

#### Step 2: 테스트 작성 (API E2E)
**담당:** Backend
**예상 시간:** 1일

**작업:**
1. `tests/api/e2e/auth.e2e.test.ts` 작성
2. 테스트 케이스:
   - `POST /auth/signup/owner` - 성공 케이스
   - `POST /auth/signup/owner` - 이메일 중복 에러 (409)
   - `POST /auth/login` - 성공 케이스 (JWT 토큰 반환)
   - `POST /auth/login` - 잘못된 비밀번호 (401)
   - `POST /auth/refresh` - Refresh Token으로 Access Token 갱신
3. `docs/qa/test-cases-api.md` 업데이트:
   ```markdown
   | AC | Test File | Test Name |
   |----|-----------|-----------|
   | AC-AUTH-01 | auth.e2e.test.ts | should create user and store on signup |
   | AC-AUTH-02 | auth.e2e.test.ts | should return 409 when email exists |
   | AC-AUTH-03 | auth.e2e.test.ts | should return valid JWT tokens on login |
   ```

**완료 기준:**
- 테스트 실행 시 모두 실패 (구현 전이므로)

---

#### Step 3: 백엔드 구현
**담당:** Backend
**예상 시간:** 3일

**작업:**
1. NestJS 프로젝트 초기 설정
   ```bash
   nest new apps/api
   ```
2. `apps/api/src/auth/` 모듈 구현:
   - `auth.controller.ts`: POST /auth/signup/owner, /auth/login, /auth/refresh
   - `auth.service.ts`: 회원가입/로그인 비즈니스 로직
   - `jwt.strategy.ts`: Passport.js JWT Strategy
   - DTOs: `SignupOwnerDto`, `LoginDto`
3. `apps/api/src/users/` 모듈 구현:
   - `users.service.ts`: 유저 CRUD
   - `users.repository.ts`: TypeORM Repository
4. `apps/api/src/stores/` 모듈 구현 (F2와 공통):
   - `stores.service.ts`: 매장 CRUD
5. 비밀번호 해싱: bcrypt (cost factor 12)
6. JWT 설정: Access Token 24h, Refresh Token 30d
7. RBAC Guard 구현:
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('OWNER')
   ```

**완료 기준:**
- API E2E 테스트 모두 통과
- Postman/Insomnia로 수동 테스트 성공

---

#### Step 4: 프론트엔드 구현
**담당:** Frontend
**예상 시간:** 4일

**작업:**
1. Next.js 14 프로젝트 초기 설정
   ```bash
   npx create-next-app@latest apps/web
   ```
2. 페이지 구현:
   - `pages/auth/signup.tsx`: 회원가입 폼
   - `pages/auth/login.tsx`: 로그인 폼
3. API 클라이언트:
   - `lib/api/auth.ts`: axios 기반 API 호출
4. 상태 관리:
   - Zustand 또는 Context API로 유저 상태 관리
5. JWT 토큰 관리:
   - localStorage에 Access Token 저장
   - HTTP-only 쿠키에 Refresh Token 저장 (향후)
6. 보호된 라우트:
   - `middleware.ts`: JWT 검증 미들웨어

**완료 기준:**
- 회원가입 → 로그인 → 대시보드 진입 플로우 동작

---

#### Step 5: UI E2E 테스트
**담당:** QA/Frontend
**예상 시간:** 2일

**작업:**
1. Playwright 설정
   ```bash
   npm install -D @playwright/test
   ```
2. `tests/ui/specs/auth.spec.ts` 작성:
   - 회원가입 플로우 (폼 입력 → 제출 → 성공 메시지)
   - 로그인 플로우 (이메일/비밀번호 → 대시보드 리다이렉트)
   - 이메일 중복 에러 처리
3. `docs/qa/test-cases-ui.md` 업데이트

**완료 기준:**
- Playwright 테스트 모두 통과

---

#### F1 총 예상 시간: **12일 (2.4주)**

---

## F2. 매장 & 직원 관리

### 관련 스펙 문서
- **PRD:** `docs/product/prd-main.md` - M1 (회원가입), US-01 관련
- **Tech Spec:** `docs/tech/tech-spec.md` - Section 2.1 (백엔드 모듈 구조)
- **API Spec:** `docs/tech/api-spec.md` - Section 7 (Employees API)
- **DB Schema:** `docs/tech/db-schema.md` - Section 2.2 (stores), 2.3 (employees)

### Acceptance Criteria (AC)
- **AC-STORE-01:** 회원가입 시 매장 정보(name, type, address)가 함께 저장된다
- **AC-STORE-02:** 점주는 직원 초대 링크를 생성할 수 있다
- **AC-STORE-03:** 초대 링크는 7일 후 만료된다
- **AC-STORE-04:** 직원이 초대 링크로 가입하면 해당 매장의 employees 테이블에 추가된다
- **AC-STORE-05:** 점주는 자신의 매장 직원 목록을 조회할 수 있다
- **AC-STORE-06:** 직원은 다른 매장의 직원 정보를 조회할 수 없다

### 구현 순서

#### Step 1: DB 스키마 추가
**담당:** Backend
**예상 시간:** 1일

**작업:**
1. `employees` 테이블 마이그레이션
   ```sql
   CREATE TABLE employees (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id) NOT NULL,
     store_id UUID REFERENCES stores(id) NOT NULL,
     role VARCHAR(50),
     hourly_wage INT NOT NULL,
     status employee_status NOT NULL DEFAULT 'ACTIVE',
     hired_at DATE NOT NULL,
     quit_at DATE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   CREATE INDEX idx_employees_user_id ON employees(user_id);
   CREATE INDEX idx_employees_store_id ON employees(store_id);
   ```
2. `invites` 테이블 추가 (초대 링크 관리):
   ```sql
   CREATE TABLE invites (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     store_id UUID REFERENCES stores(id) NOT NULL,
     email VARCHAR(255) NOT NULL,
     token VARCHAR(255) UNIQUE NOT NULL,
     expires_at TIMESTAMP NOT NULL,
     status invite_status NOT NULL DEFAULT 'PENDING',
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

**완료 기준:**
- 마이그레이션 성공

---

#### Step 2: 테스트 작성 (API E2E)
**담당:** Backend
**예상 시간:** 1일

**작업:**
1. `tests/api/e2e/employees.e2e.test.ts` 작성:
   - `POST /stores/:id/employees/invite` - 초대 링크 생성
   - `GET /stores/:id/employees` - 직원 목록 조회 (OWNER만)
   - `GET /stores/:id/employees` - 다른 매장 조회 시 403 에러

**완료 기준:**
- 테스트 작성 완료 (실패 상태)

---

#### Step 3: 백엔드 구현
**담당:** Backend
**예상 시간:** 3일

**작업:**
1. `apps/api/src/stores/` 모듈 확장:
   - `stores.controller.ts`: GET /stores/:id (매장 정보 조회)
2. `apps/api/src/employees/` 모듈 구현:
   - `employees.controller.ts`: POST /invite, GET /employees
   - `employees.service.ts`: 초대 링크 생성, 직원 목록 조회
3. 초대 링크 로직:
   - UUID 기반 토큰 생성
   - 만료 시간 7일 설정
   - 이메일 발송 (향후: SendGrid, 현재: 콘솔 출력)

**완료 기준:**
- API E2E 테스트 통과

---

#### Step 4: 프론트엔드 구현
**담당:** Frontend
**예상 시간:** 4일

**작업:**
1. 페이지 구현:
   - `pages/dashboard/index.tsx`: 점주 대시보드
   - `pages/dashboard/employees/index.tsx`: 직원 목록
   - `pages/dashboard/employees/invite.tsx`: 직원 초대 폼
2. 컴포넌트:
   - `components/EmployeeList.tsx`: 직원 목록 테이블
   - `components/InviteForm.tsx`: 초대 폼
3. API 연동:
   - `lib/api/employees.ts`

**완료 기준:**
- 직원 초대 → 초대 링크 생성 → 직원 목록 조회 플로우 동작

---

#### Step 5: UI E2E 테스트
**담당:** QA/Frontend
**예상 시간:** 1.5일

**작업:**
1. `tests/ui/specs/employees.spec.ts`:
   - 직원 초대 플로우
   - 직원 목록 조회

**완료 기준:**
- Playwright 테스트 통과

---

#### F2 총 예상 시간: **10.5일 (2.1주)**

---

## F3. 5분 매뉴얼 (핵심 기능 1)

### 관련 스펙 문서
- **PRD:** `docs/product/prd-main.md` - M2 (5분 매뉴얼), US-01, US-05
- **Tech Spec:** `docs/tech/tech-spec.md` - Section 3.1 (매뉴얼 생성 & 학습 흐름)
- **API Spec:** `docs/tech/api-spec.md` - Section 3 (Manuals API)
- **DB Schema:** `docs/tech/db-schema.md` - Section 2.4~2.8 (manuals, manual_checklists, manual_completions, skills, user_skills)
- **UX Flow:** `docs/ux/ux-flow-main.md` - Section 1.1 (점주: 매뉴얼 생성), Section 2.1 (알바생: 매뉴얼 학습)

### Acceptance Criteria (PRD 기반)
- **AC-01:** 점주가 "매뉴얼 생성" 버튼을 클릭하면 템플릿 선택 화면이 나타난다
- **AC-02:** 업종별 템플릿 (카페, 음식점, 소매점 등) 중 하나를 선택할 수 있다
- **AC-03:** 매뉴얼에 체크리스트 항목을 추가/수정/삭제할 수 있다
- **AC-04:** 완성된 매뉴얼을 저장하면 직원에게 자동 공유된다
- **AC-05:** 매뉴얼은 모바일에서도 동일하게 보인다
- **AC-21:** 직원은 모바일 앱에서 배정된 매뉴얼 목록을 볼 수 있다
- **AC-22:** 매뉴얼을 열면 체크리스트 항목들이 나타난다
- **AC-23:** 각 항목을 완료하면 체크 표시가 된다
- **AC-24:** 모든 항목 완료 시 스킬 배지가 자동 부여된다
- **AC-25:** 완료 상태는 점주 대시보드에 실시간 반영된다

### 구현 순서

#### Step 1: DB 스키마 추가
**담당:** Backend
**예상 시간:** 1일

**작업:**
1. `manuals`, `manual_checklists`, `manual_completions`, `skills`, `user_skills` 테이블 마이그레이션 (DB Schema 2.4~2.8 참조)
2. Seed 데이터: 기본 스킬 배지 (커피 마스터, 고객 서비스 등)

**완료 기준:**
- 마이그레이션 성공, Seed 데이터 삽입

---

#### Step 2: 테스트 작성 (API E2E)
**담당:** Backend
**예상 시간:** 2일

**작업:**
1. `tests/api/e2e/manuals.e2e.test.ts`:
   - `POST /stores/:id/manuals` - 매뉴얼 생성
   - `GET /stores/:id/manuals` - 매뉴얼 목록 조회
   - `POST /manuals/:id/assign` - 직원에게 매뉴얼 할당
   - `PATCH /manuals/:id/complete` - 매뉴얼 완료 처리 (직원)
   - 스킬 배지 자동 부여 검증

**완료 기준:**
- 테스트 작성 완료

---

#### Step 3: 백엔드 구현
**담당:** Backend
**예상 시간:** 5일

**작업:**
1. `apps/api/src/manuals/` 모듈:
   - `manuals.controller.ts`: CRUD API
   - `manuals.service.ts`: 매뉴얼 생성, 할당, 완료 로직
2. `apps/api/src/skills/` 모듈:
   - `skills.service.ts`: 스킬 배지 자동 부여 로직
   - 규칙: 특정 매뉴얼 완료 시 해당 스킬 부여
3. 체크리스트 자동 생성:
   - 업종별 템플릿 JSON 파일 (예: `templates/cafe.json`)
   - 템플릿 선택 시 자동으로 체크리스트 생성

**완료 기준:**
- API E2E 테스트 통과

---

#### Step 4: 프론트엔드 구현 (웹 - 점주용)
**담당:** Frontend
**예상 시간:** 5일

**작업:**
1. 페이지:
   - `pages/dashboard/manuals/index.tsx`: 매뉴얼 목록
   - `pages/dashboard/manuals/new.tsx`: 매뉴얼 생성 폼
   - `pages/dashboard/manuals/[id].tsx`: 매뉴얼 상세/수정
2. 컴포넌트:
   - `components/ManualForm.tsx`: 매뉴얼 폼 (제목, 템플릿 선택, 체크리스트 편집)
   - `components/ChecklistEditor.tsx`: 체크리스트 추가/수정/삭제
3. 템플릿 선택 UI:
   - 카페, 음식점, 소매점 등 카드 형태

**완료 기준:**
- 매뉴얼 생성 → 체크리스트 편집 → 저장 → 목록 조회 플로우 동작

---

#### Step 5: 모바일 앱 구현 (직원용)
**담당:** Mobile
**예상 시간:** 6일

**작업:**
1. React Native 프로젝트 초기 설정
   ```bash
   npx create-expo-app apps/mobile
   ```
2. 화면:
   - `screens/ManualListScreen.tsx`: 배정된 매뉴얼 목록
   - `screens/ManualDetailScreen.tsx`: 매뉴얼 상세 & 체크리스트
3. 컴포넌트:
   - `components/ChecklistItem.tsx`: 체크박스 + 내용
   - `components/SkillBadge.tsx`: 획득한 스킬 배지 표시
4. API 연동:
   - `lib/api/manuals.ts`

**완료 기준:**
- 매뉴얼 목록 → 상세 → 체크리스트 완료 → 스킬 배지 획득 플로우 동작

---

#### Step 6: UI E2E 테스트
**담당:** QA
**예상 시간:** 2일

**작업:**
1. 웹 테스트 (`tests/ui/specs/manuals-web.spec.ts`):
   - 점주: 매뉴얼 생성 → 직원 할당
2. 모바일 테스트 (`tests/ui/specs/manuals-mobile.spec.ts`):
   - 직원: 매뉴얼 학습 → 스킬 배지 획득

**완료 기준:**
- Playwright (웹) + Detox (모바일) 테스트 통과

---

#### F3 총 예상 시간: **21일 (4.2주)**

---

## F4. 출퇴근 기록 (핵심 기능 2)

### 관련 스펙 문서
- **PRD:** `docs/product/prd-main.md` - M3 (기본 근태 관리), US-06
- **Tech Spec:** `docs/tech/tech-spec.md` - Section 3.1 (출퇴근 기록 흐름)
- **API Spec:** `docs/tech/api-spec.md` - Section 5 (Attendance API)
- **DB Schema:** `docs/tech/db-schema.md` - Section 2.11 (attendance)
- **UX Flow:** `docs/ux/ux-flow-main.md` - Section 2.1 (알바생: 출퇴근 기록)

### Acceptance Criteria (PRD 기반)
- **AC-26:** 직원은 앱에서 "출근" 버튼을 누르면 GPS/QR 코드 인증 옵션이 나타난다
- **AC-27:** GPS 반경 50m 이내에서만 출근 가능 (점주 설정)
- **AC-28:** QR 코드 스캔 시 출근 기록이 즉시 저장된다
- **AC-29:** "퇴근" 버튼 클릭 시 근무 시간이 자동 계산되어 표시된다
- **AC-30:** 출퇴근 기록 수정 요청 시 점주 승인이 필요하다

### 구현 순서

#### Step 1: DB 스키마 추가
**담당:** Backend
**예상 시간:** 1일

**작업:**
1. `attendance` 테이블 마이그레이션 (DB Schema 2.11 참조)
2. PostGIS 확장 설치 (GPS 좌표 저장):
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

**완료 기준:**
- 마이그레이션 성공

---

#### Step 2: 테스트 작성 (API E2E)
**담당:** Backend
**예상 시간:** 1.5일

**작업:**
1. `tests/api/e2e/attendance.e2e.test.ts`:
   - `POST /attendance/check-in` - 출근 기록 (GPS 성공)
   - `POST /attendance/check-in` - GPS 반경 초과 시 400 에러
   - `POST /attendance/check-out` - 퇴근 기록 & 근무 시간 계산
   - `GET /attendance` - 출퇴근 기록 조회 (직원 본인, 점주)

**완료 기준:**
- 테스트 작성 완료

---

#### Step 3: 백엔드 구현
**담당:** Backend
**예상 시간:** 4일

**작업:**
1. `apps/api/src/attendance/` 모듈:
   - `attendance.controller.ts`: POST /check-in, /check-out, GET /attendance
   - `attendance.service.ts`: 출퇴근 로직, GPS 거리 계산
2. GPS 거리 계산 함수:
   ```typescript
   function calculateDistance(lat1, lon1, lat2, lon2): number {
     // Haversine formula
   }
   ```
3. 근무 시간 자동 계산:
   - `total_hours = (check_out_time - check_in_time) / 3600`
4. QR 코드 생성 (점주):
   - `POST /stores/:id/qr-code` - 매장별 QR 코드 생성

**완료 기준:**
- API E2E 테스트 통과

---

#### Step 4: 모바일 앱 구현 (직원용)
**담당:** Mobile
**예상 시간:** 5일

**작업:**
1. 화면:
   - `screens/AttendanceScreen.tsx`: 출퇴근 버튼 (대형 버튼)
   - `screens/AttendanceHistoryScreen.tsx`: 출퇴근 기록 목록
2. GPS 권한 요청:
   - `expo-location` 라이브러리 사용
3. QR 코드 스캔:
   - `expo-barcode-scanner` 라이브러리 사용
4. 실시간 위치 표시:
   - 지도 (react-native-maps)에 매장 위치 + 현재 위치 표시

**완료 기준:**
- GPS 출근 → 퇴근 → 근무 시간 표시 플로우 동작

---

#### Step 5: 프론트엔드 구현 (웹 - 점주용)
**담당:** Frontend
**예상 시간:** 3일

**작업:**
1. 페이지:
   - `pages/dashboard/attendance/index.tsx`: 전체 직원 출퇴근 현황
   - `pages/dashboard/attendance/[employeeId].tsx`: 직원별 상세 기록
2. 컴포넌트:
   - `components/AttendanceTable.tsx`: 출퇴근 기록 테이블
   - `components/QRCodeGenerator.tsx`: 매장 QR 코드 생성·다운로드

**완료 기준:**
- 점주가 실시간 출퇴근 현황 확인 가능

---

#### Step 6: UI E2E 테스트
**담당:** QA
**예상 시간:** 2일

**작업:**
1. 모바일 테스트 (`tests/ui/specs/attendance-mobile.spec.ts`):
   - 출근 (GPS) → 퇴근 → 근무 시간 확인
2. 웹 테스트 (`tests/ui/specs/attendance-web.spec.ts`):
   - 점주: 출퇴근 현황 조회

**완료 기준:**
- Playwright + Detox 테스트 통과

---

#### F4 총 예상 시간: **16.5일 (3.3주)**

---

## 3. Phase 1 전체 일정

| 기능 | 예상 기간 | 의존성 |
|------|----------|--------|
| **F1. 인증 & 유저 관리** | 2.4주 | 없음 |
| **F2. 매장 & 직원 관리** | 2.1주 | F1 완료 후 |
| **F3. 5분 매뉴얼** | 4.2주 | F1, F2 완료 후 (병렬 가능) |
| **F4. 출퇴근 기록** | 3.3주 | F1, F2 완료 후 (병렬 가능) |
| **통합 테스트 & 버그 수정** | 1주 | 모든 기능 완료 후 |
| **배포 준비 (CI/CD, 인프라)** | 1주 | 통합 테스트 후 |

**총 예상 기간:** **12주** (F3와 F4를 병렬로 진행 시)

**병렬 진행 계획:**
- Week 1-2: F1 (인증)
- Week 3-4: F2 (매장/직원)
- Week 5-8: F3 (매뉴얼) + F4 (출퇴근) 병렬
- Week 9-10: 통합 테스트
- Week 11-12: 배포 준비

---

## 4. 팀 구성 (권장)

| 역할 | 인원 | 주요 작업 |
|------|------|----------|
| **Backend Developer** | 2명 | NestJS API, DB 스키마, E2E 테스트 |
| **Frontend Developer** | 2명 | Next.js 웹 앱, UI 컴포넌트 |
| **Mobile Developer** | 1명 | React Native 앱 (직원용) |
| **QA Engineer** | 1명 | E2E 테스트, 버그 리포트 |
| **DevOps** | 0.5명 | Docker, CI/CD, AWS 인프라 |

**총 인원:** 6.5명

---

## 5. 리스크 & 완화 방안

| 리스크 | 영향도 | 완화 방안 |
|--------|--------|----------|
| GPS 정확도 낮음 (실내) | 높음 | QR 코드 인증 옵션 제공 |
| 모바일 앱 개발 지연 | 높음 | 웹 앱을 모바일 반응형으로 먼저 구현 |
| 스킬 배지 로직 복잡도 | 중간 | 초기엔 수동 부여, Phase 2에서 자동화 |
| DB 마이그레이션 실패 | 중간 | 개발 환경에서 충분히 테스트 |
| 테스트 작성 시간 부족 | 중간 | TDD 원칙 고수, 테스트 우선 작성 |

---

## 6. 성공 기준 (MVP 출시 시)

### 기능 완성도
- [ ] F1~F4 모든 Acceptance Criteria 충족
- [ ] API E2E 테스트 커버리지 > 80%
- [ ] UI E2E 테스트 주요 플로우 커버

### 성능
- [ ] API 응답 시간 p95 < 500ms
- [ ] 웹 최초 로드 시간 < 2초
- [ ] 모바일 앱 최초 로드 < 3초

### 품질
- [ ] 치명적 버그 0건
- [ ] 주요 버그 < 5건
- [ ] 보안 취약점 0건 (OWASP Top 10)

### 배포
- [ ] Staging 환경 정상 동작
- [ ] CI/CD 파이프라인 구축
- [ ] Sentry 에러 모니터링 설정

---

## 7. 다음 단계 (Phase 2 Preview)

Phase 1 MVP 출시 후:
- **F5. 스케줄 관리** (M4)
- **F6. 급여 계산** (M5)
- **F7. AI 스케줄링 추천** (S1)

---

## 8. 참고 문서

- **CLAUDE.md:** Spec-driven 개발 원칙
- **PRD:** `docs/product/prd-main.md`
- **Tech Spec:** `docs/tech/tech-spec.md`
- **API Spec:** `docs/tech/api-spec.md`
- **DB Schema:** `docs/tech/db-schema.md`
- **UX Flow:** `docs/ux/ux-flow-main.md`

---

**문서 끝**
