# Playwright 프로젝트 구조 및 설계 가이드

**프로젝트**: BestPractice HR SaaS
**Playwright 버전**: 1.48.2
**대상 독자**: 프론트엔드 개발자, QA 엔지니어
**작성일**: 2025-11-12
**상위 문서**: `docs/qa/ui-e2e/f1-auth-test-plan.md`

---

## 1. 개요

### 1.1 문서 목적

이 문서는 Playwright를 사용한 UI E2E 테스트의 **구조, 패턴, 모범 사례**를 정의한다.
초보자도 쉽게 이해하고 테스트를 작성할 수 있도록 상세한 설명과 예시를 제공한다.

### 1.2 Playwright 버전

- **버전**: 1.48.2 (from `apps/web/package.json`)
- **설치 명령**:
  ```bash
  npm install @playwright/test@1.48.2 --save-dev
  npx playwright install
  ```

### 1.3 설계 원칙

#### 1) Page Object Model (POM)

**원칙**: 화면별로 클래스를 만들어 UI 요소와 액션을 캡슐화

**장점**:
- UI 변경 시 테스트 코드 수정 최소화
- 재사용성 증가
- 가독성 향상

**예시**:
```typescript
// ❌ 나쁜 예: 테스트마다 선택자 반복
test('로그인 테스트 1', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
});

test('로그인 테스트 2', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('#email', 'other@example.com');  // 중복!
  await page.fill('#password', 'password123');     // 중복!
  await page.click('button[type="submit"]');       // 중복!
});

// ✅ 좋은 예: Page Object 사용
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('이메일').fill(email);
    await this.page.getByLabel('비밀번호').fill(password);
    await this.page.getByRole('button', { name: '로그인' }).click();
  }
}

test('로그인 테스트 1', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
});
```

#### 2) DRY (Don't Repeat Yourself)

**원칙**: 중복 코드를 Fixtures, Helpers, Page Objects로 추출

**예시**:
```typescript
// ❌ 나쁜 예: 로그인 코드 반복
test('프로필 조회', async ({ page }) => {
  // 로그인 (중복 코드 1)
  await page.goto('/auth/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');

  // 프로필 조회
  await page.goto('/profile');
  // ...
});

test('프로필 수정', async ({ page }) => {
  // 로그인 (중복 코드 2)
  await page.goto('/auth/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');

  // 프로필 수정
  await page.goto('/profile');
  // ...
});

// ✅ 좋은 예: Helper 함수 사용
async function loginAs(page: Page, email: string, password: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await page.waitForURL(/\/(dashboard|stores|my-manuals)/);
}

test('프로필 조회', async ({ page }) => {
  await loginAs(page, 'test@example.com', 'password123');
  await page.goto('/profile');
  // ...
});

test('프로필 수정', async ({ page }) => {
  await loginAs(page, 'test@example.com', 'password123');
  await page.goto('/profile');
  // ...
});
```

#### 3) 사용자 관점의 선택자 (User-Facing Selectors)

**원칙**: ID/Class보다 Role, Label, Text로 요소 선택

**이유**:
- 사용자가 보는 방식으로 테스트 작성
- 접근성(Accessibility) 향상
- CSS/HTML 구조 변경에 강함

**예시**:
```typescript
// ❌ 나쁜 예: ID/Class 선택자 (구현 세부사항에 의존)
await page.click('#submit-btn');                  // ID 변경 시 테스트 깨짐
await page.fill('.email-input', 'test@test.com'); // Class 변경 시 테스트 깨짐

// ✅ 좋은 예: 사용자 관점의 선택자
await page.getByRole('button', { name: '제출' }).click();
await page.getByLabel('이메일').fill('test@test.com');
await page.getByText('환영합니다!').isVisible();
```

#### 4) 자동 대기 활용

**원칙**: 명시적 `sleep()`/`waitFor()` 최소화, Playwright의 자동 대기 활용

**예시**:
```typescript
// ❌ 나쁜 예: 수동 대기
await page.click('#submit-btn');
await page.waitForTimeout(3000); // 3초 대기... 항상 필요한가?
await expect(page.locator('.success')).toBeVisible();

// ✅ 좋은 예: 자동 대기
await page.click('#submit-btn');
// → 버튼이 클릭 가능할 때까지 자동 대기
await expect(page.locator('.success')).toBeVisible();
// → 성공 메시지가 나타날 때까지 자동 대기 (최대 30초)
```

---

## 2. 디렉토리 구조

### 2.1 전체 구조

```
apps/web/
├── tests/
│   ├── e2e/                      # E2E 테스트 파일
│   │   └── f1-auth/              # Feature별 폴더
│   │       ├── signup.spec.ts    # 회원가입 테스트
│   │       ├── login.spec.ts     # 로그인 테스트
│   │       ├── profile.spec.ts   # 프로필 테스트
│   │       └── edge-cases.spec.ts # Edge case 테스트
│   │
│   ├── pages/                    # Page Object Model
│   │   └── auth/
│   │       ├── SignupPage.ts
│   │       ├── LoginPage.ts
│   │       └── ProfilePage.ts
│   │
│   ├── fixtures/                 # 테스트 데이터
│   │   ├── test-users.ts         # Mock 유저 데이터
│   │   └── test-stores.ts        # Mock 매장 데이터
│   │
│   └── helpers/                  # 공통 유틸리티
│       ├── auth-helper.ts        # 로그인 헬퍼
│       ├── form-helper.ts        # 폼 입력 헬퍼
│       └── assertion-helper.ts   # 검증 헬퍼
│
├── playwright.config.ts          # Playwright 설정 파일
├── .env.test                     # 테스트 환경변수
└── package.json
```

### 2.2 폴더별 역할

| 폴더 | 역할 | 예시 파일 |
|------|------|----------|
| `tests/e2e/` | 실제 테스트 시나리오 파일 | `f1-auth/signup.spec.ts` |
| `tests/pages/` | Page Object Model 클래스 | `auth/SignupPage.ts` |
| `tests/fixtures/` | 테스트 데이터 (고정된 입력값) | `test-users.ts` |
| `tests/helpers/` | 재사용 가능한 유틸리티 함수 | `auth-helper.ts` |

---

## 3. Playwright 설정 파일

### 3.1 `playwright.config.ts` 전체 구조

```typescript
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 설정 파일
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 테스트 파일 위치
  testDir: './tests/e2e',

  // 각 테스트 최대 실행 시간 (30초)
  timeout: 30 * 1000,

  // 테스트 병렬 실행 (CPU 코어 수만큼)
  fullyParallel: true,

  // 재시도 설정: CI에서 1번, 로컬에서 0번
  retries: process.env.CI ? 1 : 0,

  // 워커 수: CI에서 1개, 로컬에서 CPU 코어 수만큼
  workers: process.env.CI ? 1 : undefined,

  // 리포터 설정
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],

  // 공통 설정
  use: {
    // 기본 URL (상대 경로 사용 시 자동 추가)
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',

    // 스크린샷: 실패 시에만 캡처
    screenshot: 'only-on-failure',

    // 비디오: 실패 시에만 보관
    video: 'retain-on-failure',

    // 트레이스: 재시도 시 기록 (디버깅용)
    trace: 'on-first-retry',

    // 뷰포트 크기 (데스크탑 기본)
    viewport: { width: 1280, height: 720 },

    // 네비게이션 타임아웃 (30초)
    navigationTimeout: 30 * 1000,

    // 액션 타임아웃 (10초)
    actionTimeout: 10 * 1000,
  },

  // 프로젝트 설정 (다중 브라우저 테스트)
  projects: [
    // Desktop - Chromium
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Mock API 사용 설정 (환경변수)
        extraHTTPHeaders: {
          'X-Test-Mode': 'mock',
        },
      },
    },

    // Desktop - Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // Desktop - WebKit (Safari)
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile - iPhone 13
    {
      name: 'mobile-chrome',
      use: { ...devices['iPhone 13'] },
    },

    // Tablet - iPad Pro
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // 로컬 서버 설정 (테스트 전 자동 실행)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI, // CI에서는 새로 시작
    timeout: 120 * 1000, // 서버 시작 대기 시간 (2분)
  },
});
```

### 3.2 주요 설정 설명

| 설정 항목 | 값 | 의미 |
|----------|-----|------|
| `testDir` | `./tests/e2e` | 테스트 파일이 있는 폴더 |
| `timeout` | `30000` | 각 테스트 최대 30초 |
| `fullyParallel` | `true` | 모든 테스트 병렬 실행 |
| `retries` | CI: 1, 로컬: 0 | CI에서 실패 시 1번 재시도 |
| `workers` | CI: 1, 로컬: auto | CI에서는 1개 워커만 사용 |
| `screenshot` | `only-on-failure` | 실패 시에만 스크린샷 저장 |
| `video` | `retain-on-failure` | 실패 시에만 비디오 보관 |
| `trace` | `on-first-retry` | 재시도 시 트레이스 기록 |

---

## 3.5 Fixtures를 사용하는 이유

### 3.5.1 Fixtures란?

**Fixtures**는 테스트에서 반복적으로 사용되는 **고정된 테스트 데이터**를 의미한다.
"고정된(Fixed)" 입력값을 미리 정의해두고, 여러 테스트에서 재사용한다.

**비유**:
- 요리할 때 미리 준비해둔 "밑반찬" 같은 것
- 매번 재료를 손질하지 않고, 미리 만들어둔 밑반찬을 사용

### 3.5.2 왜 필요한가?

#### 문제 상황: 중복된 테스트 데이터

```typescript
// ❌ 나쁜 예: 테스트마다 데이터 중복 정의
test('로그인 테스트 1', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('#email', 'owner@test.com');       // 중복 1
  await page.fill('#password', 'password123');       // 중복 1
  await page.click('button[type="submit"]');
});

test('로그인 테스트 2', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('#email', 'owner@test.com');       // 중복 2
  await page.fill('#password', 'password123');       // 중복 2
  await page.click('button[type="submit"]');
});

test('프로필 수정', async ({ page }) => {
  // 먼저 로그인
  await page.goto('/auth/login');
  await page.fill('#email', 'owner@test.com');       // 중복 3
  await page.fill('#password', 'password123');       // 중복 3
  await page.click('button[type="submit"]');

  // 프로필 수정
  await page.goto('/profile');
  // ...
});
```

**문제점**:
1. 이메일/비밀번호가 바뀌면 모든 테스트 수정 필요
2. 오타 발생 시 찾기 어려움
3. 가독성 저하 (테스트 로직보다 데이터가 더 많음)

#### 해결 방법: Fixtures 사용

```typescript
// ✅ 좋은 예: Fixtures로 데이터 중앙화
// tests/fixtures/test-users.ts
export const testUsers = {
  validOwner: {
    email: 'owner@test.com',
    password: 'password123',
    role: 'OWNER',
  },
  validEmployee: {
    email: 'employee@test.com',
    password: 'password123',
    role: 'EMPLOYEE',
  },
  duplicateEmail: {
    email: 'duplicate@test.com',
    password: 'password123',
  },
};

// tests/e2e/auth/login.spec.ts
import { testUsers } from '../../fixtures/test-users';

test('로그인 테스트 1', async ({ page }) => {
  const user = testUsers.validOwner;  // 한 줄로 데이터 가져오기
  await page.goto('/auth/login');
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.click('button[type="submit"]');
});

test('로그인 테스트 2', async ({ page }) => {
  const user = testUsers.validOwner;  // 동일한 데이터 재사용
  await page.goto('/auth/login');
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.click('button[type="submit"]');
});
```

### 3.5.3 Fixtures의 장점

| 장점 | 설명 | 예시 |
|------|------|------|
| **중복 제거 (DRY)** | 데이터를 한 곳에서 관리 | `testUsers.validOwner` 한 번만 정의 |
| **유지보수 용이** | 데이터 변경 시 한 곳만 수정 | 이메일 변경 → `test-users.ts`만 수정 |
| **가독성 향상** | 테스트 로직에 집중 가능 | 데이터 대신 `user.email` 사용 |
| **Edge Case 관리** | 특수 케이스 데이터 명시적 관리 | `duplicateEmail`, `invalidPassword` 등 |

### 3.5.4 Fixtures 폴더 구조

```
tests/fixtures/
├── test-users.ts          # 유저 관련 데이터
├── test-stores.ts         # 매장 관련 데이터
├── test-manuals.ts        # 매뉴얼 관련 데이터
└── index.ts               # 모든 Fixtures export
```

**예시: `test-users.ts`**
```typescript
import type { User, SignupDto, LoginDto } from '@/lib/types';

/**
 * 테스트용 유저 데이터 Fixtures
 * Mock API의 Edge Cases와 동기화됨
 */

// 유효한 회원가입 데이터
export const validSignupData = {
  owner: {
    role: 'OWNER' as const,
    name: '김점주',
    email: 'newowner@test.com',
    password: 'password123',
    passwordConfirm: 'password123',
  },
  employee: {
    role: 'EMPLOYEE' as const,
    name: '이직원',
    email: 'newemployee@test.com',
    password: 'password123',
    passwordConfirm: 'password123',
    inviteCode: 'VALID_CODE',
  },
};

// 유효한 로그인 데이터
export const validLoginData = {
  owner: {
    email: 'owner@test.com',
    password: 'password123',
  },
  employee: {
    email: 'employee@test.com',
    password: 'password123',
  },
};

// Edge Cases (Mock API 트리거)
export const edgeCaseData = {
  duplicateEmail: {
    email: 'duplicate@test.com',
    password: 'password123',
  },
  networkFail: {
    email: 'network-fail@test.com',
    password: 'password123',
  },
  expiredInvite: {
    inviteCode: 'EXPIRED',
  },
  invalidPassword: {
    email: 'owner@test.com',
    password: 'wrongpassword',
  },
};

// Mock API 응답 데이터
export const mockUsers = {
  owner: {
    id: 'user-owner-001',
    email: 'owner@test.com',
    name: '김점주',
    role: 'OWNER' as const,
    phone: '010-1234-5678',
    createdAt: '2025-11-12T00:00:00Z',
  },
  employee: {
    id: 'user-employee-001',
    email: 'employee@test.com',
    name: '이직원',
    role: 'EMPLOYEE' as const,
    phone: '010-8765-4321',
    createdAt: '2025-11-12T00:00:00Z',
  },
};
```

### 3.5.5 Playwright의 Fixtures 확장 기능

Playwright는 자체 Fixtures 시스템도 제공한다 (선택적 사용):

```typescript
// tests/fixtures/authenticated-page.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { testUsers } from './test-users';

/**
 * 이미 로그인된 상태의 page fixture
 * 로그인이 필요한 테스트에서 재사용
 */
type AuthenticatedPageFixture = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthenticatedPageFixture>({
  authenticatedPage: async ({ page }, use) => {
    // 로그인 실행
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.validOwner.email, testUsers.validOwner.password);

    // 로그인된 page를 테스트에 전달
    await use(page);
  },
});

// 사용 예시
import { test } from '../fixtures/authenticated-page';

test('프로필 조회', async ({ authenticatedPage }) => {
  // 이미 로그인된 상태!
  await authenticatedPage.goto('/profile');
  await expect(authenticatedPage.getByText('김점주')).toBeVisible();
});

test('프로필 수정', async ({ authenticatedPage }) => {
  // 이미 로그인된 상태!
  await authenticatedPage.goto('/profile');
  await authenticatedPage.getByRole('button', { name: '수정하기' }).click();
  // ...
});
```

### 3.5.6 Fixtures 사용 전/후 비교 표

| 항목 | Fixtures 사용 전 | Fixtures 사용 후 |
|------|-----------------|-----------------|
| **데이터 정의** | 각 테스트마다 중복 | `test-users.ts` 한 곳에서 관리 |
| **데이터 변경** | 모든 테스트 수정 필요 | 한 파일만 수정 |
| **Edge Case 관리** | 산발적으로 흩어짐 | `edgeCaseData` 객체에 명시 |
| **가독성** | 낮음 (데이터가 테스트 로직과 섞임) | 높음 (로직과 데이터 분리) |
| **재사용성** | 불가능 | 모든 테스트에서 재사용 |
| **유지보수** | 어려움 | 쉬움 |

---

## 4. Page Object Model (POM) 설계

### 4.1 SignupPage 클래스 구조

```typescript
// tests/pages/auth/SignupPage.ts
import { Page, Locator, expect } from '@playwright/test';

/**
 * 회원가입 페이지 Page Object
 * 화면 요소와 액션을 캡슐화
 */
export class SignupPage {
  // Locators (요소 선택자)
  readonly page: Page;
  readonly roleOwnerRadio: Locator;
  readonly roleEmployeeRadio: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordConfirmInput: Locator;
  readonly phoneInput: Locator;
  readonly agreeCheckbox: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;

    // 사용자 관점의 선택자 사용
    this.roleOwnerRadio = page.getByRole('radio', { name: '점주' });
    this.roleEmployeeRadio = page.getByRole('radio', { name: '직원' });
    this.nameInput = page.getByLabel('이름');
    this.emailInput = page.getByLabel('이메일');
    this.passwordInput = page.getByLabel('비밀번호', { exact: true });
    this.passwordConfirmInput = page.getByLabel('비밀번호 확인');
    this.phoneInput = page.getByLabel('전화번호');
    this.agreeCheckbox = page.getByLabel(/이용약관.*동의/);
    this.submitButton = page.getByRole('button', { name: '가입하기' });
    this.errorAlert = page.getByRole('alert');
    this.successToast = page.getByText('환영합니다!');
  }

  /**
   * 회원가입 페이지로 이동
   */
  async goto() {
    await this.page.goto('/auth/signup');
  }

  /**
   * 초대 코드와 함께 회원가입 페이지로 이동
   */
  async gotoWithInvite(inviteCode: string) {
    await this.page.goto(`/auth/signup?inviteCode=${inviteCode}`);
  }

  /**
   * 역할 선택 (점주/직원)
   */
  async selectRole(role: 'OWNER' | 'EMPLOYEE') {
    if (role === 'OWNER') {
      await this.roleOwnerRadio.check();
    } else {
      await this.roleEmployeeRadio.check();
    }
  }

  /**
   * 폼 입력 (전체)
   */
  async fillForm(data: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    phone?: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.passwordConfirmInput.fill(data.passwordConfirm);

    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
  }

  /**
   * 이용약관 동의 체크
   */
  async agreeToTerms() {
    await this.agreeCheckbox.check();
  }

  /**
   * 가입하기 버튼 클릭
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * 전체 회원가입 플로우 (Helper 메서드)
   */
  async signup(data: {
    role: 'OWNER' | 'EMPLOYEE';
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    phone?: string;
  }) {
    await this.selectRole(data.role);
    await this.fillForm(data);
    await this.agreeToTerms();
    await this.submit();
  }

  /**
   * 로딩 상태 검증
   */
  async expectLoadingState() {
    // 버튼 비활성화 확인
    await expect(this.submitButton).toBeDisabled();

    // 로딩 스피너 표시 확인
    const spinner = this.submitButton.locator('[role="status"]');
    await expect(spinner).toBeVisible();
  }

  /**
   * 에러 메시지 검증
   */
  async expectError(message: string | RegExp) {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(message);
  }

  /**
   * 성공 Toast 검증
   */
  async expectSuccessToast() {
    await expect(this.successToast).toBeVisible();
  }

  /**
   * 특정 URL로 리다이렉트 검증
   */
  async expectRedirectTo(url: string | RegExp) {
    await this.page.waitForURL(url);
  }
}
```

### 4.2 LoginPage 클래스 구조

```typescript
// tests/pages/auth/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signupLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('이메일');
    this.passwordInput = page.getByLabel('비밀번호');
    this.submitButton = page.getByRole('button', { name: '로그인' });
    this.errorAlert = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: '비밀번호 찾기' });
    this.signupLink = page.getByRole('link', { name: '가입하기' });
  }

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string | RegExp) {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(message);
  }

  async expectEmailRetained(email: string) {
    await expect(this.emailInput).toHaveValue(email);
  }

  async expectPasswordCleared() {
    await expect(this.passwordInput).toHaveValue('');
  }
}
```

### 4.3 ProfilePage 클래스 구조

```typescript
// tests/pages/auth/ProfilePage.ts
import { Page, Locator, expect } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly editButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly nameInput: Locator;
  readonly emailText: Locator;
  readonly phoneInput: Locator;
  readonly roleBadge: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editButton = page.getByRole('button', { name: '수정하기' });
    this.saveButton = page.getByRole('button', { name: '저장' });
    this.cancelButton = page.getByRole('button', { name: '취소' });
    this.nameInput = page.getByLabel('이름');
    this.emailText = page.getByText(/이메일/).locator('..').locator('text=');
    this.phoneInput = page.getByLabel('전화번호');
    this.roleBadge = page.locator('[data-testid="role-badge"]');
    this.successToast = page.getByText('프로필이 업데이트되었습니다');
  }

  async goto() {
    await this.page.goto('/profile');
  }

  async clickEdit() {
    await this.editButton.click();
  }

  async updateProfile(data: { name?: string; phone?: string }) {
    if (data.name) {
      await this.nameInput.fill(data.name);
    }
    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
    await this.saveButton.click();
  }

  async expectSuccessToast() {
    await expect(this.successToast).toBeVisible();
  }

  async expectReadMode() {
    await expect(this.editButton).toBeVisible();
    await expect(this.saveButton).not.toBeVisible();
  }

  async expectEditMode() {
    await expect(this.editButton).not.toBeVisible();
    await expect(this.saveButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }
}
```

---

## 5. Test Fixture 설계

(이미 섹션 3.5에서 상세히 다룸)

**요약**:
- `tests/fixtures/test-users.ts`: 유저 데이터
- `tests/fixtures/test-stores.ts`: 매장 데이터
- `tests/fixtures/index.ts`: 모든 Fixtures export

---

## 6. Helper 함수 설계

### 6.1 `auth-helper.ts`

```typescript
// tests/helpers/auth-helper.ts
import { Page } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';

/**
 * 로그인 헬퍼 함수
 */
export async function loginAs(page: Page, email: string, password: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);

  // 역할별 대시보드로 리다이렉트 대기
  await page.waitForURL(/\/(dashboard|stores|my-manuals|attendance)/);
}

/**
 * 로그아웃 헬퍼 함수
 */
export async function logout(page: Page) {
  // 네비게이션 바의 로그아웃 버튼 클릭
  await page.getByRole('button', { name: '로그아웃' }).click();

  // 로그인 페이지로 리다이렉트 대기
  await page.waitForURL('/auth/login');
}

/**
 * localStorage 토큰 확인
 */
export async function expectTokensStored(page: Page) {
  const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
  const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));

  expect(accessToken).toBeTruthy();
  expect(refreshToken).toBeTruthy();
}
```

### 6.2 `form-helper.ts`

```typescript
// tests/helpers/form-helper.ts
import { Page, Locator, expect } from '@playwright/test';

/**
 * 폼 필드 에러 메시지 검증
 */
export async function expectFieldError(field: Locator, message: string | RegExp) {
  // 필드에 aria-invalid 속성 확인
  await expect(field).toHaveAttribute('aria-invalid', 'true');

  // 필드 하단 에러 메시지 확인
  const errorId = await field.getAttribute('aria-describedby');
  if (errorId) {
    const errorMessage = field.page().locator(`#${errorId}`);
    await expect(errorMessage).toContainText(message);
  }
}

/**
 * 폼 전체 에러 Alert 검증
 */
export async function expectFormError(page: Page, message: string | RegExp) {
  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(message);
}
```

---

## 7. 테스트 작성 패턴

### 7.1 AAA 패턴 (Arrange-Act-Assert)

모든 테스트는 다음 3단계로 구성:

```typescript
test('TC-F1-01: 점주 회원가입 성공 플로우', async ({ page }) => {
  // === Arrange (준비) ===
  // 테스트 데이터 준비
  const signupData = testUsers.validSignupData.owner;
  const signupPage = new SignupPage(page);

  // === Act (실행) ===
  // 실제 사용자 액션 수행
  await signupPage.goto();
  await signupPage.signup(signupData);

  // === Assert (검증) ===
  // 예상 결과 확인
  await signupPage.expectSuccessToast();
  await signupPage.expectRedirectTo('/stores/new');
  await expectTokensStored(page);
});
```

### 7.2 테스트 파일 구조

```typescript
// tests/e2e/f1-auth/signup.spec.ts
import { test, expect } from '@playwright/test';
import { SignupPage } from '../../pages/auth/SignupPage';
import { testUsers } from '../../fixtures/test-users';

// 테스트 그룹화
test.describe('F1-Auth: 회원가입', () => {
  // 각 테스트 전에 실행 (선택)
  test.beforeEach(async ({ page }) => {
    // 필요 시 초기 설정
  });

  // 성공 케이스
  test('TC-F1-01: 점주 회원가입 성공', async ({ page }) => {
    // ...
  });

  test('TC-F1-02: 직원 회원가입 성공 (초대 코드)', async ({ page }) => {
    // ...
  });

  // 에러 케이스
  test('TC-F1-05: 이메일 중복 에러', async ({ page }) => {
    // ...
  });

  test('TC-F1-08: 네트워크 실패 에러', async ({ page }) => {
    // ...
  });
});
```

---

## 8. Mock API 설정 방법

### 8.1 환경변수 설정

```bash
# apps/web/.env.test
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 8.2 Playwright에서 환경변수 전달

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    env: {
      NEXT_PUBLIC_USE_MOCK_API: 'true', // Mock API 사용
    },
  },
});
```

---

## 9. 테스트 데이터 관리

### 9.1 데이터 분류

| 데이터 유형 | 저장 위치 | 예시 |
|------------|---------|------|
| **정적 데이터** | `tests/fixtures/` | 유저 이메일, 비밀번호 |
| **동적 데이터** | 테스트 내부 생성 | `Date.now()`, UUID |
| **Edge Case 데이터** | `tests/fixtures/` | `duplicate@test.com` |

### 9.2 데이터 격리 (Isolation)

각 테스트는 독립적으로 실행되어야 함:

```typescript
// ❌ 나쁜 예: 테스트 간 데이터 공유
let sharedUser: User;

test('회원가입', async ({ page }) => {
  sharedUser = await signup(page); // 전역 변수 수정
});

test('로그인', async ({ page }) => {
  await login(page, sharedUser.email); // 이전 테스트 의존
});

// ✅ 좋은 예: 각 테스트 독립적
test('회원가입', async ({ page }) => {
  const user = testUsers.validSignupData.owner;
  await signup(page, user);
});

test('로그인', async ({ page }) => {
  const user = testUsers.validLoginData.owner;
  await login(page, user);
});
```

---

## 10. 스크린샷 & 비디오 설정

### 10.1 자동 캡처 설정

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure', // 실패 시에만
    video: 'retain-on-failure',    // 실패 시에만
  },
});
```

### 10.2 수동 스크린샷

```typescript
test('디버깅용 스크린샷', async ({ page }) => {
  await page.goto('/auth/signup');

  // 특정 시점에 스크린샷 저장
  await page.screenshot({ path: 'debug-signup-initial.png' });

  await page.fill('#email', 'test@test.com');

  // 폼 입력 후 스크린샷
  await page.screenshot({ path: 'debug-signup-filled.png' });
});
```

---

## 11. CI/CD 통합 가이드

### 11.1 GitHub Actions 워크플로우

```yaml
# .github/workflows/ui-e2e-test.yml
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
      - name: Checkout code
        uses: actions/checkout@v3

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

      - name: Run Playwright tests
        run: |
          cd apps/web
          npx playwright test

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/web/playwright-report/
          retention-days: 7

      - name: Upload screenshots & videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: apps/web/test-results/
          retention-days: 7
```

---

## 12. 디버깅 가이드

### 12.1 Playwright Inspector

```bash
# Inspector 모드로 실행 (단계별 실행)
PWDEBUG=1 npx playwright test tests/e2e/f1-auth/signup.spec.ts
```

### 12.2 Trace Viewer

```bash
# 트레이스 기록하며 테스트 실행
npx playwright test --trace on

# 트레이스 파일 재생 (시각적 디버깅)
npx playwright show-trace test-results/f1-auth-signup-chromium/trace.zip
```

### 12.3 UI 모드

```bash
# UI 모드로 실행 (브라우저에서 테스트 관리)
npx playwright test --ui
```

### 12.4 Headed 모드

```bash
# 브라우저 화면 보면서 테스트 실행
npx playwright test --headed
```

---

## 13. 베스트 프랙티스 요약

### 13.1 해야 할 것 (✅)

1. **Page Object Model 사용**: UI 요소와 액션 캡슐화
2. **Fixtures 활용**: 테스트 데이터 중앙화
3. **사용자 관점 선택자**: `getByRole()`, `getByLabel()` 우선
4. **자동 대기 활용**: `sleep()` 최소화
5. **AAA 패턴**: Arrange-Act-Assert 구조 유지
6. **테스트 독립성**: 각 테스트 독립적으로 실행 가능
7. **의미 있는 테스트명**: `TC-F1-01: 점주 회원가입 성공 플로우`
8. **에러 메시지 검증**: 사용자에게 표시되는 메시지 확인

### 13.2 하지 말아야 할 것 (❌)

1. **ID/Class 선택자 남용**: CSS 구조 변경에 취약
2. **하드코딩된 대기**: `waitForTimeout(3000)` 지양
3. **테스트 간 데이터 공유**: 전역 변수 사용 금지
4. **너무 긴 테스트**: 한 테스트에 여러 시나리오 포함 지양
5. **구현 세부사항 테스트**: 내부 함수 대신 사용자 행동 테스트
6. **스크린샷 과다 사용**: 필요한 경우에만 저장
7. **에러 무시**: 테스트 실패 시 원인 파악 후 수정

---

## 14. 참조 자료

- **Playwright 공식 문서**: https://playwright.dev/
- **Playwright API Reference**: https://playwright.dev/docs/api/class-test
- **Page Object Model**: https://playwright.dev/docs/pom
- **Best Practices**: https://playwright.dev/docs/best-practices
- **F1 테스트 계획**: `docs/qa/ui-e2e/f1-auth-test-plan.md`

---

**Last Updated**: 2025-11-12
**Status**: Playwright 구조 설계 완료
**Next**: 실제 테스트 코드 작성 (`tests/e2e/f1-auth/signup.spec.ts`)
