# Phase 1 MVP 개발 계획

**버전**: v2.0
**최종 업데이트**: 2025-11-12
**목표**: MVP 출시 (F1~F4 핵심 기능)
**예상 기간**: 12주
**개발 방식**: UI-First Mock-Driven Development
**상위 문서**: `docs/project/roadmap.md`

---

## 0. Phase 1 범위 정의

### MVP에 포함할 기능

이 Phase에서는 다음 4개 Feature를 구현한다:

- **F1. 인증 & 유저 관리** (2.4주)
- **F2. 매장 & 직원 관리** (2.1주)
- **F3. 5분 매뉴얼** (4.2주)
- **F4. 출퇴근 기록** (3.3주)

각 Feature의 상세 실행 계획은 `docs/project/features/` 디렉토리를 참조한다.

### MVP에서 제외

- AI 스케줄링 (Phase 2)
- 급여 계산 (Phase 2)
- 스케줄 관리 (Phase 2)
- 인재 매칭 (Phase 3)
- Best Practice 모델 (Phase 3)

---

## 1. 개발 원칙 (UI-First Mock-Driven Development)

### 1.1 개발 순서: 4단계 프로세스

```
Step 1: UX Planning & Design
  ↓
Step 2: Frontend Prototype with Mock
  ↓
Step 3: Data Layer Design & Migration
  ↓
Step 4: Backend API & Integration
```

### 1.2 각 단계의 역할

**Step 1: UX Planning & Design**
- 사용자 여정(User Journey) 정의
- 화면 구조(Screen Layout) 설계
- 인터랙션(Interaction) 명세
- 관련 Command: `/ux-plan <feature-name> <feature-id>`

**Step 2: Frontend Prototype with Mock**
- UI 컴포넌트 구현
- Mock 데이터로 화면 동작 검증
- UI E2E 테스트 작성 (Mock 기반)
- 관련 Command: `/mock-ui <feature-name> <feature-id>`

**Step 3: Data Layer Design & Migration**
- Mock 데이터 구조 → DB 스키마 변환
- TypeORM Entity 작성
- Migration 파일 생성 및 실행
- 관련 Command: `/design-db <feature-name> <feature-id>`

**Step 4: Backend API & Integration**
- Backend API 구현
- API E2E 테스트 작성
- Frontend Mock → Real API 교체
- UI E2E 테스트 (Real API) 실행
- 관련 Command: `/implement-api <feature-name> <feature-id>`

### 1.3 문서 우선 원칙

- 코드 변경 전 항상 PRD/Tech Spec/API Spec 확인
- 스펙과 충돌 시 문서 수정 제안 → 승인 후 코드 변경

### 1.4 테스트 커버리지

- API E2E 테스트: 모든 엔드포인트
- UI E2E 테스트: 주요 유저 플로우
- 유닛 테스트: 핵심 비즈니스 로직

---

## 2. Phase 1 Features 목록

### F1: 인증 & 유저 관리 (2.4주) `[status: todo]`
- 회원가입 (점주/직원)
- 로그인 & JWT 인증
- 역할 기반 접근 제어 (RBAC: OWNER, EMPLOYEE, MANAGER)
- 프로필 관리

**상세 계획**: `docs/project/features/f1-auth.md`

---

### F2: 매장 & 직원 관리 (2.1주) `[status: todo]`
- 매장 생성 및 설정
- 직원 초대 (이메일 기반)
- 직원 목록 조회 & 상태 관리
- 매장-직원 관계 관리

**상세 계획**: `docs/project/features/f2-store-management.md`

---

### F3: 5분 매뉴얼 (4.2주) `[status: todo]`
- 매뉴얼 생성 (제목, 내용, 체크리스트)
- 매뉴얼 직원 할당
- 직원 매뉴얼 학습 & 체크리스트 완료
- 스킬 배지 자동 부여
- 학습 진행률 대시보드

**상세 계획**: `docs/project/features/f3-manual.md`

---

### F4: 출퇴근 기록 (3.3주) `[status: todo]`
- GPS 기반 출근 체크인
- 퇴근 체크아웃
- 근무 시간 자동 계산
- 출퇴근 기록 조회 (일별/주별/월별)
- 근무 통계 대시보드

**상세 계획**: `docs/project/features/f4-attendance.md`

---

## 3. Feature 간 의존성

```
F1 (인증 & 유저 관리)
 ↓
F2 (매장 & 직원 관리)
 ↓
F3, F4 (병렬 진행 가능)
```

- **F1 → F2**: 매장 관리는 인증된 유저 필요
- **F2 → F3, F4**: 매뉴얼과 출퇴근은 매장/직원 데이터 필요
- **F3, F4**: 서로 독립적이므로 병렬 진행 가능

---

## 4. 전체 타임라인

| Week | Feature | Step | 주요 작업 |
|------|---------|------|----------|
| 1 | F1 | Step 1-2 | 인증 UX 설계 & Mock UI 구현 |
| 2 | F1 | Step 3-4 | DB 스키마 & API 구현 |
| 3 | F2 | Step 1-2 | 매장 관리 UX & Mock UI |
| 4 | F2 | Step 3-4 | DB & API 구현 |
| 5-6 | F3 | Step 1-2 | 매뉴얼 UX & Mock UI |
| 7-8 | F3 | Step 3-4 | DB & API 구현 |
| 9-10 | F4 | Step 1-2 | 출퇴근 UX & Mock UI |
| 11-12 | F4 | Step 3-4 | DB & API 구현 |

---

## 5. Phase 1 완료 조건

- [ ] F1~F4 모두 `[status: completed]`
- [ ] 모든 API E2E 테스트 통과
- [ ] 모든 UI E2E 테스트 통과 (Real API)
- [ ] UI-First 워크플로우 검증 (4단계 프로세스 확립)
- [ ] 베타 테스터 10명 확보
- [ ] Production 환경 배포 완료
- [ ] 모니터링 & 알람 설정 완료

---

## 6. 다음 작업

현재 Phase 1이 시작 단계이므로, 다음 작업은:

1. **F1 Step 1 실행**: `/ux-plan auth F1`
2. F1의 사용자 여정, 화면 구조, 인터랙션 설계
3. `docs/ux/features/auth-flow.md` 및 `auth-screens.md` 작성

---

## 참조 문서

- **상위 로드맵**: `docs/project/roadmap.md`
- **비즈니스 계획**: `docs/business/business-plan.md`
- **제품 요구사항**: `docs/product/prd-main.md`
- **기술 스펙**: `docs/tech/tech-spec.md`
- **개발 원칙**: `CLAUDE.md`

---

**Last Updated**: 2025-11-12
**Next Review**: F1 완료 시
