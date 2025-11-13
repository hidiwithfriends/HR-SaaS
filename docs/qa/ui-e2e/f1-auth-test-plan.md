# F1: 인증 & 유저 관리 - UI E2E 테스트 계획서

**Feature ID**: F1
**테스트 대상**: 인증 & 유저 관리 (회원가입, 로그인, 프로필)
**테스트 환경**: Mock API
**테스트 프레임워크**: Playwright 1.48.2
**작성일**: 2025-11-12
**상위 문서**: `docs/project/features/f1-auth.md`

---

## 0. Playwright를 사용하는 이유

### 0.1 E2E 테스트가 필요한 이유

소프트웨어 테스트는 여러 레벨로 나뉘며, 각 레벨은 고유한 목적과 범위를 가진다:

| 테스트 유형 | 범위 | 속도 | 검증 대상 | 예시 |
|------------|------|------|---------|------|
| **Unit 테스트** | 함수/메서드 단위 | 매우 빠름 | 개별 로직의 정확성 | `hashPassword()` 함수가 올바른 bcrypt 해시를 생성하는가? |
| **Component 테스트** | React 컴포넌트 단위 | 빠름 | UI 렌더링 및 상호작용 | `<SignupForm />`이 클릭 시 올바른 prop을 호출하는가? |
| **E2E 테스트** | 전체 사용자 플로우 | 느림 | 실제 사용자 경험 | 사용자가 회원가입 후 대시보드에 도달하는가? |

**E2E 테스트의 핵심 가치**:
1. **실제 사용자 관점에서 검증**: Unit/Component 테스트는 개별 부품을 검증하지만, E2E는 전체 시스템이 "진짜로 작동하는지" 검증
2. **통합 이슈 발견**: API 응답 형식 불일치, 라우팅 오류, 상태 관리 버그 등 통합 시에만 나타나는 문제 발견
3. **회귀 방지**: 기능 추가 시 기존 플로우가 깨지지 않았는지 자동 검증
4. **문서화**: 테스트 코드 자체가 "어떻게 사용해야 하는지" 설명하는 살아있는 문서

**예시 시나리오**:
```typescript
// ❌ Unit 테스트만으로는 부족한 경우
// hashPassword() 함수는 정상 작동하지만,
// 회원가입 API가 해시를 잘못된 필드에 저장하면?
// → E2E 테스트로 전체 플로우 검증 필요!

// ✅ E2E 테스트가 잡아내는 실제 문제
test('회원가입 후 로그인 가능', async ({ page }) => {
  // 1. 회원가입 (DB에 저장)
  await page.goto('/auth/signup');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');

  // 2. 로그아웃
  await page.click('[aria-label="로그아웃"]');

  // 3. 다시 로그인 (저장된 비밀번호 해시로 검증)
  await page.goto('/auth/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');

  // 4. 대시보드 진입 확인
  await expect(page).toHaveURL(/\/dashboard/);
  // → 이 플로우가 성공하면 회원가입/로그인/세션 관리 모두 정상!
});
```

---

### 0.2 Playwright의 장점

Playwright는 Microsoft가 개발한 최신 E2E 테스트 프레임워크로, 다음과 같은 강점을 가진다:

#### 1) 다중 브라우저 지원

하나의 테스트 코드로 Chromium, Firefox, WebKit(Safari) 모두 테스트:

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});

// 한 번의 실행으로 4개 브라우저 모두 테스트!
// npx playwright test → 모든 프로젝트 실행
```

#### 2) 자동 대기 (Auto-waiting)

Playwright는 요소가 "실제로 사용 가능한 상태"가 될 때까지 자동으로 대기:

```typescript
// ❌ 다른 도구: 수동으로 대기 코드 작성
await page.click('#submit-button');
await sleep(3000); // 로딩 완료까지 3초 기다리기... 정확한 시간은?
await expect(page.locator('.success-message')).toBeVisible();

// ✅ Playwright: 자동 대기
await page.click('#submit-button');
// → 버튼이 클릭 가능할 때까지 자동 대기 (disabled 해제, 화면에 표시, 가려지지 않음)
await expect(page.locator('.success-message')).toBeVisible();
// → 성공 메시지가 나타날 때까지 자동 대기 (최대 30초)
```

**자동 대기가 확인하는 것들**:
- 요소가 DOM에 존재하는가?
- 요소가 화면에 표시되는가? (display: none이 아닌가?)
- 요소가 다른 요소에 가려지지 않았는가?
- 요소가 활성화 상태인가? (disabled가 아닌가?)
- 애니메이션이 완료되었는가?

#### 3) 강력한 Locator

Playwright의 Locator는 현대적이고 안정적인 요소 선택 방식:

```typescript
// ✅ 권장: 사용자 관점의 선택자 (역할, 텍스트)
await page.getByRole('button', { name: '가입하기' }).click();
await page.getByLabel('이메일').fill('test@example.com');
await page.getByText('환영합니다!').isVisible();

// ⚠️ CSS 선택자도 사용 가능하지만 덜 안정적
await page.locator('#submit-btn').click(); // ID가 변경되면 테스트 깨짐
await page.locator('input[name="email"]').fill('test@example.com');

// 🚀 고급 기능: 체이닝 및 필터링
await page
  .getByRole('row')
  .filter({ hasText: '김점주' })
  .getByRole('button', { name: '수정' })
  .click();
// → "김점주"가 포함된 행의 "수정" 버튼만 클릭!
```

#### 4) 네트워크 제어 (Mock API)

API 응답을 가로채서 원하는 데이터로 대체:

```typescript
// 특정 API 응답을 Mock으로 대체
await page.route('**/api/auth/signup', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      accessToken: 'mock-token-123',
      user: { id: '1', name: '김점주', role: 'OWNER' },
    }),
  });
});

// 회원가입 폼 제출
await page.goto('/auth/signup');
await page.fill('#email', 'test@example.com');
await page.click('button[type="submit"]');

// Mock 응답으로 인해 즉시 성공 플로우 테스트 가능
await expect(page).toHaveURL('/stores/new');
```

**장점**:
- 백엔드 서버 없이도 프론트엔드 테스트 가능
- 에러 케이스 시뮬레이션 용이 (네트워크 실패, 400/500 에러)
- 테스트 속도 향상 (실제 API 호출 없이 즉시 응답)

#### 5) 스크린샷 자동 캡처

테스트 실패 시 자동으로 스크린샷 및 비디오 저장:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure', // 실패 시에만 스크린샷
    video: 'retain-on-failure',    // 실패 시에만 비디오 보관
    trace: 'on-first-retry',       // 재시도 시 전체 트레이스 기록
  },
});

// 테스트 실패 시 자동 생성:
// - test-results/auth-signup-chromium/test-failed-1.png
// - test-results/auth-signup-chromium/video.webm
// - trace.zip (Playwright Trace Viewer로 재생 가능)
```

**Trace Viewer 예시**:
```bash
# 실패한 테스트의 전체 과정을 시각적으로 재생
npx playwright show-trace trace.zip

# 브라우저에서 다음을 볼 수 있음:
# - 각 단계별 스크린샷
# - 네트워크 요청/응답
# - 콘솔 로그
# - DOM 스냅샷
# - 테스트 코드 하이라이트
```

---

### 0.3 Playwright vs Cypress 비교

| 항목 | Playwright | Cypress |
|------|-----------|---------|
| **브라우저 지원** | Chromium, Firefox, WebKit (Safari) | Chromium, Firefox (WebKit 실험적) |
| **언어** | TypeScript, JavaScript, Python, Java, .NET | TypeScript, JavaScript만 |
| **자동 대기** | ✅ 기본 내장 (모든 액션에 자동 적용) | ✅ 기본 내장 |
| **병렬 실행** | ✅ 무료 (로컬 및 CI) | ⚠️ CI에서는 유료 (Cypress Cloud) |
| **iframe 지원** | ✅ 완벽 지원 | ⚠️ 제한적 |
| **다중 탭/윈도우** | ✅ 지원 | ❌ 미지원 |
| **네트워크 제어** | ✅ 요청/응답 수정 가능 | ✅ 요청만 가로채기 가능 |
| **모바일 테스트** | ✅ 디바이스 에뮬레이션 | ⚠️ 뷰포트 크기만 조정 |
| **속도** | 빠름 | 매우 빠름 (브라우저 내부에서 실행) |
| **디버깅** | Trace Viewer, Inspector | Time-travel debugging |
| **러닝 커브** | 보통 | 쉬움 (개발자 친화적 API) |
| **생태계** | 빠르게 성장 중 | 성숙한 커뮤니티 |

**선택 가이드**:
- **Playwright 선택**:
  - 다중 브라우저 테스트 필수
  - Safari 지원 필요
  - 병렬 실행 무료 필요
  - iframe, 다중 탭 사용

- **Cypress 선택**:
  - Chrome/Firefox만 지원하면 충분
  - 개발자 경험(DX) 최우선
  - 디버깅 편의성 중요

---

### 0.4 우리 프로젝트에서의 활용

**BestPractice HR SaaS에서 Playwright를 선택한 이유**:

1. **다중 브라우저 지원**: 점주들은 다양한 환경 (모바일, 태블릿, PC)에서 접속
2. **Mock API 기반 개발**: 백엔드 개발 전에 프론트엔드 UI/UX 검증
3. **CI/CD 통합**: GitHub Actions에서 무료로 병렬 테스트 실행
4. **스크린샷 자동화**: 버그 재현을 위한 시각적 증거 확보
5. **Fast Feedback**: 개발자가 코드 변경 후 즉시 전체 플로우 검증

**테스트 전략**:
- **Step 2 (Mock API)**: Playwright + Mock API로 UI 플로우 검증
- **Step 4 (Real API)**: Playwright + Real API로 통합 테스트
- **CI/CD**: PR 생성 시 자동으로 전체 E2E 테스트 실행

---

## 1. 개요

### 1.1 문서 목적

이 문서는 F1 (인증 & 유저 관리) 기능의 UI E2E 테스트 시나리오를 정의한다.
각 시나리오는 실제 사용자의 행동을 시뮬레이션하며, Acceptance Criteria(AC)와 1:1 매핑된다.

### 1.2 테스트 대상 화면

- `/auth/signup`: 회원가입 폼 (점주/직원)
- `/auth/login`: 로그인 폼
- `/profile`: 프로필 조회/수정 화면

### 1.3 테스트 환경

- **프론트엔드**: Next.js 14 (App Router) - 포트 3001
- **API**: Mock API (`apps/web/lib/mocks/auth-api.ts`)
- **환경변수**: `NEXT_PUBLIC_USE_MOCK_API=true`
- **브라우저**: Chromium, Firefox, WebKit (Playwright)
- **실행 방식**: Headless (CI) / Headed (로컬 디버깅)

### 1.4 참조 문서

- **Feature Spec**: `docs/project/features/f1-auth.md` - AC 정의
- **UX Flow**: `docs/ux/features/auth-flow.md` - 사용자 여정
- **Screen Spec**: `docs/ux/features/auth-screens.md` - 화면 구조
- **Mock API**: `apps/web/lib/mocks/auth-api.ts` - Edge cases
- **Playwright 구조**: `docs/qa/ui-e2e/playwright-structure.md` - 테스트 설계

---

## 2. 테스트 전제 조건

### 2.1 환경 설정

**필수 환경변수** (`apps/web/.env.test`):
```bash
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

**서버 실행**:
```bash
cd apps/web
npm run dev
# → http://localhost:3001 에서 실행
```

**Playwright 설치**:
```bash
npm install @playwright/test@1.48.2 --save-dev
npx playwright install
```

### 2.2 Mock API 전제 조건

Mock API는 다음 Edge Cases를 시뮬레이션한다 (from `auth-api.ts`):

| Trigger | API 동작 |
|---------|----------|
| `email: "duplicate@test.com"` | `EMAIL_ALREADY_EXISTS` 에러 반환 |
| `email: "network-fail@test.com"` | Network Error 발생 |
| `inviteCode: "EXPIRED"` | `INVITE_EXPIRED` 에러 반환 |
| `password !== "password123"` | `INVALID_CREDENTIALS` 에러 반환 |
| 정상 입력 | 1초 delay 후 성공 응답 |

### 2.3 테스트 데이터

**유효한 점주 회원가입 데이터**:
```typescript
{
  role: 'OWNER',
  name: '김점주',
  email: 'newowner@test.com',
  password: 'password123',
  passwordConfirm: 'password123',
}
```

**유효한 직원 회원가입 데이터**:
```typescript
{
  role: 'EMPLOYEE',
  name: '이직원',
  email: 'newemployee@test.com',
  password: 'password123',
  inviteCode: 'VALID_CODE',
}
```

**유효한 로그인 데이터**:
```typescript
{
  email: 'owner@test.com',
  password: 'password123',
}
```

---

## 3. AC ↔ 테스트 시나리오 매핑표

| AC ID | AC 설명 | 테스트 시나리오 ID | 우선순위 | 비고 |
|-------|--------|-------------------|---------|------|
| AC-F1-01 | 회원가입 시 users, stores 테이블 저장 | TC-F1-01, TC-F1-02 | P0 (필수) | Mock에서는 localStorage 저장 확인 |
| AC-F1-02 | 이메일 중복 시 에러 반환 | TC-F1-05 | P0 (필수) | `duplicate@test.com` 트리거 |
| AC-F1-03 | 로그인 시 JWT 토큰 발급 | TC-F1-03, TC-F1-04 | P0 (필수) | accessToken, refreshToken 확인 |
| AC-F1-04 | 잘못된 비밀번호 시 에러 반환 | TC-F1-06 | P0 (필수) | `password !== "password123"` |
| AC-F1-05 | RBAC 역할별 접근 제어 | TC-F1-10 | P1 (중요) | 점주/직원별 리다이렉트 확인 |
| AC-F1-06 | Refresh Token으로 토큰 갱신 | - | P2 (Phase 2) | Step 4 (Real API)에서 검증 |
| AC-F1-07 | 비밀번호 해시 응답 제외 | TC-F1-09 | P1 (중요) | 프로필 조회 시 password 필드 없음 |

---

## 4. 테스트 시나리오 (10개)

### TC-F1-01: 점주 회원가입 성공 플로우

**AC 매핑**: AC-F1-01
**우선순위**: P0 (필수)

**테스트 데이터**:
- 입력:
  - 역할: "점주" (OWNER)
  - 이름: "김점주"
  - 이메일: "newowner@test.com"
  - 비밀번호: "password123"
  - 비밀번호 확인: "password123"
- Mock API 응답 (1초 delay):
  ```json
  {
    "accessToken": "mock-access-token-1699000000",
    "refreshToken": "mock-refresh-token-1699000000",
    "user": {
      "id": "user-owner-1699000000",
      "email": "newowner@test.com",
      "name": "김점주",
      "role": "OWNER",
      "createdAt": "2025-11-12T00:00:00Z"
    }
  }
  ```

**Step-by-Step 플로우**:
1. 브라우저에서 `/auth/signup` 페이지로 이동
2. 페이지 로드 확인: "BestPractice" 로고 표시 확인
3. 역할 선택: "점주" 라디오 버튼 클릭 (기본 선택된 상태)
4. 이름 입력 필드에 "김점주" 입력
5. 이메일 입력 필드에 "newowner@test.com" 입력
6. 비밀번호 입력 필드에 "password123" 입력
7. 비밀번호 확인 필드에 "password123" 입력
8. "이용약관에 동의합니다" 체크박스 클릭
9. "가입하기" 버튼 클릭
10. 로딩 상태 확인:
    - 버튼이 비활성화(disabled)됨
    - 버튼 내부에 로딩 스피너 표시
11. Mock API 응답 대기 (1초)
12. 페이지 전환 확인

**검증 포인트 (Assertions)**:
- [✓] URL이 `/stores/new`로 리다이렉트됨
- [✓] Toast 알림 표시: "환영합니다!" 메시지
- [✓] localStorage에 `accessToken` 저장 확인
- [✓] localStorage에 `refreshToken` 저장 확인
- [✓] localStorage에 `user` 객체 저장 확인 (role: "OWNER")
- [✓] 매장 생성 폼이 화면에 표시됨 (안내 메시지 "매장 정보를 입력해주세요")

**예상 소요 시간**: 30초

---

### TC-F1-02: 직원 회원가입 성공 플로우 (초대 코드 포함)

**AC 매핑**: AC-F1-01
**우선순위**: P0 (필수)

**테스트 데이터**:
- URL: `/auth/signup?inviteCode=VALID_CODE`
- 입력:
  - 역할: "직원" (EMPLOYEE, 자동 선택 & 비활성화)
  - 이름: "이직원"
  - 이메일: "newemployee@test.com"
  - 비밀번호: "password123"
  - 비밀번호 확인: "password123"
- Mock API 응답:
  ```json
  {
    "accessToken": "mock-access-token-1699000001",
    "refreshToken": "mock-refresh-token-1699000001",
    "user": {
      "id": "user-employee-1699000001",
      "email": "newemployee@test.com",
      "name": "이직원",
      "role": "EMPLOYEE",
      "storeId": "store-001",
      "createdAt": "2025-11-12T00:00:00Z"
    }
  }
  ```

**Step-by-Step 플로우**:
1. `/auth/signup?inviteCode=VALID_CODE` 페이지로 이동
2. 초대 정보 카드 확인: "카페 OO에서 초대했어요" 메시지 표시
3. 역할 선택 확인: "직원" 라디오 버튼이 자동 선택됨, 비활성화 상태
4. 이름 입력: "이직원"
5. 이메일 입력: "newemployee@test.com"
6. 비밀번호 입력: "password123"
7. 비밀번호 확인 입력: "password123"
8. "이용약관에 동의합니다" 체크박스 클릭
9. "가입하기" 버튼 클릭
10. 로딩 상태 확인
11. Mock API 응답 대기 (1초)

**검증 포인트 (Assertions)**:
- [✓] URL이 `/dashboard` 또는 `/my-manuals`로 리다이렉트됨
- [✓] Toast 알림 표시: "환영합니다!"
- [✓] localStorage에 `accessToken`, `refreshToken` 저장 확인
- [✓] localStorage의 `user.role`이 "EMPLOYEE"임
- [✓] localStorage의 `user.storeId`가 존재함 (매장 자동 참여)
- [✓] 직원 대시보드가 표시됨 (예: "내 매뉴얼" 섹션)

**예상 소요 시간**: 30초

---

### TC-F1-03: 점주 로그인 성공 플로우

**AC 매핑**: AC-F1-03
**우선순위**: P0 (필수)

**테스트 데이터**:
- 입력:
  - 이메일: "owner@test.com"
  - 비밀번호: "password123"
- Mock API 응답:
  ```json
  {
    "accessToken": "mock-access-token-1699000002",
    "refreshToken": "mock-refresh-token-1699000002",
    "user": {
      "id": "user-owner-001",
      "email": "owner@test.com",
      "name": "김점주",
      "role": "OWNER",
      "phone": "010-1234-5678",
      "createdAt": "2025-11-12T00:00:00Z"
    }
  }
  ```

**Step-by-Step 플로우**:
1. `/auth/login` 페이지로 이동
2. 페이지 로드 확인: "로그인" 제목 표시
3. 이메일 입력 필드에 자동 포커스 확인 (autofocus)
4. 이메일 입력: "owner@test.com"
5. 비밀번호 입력: "password123"
6. "로그인" 버튼 클릭
7. 로딩 상태 확인:
   - 버튼 비활성화
   - "로그인 중..." 텍스트 표시
8. Mock API 응답 대기 (800ms)
9. 자동 프로필 조회 (`GET /auth/me`) 시뮬레이션

**검증 포인트 (Assertions)**:
- [✓] URL이 `/dashboard` 또는 `/stores/[id]`로 리다이렉트됨 (점주 대시보드)
- [✓] localStorage에 `accessToken` 저장 확인
- [✓] localStorage에 `refreshToken` 저장 확인
- [✓] localStorage의 `user.role`이 "OWNER"임
- [✓] 점주 대시보드 표시 확인 (예: "내 매장" 카드, "직원 초대하기" 버튼)
- [✓] 네비게이션 바에 사용자 이름 표시: "김점주"

**예상 소요 시간**: 20초

---

### TC-F1-04: 직원 로그인 성공 플로우

**AC 매핑**: AC-F1-03, AC-F1-05
**우선순위**: P0 (필수)

**테스트 데이터**:
- 입력:
  - 이메일: "employee@test.com"
  - 비밀번호: "password123"
- Mock API 응답:
  ```json
  {
    "accessToken": "mock-access-token-1699000003",
    "refreshToken": "mock-refresh-token-1699000003",
    "user": {
      "id": "user-employee-001",
      "email": "employee@test.com",
      "name": "이직원",
      "role": "EMPLOYEE",
      "phone": "010-8765-4321",
      "createdAt": "2025-11-12T00:00:00Z"
    }
  }
  ```

**Step-by-Step 플로우**:
1. `/auth/login` 페이지로 이동
2. 이메일 입력: "employee@test.com"
3. 비밀번호 입력: "password123"
4. "로그인" 버튼 클릭
5. 로딩 상태 대기
6. Mock API 응답 대기 (800ms)

**검증 포인트 (Assertions)**:
- [✓] URL이 `/my-manuals` 또는 `/attendance/my-records`로 리다이렉트됨 (직원 대시보드)
- [✓] localStorage에 토큰 저장 확인
- [✓] localStorage의 `user.role`이 "EMPLOYEE"임
- [✓] 직원 대시보드 표시 확인 (예: "내 매뉴얼" 섹션, "출근 체크인" 버튼)
- [✓] 점주 전용 메뉴 접근 불가 (예: "직원 관리" 메뉴 미표시)

**예상 소요 시간**: 20초

---

### TC-F1-05: 이메일 중복 에러 처리

**AC 매핑**: AC-F1-02
**우선순위**: P0 (필수)

**테스트 데이터**:
- 입력:
  - 이메일: "duplicate@test.com" ← Mock API 트리거
  - 비밀번호: "password123"
- Mock API 응답:
  ```json
  {
    "statusCode": 400,
    "error": "EMAIL_ALREADY_EXISTS",
    "message": "이미 가입된 이메일입니다"
  }
  ```

**Step-by-Step 플로우**:
1. `/auth/signup` 페이지로 이동
2. 역할 선택: "점주"
3. 이름 입력: "김중복"
4. 이메일 입력: "duplicate@test.com"
5. 비밀번호 입력: "password123"
6. 비밀번호 확인 입력: "password123"
7. "이용약관에 동의합니다" 체크박스 클릭
8. "가입하기" 버튼 클릭
9. Mock API 에러 응답 대기 (1초)

**검증 포인트 (Assertions)**:
- [✓] 페이지가 `/auth/signup`에 그대로 유지됨 (리다이렉트 안 됨)
- [✓] 에러 메시지 표시:
  - 이메일 입력 필드 하단에 빨간색 메시지: "이미 가입된 이메일입니다"
  - 또는 폼 상단에 Alert 컴포넌트 표시
- [✓] 이메일 입력 필드에 빨간 테두리 강조 (`border-destructive`)
- [✓] "로그인하기" 링크 표시 확인
- [✓] 다른 입력 필드는 그대로 유지됨 (이름, 비밀번호 클리어 안 됨)
- [✓] "가입하기" 버튼 다시 활성화됨

**예상 소요 시간**: 25초

---

### TC-F1-06: 로그인 실패 - 잘못된 비밀번호

**AC 매핑**: AC-F1-04
**우선순위**: P0 (필수)

**테스트 데이터**:
- 입력:
  - 이메일: "owner@test.com"
  - 비밀번호: "wrongpassword" ← Mock API 트리거
- Mock API 응답:
  ```json
  {
    "statusCode": 401,
    "error": "INVALID_CREDENTIALS",
    "message": "이메일 또는 비밀번호가 잘못되었습니다"
  }
  ```

**Step-by-Step 플로우**:
1. `/auth/login` 페이지로 이동
2. 이메일 입력: "owner@test.com"
3. 비밀번호 입력: "wrongpassword"
4. "로그인" 버튼 클릭
5. Mock API 에러 응답 대기 (800ms)

**검증 포인트 (Assertions)**:
- [✓] 페이지가 `/auth/login`에 유지됨
- [✓] 폼 상단에 Alert 컴포넌트 표시:
  - 빨간색 배경 (`variant="destructive"`)
  - 메시지: "이메일 또는 비밀번호가 잘못되었습니다"
- [✓] 비밀번호 입력 필드만 클리어됨 (빈 값으로 초기화)
- [✓] 이메일 입력 필드는 그대로 유지됨: "owner@test.com"
- [✓] 비밀번호 입력 필드에 자동 포커스
- [✓] "로그인" 버튼 다시 활성화됨
- [✓] "비밀번호 찾기" 링크 강조 (선택, Phase 2)

**예상 소요 시간**: 20초

---

### TC-F1-07: 초대 코드 만료 에러 처리

**AC 매핑**: AC-F1-02 (유사)
**우선순위**: P1 (중요)

**테스트 데이터**:
- URL: `/auth/signup?inviteCode=EXPIRED` ← Mock API 트리거
- 입력:
  - 이름: "이만료"
  - 이메일: "expired@test.com"
  - 비밀번호: "password123"
- Mock API 응답:
  ```json
  {
    "statusCode": 400,
    "error": "INVITE_EXPIRED",
    "message": "초대 링크가 만료되었습니다"
  }
  ```

**Step-by-Step 플로우**:
1. `/auth/signup?inviteCode=EXPIRED` 페이지로 이동
2. 초대 정보 카드 표시 확인
3. 역할 자동 선택: "직원"
4. 이름 입력: "이만료"
5. 이메일 입력: "expired@test.com"
6. 비밀번호 입력: "password123"
7. 비밀번호 확인 입력: "password123"
8. "이용약관에 동의합니다" 체크박스 클릭
9. "가입하기" 버튼 클릭
10. Mock API 에러 응답 대기 (1초)

**검증 포인트 (Assertions)**:
- [✓] 페이지가 `/auth/signup`에 유지됨
- [✓] 폼 상단에 Alert 컴포넌트 표시:
  - 빨간색 배경
  - 메시지: "초대 링크가 만료되었습니다"
- [✓] 추가 안내 메시지: "점주에게 새로운 초대 링크를 요청해주세요"
- [✓] 입력 필드 그대로 유지 (사용자가 수정 가능)
- [✓] "가입하기" 버튼 다시 활성화

**예상 소요 시간**: 25초

---

### TC-F1-08: 네트워크 실패 에러 처리

**AC 매핑**: (공통 에러 처리)
**우선순위**: P1 (중요)

**테스트 데이터**:
- 입력:
  - 이메일: "network-fail@test.com" ← Mock API 트리거
  - 비밀번호: "password123"
- Mock API 동작:
  ```typescript
  if (email === 'network-fail@test.com') {
    throw new Error('Network Error: Failed to connect to server');
  }
  ```

**Step-by-Step 플로우**:
1. `/auth/signup` 페이지로 이동
2. 역할 선택: "점주"
3. 이름 입력: "김네트워크"
4. 이메일 입력: "network-fail@test.com"
5. 비밀번호 입력: "password123"
6. 비밀번호 확인 입력: "password123"
7. "이용약관에 동의합니다" 체크박스 클릭
8. "가입하기" 버튼 클릭
9. Mock API 에러 발생 (1초 후)

**검증 포인트 (Assertions)**:
- [✓] 페이지가 `/auth/signup`에 유지됨
- [✓] Toast 알림 표시 (우상단):
  - 메시지: "네트워크 연결을 확인해주세요"
  - 빨간색 배경
  - 3초 후 자동 사라짐
- [✓] "다시 시도" 버튼 표시 (선택)
- [✓] 로딩 인디케이터 숨김
- [✓] 입력 필드 활성화 (사용자가 수정 가능)

**예상 소요 시간**: 25초

---

### TC-F1-09: 프로필 조회 및 수정

**AC 매핑**: AC-F1-07
**우선순위**: P1 (중요)

**테스트 데이터**:
- 로그인 사용자: "owner@test.com" (점주)
- Mock API 응답 (`GET /auth/me`):
  ```json
  {
    "id": "user-owner-001",
    "email": "owner@test.com",
    "name": "김점주",
    "role": "OWNER",
    "phone": "010-1234-5678",
    "createdAt": "2025-01-01T00:00:00Z"
    // ⚠️ password, password_hash 필드 없음 (AC-F1-07)
  }
  ```

**Step-by-Step 플로우**:
1. 로그인 (TC-F1-03 선행)
2. 네비게이션 바에서 "프로필" 메뉴 클릭
3. `/profile` 페이지로 이동
4. 프로필 카드 로드 확인 (Skeleton UI → 실제 데이터)
5. 읽기 모드 확인:
   - 이름: "김점주"
   - 이메일: "owner@test.com" (읽기 전용)
   - 전화번호: "010-1234-5678"
   - 역할: "점주" (Badge 컴포넌트, 읽기 전용)
   - 가입일: "2025-01-01" (읽기 전용)
6. "수정하기" 버튼 클릭
7. 수정 모드로 전환:
   - 이름, 전화번호 필드만 Input으로 변경
   - 이메일, 역할, 가입일은 그대로 읽기 전용
8. 이름 수정: "김사장"
9. 전화번호 수정: "010-9999-8888"
10. "저장" 버튼 클릭
11. Mock API 응답 대기 (`PATCH /users/me`)

**검증 포인트 (Assertions)**:
- [✓] 프로필 조회 응답에 `password` 또는 `password_hash` 필드 없음 (AC-F1-07)
- [✓] 읽기 모드에서 비밀번호 관련 정보 미표시
- [✓] "저장" 버튼 클릭 후 로딩 상태: "저장 중..." 텍스트
- [✓] Toast 알림 표시: "프로필이 업데이트되었습니다"
- [✓] 읽기 모드로 자동 전환
- [✓] 화면에 최신 데이터 표시: "김사장", "010-9999-8888"
- [✓] localStorage의 `user` 객체도 업데이트됨

**예상 소요 시간**: 40초

---

### TC-F1-10: 역할 기반 리다이렉트 (RBAC)

**AC 매핑**: AC-F1-05
**우선순위**: P1 (중요)

**테스트 데이터**:
- 점주 로그인: "owner@test.com"
- 직원 로그인: "employee@test.com"

**Step-by-Step 플로우**:

**Part 1: 점주 로그인 → 점주 대시보드**
1. `/auth/login` 페이지로 이동
2. 이메일 입력: "owner@test.com"
3. 비밀번호 입력: "password123"
4. "로그인" 버튼 클릭
5. Mock API 응답 대기 (role: "OWNER")

**Part 1 검증**:
- [✓] URL이 `/dashboard` 또는 `/stores/[id]`로 리다이렉트됨
- [✓] 점주 전용 메뉴 표시 확인:
  - "직원 관리"
  - "매장 설정"
  - "초대 코드 생성"
- [✓] 직원 전용 메뉴 미표시:
  - "내 근무 시간"
  - "출근 체크인"

**Part 2: 로그아웃 → 직원 로그인 → 직원 대시보드**
6. 네비게이션 바에서 "로그아웃" 클릭
7. `/auth/login` 페이지로 리다이렉트
8. 이메일 입력: "employee@test.com"
9. 비밀번호 입력: "password123"
10. "로그인" 버튼 클릭
11. Mock API 응답 대기 (role: "EMPLOYEE")

**Part 2 검증**:
- [✓] URL이 `/my-manuals` 또는 `/attendance/my-records`로 리다이렉트됨
- [✓] 직원 전용 메뉴 표시 확인:
  - "내 매뉴얼"
  - "출근 체크인"
  - "내 근무 시간"
- [✓] 점주 전용 메뉴 미표시:
  - "직원 관리"
  - "매장 설정"
  - "초대 코드 생성"

**Part 3: 권한 없는 페이지 접근 시도**
12. 직원으로 로그인된 상태에서 URL 직접 입력: `/stores/[id]/employees` (점주 전용 페이지)
13. 페이지 로드 시도

**Part 3 검증**:
- [✓] 403 Forbidden 페이지 표시 또는 직원 대시보드로 강제 리다이렉트
- [✓] Toast 알림: "접근 권한이 없습니다"

**예상 소요 시간**: 60초

---

## 5. Edge Case 테스트

### 5.1 Mock API Edge Case 트리거 방법

Mock API (`apps/web/lib/mocks/auth-api.ts`)는 다음 패턴으로 Edge Cases를 트리거:

| Edge Case | Trigger 조건 | 응답 |
|-----------|-------------|------|
| 이메일 중복 | `email === "duplicate@test.com"` | `400 EMAIL_ALREADY_EXISTS` |
| 초대 코드 만료 | `inviteCode === "EXPIRED"` | `400 INVITE_EXPIRED` |
| 잘못된 비밀번호 | `password !== "password123"` | `401 INVALID_CREDENTIALS` |
| 네트워크 실패 | `email === "network-fail@test.com"` | `Network Error` 발생 |
| 토큰 만료 | localStorage에 `expired` 토큰 | `401 TOKEN_EXPIRED` |

### 5.2 Edge Case 테스트 커버리지

| Edge Case | 테스트 시나리오 | 우선순위 |
|-----------|----------------|---------|
| 이메일 중복 | TC-F1-05 | P0 |
| 초대 코드 만료 | TC-F1-07 | P1 |
| 잘못된 비밀번호 | TC-F1-06 | P0 |
| 네트워크 실패 | TC-F1-08 | P1 |
| 토큰 만료 | (Step 4에서 검증) | P2 |

---

## 6. 인터랙션 테스트

### 6.1 실시간 폼 Validation

**테스트 시나리오**: 회원가입 폼 실시간 검증

**플로우**:
1. `/auth/signup` 페이지로 이동
2. 이메일 입력 필드에 잘못된 이메일 입력: "invalid-email"
3. 다음 필드로 포커스 이동 (Tab 키)
4. 이메일 필드 하단에 에러 메시지 즉시 표시: "올바른 이메일 형식이 아닙니다"
5. 이메일 필드에 올바른 이메일 입력: "valid@test.com"
6. 다음 필드로 포커스 이동
7. 에러 메시지 사라지고 녹색 체크 아이콘 표시

**검증 포인트**:
- [✓] 실시간 validation (focus out 시 즉시 검증)
- [✓] 에러 메시지 즉시 표시/숨김
- [✓] 유효한 입력 시 시각적 피드백 (체크 아이콘)

### 6.2 비밀번호 강도 인디케이터

**플로우**:
1. 비밀번호 입력 필드에 "123" 입력
2. 강도 인디케이터 표시: 빨간색 바 (0~40%), "약함"
3. "abc" 추가 입력 → "123abc"
4. 강도 업데이트: 노란색 바 (41~70%), "보통"
5. "ABC!" 추가 입력 → "123abcABC!"
6. 강도 업데이트: 초록색 바 (71~100%), "강함"

**검증 포인트**:
- [✓] 실시간 강도 계산 및 표시
- [✓] 색상 변경 (빨강 → 노랑 → 초록)
- [✓] 텍스트 변경 ("약함" → "보통" → "강함")

### 6.3 로딩 상태 인터랙션

**플로우**:
1. 로그인 폼 제출
2. 버튼 즉시 비활성화 (disabled)
3. 버튼 텍스트 변경: "로그인" → "로그인 중..."
4. 버튼 내부에 로딩 스피너 표시
5. 모든 입력 필드 비활성화
6. Mock API 응답 후 (800ms) 정상 상태로 복귀

**검증 포인트**:
- [✓] 즉각적인 로딩 상태 전환
- [✓] 사용자가 중복 제출 못하도록 방지
- [✓] 시각적 피드백 제공 (스피너, 텍스트)

---

## 7. 접근성 (Accessibility) 테스트

### 7.1 키보드 네비게이션

**테스트 플로우**:
1. `/auth/signup` 페이지로 이동
2. Tab 키로 모든 입력 필드 순차 이동:
   - 역할 선택 → 이름 → 이메일 → 비밀번호 → 비밀번호 확인 → 약관 체크박스 → 가입하기 버튼
3. Shift+Tab 키로 역방향 이동
4. Enter 키로 "가입하기" 버튼 제출
5. Escape 키로 모달/Toast 닫기 (해당되는 경우)

**검증 포인트**:
- [✓] 모든 입력 요소가 Tab 키로 접근 가능
- [✓] 포커스 순서가 논리적 (위→아래, 좌→우)
- [✓] 포커스 시 시각적 표시 (outline, border-primary)
- [✓] Enter 키로 폼 제출 가능
- [✓] Escape 키로 모달/Toast 닫기 가능

### 7.2 ARIA 속성 검증

**테스트 대상**:
- `<label>` 요소가 모든 입력 필드와 연결됨 (`htmlFor` 속성)
- 에러 메시지에 `role="alert"` 속성 존재
- 필수 입력 필드에 `aria-required="true"` 속성
- 유효하지 않은 입력에 `aria-invalid="true"` 속성
- 로딩 중에 `aria-busy="true"` 속성

**검증 방법**:
```typescript
// Playwright 테스트 코드 예시
const emailInput = page.getByLabel('이메일');
await expect(emailInput).toHaveAttribute('aria-required', 'true');

// 잘못된 입력 후
await emailInput.fill('invalid-email');
await emailInput.blur();
await expect(emailInput).toHaveAttribute('aria-invalid', 'true');

// 에러 메시지 검증
const errorMessage = page.locator('[role="alert"]');
await expect(errorMessage).toContainText('올바른 이메일 형식이 아닙니다');
```

### 7.3 스크린 리더 호환성

**테스트 항목**:
- 모든 입력 필드에 의미 있는 `<label>` 제공
- 에러 메시지가 `aria-describedby`로 필드와 연결됨
- 로딩 상태가 스크린 리더에 알려짐 (`aria-live="polite"`)
- 버튼에 명확한 텍스트 제공 ("가입하기", "로그인", "저장")

**검증 방법**:
- Playwright Accessibility Snapshot 사용
- axe-core 라이브러리로 자동 검증 (선택)

---

## 8. 테스트 실행 가이드

### 8.1 로컬 환경 실행

**1단계: Mock API 모드로 서버 실행**
```bash
cd apps/web

# .env.test 파일 생성 (환경변수 설정)
echo "NEXT_PUBLIC_USE_MOCK_API=true" > .env.test
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3001" >> .env.test

# 개발 서버 시작 (포트 3001)
npm run dev
```

**2단계: Playwright 테스트 실행**
```bash
# 모든 테스트 실행 (headless)
npx playwright test

# 특정 파일만 실행
npx playwright test tests/e2e/f1-auth.spec.ts

# UI 모드로 실행 (디버깅)
npx playwright test --ui

# 특정 브라우저만 실행
npx playwright test --project=chromium

# headed 모드 (브라우저 화면 보기)
npx playwright test --headed
```

**3단계: 테스트 결과 확인**
```bash
# HTML 리포트 생성
npx playwright show-report

# 실패한 테스트의 트레이스 확인
npx playwright show-trace test-results/f1-auth-chromium/trace.zip
```

### 8.2 CI/CD 환경 실행 (GitHub Actions)

**`.github/workflows/ui-e2e-test.yml` 예시**:
```yaml
name: UI E2E Tests

on:
  pull_request:
    paths:
      - 'apps/web/**'
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd apps/web
          npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Set environment variables
        run: |
          cd apps/web
          echo "NEXT_PUBLIC_USE_MOCK_API=true" > .env.test
          echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3001" >> .env.test

      - name: Start Next.js server
        run: |
          cd apps/web
          npm run dev &
          npx wait-on http://localhost:3001

      - name: Run Playwright tests
        run: |
          cd apps/web
          npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/web/playwright-report/
          retention-days: 7

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: apps/web/test-results/
          retention-days: 7
```

### 8.3 테스트 디버깅

**방법 1: Playwright Inspector 사용**
```bash
# Inspector 모드로 실행 (단계별 실행 가능)
PWDEBUG=1 npx playwright test tests/e2e/f1-auth.spec.ts
```

**방법 2: Trace Viewer 사용**
```bash
# 테스트 실행 시 트레이스 기록
npx playwright test --trace on

# 트레이스 파일 재생
npx playwright show-trace test-results/f1-auth-chromium/trace.zip
```

**방법 3: 스크린샷 추가**
```typescript
// 테스트 코드에 스크린샷 추가
test('회원가입 테스트', async ({ page }) => {
  await page.goto('/auth/signup');

  // 디버깅용 스크린샷
  await page.screenshot({ path: 'debug-signup-page.png' });

  await page.fill('#email', 'test@example.com');

  // 폼 입력 후 스크린샷
  await page.screenshot({ path: 'debug-form-filled.png' });
});
```

---

## 9. 알려진 이슈 & 제약사항

### 9.1 Mock API 제약사항

**제약 1: 상태 유지 안 됨**
- Mock API는 브라우저 새로고침 시 데이터가 초기화됨
- 해결: localStorage 또는 sessionStorage 활용

**제약 2: 동시성 테스트 불가**
- Mock API는 단일 브라우저 탭에서만 작동
- 해결: Real API 테스트에서 검증 (Step 4)

**제약 3: 네트워크 지연 시뮬레이션 제한**
- Mock API의 delay는 고정값 (1초, 800ms)
- 해결: 필요 시 `delay()` 함수 파라미터로 조정

### 9.2 테스트 환경 이슈

**이슈 1: 포트 충돌**
- 증상: `Error: Port 3001 already in use`
- 해결: `pkill -f "next dev"` 실행 후 재시작

**이슈 2: Playwright 브라우저 미설치**
- 증상: `Error: Executable doesn't exist at ...`
- 해결: `npx playwright install` 실행

**이슈 3: 환경변수 미적용**
- 증상: Real API 호출 시도 (Mock API 사용 의도)
- 해결: `.env.test` 파일 존재 확인, 서버 재시작

### 9.3 Phase 2에서 보완 예정

- [ ] 소셜 로그인 테스트 (Google, Kakao)
- [ ] 비밀번호 찾기 플로우
- [ ] 이메일 인증 플로우
- [ ] 토큰 갱신 자동화 테스트 (Refresh Token)
- [ ] 2단계 인증 (2FA) 테스트

---

## 10. 참조 문서

- **Feature Spec**: `docs/project/features/f1-auth.md` - AC 정의
- **UX Flow**: `docs/ux/features/auth-flow.md` - 사용자 여정
- **Screen Spec**: `docs/ux/features/auth-screens.md` - 화면 구조
- **Mock API**: `apps/web/lib/mocks/auth-api.ts` - Edge cases
- **Playwright 구조**: `docs/qa/ui-e2e/playwright-structure.md` - 테스트 설계
- **Playwright 공식 문서**: https://playwright.dev/

---

**Last Updated**: 2025-11-12
**Status**: F1 Step 2 테스트 계획 완료
**Next**: `docs/qa/ui-e2e/playwright-structure.md` 작성
