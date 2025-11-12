# F1: 인증 & 유저 관리

**Feature ID**: F1
**예상 기간**: 2.4주 (12일)
**상태**: `[status: todo]`
**담당 Phase**: Phase 1 MVP
**상위 문서**: `docs/project/phase1-plan.md`

---

## 개요

BestPractice HR SaaS의 핵심 인프라로, 점주와 직원의 회원가입, 로그인, 역할 기반 접근 제어(RBAC)를 구현한다.

### 주요 기능

- 회원가입 (점주/직원)
- 로그인 & JWT 인증
- 역할 기반 접근 제어 (RBAC: OWNER, EMPLOYEE, MANAGER)
- 프로필 관리

---

## 관련 스펙 문서

- **PRD**: `docs/product/prd-main.md` - M1 (회원가입 & 인증)
- **Tech Spec**: `docs/tech/tech-spec.md` - Section 4 (Auth & Authorization)
- **API Spec**: `docs/tech/api-spec.md` - Section 2 (Auth API)
- **DB Schema**: `docs/tech/db-schema.md` - Section 2.1 (users 테이블)
- **UX Flow**: `docs/ux/ux-flow-main.md` - Section 1.1 (첫 회원가입 → 매장 등록)

---

## Acceptance Criteria (AC)

이 Feature는 다음 조건을 모두 만족해야 완료된 것으로 간주한다:

- **AC-F1-01**: 점주가 이메일/비밀번호로 회원가입 시 users, stores 테이블에 데이터가 저장된다
- **AC-F1-02**: 이메일 중복 시 `EMAIL_ALREADY_EXISTS` 에러가 반환된다
- **AC-F1-03**: 로그인 시 유효한 JWT Access Token(24h), Refresh Token(30d)이 발급된다
- **AC-F1-04**: 잘못된 비밀번호 입력 시 `INVALID_CREDENTIALS` 에러가 반환된다
- **AC-F1-05**: OWNER 역할은 자신의 매장에만 접근 가능하다 (RBAC)
- **AC-F1-06**: 토큰 만료 시 Refresh Token으로 새 Access Token을 발급받을 수 있다
- **AC-F1-07**: 프로필 조회 시 비밀번호 해시가 응답에 포함되지 않는다

---

## Step 1: UX Planning & Design (2일)

### 작업 내용

1. **사용자 여정(User Journey) 정의**
   - `docs/ux/features/auth-flow.md` 작성
   - 점주 회원가입 → 매장 생성 → 온보딩 플로우
   - 직원 회원가입 → 초대 코드 입력 → 매장 참여 플로우
   - 로그인 → 대시보드 이동 플로우
   - 프로필 수정 플로우

2. **화면 구조(Screen Layout) 설계**
   - `docs/ux/features/auth-screens.md` 작성
   - 화면별 구조:
     - `/auth/signup`: 회원가입 폼
     - `/auth/login`: 로그인 폼
     - `/profile`: 프로필 조회/수정 화면
   - 컴포넌트 구성:
     - `<SignupForm />`: 이메일, 비밀번호, 역할 선택
     - `<LoginForm />`: 이메일, 비밀번호, "기억하기" 체크박스
     - `<ProfileCard />`: 유저 정보 표시 및 수정 버튼

3. **인터랙션(Interaction) 명세**
   - 폼 Validation 규칙:
     - 이메일: RFC 5322 형식
     - 비밀번호: 최소 8자, 영문+숫자 포함
   - 에러 처리:
     - 이메일 중복 → 인라인 에러 메시지
     - 로그인 실패 → Toast 알림
   - 로딩 상태:
     - 회원가입/로그인 중 버튼 Disabled
     - Spinner 표시

### 완료 조건

- [ ] `docs/ux/features/auth-flow.md` 작성 완료
- [ ] `docs/ux/features/auth-screens.md` 작성 완료
- [ ] 사용자 확인 및 승인

### 관련 Command

```
/ux-plan auth F1
```

### 예상 산출물

- `docs/ux/features/auth-flow.md` - 사용자 여정 문서
- `docs/ux/features/auth-screens.md` - 화면 구조 문서

---

## Step 2: Frontend Prototype with Mock (4일)

### 작업 내용

1. **Mock 데이터 작성**
   - `apps/web/lib/mocks/auth.ts` 생성
   - Mock User 데이터:
     ```typescript
     {
       id: 'user-1',
       email: 'owner@example.com',
       name: '김사장',
       role: 'OWNER',
       storeIds: ['store-1'],
       createdAt: new Date(),
     }
     ```
   - Mock Auth Functions:
     - `mockSignup(data)`: 회원가입 시뮬레이션
     - `mockLogin(email, password)`: 로그인 시뮬레이션
     - `mockGetProfile()`: 프로필 조회 시뮬레이션

2. **UI 컴포넌트 구현**
   - `apps/web/app/auth/signup/page.tsx` 작성
   - `apps/web/app/auth/login/page.tsx` 작성
   - `apps/web/app/profile/page.tsx` 작성
   - `apps/web/components/auth/SignupForm.tsx` 작성
   - `apps/web/components/auth/LoginForm.tsx` 작성
   - shadcn/ui 컴포넌트 활용:
     - `<Input />`, `<Button />`, `<Form />`, `<Label />`
   - `docs/ux/ui-theme.md`의 색상/타이포 적용

3. **상태 관리**
   - `apps/web/lib/stores/auth-store.ts` (Zustand 사용)
   - 상태:
     - `user`: 현재 로그인 유저 정보
     - `isAuthenticated`: 로그인 상태
     - `isLoading`: 로딩 상태
   - Actions:
     - `login(email, password)`: 로그인
     - `logout()`: 로그아웃
     - `signup(data)`: 회원가입

4. **UI E2E 테스트 작성 (Mock 기반)**
   - `apps/web/tests/e2e/f1-auth.spec.ts` 작성
   - 테스트 시나리오:
     - **TC-F1-01**: 점주 회원가입 → 매장 대시보드 이동
     - **TC-F1-02**: 이메일 중복 시 에러 표시
     - **TC-F1-03**: 로그인 → 프로필 조회
     - **TC-F1-04**: 잘못된 비밀번호 → 에러 Toast
     - **TC-F1-05**: 로그아웃 → 로그인 화면 리다이렉트

### 완료 조건

- [ ] Mock 데이터 및 함수 작성 완료
- [ ] 회원가입/로그인/프로필 UI 구현 완료
- [ ] UI E2E 테스트 (Mock) 모두 통과
- [ ] 브라우저에서 수동 테스트 완료
- [ ] 사용자 확인 및 승인

### 관련 Command

```
/mock-ui auth F1
```

### 예상 산출물

- `apps/web/lib/mocks/auth.ts` - Mock 데이터
- `apps/web/app/auth/signup/page.tsx` - 회원가입 페이지
- `apps/web/app/auth/login/page.tsx` - 로그인 페이지
- `apps/web/app/profile/page.tsx` - 프로필 페이지
- `apps/web/tests/e2e/f1-auth.spec.ts` - UI E2E 테스트

---

## Step 3: Data Layer Design & Migration (2일)

### 작업 내용

1. **Mock 데이터 구조 분석**
   - `apps/web/lib/mocks/auth.ts` 분석
   - TypeScript 타입 → PostgreSQL 타입 변환
   - 필수/선택 필드 구분

2. **TypeORM Entity 작성**
   - `apps/api/src/entities/user.entity.ts` 생성
   - 필드 정의:
     ```typescript
     @Entity('users')
     export class User {
       @PrimaryGeneratedColumn('uuid')
       id: string;

       @Column({ unique: true })
       email: string;

       @Column()
       password_hash: string;

       @Column({ type: 'enum', enum: UserRole })
       role: UserRole;

       @Column()
       name: string;

       @Column({ type: 'enum', enum: UserStatus, default: 'ACTIVE' })
       status: UserStatus;

       @CreateDateColumn()
       created_at: Date;

       @UpdateDateColumn()
       updated_at: Date;
     }
     ```

3. **Migration 파일 생성**
   - `apps/api/src/migrations/1699000000000-CreateUsers.ts` 생성
   - ENUM 타입 생성:
     ```sql
     CREATE TYPE user_role AS ENUM ('OWNER', 'EMPLOYEE', 'MANAGER', 'PARTNER', 'ADMIN');
     CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
     ```
   - users 테이블 생성:
     - 컬럼: id, email, password_hash, role, name, status, created_at, updated_at
     - 제약조건: email UNIQUE, password_hash NOT NULL
     - 인덱스: email (UNIQUE INDEX)

4. **Migration 실행**
   - `npm run migration:run` 실행
   - 에러 발생 시 디버깅 및 수정
   - `docs/tech/db-schema.md` 업데이트

### 완료 조건

- [ ] TypeORM Entity 생성 완료
- [ ] Migration 파일 생성 완료
- [ ] Migration 실행 성공
- [ ] `docs/tech/db-schema.md` 업데이트
- [ ] 사용자 확인 및 승인

### 관련 Command

```
/design-db auth F1
```

### 예상 산출물

- `apps/api/src/entities/user.entity.ts` - User Entity
- `apps/api/src/migrations/1699000000000-CreateUsers.ts` - Migration 파일
- `docs/tech/db-schema.md` 업데이트

---

## Step 4: Backend API & Integration (4일)

### 작업 내용

1. **DTO 클래스 작성**
   - `apps/api/src/modules/auth/dto/signup.dto.ts`
   - `apps/api/src/modules/auth/dto/login.dto.ts`
   - class-validator 데코레이터:
     - `@IsEmail()`, `@IsString()`, `@MinLength(8)`
   - `@ApiProperty()` 추가 (Swagger)

2. **Service 레이어 구현**
   - `apps/api/src/modules/auth/auth.service.ts` 생성
   - 메서드:
     - `signup(dto)`: 회원가입 (bcrypt 해싱)
     - `login(email, password)`: 로그인 (JWT 발급)
     - `validateUser(email, password)`: 유저 검증
     - `refreshToken(refreshToken)`: 토큰 갱신
   - 비즈니스 로직:
     - 이메일 중복 체크
     - 비밀번호 해싱 (bcrypt)
     - JWT 토큰 생성 (Passport.js)

3. **Controller 레이어 구현**
   - `apps/api/src/modules/auth/auth.controller.ts` 생성
   - 엔드포인트:
     - `POST /auth/signup`: 회원가입
     - `POST /auth/login`: 로그인
     - `POST /auth/refresh`: 토큰 갱신
     - `GET /auth/profile`: 프로필 조회 (JWT Guard)
     - `PUT /auth/profile`: 프로필 수정 (JWT Guard)
   - Swagger 문서화

4. **Module 구성**
   - `apps/api/src/modules/auth/auth.module.ts` 생성
   - Passport.js 전략 설정:
     - JwtStrategy
     - JwtAuthGuard
   - TypeORM Repository 등록
   - `app.module.ts`에 AuthModule 등록

5. **API E2E 테스트 작성**
   - `apps/api/test/e2e/auth.e2e-spec.ts` 생성
   - AC별 테스트 케이스:
     - AC-F1-01 → `should create user and store on signup`
     - AC-F1-02 → `should return error on duplicate email`
     - AC-F1-03 → `should return JWT tokens on login`
     - AC-F1-04 → `should return error on invalid password`
     - AC-F1-05 → `should restrict access based on role`
     - AC-F1-06 → `should refresh access token`
     - AC-F1-07 → `should not return password hash in profile`

6. **Frontend Real API Client 구현**
   - `apps/web/lib/api/auth-client.ts` 생성
   - Mock 함수를 Real API 호출로 교체:
     - `signup()`: `POST /auth/signup`
     - `login()`: `POST /auth/login`
     - `getProfile()`: `GET /auth/profile`
     - `updateProfile()`: `PUT /auth/profile`
   - 환경변수로 Mock/Real 전환:
     ```typescript
     const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
     ```

7. **UI E2E 테스트 (Real API)**
   - 환경변수 `NEXT_PUBLIC_USE_MOCK_API=false` 설정
   - `npx playwright test apps/web/tests/e2e/f1-auth.spec.ts` 실행
   - 모든 테스트 통과 확인

8. **통합 검증**
   - 브라우저에서 수동 테스트:
     - 회원가입 → 로그인 → 프로필 조회 → 로그아웃
     - 에러 케이스 확인 (중복 이메일, 잘못된 비밀번호)
   - API E2E 테스트 모두 통과
   - UI E2E 테스트 (Real API) 모두 통과

### 완료 조건

- [ ] DTO, Service, Controller, Module 구현 완료
- [ ] API E2E 테스트 모두 통과
- [ ] Frontend Real API Client 구현 완료
- [ ] UI E2E 테스트 (Real API) 모두 통과
- [ ] 브라우저 수동 테스트 통과
- [ ] `docs/tech/api-spec.md` 업데이트
- [ ] 사용자 최종 승인

### 관련 Command

```
/implement-api auth F1
```

### 예상 산출물

- `apps/api/src/modules/auth/dto/*.dto.ts` - DTO 클래스
- `apps/api/src/modules/auth/auth.service.ts` - Service
- `apps/api/src/modules/auth/auth.controller.ts` - Controller
- `apps/api/src/modules/auth/auth.module.ts` - Module
- `apps/api/test/e2e/auth.e2e-spec.ts` - API E2E 테스트
- `apps/web/lib/api/auth-client.ts` - Real API Client
- `docs/tech/api-spec.md` 업데이트

---

## 테스트 전략

### AC ↔ 테스트 매핑

| AC ID | 설명 | API E2E 테스트 | UI E2E 테스트 |
|-------|------|----------------|---------------|
| AC-F1-01 | 회원가입 시 DB 저장 | `auth.e2e-spec.ts::should create user and store` | `f1-auth.spec.ts::TC-F1-01` |
| AC-F1-02 | 이메일 중복 에러 | `auth.e2e-spec.ts::should return error on duplicate` | `f1-auth.spec.ts::TC-F1-02` |
| AC-F1-03 | JWT 토큰 발급 | `auth.e2e-spec.ts::should return JWT tokens` | `f1-auth.spec.ts::TC-F1-03` |
| AC-F1-04 | 잘못된 비밀번호 에러 | `auth.e2e-spec.ts::should return error on invalid password` | `f1-auth.spec.ts::TC-F1-04` |
| AC-F1-05 | RBAC 접근 제어 | `auth.e2e-spec.ts::should restrict access` | - |
| AC-F1-06 | 토큰 갱신 | `auth.e2e-spec.ts::should refresh token` | - |
| AC-F1-07 | 비밀번호 해시 숨김 | `auth.e2e-spec.ts::should not return password hash` | - |

### 테스트 환경

- **Mock API 테스트**: Step 2에서 UI E2E 테스트
- **Real API 테스트**: Step 4에서 API E2E + UI E2E 테스트

---

## Feature 완료 조건

F1 Feature가 완료되었다고 간주하려면 다음 조건을 모두 만족해야 한다:

- [ ] Step 1~4 모두 완료
- [ ] 모든 AC (AC-F1-01 ~ AC-F1-07) 검증 완료
- [ ] API E2E 테스트 모두 통과
- [ ] UI E2E 테스트 (Mock) 통과
- [ ] UI E2E 테스트 (Real API) 통과
- [ ] 브라우저 수동 테스트 통과
- [ ] 문서 업데이트 완료:
  - `docs/ux/features/auth-flow.md`
  - `docs/ux/features/auth-screens.md`
  - `docs/tech/db-schema.md`
  - `docs/tech/api-spec.md`
- [ ] 사용자 최종 승인

---

## 참조 문서

- **상위 계획**: `docs/project/phase1-plan.md`
- **로드맵**: `docs/project/roadmap.md`
- **PRD**: `docs/product/prd-main.md`
- **Tech Spec**: `docs/tech/tech-spec.md`
- **API Spec**: `docs/tech/api-spec.md`
- **DB Schema**: `docs/tech/db-schema.md`
- **UX Flow**: `docs/ux/ux-flow-main.md`
- **UI Theme**: `docs/ux/ui-theme.md`

---

**Last Updated**: 2025-11-12
**Status**: `[status: todo]`
**Next Step**: Step 1 - UX Planning & Design
