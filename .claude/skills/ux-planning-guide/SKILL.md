---
name: ux-planning-guide
description: >
  Step 1 (UX Planning & Design) 실행 가이드.
  사용자 여정을 정의하고 화면 구조를 설계한다.
---

# ux-planning-guide

## 목적

이 Skill은 Feature 구현의 **Step 1: UX Planning & Design**을 실행하는 가이드이다.

- PRD에서 Acceptance Criteria (AC) 추출
- 사용자 여정(User Journey) 설계
- 화면별 UI 요소 정의
- AC와 화면 매핑

이 단계는 **Backend나 API 없이, 사용자 관점에서 Feature를 이해**하는 것이 목표다.

## 입력

### 필수 문서
- `docs/business/business-plan.md` - 비즈니스 요구사항
- `docs/product/prd-main.md` - 전체 PRD 및 AC
- `docs/ux/ui-theme.md` - UI 테마 가이드 (컬러, 타이포, 톤앤매너)

### 필수 정보
- Feature 이름 (예: "store-management", "attendance-checkin")
- Feature 범위 (PRD의 어느 부분인지)

## 출력

### 생성 문서
1. `docs/ux/features/<feature-name>-flow.md`
   - 사용자 여정 (User Journey)
   - 예: 로그인 → 매장 목록 → 상세 화면 → 수정 → 저장 → 확인

2. `docs/ux/features/<feature-name>-screens.md`
   - 각 화면의 구조와 UI 요소
   - 예:
     - 화면명
     - URL/라우트
     - 주요 UI 요소 (제목, 버튼, 폼, 테이블 등)
     - 상태/인터랙션 (로딩, 에러, 빈 화면 등)

### 업데이트 문서
- 필요시 `docs/ux/ux-flow-main.md` 전체 플로우에 추가

## 실행 체크리스트

### 1. PRD 분석
- [ ] `docs/product/prd-main.md`에서 해당 Feature의 AC 추출
- [ ] AC 번호를 명확히 기록 (예: AC-F2-01, AC-F2-02)
- [ ] AC를 "사용자가 ~할 수 있다" 형식으로 정리

### 2. 사용자 여정 정의
- [ ] Feature의 시작점 정의 (어느 화면에서 진입하는가?)
- [ ] Feature의 종료점 정의 (어떤 상태로 끝나는가?)
- [ ] 여정의 주요 단계 나열 (Step 1 → Step 2 → Step 3 …)
- [ ] 각 단계에서 사용자가 보는 화면 명시
- [ ] 분기점이 있다면 명시 (예: 성공 시 / 실패 시)

### 3. 화면 구조 정의
- [ ] 여정에서 등장하는 모든 화면을 나열
- [ ] 각 화면에 대해:
  - [ ] 화면명 (명확하고 간결하게)
  - [ ] URL 또는 라우트 (예: `/stores`, `/stores/:id/employees`)
  - [ ] 주요 UI 요소 나열:
    - [ ] 제목/헤딩
    - [ ] 버튼 (액션별로)
    - [ ] 폼 필드 (입력창, 선택창 등)
    - [ ] 테이블/리스트
    - [ ] 카드/섹션
  - [ ] 상태별 UI 정의:
    - [ ] 로딩 중 (Skeleton, Spinner)
    - [ ] 데이터 없음 (Empty State)
    - [ ] 에러 발생 (Error State)

### 4. AC ↔ 화면 매핑
- [ ] 각 AC가 어느 화면에서 검증되는지 명시
- [ ] 예:
  - AC-F2-01: "점주가 새 매장을 등록할 수 있다" → `/stores/new` 화면
  - AC-F2-02: "점주가 매장 목록을 볼 수 있다" → `/stores` 화면

### 5. 문서 작성
- [ ] `docs/ux/features/<feature-name>-flow.md` 작성
- [ ] `docs/ux/features/<feature-name>-screens.md` 작성
- [ ] 문서가 명확하고 다른 사람이 읽어도 이해 가능한지 확인

## 주의사항

### ❌ 하지 말아야 할 것
- **DB 스키마나 API를 먼저 생각하지 않는다.**
  - 예: "User 테이블에 role 필드가 있으니…" (X)
  - 대신: "사용자는 역할 선택 드롭다운을 본다" (O)

- **기술 구현 세부사항을 UX 단계에서 결정하지 않는다.**
  - 예: "React Context로 상태 관리" (X)
  - 대신: "로그인 후 사용자 정보가 모든 화면에서 보인다" (O)

- **"나중에 필요할 것 같은" 화면을 미리 설계하지 않는다.**
  - PRD의 AC에 명시된 것만 설계한다.

### ✅ 해야 할 것
- **사용자 관점에서 생각한다.**
  - "점주가 이 버튼을 클릭하면 무엇을 보게 되는가?"

- **UI 요소를 구체적으로 나열한다.**
  - "버튼" (X) → "저장 버튼, 취소 버튼" (O)
  - "폼" (X) → "매장명 입력창, 주소 입력창, 전화번호 입력창" (O)

- **Empty State, Error State를 잊지 않는다.**
  - 데이터가 없을 때 무엇을 보여줄지 명시

## Agent 실행 가이드 (향후 Agent 구축 시 참조)

### Agent 역할
- `ux-agent` (general-purpose Agent 사용)

### Agent 작업 순서
1. `docs/product/prd-main.md` 읽기
2. Feature 범위 확인 및 AC 추출
3. 사용자 여정 설계
4. 화면별 UI 요소 나열
5. AC ↔ 화면 매핑
6. 문서 생성:
   - `docs/ux/features/<feature-name>-flow.md`
   - `docs/ux/features/<feature-name>-screens.md`
7. 완료 보고서 생성

### Agent 출력 형식
```markdown
## UX Planning 완료 보고

Feature: <feature-name>

### AC 추출 결과
- AC-FX-01: ...
- AC-FX-02: ...

### 사용자 여정
1. ...
2. ...

### 화면 목록
- 화면1: /path1
- 화면2: /path2

### AC ↔ 화면 매핑
- AC-FX-01 → 화면1
- AC-FX-02 → 화면2

### 생성 파일
- docs/ux/features/<feature-name>-flow.md
- docs/ux/features/<feature-name>-screens.md
```

## 완료 조건

- [ ] `docs/ux/features/<feature-name>-flow.md` 파일이 생성됨
- [ ] `docs/ux/features/<feature-name>-screens.md` 파일이 생성됨
- [ ] 모든 AC가 화면에 매핑됨
- [ ] 각 화면의 주요 UI 요소가 명확히 나열됨
- [ ] Empty State, Error State가 정의됨
- [ ] **사용자가 문서를 검토하고 승인함** ← 중요!

## 참조 문서

- `CLAUDE.md` Section 3.1
- `docs/business/business-plan.md`
- `docs/product/prd-main.md`
- `docs/ux/ui-theme.md`
- `docs/ux/ux-flow-main.md`

## 예시 (참고용)

### Feature: 매장 관리 (store-management)

#### 사용자 여정 (flow.md)
```markdown
## 사용자 여정: 매장 관리

### 1. 매장 목록 보기
- 진입점: 메인 대시보드 → "매장 관리" 메뉴 클릭
- 화면: `/stores`
- 사용자 액션: 매장 목록 확인

### 2. 새 매장 등록
- 화면: `/stores/new`
- 사용자 액션: 폼 작성 → "저장" 버튼 클릭
- 결과: 성공 시 `/stores/:id`로 이동, 실패 시 에러 메시지

### 3. 매장 상세 보기
- 화면: `/stores/:id`
- 사용자 액션: 정보 확인, "수정" 버튼 클릭 시 편집 모드

### 4. 매장 수정
- 화면: `/stores/:id/edit`
- 사용자 액션: 정보 수정 → "저장" 버튼 클릭
- 결과: 성공 시 `/stores/:id`로 돌아감
```

#### 화면 구조 (screens.md)
```markdown
## 화면: 매장 목록 (/stores)

### URL
`/stores`

### 주요 UI 요소
- 제목: "매장 관리"
- 버튼: "새 매장 등록"
- 테이블:
  - 컬럼: 매장명, 주소, 직원 수, 상태
  - 액션: 각 행마다 "보기" 버튼
- 페이지네이션: 하단

### 상태별 UI
- 로딩 중: Skeleton Table
- 데이터 없음: "등록된 매장이 없습니다" 메시지 + "새 매장 등록" 버튼
- 에러 발생: "매장 목록을 불러올 수 없습니다" 메시지 + "다시 시도" 버튼

### AC 매핑
- AC-F2-02: "점주가 매장 목록을 볼 수 있다"
```
