---
description: UX Planning & Design (Step 1) - 사용자 여정과 화면 구조를 설계한다.
---

# UX Planning & Design

## 실행 방식

이 커맨드는 **`ux-planning-guide` 스킬**을 실행합니다.

### 수동 실행 (Manual Mode)
- Claude가 스킬의 체크리스트를 따라 단계별로 진행
- 각 단계 완료 후 사용자 확인 요청
- 현재 이 방식으로 작동

### 자동 실행 (Agent Mode - 향후)
- Claude가 Agent Prompt를 참조하여 완전 자동 실행
- Agent Prompt 위치: `.claude/agents/step1-ux-planning-agent.md`
- 최종 결과만 사용자에게 보고

### 사용 예시
```
/ux-plan attendance-checkin F4
```
- `attendance-checkin`: Feature 이름
- `F4`: Feature 번호

---

## 작업 내용

`ux-planning-guide` 스킬을 참조하여 다음 작업을 수행해주세요:

## 1. PRD 분석
- `docs/product/prd-main.md`에서 Feature의 Acceptance Criteria 추출
- AC 번호를 명확히 기록 (예: AC-F2-01, AC-F2-02)
- AC를 "사용자가 ~할 수 있다" 형식으로 정리

## 2. 사용자 여정 설계
- Feature의 시작점 정의 (어느 화면에서 진입하는가?)
- Feature의 종료점 정의 (어떤 상태로 끝나는가?)
- 여정의 주요 단계 나열 (Step 1 → Step 2 → Step 3 …)
- 각 단계에서 사용자가 보는 화면 명시
- 분기점이 있다면 명시 (예: 성공 시 / 실패 시)

## 3. 화면 구조 정의
- 여정에서 등장하는 모든 화면을 나열
- 각 화면에 대해:
  - 화면명 (명확하고 간결하게)
  - URL 또는 라우트 (예: `/stores`, `/stores/:id/employees`)
  - 주요 UI 요소 나열:
    - 제목/헤딩
    - 버튼 (액션별로)
    - 폼 필드 (입력창, 선택창 등)
    - 테이블/리스트
    - 카드/섹션
  - 상태별 UI 정의:
    - 로딩 중 (Skeleton, Spinner)
    - 데이터 없음 (Empty State)
    - 에러 발생 (Error State)

## 4. AC ↔ 화면 매핑
- 각 AC가 어느 화면에서 검증되는지 명시
- 예:
  - AC-F2-01: "점주가 새 매장을 등록할 수 있다" → `/stores/new` 화면
  - AC-F2-02: "점주가 매장 목록을 볼 수 있다" → `/stores` 화면

## 5. 문서 생성
- `docs/ux/features/<feature-name>-flow.md` 작성
- `docs/ux/features/<feature-name>-screens.md` 작성
- 문서가 명확하고 다른 사람이 읽어도 이해 가능한지 확인

## 완료 조건
- [ ] 모든 AC가 화면에 매핑됨
- [ ] 각 화면의 주요 UI 요소가 명확히 나열됨
- [ ] Empty State, Error State가 정의됨
- [ ] 사용자에게 문서 검토 요청

## 주의사항
- ❌ DB 스키마나 API를 먼저 생각하지 않는다
- ❌ 기술 구현 세부사항을 UX 단계에서 결정하지 않는다
- ✅ 사용자 관점에서 생각한다
- ✅ UI 요소를 구체적으로 나열한다

**참고**: `.claude/skills/ux-planning-guide/SKILL.md`의 체크리스트와 예시를 참조하세요.
