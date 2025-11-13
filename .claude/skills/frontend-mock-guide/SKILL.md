---
name: frontend-mock-guide
description: >
  Step 2 (Frontend Prototype with Mock Data) 실행 가이드.
  Mock 데이터로 동작하는 UI를 구현하고 Playwright로 테스트한다.
---

# frontend-mock-guide

## 목적

이 Skill은 Feature 구현의 **Step 2: Frontend Prototype with Mock Data**를 실행하는 가이드이다.

- UX 문서 기반 Mock 데이터 생성
- Next.js 14 App Router 페이지/컴포넌트 구현
- shadcn/ui 컴포넌트 사용
- Mock Provider 패턴으로 API Client 분리
- Playwright E2E 테스트 작성 및 실행

이 단계의 목표는 **Backend API 없이 완전히 동작하는 UI**를 만드는 것이다.

## 입력

### 필수 문서
- `docs/ux/features/<feature-name>-flow.md` - 사용자 여정
- `docs/ux/features/<feature-name>-screens.md` - 화면 구조
- `docs/ux/ui-theme.md` - UI 테마 가이드

### 필수 정보
- Feature 이름 (예: "store-management", "attendance-checkin")

## 출력

### 생성 파일

#### 1. Mock 데이터
- `apps/web/lib/mocks/<feature-name>.ts`
  - Realistic한 Mock 데이터
  - TypeScript 타입 정의
  - 여러 시나리오 지원 (정상, 에러, Empty 등)

#### 2. Next.js 페이지
- `apps/web/app/<feature-path>/page.tsx`
  - App Router 기반
  - Server Component / Client Component 구분
  - 라우팅 구조 반영

#### 3. UI 컴포넌트
- `apps/web/components/<feature>/*.tsx`
  - shadcn/ui 컴포넌트 활용
  - 재사용 가능한 컴포넌트 설계
  - UI Theme 적용 (색상, 타이포, 여백)

#### 4. API Client (Mock Provider)
- `apps/web/lib/api/<feature-name>-client.ts`
  - Mock Provider 패턴
  - 환경변수로 Mock/Real 전환 가능
  - 예:
    ```typescript
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

    export const storeApi = {
      getStores: useMock ? mockGetStores : realGetStores,
      createStore: useMock ? mockCreateStore : realCreateStore,
    };
    ```

#### 5. Playwright E2E 테스트
- `apps/web/tests/e2e/<feature-name>.spec.ts`
  - Mock 데이터 기반 테스트
  - 사용자 플로우 시나리오
  - AC 검증

## 실행 체크리스트

### 1. UX 문서 분석
- [ ] `docs/ux/features/<feature-name>-flow.md` 읽기
- [ ] `docs/ux/features/<feature-name>-screens.md` 읽기
- [ ] 필요한 데이터 구조 파악

### 2. Mock 데이터 생성
- [ ] `apps/web/lib/mocks/<feature-name>.ts` 파일 생성
- [ ] TypeScript 타입 정의
- [ ] Realistic한 데이터 작성 (실제 사용 가능한 수준)
- [ ] 시나리오별 데이터 준비:
  - [ ] 정상 케이스 (데이터 있음)
  - [ ] Empty State (데이터 없음)
  - [ ] 에러 케이스 (API 실패 시뮬레이션)
- [ ] Mock 함수 작성:
  - [ ] GET 요청 (목록, 상세)
  - [ ] POST 요청 (생성)
  - [ ] PUT/PATCH 요청 (수정)
  - [ ] DELETE 요청 (삭제)

### 3. API Client 작성 (Mock Provider)
- [ ] `apps/web/lib/api/<feature-name>-client.ts` 생성
- [ ] Mock Provider 패턴 적용
- [ ] 환경변수로 Mock/Real 전환 가능하도록 설정
- [ ] 각 API 함수의 시그니처 정의
- [ ] Mock 함수는 실제 API와 동일한 응답 구조 반환

### 4. Next.js 페이지 구현
- [ ] App Router 구조에 맞게 디렉토리 생성
- [ ] 각 화면에 대응하는 `page.tsx` 작성
- [ ] Server Component / Client Component 구분:
  - [ ] Server Component: 데이터 fetching, 레이아웃
  - [ ] Client Component: 인터랙션, 상태 관리
- [ ] 라우팅 파라미터 처리 (`[id]` 등)

### 5. UI 컴포넌트 구현
- [ ] shadcn/ui 컴포넌트 활용
  - [ ] Button, Input, Table, Card 등
- [ ] `docs/ux/ui-theme.md` 스타일 적용:
  - [ ] 색상 (Primary, Secondary, Accent)
  - [ ] 타이포그래피 (제목, 본문, 설명)
  - [ ] 여백, 라운드, 그림자
- [ ] 상태별 UI 구현:
  - [ ] 로딩 중 (Skeleton, Spinner)
  - [ ] Empty State
  - [ ] Error State
- [ ] 재사용 가능한 컴포넌트로 분리
- [ ] Props 타입 정의 (TypeScript)

### 6. Playwright E2E 테스트 작성
- [ ] `apps/web/tests/e2e/<feature-name>.spec.ts` 생성
- [ ] 사용자 플로우 기반 시나리오 작성:
  - [ ] 화면 진입
  - [ ] 버튼 클릭
  - [ ] 폼 입력
  - [ ] 제출
  - [ ] 결과 확인
- [ ] AC별 테스트 케이스 작성
- [ ] Empty State 테스트
- [ ] Error State 테스트

### 7. 테스트 실행 및 검증
- [ ] `npm run dev` 실행
- [ ] 브라우저에서 수동 테스트:
  - [ ] 모든 화면 렌더링 확인
  - [ ] 버튼/폼 동작 확인
  - [ ] 상태 전환 확인
- [ ] `npx playwright test apps/web/tests/e2e/<feature-name>.spec.ts` 실행
- [ ] 모든 테스트 통과 확인
- [ ] 실패 시 원인 파악 및 수정

## 주의사항

### ❌ 하지 말아야 할 것

- **Real API를 구현하거나 호출하지 않는다.**
  - 이 단계는 100% Mock 데이터로 동작해야 한다.

- **"나중에 API 연결하면 된다"는 마인드로 임시 코드를 작성하지 않는다.**
  - Mock Provider 패턴을 사용하면, 코드 변경 없이 전환 가능해야 한다.

- **UI Theme을 무시하고 임의로 스타일을 적용하지 않는다.**
  - `docs/ux/ui-theme.md`를 따라야 한다.

- **테스트 없이 "눈으로 확인했으니 됐다"고 넘어가지 않는다.**
  - Playwright 테스트를 반드시 작성하고 통과시켜야 한다.

### ✅ 해야 할 것

- **Realistic한 Mock 데이터를 작성한다.**
  - "test1", "test2" (X)
  - "스타벅스 강남점", "투썸플레이스 역삼점" (O)

- **Mock Provider 패턴을 철저히 적용한다.**
  - 환경변수 하나로 Mock/Real을 전환할 수 있어야 한다.

- **shadcn/ui 컴포넌트를 적극 활용한다.**
  - 직접 만들지 말고, shadcn/ui에 있는 컴포넌트를 사용한다.

- **Empty State, Error State를 빠뜨리지 않는다.**
  - 사용자가 실제로 경험할 모든 상태를 구현한다.

## Mock Provider 패턴 예시

### 1. Mock 데이터 파일 (`apps/web/lib/mocks/stores.ts`)

```typescript
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  employeeCount: number;
  status: 'active' | 'inactive';
}

export const mockStores: Store[] = [
  {
    id: '1',
    name: '스타벅스 강남점',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    employeeCount: 12,
    status: 'active',
  },
  // ... more realistic data
];

export const mockGetStores = async (): Promise<Store[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockStores;
};

export const mockCreateStore = async (data: Omit<Store, 'id'>): Promise<Store> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newStore = { ...data, id: Date.now().toString() };
  mockStores.push(newStore);
  return newStore;
};
```

### 2. API Client (`apps/web/lib/api/stores-client.ts`)

```typescript
import { mockGetStores, mockCreateStore } from '@/lib/mocks/stores';

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Real API 함수 (Step 4에서 구현)
const realGetStores = async () => {
  const res = await fetch('/api/stores');
  return res.json();
};

const realCreateStore = async (data) => {
  const res = await fetch('/api/stores', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json();
};

// Provider 패턴: Mock/Real 전환
export const storesApi = {
  getStores: useMock ? mockGetStores : realGetStores,
  createStore: useMock ? mockCreateStore : realCreateStore,
};
```

### 3. 페이지에서 사용 (`apps/web/app/stores/page.tsx`)

```typescript
import { storesApi } from '@/lib/api/stores-client';

export default async function StoresPage() {
  const stores = await storesApi.getStores();

  return (
    <div>
      <h1>매장 관리</h1>
      {stores.length === 0 ? (
        <EmptyState />
      ) : (
        <StoreList stores={stores} />
      )}
    </div>
  );
}
```

## Agent 실행 가이드 (향후 Agent 구축 시 참조)

### Agent 역할
- `frontend-agent` (general-purpose Agent 사용)

### Agent 작업 순서
1. UX 문서 읽기
2. Mock 데이터 구조 설계
3. Mock 데이터 생성 (`apps/web/lib/mocks/<feature-name>.ts`)
4. API Client 생성 (Mock Provider 패턴)
5. Next.js 페이지 생성
6. shadcn/ui 컴포넌트 활용하여 UI 구현
7. UI Theme 적용
8. Playwright 테스트 작성
9. `npm run dev` 실행
10. `npx playwright test` 실행
11. 테스트 결과 확인 및 수정
12. 완료 보고서 생성

### Agent 출력 형식
```markdown
## Frontend Prototype 완료 보고

Feature: <feature-name>

### 생성 파일
- apps/web/lib/mocks/<feature-name>.ts
- apps/web/lib/api/<feature-name>-client.ts
- apps/web/app/<feature-path>/page.tsx
- apps/web/components/<feature>/*.tsx
- apps/web/tests/e2e/<feature-name>.spec.ts

### 테스트 결과
- Playwright E2E: X개 테스트 모두 통과

### 브라우저 확인 사항
- 모든 화면 렌더링 완료
- Empty State, Error State 확인
- UI Theme 적용 완료

### 다음 단계
- 사용자 UI 검토 및 승인 대기
```

## 완료 조건

- [ ] Mock 데이터 파일 생성됨 (`apps/web/lib/mocks/<feature-name>.ts`)
- [ ] API Client 생성됨 (Mock Provider 패턴)
- [ ] Next.js 페이지 생성됨
- [ ] shadcn/ui 컴포넌트 활용
- [ ] UI Theme 적용 완료
- [ ] Empty State, Error State 구현
- [ ] Playwright E2E 테스트 작성 및 통과
- [ ] 브라우저에서 수동 테스트 통과
- [ ] **사용자가 브라우저에서 UI를 직접 보고 승인함** ← 중요!

## 참조 문서

- `CLAUDE.md` Section 3.2
- `docs/ux/features/<feature-name>-flow.md`
- `docs/ux/features/<feature-name>-screens.md`
- `docs/ux/ui-theme.md`
- shadcn/ui 공식 문서: https://ui.shadcn.com/
- Next.js 14 App Router 문서: https://nextjs.org/docs
- Playwright 문서: https://playwright.dev/

## Playwright 테스트 예시

### `apps/web/tests/e2e/store-management.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('매장 관리', () => {
  test('AC-F2-02: 점주가 매장 목록을 볼 수 있다', async ({ page }) => {
    await page.goto('/stores');

    await expect(page.locator('h1')).toHaveText('매장 관리');
    await expect(page.locator('table tbody tr')).toHaveCount(2); // Mock 데이터 개수
  });

  test('AC-F2-01: 점주가 새 매장을 등록할 수 있다', async ({ page }) => {
    await page.goto('/stores');
    await page.click('button:has-text("새 매장 등록")');

    await expect(page).toHaveURL('/stores/new');

    await page.fill('input[name="name"]', '테스트 매장');
    await page.fill('input[name="address"]', '서울시 강남구');
    await page.fill('input[name="phone"]', '02-1234-5678');

    await page.click('button:has-text("저장")');

    await expect(page).toHaveURL(/\/stores\/\d+/);
    await expect(page.locator('h1')).toHaveText('테스트 매장');
  });

  test('Empty State: 매장이 없을 때', async ({ page }) => {
    // Mock을 Empty 상태로 전환하는 로직 필요 (또는 별도 환경)
    await page.goto('/stores?mock=empty');

    await expect(page.locator('text="등록된 매장이 없습니다"')).toBeVisible();
    await expect(page.locator('button:has-text("새 매장 등록")')).toBeVisible();
  });
});
```
