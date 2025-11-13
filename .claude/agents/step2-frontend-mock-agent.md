---
name: step2-frontend-mock-agent
version: 1.0
purpose: >
  Step 2: Frontend Prototype with Mock Data - Mock 데이터로 동작하는 UI를 자동으로 구현합니다.
  Agent automation guide for executing the frontend mock implementation workflow.
target_skill: frontend-mock-guide
target_command: /mock-ui
---

# Agent Prompt: Step 2 - Frontend Mock Agent

## 목적 (Purpose)

이 Agent는 `/mock-ui` 커맨드 실행 시 Mock 데이터로 완전히 동작하는 UI를 **자동으로 구현**합니다.

- UX 문서 기반 Mock 데이터 자동 생성
- Mock Provider 패턴 자동 적용
- Next.js 14 App Router 페이지/컴포넌트 자동 생성
- shadcn/ui 컴포넌트 자동 통합
- Playwright E2E 테스트 자동 작성 및 실행

**핵심 원칙**: Backend API 없이 100% Mock으로 동작하는 완성된 UI

## 사전조건 (Prerequisites)

Agent 실행 전 다음 조건이 충족되어야 합니다:

- [ ] Step 1 (UX Planning) 완료
- [ ] `docs/ux/features/<feature-name>-flow.md` 파일 존재
- [ ] `docs/ux/features/<feature-name>-screens.md` 파일 존재
- [ ] `docs/ux/ui-theme.md` 파일 존재
- [ ] Next.js 14 App Router 프로젝트 설정 완료
- [ ] shadcn/ui 설치 완료
- [ ] Playwright 설치 완료

## 입력 파라미터 (Input Parameters)

Agent 실행 시 다음 파라미터가 필요합니다:

- `feature_name`: Feature 이름 (예: "store-management", "attendance-checkin")
- `feature_number`: Feature 번호 (예: "F2", "F3")

## Agent 작업 순서 (Task Sequence)

### Phase 1: UX 문서 분석 (UX Document Analysis)

#### 1. UX 문서 읽기
- `docs/ux/features/<feature-name>-flow.md` 읽기
- `docs/ux/features/<feature-name>-screens.md` 읽기
- 화면 목록 추출
- 각 화면의 UI 요소 추출

#### 2. 필요한 데이터 구조 파악
- 각 화면에서 필요한 데이터 필드 추출
- 데이터 간 관계 파악 (1:1, 1:N, N:M)
- TypeScript 인터페이스 설계

**결정 규칙**:
- 목록 화면 → Array 타입
- 상세 화면 → Single Object 타입
- 폼 화면 → Input DTO 타입 (Omit<T, 'id' | 'createdAt'>)

### Phase 2: Mock 데이터 생성 (Mock Data Generation)

#### 3. TypeScript 타입 정의
`apps/web/lib/mocks/<feature-name>.ts` 파일 생성:

```typescript
export interface {EntityName} {
  id: string;
  {field1}: {type};
  {field2}: {type};
  // ...
  createdAt: Date;
  updatedAt?: Date;
}

export type Create{EntityName}DTO = Omit<{EntityName}, 'id' | 'createdAt' | 'updatedAt'>;
export type Update{EntityName}DTO = Partial<Create{EntityName}DTO>;
```

#### 4. Realistic Mock 데이터 작성
- 최소 3-5개의 실제와 유사한 Mock 데이터 생성
- 다양한 시나리오 포함 (active/inactive, 여러 상태 등)

**중요**: "test1", "test2" 같은 테스트 데이터 금지!
**예시**: "스타벅스 강남점", "투썸플레이스 역삼점" 등 실제 사용 가능한 데이터

```typescript
export const mock{Entities}: {EntityName}[] = [
  {
    id: '1',
    name: '스타벅스 강남점',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    employeeCount: 12,
    status: 'active',
    createdAt: new Date('2025-01-15'),
  },
  // ... more realistic data
];
```

#### 5. Mock 함수 작성
CRUD 패턴에 맞춰 Mock 함수 작성:

```typescript
// GET: 목록 조회
export const mockGet{Entities} = async (): Promise<{EntityName}[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // API 지연 시뮬레이션
  return mock{Entities};
};

// GET: 단건 조회
export const mockGet{Entity} = async (id: string): Promise<{EntityName} | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mock{Entities}.find(item => item.id === id) || null;
};

// POST: 생성
export const mockCreate{Entity} = async (data: Create{EntityName}DTO): Promise<{EntityName}> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const new{Entity} = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  mock{Entities}.push(new{Entity});
  return new{Entity};
};

// PUT/PATCH: 수정
export const mockUpdate{Entity} = async (id: string, data: Update{EntityName}DTO): Promise<{EntityName}> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mock{Entities}.findIndex(item => item.id === id);
  if (index === -1) throw new Error('Not found');

  mock{Entities}[index] = { ...mock{Entities}[index], ...data, updatedAt: new Date() };
  return mock{Entities}[index];
};

// DELETE: 삭제
export const mockDelete{Entity} = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mock{Entities}.findIndex(item => item.id === id);
  if (index === -1) throw new Error('Not found');

  mock{Entities}.splice(index, 1);
};
```

#### 6. 시나리오별 Mock 데이터 준비
- **정상 케이스**: 데이터 있음 (기본)
- **Empty State**: 빈 배열 반환
- **Error State**: throw new Error() 시뮬레이션

**환경변수 활용 예시**:
```typescript
const mockScenario = process.env.NEXT_PUBLIC_MOCK_SCENARIO || 'normal';

export const mockGet{Entities} = async (): Promise<{EntityName}[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  if (mockScenario === 'empty') return [];
  if (mockScenario === 'error') throw new Error('API Error');

  return mock{Entities};
};
```

### Phase 3: API Client 작성 (Mock Provider Pattern)

#### 7. Mock Provider 패턴 적용
`apps/web/lib/api/<feature-name>-client.ts` 파일 생성:

```typescript
import {
  mockGet{Entities},
  mockGet{Entity},
  mockCreate{Entity},
  mockUpdate{Entity},
  mockDelete{Entity},
} from '@/lib/mocks/<feature-name>';

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Real API 함수 (Step 4에서 구현, 현재는 placeholder)
const realGet{Entities} = async () => {
  const res = await fetch('/api/{resource}');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const realGet{Entity} = async (id: string) => {
  const res = await fetch(`/api/{resource}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const realCreate{Entity} = async (data: Create{EntityName}DTO) => {
  const res = await fetch('/api/{resource}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create');
  return res.json();
};

const realUpdate{Entity} = async (id: string, data: Update{EntityName}DTO) => {
  const res = await fetch(`/api/{resource}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
};

const realDelete{Entity} = async (id: string) => {
  const res = await fetch(`/api/{resource}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete');
};

// Provider 패턴: 환경변수 하나로 Mock/Real 전환
export const {resource}Api = {
  get{Entities}: useMock ? mockGet{Entities} : realGet{Entities},
  get{Entity}: useMock ? mockGet{Entity} : realGet{Entity},
  create{Entity}: useMock ? mockCreate{Entity} : realCreate{Entity},
  update{Entity}: useMock ? mockUpdate{Entity} : realUpdate{Entity},
  delete{Entity}: useMock ? mockDelete{Entity} : realDelete{Entity},
};
```

### Phase 4: Next.js 페이지 구현 (Next.js Page Implementation)

#### 8. App Router 디렉토리 구조 생성
UX 문서의 URL 패턴에 맞춰 디렉토리 생성:

```
apps/web/app/
├── {resource}/                    # 목록 화면
│   ├── page.tsx
│   ├── new/                       # 생성 폼
│   │   └── page.tsx
│   └── [id]/                      # 상세 화면
│       ├── page.tsx
│       └── edit/                  # 수정 폼
│           └── page.tsx
```

#### 9. 각 페이지 구현
**Server Component vs Client Component 결정 규칙**:
- **Server Component**: 초기 데이터 fetching, SEO 필요
- **Client Component**: 사용자 인터랙션, 상태 관리

**목록 페이지 예시** (`apps/web/app/{resource}/page.tsx`):
```typescript
import { {resource}Api } from '@/lib/api/<feature-name>-client';
import { {EntityName}List } from '@/components/<feature>/{EntityName}List';

export default async function {Entities}Page() {
  const {entities} = await {resource}Api.get{Entities}();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{화면 제목}</h1>

      {entities.length === 0 ? (
        <EmptyState />
      ) : (
        <{EntityName}List {entities}={{entities}} />
      )}
    </div>
  );
}
```

#### 10. 라우팅 파라미터 처리
Dynamic routes (`[id]`) 처리:

```typescript
export default async function {Entity}DetailPage({
  params,
}: {
  params: { id: string };
}) {
  const {entity} = await {resource}Api.get{Entity}(params.id);

  if (!{entity}) {
    return <NotFound />;
  }

  return <{Entity}Detail {entity}={{entity}} />;
}
```

### Phase 5: UI 컴포넌트 구현 (UI Components Implementation)

#### 11. shadcn/ui 컴포넌트 활용
`apps/web/components/<feature>/` 디렉토리에 컴포넌트 생성:

**필수 shadcn/ui 컴포넌트**:
- Button (`npx shadcn-ui@latest add button`)
- Input (`npx shadcn-ui@latest add input`)
- Table (`npx shadcn-ui@latest add table`)
- Card (`npx shadcn-ui@latest add card`)
- Form (`npx shadcn-ui@latest add form`)

#### 12. UI Theme 적용
`docs/ux/ui-theme.md`의 스타일 가이드 준수:
- 색상 (Primary, Secondary, Accent)
- 타이포그래피 (제목, 본문, 설명)
- 여백, 라운드, 그림자

#### 13. 상태별 UI 구현
**필수 상태**:
- 로딩 중: Skeleton, Spinner
- Empty State: 메시지 + CTA 버튼
- Error State: 에러 메시지 + 재시도 버튼

**Empty State 컴포넌트 예시**:
```typescript
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <p className="text-gray-500 mb-4">등록된 {데이터}가 없습니다</p>
      <Button asChild>
        <Link href="/{resource}/new">새로 등록하기</Link>
      </Button>
    </div>
  );
}
```

#### 14. Props 타입 정의
모든 컴포넌트에 TypeScript Props 정의:

```typescript
interface {EntityName}ListProps {
  {entities}: {EntityName}[];
}

export function {EntityName}List({ {entities} }: {EntityName}ListProps) {
  // ...
}
```

### Phase 6: Playwright E2E 테스트 작성 (E2E Testing)

#### 15. E2E 테스트 파일 생성
`apps/web/tests/e2e/<feature-name>.spec.ts` 생성:

```typescript
import { test, expect } from '@playwright/test';

test.describe('{Feature 제목}', () => {
  test.beforeEach(async ({ page }) => {
    // Mock 데이터 환경 설정
    await page.goto('/{resource}');
  });

  test('AC-F{N}-01: {AC 설명}', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('{화면 제목}');
    await expect(page.locator('table tbody tr')).toHaveCount(3); // Mock 데이터 개수
  });

  test('AC-F{N}-02: {AC 설명}', async ({ page }) => {
    await page.click('button:has-text("새로 등록")');
    await expect(page).toHaveURL('/{resource}/new');

    await page.fill('input[name="field1"]', 'Test Value');
    await page.fill('input[name="field2"]', 'Test Value 2');
    await page.click('button:has-text("저장")');

    await expect(page).toHaveURL(/\/{resource}\/\d+/);
  });

  test('Empty State 테스트', async ({ page, context }) => {
    // Mock 시나리오를 Empty로 변경 (환경변수 조작 또는 별도 설정)
    await page.goto('/{resource}?mock=empty');
    await expect(page.locator('text="등록된 {데이터}가 없습니다"')).toBeVisible();
    await expect(page.locator('button:has-text("새로 등록")')).toBeVisible();
  });
});
```

### Phase 7: 테스트 실행 및 검증 (Test Execution & Validation)

#### 16. 개발 서버 실행
```bash
cd apps/web
npm run dev
```

브라우저에서 수동 테스트:
- [ ] 모든 화면 렌더링 확인
- [ ] 버튼/폼 동작 확인
- [ ] 상태 전환 확인 (로딩, Empty, Error)

#### 17. Playwright 테스트 실행
```bash
npx playwright test apps/web/tests/e2e/<feature-name>.spec.ts
```

**검증 항목**:
- [ ] 모든 테스트 통과
- [ ] AC별 테스트 케이스 모두 성공
- [ ] Empty State, Error State 동작 확인

**에러 처리**:
- 테스트 실패 시: 스크린샷 확인, 에러 로그 분석, 수정 후 재실행
- 최대 3회 재시도 후 사용자에게 보고

## 출력 형식 (Output Format)

Agent 실행 완료 시 다음 형식으로 보고서 생성:

```markdown
## Step 2 (Frontend Prototype with Mock) 완료 보고

Feature: {feature_name} ({feature_number})

### 생성된 파일

#### Mock 데이터
- ✅ `apps/web/lib/mocks/<feature-name>.ts`
  - TypeScript 타입: {count}개
  - Mock 데이터: {count}개
  - Mock 함수: {count}개

#### API Client
- ✅ `apps/web/lib/api/<feature-name>-client.ts`
  - Mock Provider 패턴 적용
  - 환경변수: NEXT_PUBLIC_USE_MOCK_API=true

#### Next.js 페이지
- ✅ `apps/web/app/{resource}/page.tsx` (목록)
- ✅ `apps/web/app/{resource}/new/page.tsx` (생성 폼)
- ✅ `apps/web/app/{resource}/[id]/page.tsx` (상세)
- ✅ `apps/web/app/{resource}/[id]/edit/page.tsx` (수정 폼)

#### UI 컴포넌트
- ✅ `apps/web/components/<feature>/{EntityName}List.tsx`
- ✅ `apps/web/components/<feature>/{EntityName}Form.tsx`
- ✅ `apps/web/components/<feature>/EmptyState.tsx`
- ✅ `apps/web/components/<feature>/ErrorState.tsx`

#### E2E 테스트
- ✅ `apps/web/tests/e2e/<feature-name>.spec.ts`

### Playwright 테스트 결과
- ✅ 총 {count}개 테스트 모두 통과
- ✅ AC 검증: {passed}/{total}
- ✅ Empty State 테스트 통과
- ✅ Error State 테스트 통과

### shadcn/ui 컴포넌트 사용
- Button, Input, Table, Card, Form

### UI Theme 적용
- ✅ 색상 적용 (Primary, Secondary)
- ✅ 타이포그래피 적용
- ✅ 여백 및 레이아웃 가이드 준수

### 브라우저 검증
- ✅ 개발 서버 실행: http://localhost:3000/{resource}
- ✅ 모든 화면 렌더링 완료
- ✅ Mock 데이터 정상 동작
- ✅ Empty/Error State 확인

### 다음 단계
- [ ] 사용자가 브라우저에서 UI를 직접 확인하고 승인
- [ ] 승인 후 Step 3 (Data Layer Design) 진행

---

**사용자 액션 필요**: 브라우저에서 http://localhost:3000/{resource}를 열어 UI를 직접 테스트해주세요.
```

## 결정 규칙 (Decision Rules)

### Server Component vs Client Component
- **If** 데이터 fetching만 있고 인터랙션 없음 **Then** Server Component
- **If** useState, useEffect, onClick 등 사용 **Then** Client Component ('use client' 추가)
- **If** Form 제출, 버튼 클릭 등 **Then** Client Component

### shadcn/ui 컴포넌트 선택
- 목록 화면 → Table
- 폼 화면 → Form + Input
- 카드 레이아웃 → Card
- 버튼 → Button (variant: default, destructive, outline, ghost)

### Mock 데이터 개수
- **최소 3개**, **최대 10개**
- 다양한 상태 포함 (active/inactive, 여러 role 등)

## 에러 처리 (Error Handling)

| Error Type | Detection | Recovery |
|-----------|-----------|----------|
| UX 문서 없음 | File not found | "Step 1 (UX Planning)을 먼저 완료해주세요" 출력 후 중단 |
| shadcn/ui 미설치 | Import error | "shadcn/ui 설치 필요: npx shadcn-ui@latest init" 출력 후 중단 |
| Playwright 미설치 | Command not found | "npm install -D @playwright/test" 실행 후 재시도 |
| 테스트 실패 | Test exit code != 0 | 에러 로그 분석, 최대 3회 재시도, 실패 시 사용자에게 보고 |
| 개발 서버 실행 실패 | Port already in use | 다른 포트로 재시도 (3001, 3002 등) |

## 완료 검증 (Completion Validation)

Agent 작업 완료 기준:

- [ ] Mock 데이터 파일 생성 (`apps/web/lib/mocks/<feature-name>.ts`)
- [ ] API Client 생성 (Mock Provider 패턴)
- [ ] Next.js 페이지 생성 (모든 화면)
- [ ] shadcn/ui 컴포넌트 활용
- [ ] UI Theme 적용 완료
- [ ] Empty State, Error State 구현
- [ ] Playwright E2E 테스트 작성 및 통과
- [ ] 브라우저에서 수동 테스트 통과

**사용자 승인 필요**: 생성된 UI를 브라우저에서 직접 확인하고 승인해야 다음 Step으로 진행 가능합니다.

## 주의사항 (Cautions)

### ❌ 하지 말아야 할 것

- **Real API를 구현하거나 호출하지 않습니다.**
  - 이 단계는 100% Mock 데이터로 동작해야 합니다.

- **"나중에 API 연결하면 된다"는 마인드로 임시 코드를 작성하지 않습니다.**
  - Mock Provider 패턴을 사용하면, 코드 변경 없이 전환 가능해야 합니다.

- **UI Theme을 무시하고 임의로 스타일을 적용하지 않습니다.**
  - `docs/ux/ui-theme.md`를 따라야 합니다.

- **테스트 없이 "눈으로 확인했으니 됐다"고 넘어가지 않습니다.**
  - Playwright 테스트를 반드시 작성하고 통과시켜야 합니다.

### ✅ 해야 할 것

- **Realistic한 Mock 데이터를 작성합니다.**
  - "test1", "test2" (X)
  - "스타벅스 강남점", "투썸플레이스 역삼점" (O)

- **Mock Provider 패턴을 철저히 적용합니다.**
  - 환경변수 하나로 Mock/Real을 전환할 수 있어야 합니다.

- **shadcn/ui 컴포넌트를 적극 활용합니다.**
  - 직접 만들지 말고, shadcn/ui에 있는 컴포넌트를 사용합니다.

- **Empty State, Error State를 빠뜨리지 않습니다.**
  - 사용자가 실제로 경험할 모든 상태를 구현합니다.

## 참조 (References)

- **Skill 가이드**: `.claude/skills/frontend-mock-guide/SKILL.md`
- **Command**: `.claude/commands/mock-ui.md`
- **CLAUDE.md**: Section 3.2 (Step 2: Frontend Prototype with Mock Data)
- **UX 문서**: `docs/ux/features/<feature-name>-flow.md`, `docs/ux/features/<feature-name>-screens.md`
- **UI Theme**: `docs/ux/ui-theme.md`
- **shadcn/ui 공식 문서**: https://ui.shadcn.com/
- **Next.js 14 App Router**: https://nextjs.org/docs
- **Playwright**: https://playwright.dev/

## 버전 히스토리 (Version History)

- v1.0 (2025-11-11): 초기 버전 생성
