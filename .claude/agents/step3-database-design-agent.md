---
name: step3-database-design-agent
version: 1.0
purpose: >
  Step 3: Data Layer Design & Migration - Mock 데이터 구조를 분석해서 DB 스키마를 자동으로 설계합니다.
  Agent automation guide for executing the database design workflow.
target_skill: database-design-guide
target_command: /design-db
---

# Agent Prompt: Step 3 - Database Design Agent

## 목적 (Purpose)

이 Agent는 `/design-db` 커맨드 실행 시 Mock 데이터 구조를 분석하여 DB 스키마를 **자동으로 설계**합니다.

- Mock 데이터 구조 자동 분석
- TypeScript → PostgreSQL 타입 자동 변환
- 관계(Relation) 자동 추론
- TypeORM Entity 클래스 자동 생성
- Migration 파일 자동 생성 및 실행
- DB 스키마 문서 자동 업데이트

**핵심 원칙**: Frontend에서 검증된 Mock 데이터 구조를 그대로 반영

## 사전조건 (Prerequisites)

Agent 실행 전 다음 조건이 충족되어야 합니다:

- [ ] Step 2 (Frontend Prototype with Mock) 완료
- [ ] `apps/web/lib/mocks/<feature-name>.ts` 파일 존재
- [ ] TypeORM 설정 완료
- [ ] PostgreSQL 데이터베이스 실행 중
- [ ] `app.module.ts`에 TypeORM 모듈 설정됨

## 입력 파라미터 (Input Parameters)

Agent 실행 시 다음 파라미터가 필요합니다:

- `feature_name`: Feature 이름 (예: "store-management", "attendance-checkin")
- `entity_name`: Entity 이름 (단수형, PascalCase, 예: "Store", "Employee")
- `table_name`: 테이블 이름 (복수형, snake_case, 예: "stores", "employees")

## Agent 작업 순서 (Task Sequence)

### Phase 1: Mock 데이터 분석 (Mock Data Analysis)

#### 1. Mock 데이터 파일 읽기
- `apps/web/lib/mocks/<feature-name>.ts` 파일 읽기
- TypeScript 인터페이스 추출
- 각 필드의 타입 파악

**파싱 예시**:
```typescript
interface Store {
  id: string;           // → uuid
  name: string;         // → varchar(255)
  address: string;      // → text
  phone: string;        // → varchar(20)
  employeeCount: number; // → int
  status: 'active' | 'inactive'; // → varchar(20) or enum
  createdAt: Date;      // → timestamp
  updatedAt?: Date;     // → timestamp, nullable
}
```

#### 2. 필드 분류
각 필드를 분류:
- **Primary Key**: `id` 필드
- **필수 필드**: 타입에 `?`가 없는 필드
- **선택적 필드**: 타입에 `?`가 있는 필드
- **타임스탬프 필드**: `createdAt`, `updatedAt`
- **관계 필드**: `{EntityName}Id` 패턴 (예: `storeId`, `userId`)

### Phase 2: TypeScript → PostgreSQL 타입 변환 (Type Conversion)

#### 3. 타입 변환 규칙 적용
Mock 데이터의 각 필드에 대해 PostgreSQL 타입 결정:

| TypeScript | PostgreSQL | 결정 규칙 |
|------------|-----------|---------|
| `string` (id 필드) | `uuid` | 필드명이 `id`이거나 `*Id` 패턴 |
| `string` (짧은 텍스트) | `varchar(N)` | 필드명: name, title, phone 등 |
| `string` (긴 텍스트) | `text` | 필드명: description, address, content 등 |
| `number` (정수) | `int` | 기본값 (count, age 등) |
| `number` (큰 정수) | `bigint` | 필드명: *Count가 매우 큰 경우 |
| `number` (소수) | `decimal(10,2)` | 필드명: price, amount, salary 등 |
| `boolean` | `boolean` | 직접 매핑 |
| `Date` | `timestamp` | 날짜 + 시간 |
| `'val1' \| 'val2'` | `varchar(20)` | Union 타입 (간단한 enum) |
| `enum Status` | `enum('val1','val2')` | 정식 Enum |

**varchar 길이 결정**:
- `name`, `title`: 255
- `phone`: 20
- `email`: 255
- `code`: 50

#### 4. 제약조건 결정
각 필드에 대해:
- **NOT NULL**: 선택적 필드가 아니면 NOT NULL
- **UNIQUE**: 필드명이 `email`, `code`, `username` 등이면 UNIQUE
- **DEFAULT**: 상태 필드는 기본값 설정 (예: `status` → `'active'`)

#### 5. 인덱스 결정
다음 조건에 해당하면 인덱스 생성:
- WHERE 절에 자주 사용되는 필드 (status, type 등)
- 외래키 필드 (자동으로 인덱스 권장)
- UNIQUE 제약이 있는 필드 (자동으로 인덱스 생성됨)

### Phase 3: 관계 추론 (Relation Inference)

#### 6. 관계 패턴 찾기
Mock 데이터에서 관계 패턴 탐지:

**패턴 1: ManyToOne / OneToMany**
```typescript
// Mock에 storeId 필드가 있으면
interface Employee {
  id: string;
  storeId: string; // ← 관계 패턴 탐지!
  name: string;
}

// 결론: Employee (Many) → Store (One)
// Store (One) ← Employee (Many)
```

**패턴 2: OneToOne**
```typescript
// Mock에 userId 필드가 있고, 1:1 관계일 때
interface Profile {
  id: string;
  userId: string; // ← UNIQUE 제약이 있으면 OneToOne
  bio: string;
}
```

**패턴 3: ManyToMany**
```typescript
// 중간 테이블이 필요한 경우
// Mock 데이터에 배열로 표현되어 있을 때
interface Employee {
  id: string;
  skills: Skill[]; // ← ManyToMany 관계 추론
}

// 자동 생성: employee_skills 중간 테이블
```

#### 7. CASCADE 옵션 결정
외래키의 ON DELETE 옵션:
- **CASCADE**: 부모가 삭제되면 자식도 삭제 (예: Store 삭제 → Employee 삭제)
- **SET NULL**: 부모가 삭제되면 자식의 FK를 NULL로 (선택적 관계)
- **RESTRICT**: 자식이 있으면 부모 삭제 불가 (기본값)

**결정 규칙**:
- **If** 자식이 부모 없이 존재 의미 없음 **Then** CASCADE
- **If** 자식이 독립적으로 존재 가능 **Then** SET NULL
- **If** 데이터 보호 중요 **Then** RESTRICT

### Phase 4: TypeORM Entity 생성 (Entity Class Generation)

#### 8. Entity 클래스 파일 생성
`apps/api/src/entities/<entity-name>.entity.ts` 파일 생성:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('<table_name>')
export class {EntityName} {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status: 'active' | 'inactive';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Employee, employee => employee.store)
  employees: Employee[];
}
```

#### 9. 관계 데코레이터 추가
관계 유형에 따라 적절한 데코레이터 추가:

**ManyToOne (자식 Entity)**:
```typescript
@ManyToOne(() => Store, store => store.employees, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'storeId' })
store: Store;

@Column({ type: 'uuid' })
storeId: string;
```

**OneToMany (부모 Entity)**:
```typescript
@OneToMany(() => Employee, employee => employee.store)
employees: Employee[];
```

**ManyToMany**:
```typescript
@ManyToMany(() => Skill, skill => skill.employees)
@JoinTable({
  name: 'employee_skills',
  joinColumn: { name: 'employeeId', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'skillId', referencedColumnName: 'id' },
})
skills: Skill[];
```

### Phase 5: Migration 파일 생성 (Migration File Generation)

#### 10. Migration 파일 생성
`apps/api/src/migrations/<timestamp>-Add<EntityName>.ts` 생성:

**타임스탬프 형식**: `Date.now()` 또는 `YYYYMMDDHHmmss`

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class Add{EntityName}{Timestamp} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: '<table_name>',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          // ... 나머지 컬럼
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // 인덱스 생성
    await queryRunner.createIndex(
      '<table_name>',
      new TableIndex({
        name: 'IDX_{TABLE_NAME}_{COLUMN}',
        columnNames: ['<column_name>'],
      }),
    );

    // 외래키 생성
    await queryRunner.createForeignKey(
      '<table_name>',
      new TableForeignKey({
        columnNames: ['<foreignKeyColumn>'],
        referencedColumnNames: ['id'],
        referencedTableName: '<referenced_table>',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('<table_name>');
  }
}
```

### Phase 6: Migration 실행 (Migration Execution)

#### 11. Migration 실행
```bash
cd apps/api
npm run migration:run
```

**검증**:
- Migration 성공 메시지 확인
- 에러 발생 시 원인 파악:
  - 테이블 이미 존재: `DROP TABLE` 후 재실행
  - 외래키 참조 테이블 없음: 참조되는 테이블 먼저 생성
  - SQL 문법 오류: Migration 파일 수정

**재시도 로직**:
- 최대 3회 재시도
- 실패 시 `npm run migration:revert` 실행 후 재시도

### Phase 7: DB 스키마 검증 (Schema Validation)

#### 12. DB 스키마 확인 (향후 MCP 구축 후)
MCP PostgreSQL 서버 사용하여:
- 테이블 존재 확인: `SELECT * FROM information_schema.tables WHERE table_name = '<table_name>'`
- 컬럼 확인: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '<table_name>'`
- 인덱스 확인: `SELECT indexname FROM pg_indexes WHERE tablename = '<table_name>'`
- 외래키 확인: `SELECT * FROM information_schema.table_constraints WHERE table_name = '<table_name>' AND constraint_type = 'FOREIGN KEY'`

### Phase 8: 문서 업데이트 (Documentation Update)

#### 13. `docs/tech/db-schema.md` 업데이트
기존 파일에 새 테이블 정보 추가:

```markdown
## {EntityName} 테이블

### 테이블명
`<table_name>`

### 컬럼 목록
| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|------|--------|------|
| id | uuid | NO | uuid_generate_v4() | Primary Key |
| name | varchar(255) | NO | - | {설명} |
| ... | ... | ... | ... | ... |
| createdAt | timestamp | NO | now() | 생성일시 |
| updatedAt | timestamp | NO | now() | 수정일시 |

### 관계 (Relations)
- **OneToMany**: Store → Employee (employees)
- **ManyToOne**: Employee → Store (store)

### 인덱스 (Indexes)
- `IDX_STORES_NAME`: name 컬럼

### 외래키 (Foreign Keys)
- `storeId` → `stores.id` (ON DELETE CASCADE)

### 생성 Migration
- `apps/api/src/migrations/{timestamp}-Add{EntityName}.ts`
```

## 출력 형식 (Output Format)

Agent 실행 완료 시 다음 형식으로 보고서 생성:

```markdown
## Step 3 (Data Layer Design & Migration) 완료 보고

Feature: {feature_name}
Entity: {EntityName}
Table: {table_name}

### Mock 데이터 분석 결과
- TypeScript 인터페이스: {EntityName}
- 필드 개수: {count}
- 관계 필드: {foreignKeyFields}

### TypeScript → PostgreSQL 타입 변환
| 필드명 | TypeScript | PostgreSQL | 제약조건 |
|--------|-----------|-----------|---------|
| id | string | uuid | PRIMARY KEY |
| name | string | varchar(255) | NOT NULL |
| ... | ... | ... | ... |

### 추론된 관계 (Relations)
- {EntityName} **ManyToOne** → {RelatedEntity} (onDelete: CASCADE)
- {EntityName} **OneToMany** ← {RelatedEntity}
(총 {count}개)

### 생성된 파일
- ✅ `apps/api/src/entities/{entity-name}.entity.ts`
- ✅ `apps/api/src/migrations/{timestamp}-Add{EntityName}.ts`

### Migration 실행 결과
- ✅ Migration 성공: `{timestamp}-Add{EntityName}.ts`
- ✅ 테이블 생성 완료: `{table_name}`
- ✅ 인덱스 생성 완료: {count}개
- ✅ 외래키 생성 완료: {count}개

### DB 검증 결과 (MCP 사용)
- ✅ 테이블 존재 확인: `{table_name}`
- ✅ 컬럼 타입 확인: {count}/{total}
- ✅ 인덱스 확인: {count}/{total}
- ✅ 외래키 확인: {count}/{total}

### 문서 업데이트
- ✅ `docs/tech/db-schema.md` 업데이트 완료

### 다음 단계
- [ ] 사용자가 DB 스키마를 검토하고 승인
- [ ] 승인 후 Step 4 (Backend API Implementation) 진행

---

**사용자 액션 필요**: DB 스키마를 검토하고 승인해주세요.
```

## 결정 규칙 (Decision Rules)

### TypeScript → PostgreSQL 타입 변환
- **If** 필드명 === `id` **Then** `uuid`
- **If** 필드명 ends with `Id` **Then** `uuid` (외래키)
- **If** 필드명 in [`name`, `title`, `email`] **Then** `varchar(255)`
- **If** 필드명 in [`description`, `address`, `content`] **Then** `text`
- **If** 필드명 includes `price` or `amount` or `salary` **Then** `decimal(10,2)`
- **If** TypeScript 타입 === `number` **Then** `int` (기본값)
- **If** TypeScript 타입 === `boolean` **Then** `boolean`
- **If** TypeScript 타입 === `Date` **Then** `timestamp`
- **If** TypeScript 타입 === `'val1' | 'val2'` **Then** `varchar(20)`

### 관계 유형 결정
- **If** 필드명 matches `{EntityName}Id` 패턴 **Then** ManyToOne 관계
- **If** Mock에 배열 필드 (`{entities}: Entity[]`) **Then** OneToMany 또는 ManyToMany
- **If** Mock에 `{entities}: Entity[]` and no 중간테이블 **Then** OneToMany
- **If** Mock에 `{entities}: Entity[]` and 양방향 관계 **Then** ManyToMany

### CASCADE 결정
- **If** 자식 Entity가 부모 없이 의미 없음 **Then** `onDelete: 'CASCADE'`
- **If** 자식 Entity가 독립적 **Then** `onDelete: 'SET NULL'`
- **If** 불명확 **Then** `onDelete: 'RESTRICT'` (기본값)

### 인덱스 생성 결정
- **If** 필드가 WHERE 절에 자주 사용 (status, type 등) **Then** 인덱스 생성
- **If** 필드가 외래키 **Then** 인덱스 생성 권장
- **If** 필드가 UNIQUE **Then** 자동으로 인덱스 생성됨 (수동 불필요)

## 에러 처리 (Error Handling)

| Error Type | Detection | Recovery |
|-----------|-----------|----------|
| Mock 파일 없음 | File not found | "Step 2 (Frontend Mock)를 먼저 완료해주세요" 출력 후 중단 |
| TypeScript 파싱 실패 | Syntax error | Mock 파일 구문 검증, 에러 위치 출력 후 중단 |
| Migration 실행 실패 | Exit code != 0 | 에러 로그 분석, `migration:revert` 실행, 최대 3회 재시도 |
| 테이블 이미 존재 | Duplicate table error | `DROP TABLE` 후 재실행 (개발 환경) 또는 사용자 확인 요청 (프로덕션) |
| 외래키 참조 오류 | Foreign key constraint | 참조되는 테이블 먼저 생성, Migration 순서 조정 |
| SQL 문법 오류 | SQL syntax error | Migration 파일 검증, 수정 후 재실행 |

## 완료 검증 (Completion Validation)

Agent 작업 완료 기준:

- [ ] TypeORM Entity 클래스 생성됨 (`apps/api/src/entities/<entity-name>.entity.ts`)
- [ ] Migration 파일 생성됨 (`apps/api/src/migrations/<timestamp>-Add<EntityName>.ts`)
- [ ] `npm run migration:run` 실행 성공
- [ ] DB에 테이블 존재 확인 (MCP 구축 후)
- [ ] 컬럼, 타입, 제약조건 확인
- [ ] 외래키 관계 확인
- [ ] `docs/tech/db-schema.md` 업데이트 완료

**사용자 승인 필요**: 생성된 DB 스키마를 사용자가 검토하고 승인해야 다음 Step으로 진행 가능합니다.

## 주의사항 (Cautions)

### ❌ 하지 말아야 할 것

- **Mock 데이터와 다른 구조로 Entity를 설계하지 않습니다.**
  - Mock에 없는 필드를 추가하지 않습니다.
  - Mock의 필드를 임의로 제거하지 않습니다.

- **"나중에 필요할 것 같은" 필드를 미리 추가하지 않습니다.**
  - YAGNI (You Aren't Gonna Need It) 원칙을 따릅니다.

- **복잡한 정규화를 과도하게 적용하지 않습니다.**
  - MVP 단계에서는 간결함을 우선합니다.
  - 필요할 때 리팩터링합니다.

### ✅ 해야 할 것

- **Mock 데이터 구조를 최대한 그대로 반영합니다.**
  - Frontend가 이미 검증한 데이터 구조이므로 신뢰합니다.

- **관계는 명확하게 정의합니다.**
  - 애매한 관계는 주석으로 설명을 추가합니다.

- **인덱스는 신중하게 추가합니다.**
  - WHERE 절에 자주 사용되는 컬럼
  - JOIN에 사용되는 외래키
  - 과도한 인덱스는 INSERT/UPDATE 성능 저하

- **Migration은 롤백 가능하게 작성합니다.**
  - `down()` 메서드를 꼭 구현합니다.

## 참조 (References)

- **Skill 가이드**: `.claude/skills/database-design-guide/SKILL.md`
- **Command**: `.claude/commands/design-db.md`
- **CLAUDE.md**: Section 3.3 (Step 3: Data Layer Design & Migration)
- **Mock 데이터**: `apps/web/lib/mocks/<feature-name>.ts`
- **DB 스키마 문서**: `docs/tech/db-schema.md`
- **TypeORM 공식 문서**: https://typeorm.io/
- **PostgreSQL 공식 문서**: https://www.postgresql.org/docs/

## 버전 히스토리 (Version History)

- v1.0 (2025-11-11): 초기 버전 생성
