---
description: Data Layer Design & Migration (Step 3) - Mock 데이터 구조를 분석해서 DB 스키마를 설계하고 Migration을 생성한다.
---

# Data Layer Design & Migration

## 실행 방식

이 커맨드는 **`database-design-guide` 스킬**을 실행합니다.

### 수동 실행 (Manual Mode)
- Claude가 스킬의 체크리스트를 따라 단계별로 진행
- 각 단계 완료 후 사용자 확인 요청
- 현재 이 방식으로 작동

### 자동 실행 (Agent Mode - 향후)
- Claude가 Agent Prompt를 참조하여 완전 자동 실행
- Agent Prompt 위치: `.claude/agents/step3-database-design-agent.md`
- 최종 결과만 사용자에게 보고

### 사용 예시
```
/design-db attendance-checkin F4
```
- `attendance-checkin`: Feature 이름
- `F4`: Feature 번호

---

## 작업 내용

`database-design-guide` 스킬을 참조하여 다음 작업을 수행해주세요:

## 1. Mock 데이터 분석
- `apps/web/lib/mocks/<feature-name>.ts` 읽기
- Mock 데이터의 TypeScript 타입 추출
- 각 필드의 의미와 용도 파악
- 필수 필드 / 선택 필드 구분

## 2. 타입 변환 (TypeScript → PostgreSQL)
- 각 필드의 PostgreSQL 타입 결정:
  - `string` → `varchar`, `text`, `uuid`
  - `number` → `int`, `bigint`, `decimal`
  - `boolean` → `boolean`
  - `Date` → `timestamp`, `date`
  - `enum` → `enum` 또는 `varchar` with CHECK
- 필드 제약조건 결정 (NOT NULL, UNIQUE, DEFAULT)
- 인덱스 필요 여부 판단

## 3. 관계(Relation) 추론
- Mock 데이터에서 관계 패턴 찾기 (예: `storeId` → Store와 OneToMany)
- 관계 유형 결정 (OneToOne, ManyToOne/OneToMany, ManyToMany)
- 외래키(Foreign Key) 정의
- CASCADE 옵션 결정 (ON DELETE, ON UPDATE)

## 4. TypeORM Entity 작성
- `apps/api/src/entities/<entity-name>.entity.ts` 생성
- `@Entity()`, `@Column()` 데코레이터 추가
- `@PrimaryGeneratedColumn('uuid')` 설정
- 관계 데코레이터 추가 (`@OneToMany`, `@ManyToOne` 등)
- `@CreateDateColumn()`, `@UpdateDateColumn()` 추가

## 5. Migration 파일 생성
- `apps/api/src/migrations/<timestamp>-Add<EntityName>.ts` 생성
- `up()` 메서드 작성:
  - CREATE TABLE 문
  - 컬럼 정의
  - 외래키 제약조건
  - 인덱스 생성
- `down()` 메서드 작성 (롤백 가능하게)

## 6. Migration 실행
- `npm run migration:run` 실행
- 에러 발생 시 원인 파악 및 수정
- Migration 성공 확인

## 7. DB 스키마 검증
- (향후 MCP 구축 후) DB에 테이블 존재 확인
- 컬럼, 타입, 제약조건 확인
- 외래키 관계 확인
- 인덱스 확인

## 8. 문서 업데이트
- `docs/tech/db-schema.md` 업데이트
  - 테이블명, 컬럼 목록
  - 관계 다이어그램 (텍스트 또는 Mermaid)
  - 인덱스 목록

## 완료 조건
- [ ] TypeORM Entity 클래스 생성됨
- [ ] Migration 파일 생성됨
- [ ] `npm run migration:run` 실행 성공
- [ ] `docs/tech/db-schema.md` 업데이트
- [ ] 사용자가 스키마를 검토하고 승인함

## 주의사항
- ❌ Mock 데이터와 다른 구조로 Entity를 설계하지 않는다
- ❌ "나중에 필요할 것 같은" 필드를 미리 추가하지 않는다 (YAGNI 원칙)
- ❌ 복잡한 정규화를 과도하게 적용하지 않는다
- ✅ Mock 데이터 구조를 최대한 그대로 반영한다
- ✅ 관계는 명확하게 정의한다
- ✅ Migration은 롤백 가능하게 작성한다 (down() 메서드 필수)

**참고**: `.claude/skills/database-design-guide/SKILL.md`의 TypeScript → PostgreSQL 타입 변환 가이드와 Entity 예시를 참조하세요.
