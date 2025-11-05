# UI E2E 테스트 케이스

**버전:** v0.1
**최종 수정일:** 2025-11-05
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

## 2. 테스트 실행 방법

```bash
cd tests/e2e
npm install
npx playwright install
npm test
```
