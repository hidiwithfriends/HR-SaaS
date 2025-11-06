# UI E2E 테스트 케이스

**버전:** v0.2
**최종 수정일:** 2025-11-06
**테스트 프레임워크:** Playwright

---

## 1. F1 - 인증 및 유저 관리

### 1.1 점주 회원가입 → 로그인 → 대시보드 플로우

| Test ID | Test Case | Spec File | Status |
|---------|-----------|-----------|--------|
| UX-1.1 | Owner signup and login flow | `auth-flow.spec.ts` | ✅ |
| UX-1.1-Error | Signup with invalid data shows errors | `auth-flow.spec.ts` | ✅ |
| UX-1.1-Error | Signup with existing email shows error | `auth-flow.spec.ts` | ✅ |
| UX-1.1-Login | Login with invalid credentials shows error | `auth-flow.spec.ts` | ✅ |
| UX-1.1-Nav | Navigation between signup and login pages | `auth-flow.spec.ts` | ✅ |
| UX-1.1-Logout | Logout clears cookies and redirects | `auth-flow.spec.ts` | ✅ |
| UX-1.1-Protected | Dashboard is protected, redirects to login | `auth-flow.spec.ts` | ✅ |

---

## 2. F2 - 매장 & 직원 관리

### 2.1 전체 플로우 테스트 (Complete Flow)

| Test ID | Test Case | Spec File | Status |
|---------|-----------|-----------|--------|
| UX-2.1 | Scenario 1: Owner signup and store creation | `f2-store-management.spec.ts` | ✅ |
| UX-2.2 | Scenario 2: Owner creates invite | `f2-store-management.spec.ts` | ✅ |
| UX-2.3 | Scenario 3: Employee signup with invite | `f2-store-management.spec.ts` | ✅ |
| UX-2.4 | Scenario 4: Owner views employee list | `f2-store-management.spec.ts` | ✅ |
| UX-2.5 | Scenario 5: Owner updates store settings | `f2-store-management.spec.ts` | ✅ |
| UX-2.6 | Scenario 6: Login and logout flow | `f2-store-management.spec.ts` | ✅ |

### 2.2 상세 시나리오 설명

#### Scenario 1: Owner signup and store creation
- 점주가 회원가입을 하면 매장이 자동으로 생성됨
- `/stores` 페이지로 리다이렉트
- 매장명과 매장 유형(카페)이 표시됨

#### Scenario 2: Owner creates invite
- 점주가 로그인 후 초대 링크 생성 페이지로 이동
- 직원 이메일, 역할(BARISTA), 시급 입력
- 초대 링크와 토큰이 생성됨
- 토큰 길이가 10자 이상인지 검증

#### Scenario 3: Employee signup with invite
- 직원이 초대 링크로 회원가입 페이지 접속
- "초대 링크가 적용되었습니다" 메시지 확인
- 회원가입 완료 후 `/profile` 페이지로 리다이렉트
- 프로필에 이름과 이메일이 정확히 표시됨

#### Scenario 4: Owner views employee list
- 점주가 로그인 후 직원 목록 페이지로 이동
- "현재 1명의 직원이 등록되어 있습니다" 메시지 확인
- 직원 이름과 이메일이 테이블에 표시됨

#### Scenario 5: Owner updates store settings
- 점주가 로그인 후 매장 설정 페이지로 이동
- 주소와 전화번호 수정
- "업데이트되었습니다" 성공 메시지 확인

#### Scenario 6: Login and logout flow
- 점주가 로그인
- 로그아웃 후 `/auth/login`으로 리다이렉트
- 다시 로그인하여 정상 접근 확인
- 네비게이션에 사용자 이름 표시 확인

---

## 3. 테스트 실행 방법

```bash
# 프론트엔드 디렉토리로 이동
cd apps/web

# Playwright 설치 (최초 1회)
npx playwright install

# 모든 E2E 테스트 실행
npm test

# 특정 테스트만 실행
npx playwright test f2-store-management.spec.ts

# UI 모드로 디버깅
npx playwright test --ui

# 헤드풀 모드 (브라우저 표시)
npx playwright test --headed
```

---

## 4. 테스트 커버리지

| 기능 | 시나리오 수 | 통과율 |
|------|-------------|--------|
| F1 - 인증 | 7 | 100% (7/7) |
| F2 - 매장 & 직원 관리 | 6 | 100% (6/6) |
| **Total** | **13** | **100% (13/13)** |

---

## 5. 참고 문서

- PRD: `docs/product/prd-main.md`
- Phase 1 Plan: `docs/project/phase1-plan.md`
- UX Flow: `docs/ux/ux-flow-main.md`
