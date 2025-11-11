---
description: Frontend Prototype with Mock (Step 2) - Mock 데이터로 동작하는 UI를 구현한다.
---

# Frontend Prototype with Mock Data

## 실행 방식

이 커맨드는 **`frontend-mock-guide` 스킬**을 실행합니다.

### 수동 실행 (Manual Mode)
- Claude가 스킬의 체크리스트를 따라 단계별로 진행
- 각 단계 완료 후 사용자 확인 요청
- 현재 이 방식으로 작동

### 자동 실행 (Agent Mode - 향후)
- Claude가 Agent Prompt를 참조하여 완전 자동 실행
- Agent Prompt 위치: `.claude/agents/step2-frontend-mock-agent.md`
- 최종 결과만 사용자에게 보고

### 사용 예시
```
/mock-ui attendance-checkin F4
```
- `attendance-checkin`: Feature 이름
- `F4`: Feature 번호

---

## 작업 내용

`frontend-mock-guide` 스킬을 참조하여 다음 작업을 수행해주세요:

## 1. UX 문서 분석
- `docs/ux/features/<feature-name>-flow.md` 읽기
- `docs/ux/features/<feature-name>-screens.md` 읽기
- 필요한 데이터 구조 파악

## 2. Mock 데이터 생성
- `apps/web/lib/mocks/<feature-name>.ts` 파일 생성
- TypeScript 타입 정의
- Realistic한 데이터 작성 (실제 사용 가능한 수준)
- 시나리오별 데이터 준비:
  - 정상 케이스 (데이터 있음)
  - Empty State (데이터 없음)
  - 에러 케이스 (API 실패 시뮬레이션)
- Mock 함수 작성 (GET, POST, PUT, DELETE)

## 3. API Client 작성 (Mock Provider)
- `apps/web/lib/api/<feature-name>-client.ts` 생성
- Mock Provider 패턴 적용
- 환경변수로 Mock/Real 전환 가능하도록 설정
- 각 API 함수의 시그니처 정의

## 4. Next.js 페이지 구현
- App Router 구조에 맞게 디렉토리 생성
- 각 화면에 대응하는 `page.tsx` 작성
- Server Component / Client Component 구분
- 라우팅 파라미터 처리 (`[id]` 등)

## 5. UI 컴포넌트 구현
- shadcn/ui 컴포넌트 활용 (Button, Input, Table, Card 등)
- `docs/ux/ui-theme.md` 스타일 적용 (색상, 타이포, 여백)
- 상태별 UI 구현:
  - 로딩 중 (Skeleton, Spinner)
  - Empty State
  - Error State
- 재사용 가능한 컴포넌트로 분리
- Props 타입 정의 (TypeScript)

## 6. Playwright E2E 테스트 작성
- `apps/web/tests/e2e/<feature-name>.spec.ts` 생성
- 사용자 플로우 기반 시나리오 작성
- AC별 테스트 케이스 작성
- Empty State 테스트
- Error State 테스트

## 7. 테스트 실행 및 검증
- `npm run dev` 실행
- 브라우저에서 수동 테스트 (모든 화면 렌더링 확인)
- `npx playwright test apps/web/tests/e2e/<feature-name>.spec.ts` 실행
- 모든 테스트 통과 확인

## 완료 조건
- [ ] Mock 데이터 생성 완료
- [ ] API Client 생성 완료 (Mock Provider 패턴)
- [ ] 모든 화면 렌더링 확인
- [ ] shadcn/ui 컴포넌트 활용
- [ ] UI Theme 적용 완료
- [ ] Empty State, Error State 구현
- [ ] Playwright E2E 테스트 모두 통과
- [ ] 사용자에게 브라우저에서 UI 확인 요청

## 주의사항
- ❌ Real API를 구현하거나 호출하지 않는다
- ❌ "나중에 API 연결하면 된다"는 마인드로 임시 코드를 작성하지 않는다
- ✅ Realistic한 Mock 데이터를 작성한다
- ✅ Mock Provider 패턴을 철저히 적용한다

**참고**: `.claude/skills/frontend-mock-guide/SKILL.md`의 Mock Provider 패턴 예시와 Playwright 테스트 코드를 참조하세요.
