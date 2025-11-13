---
name: database-design-guide
description: >
  Step 3 (Data Layer Design & Migration) 실행 가이드.
  Mock 데이터를 분석해서 실제 DB 스키마를 설계하고 Migration을 생성한다.
---

# database-design-guide

## 목적

이 Skill은 Feature 구현의 **Step 3: Data Layer Design & Migration**을 실행하는 가이드이다.

- Step 2의 Mock 데이터 구조 분석
- TypeScript 타입 → PostgreSQL 타입 변환
- 관계(relation) 추론 및 정의
- TypeORM Entity 클래스 작성
- Migration 파일 생성 및 실행

이 단계의 목표는 **Frontend에서 사용한 Mock 데이터를 그대로 반영한 DB 스키마**를 만드는 것이다.

## 입력

### 필수 파일
- `apps/web/lib/mocks/<feature-name>.ts` - Step 2에서 생성한 Mock 데이터
- `docs/tech/db-schema.md` - 기존 스키마 문서 (있다면)

### 필수 정보
- Feature 이름 (예: "store-management", "attendance-checkin")

## 출력

### 생성 파일

#### 1. TypeORM Entity 클래스
- `apps/api/src/entities/<entity-name>.entity.ts`
  - 예: `store.entity.ts`, `employee.entity.ts`
  - TypeORM 데코레이터 사용
  - 관계(relation) 정의

#### 2. Migration 파일
- `apps/api/src/migrations/<timestamp>-Add<EntityName>.ts`
  - 예: `1699100000000-AddStore.ts`
  - `up()`: 테이블 생성
  - `down()`: 테이블 삭제 (롤백)

### 업데이트 문서
- `docs/tech/db-schema.md` - 스키마 문서 업데이트

## 실행 체크리스트

### 1. Mock 데이터 분석
- [ ] `apps/web/lib/mocks/<feature-name>.ts` 읽기
- [ ] Mock 데이터의 TypeScript 타입 추출
- [ ] 각 필드의 의미와 용도 파악
- [ ] 필수 필드 / 선택 필드 구분

### 2. 타입 변환 (TypeScript → PostgreSQL)
- [ ] 각 필드의 PostgreSQL 타입 결정:
  - `string` → `varchar`, `text`, `uuid`
  - `number` → `int`, `bigint`, `decimal`
  - `boolean` → `boolean`
  - `Date` → `timestamp`, `date`
  - `enum` → `enum` 또는 `varchar` with CHECK
- [ ] 필드 제약조건 결정:
  - `NOT NULL`, `UNIQUE`, `DEFAULT`
- [ ] 인덱스 필요 여부 판단 (검색/필터링에 자주 사용되는 필드)

### 3. 관계(Relation) 추론
- [ ] Mock 데이터에서 관계 패턴 찾기:
  - `storeId` → Store와 OneToMany 관계
  - `userId` → User와 ManyToOne 관계
- [ ] 관계 유형 결정:
  - OneToOne: 1:1 관계
  - ManyToOne / OneToMany: N:1 관계
  - ManyToMany: N:M 관계 (중간 테이블 필요)
- [ ] 외래키(Foreign Key) 정의
- [ ] CASCADE 옵션 결정 (ON DELETE, ON UPDATE)

### 4. TypeORM Entity 작성
- [ ] `apps/api/src/entities/<entity-name>.entity.ts` 생성
- [ ] `@Entity()` 데코레이터 추가
- [ ] 각 필드에 데코레이터 추가:
  - `@PrimaryGeneratedColumn('uuid')`
  - `@Column()`
  - `@CreateDateColumn()`, `@UpdateDateColumn()`
- [ ] 관계 데코레이터 추가:
  - `@OneToOne()`, `@ManyToOne()`, `@OneToMany()`, `@ManyToMany()`
- [ ] TypeScript 타입 정의 (interface 또는 class)

### 5. Migration 파일 생성
- [ ] `npm run migration:generate` 또는 수동 생성
- [ ] Migration 파일명 확인: `<timestamp>-Add<EntityName>.ts`
- [ ] `up()` 메서드 작성:
  - [ ] `CREATE TABLE` 문
  - [ ] 컬럼 정의
  - [ ] 외래키 제약조건
  - [ ] 인덱스 생성
- [ ] `down()` 메서드 작성:
  - [ ] `DROP TABLE` 문
  - [ ] 인덱스 삭제

### 6. Migration 실행
- [ ] `npm run migration:run` 실행
- [ ] 에러 발생 시 원인 파악 및 수정
- [ ] Migration 성공 확인

### 7. DB 스키마 검증
- [ ] (MCP 구축 후) DB에 테이블 존재 확인
- [ ] 컬럼, 타입, 제약조건 확인
- [ ] 외래키 관계 확인
- [ ] 인덱스 확인

### 8. 문서 업데이트
- [ ] `docs/tech/db-schema.md` 업데이트
  - [ ] 테이블명, 컬럼 목록
  - [ ] 관계 다이어그램 (텍스트 또는 Mermaid)
  - [ ] 인덱스 목록

## 주의사항

### ❌ 하지 말아야 할 것

- **Mock 데이터와 다른 구조로 Entity를 설계하지 않는다.**
  - Mock에 없는 필드를 추가하지 않는다.
  - Mock의 필드를 임의로 제거하지 않는다.

- **"나중에 필요할 것 같은" 필드를 미리 추가하지 않는다.**
  - YAGNI (You Aren't Gonna Need It) 원칙을 따른다.

- **복잡한 정규화를 과도하게 적용하지 않는다.**
  - MVP 단계에서는 간결함을 우선한다.
  - 필요할 때 리팩터링한다.

### ✅ 해야 할 것

- **Mock 데이터 구조를 최대한 그대로 반영한다.**
  - Frontend가 이미 검증한 데이터 구조이므로 신뢰한다.

- **관계는 명확하게 정의한다.**
  - 애매한 관계는 주석으로 설명을 추가한다.

- **인덱스는 신중하게 추가한다.**
  - WHERE 절에 자주 사용되는 컬럼
  - JOIN에 사용되는 외래키
  - 과도한 인덱스는 INSERT/UPDATE 성능 저하

- **Migration은 롤백 가능하게 작성한다.**
  - `down()` 메서드를 꼭 구현한다.

## TypeScript → PostgreSQL 타입 변환 가이드

| TypeScript | PostgreSQL | 비고 |
|------------|-----------|------|
| `string` | `varchar(255)` | 짧은 문자열 |
| `string` | `text` | 긴 문자열 (본문 등) |
| `string` | `uuid` | ID 필드 |
| `number` | `int` | 정수 |
| `number` | `bigint` | 큰 정수 |
| `number` | `decimal(10,2)` | 금액, 소수점 |
| `boolean` | `boolean` | True/False |
| `Date` | `timestamp` | 날짜 + 시간 |
| `Date` | `date` | 날짜만 |
| `'active' \| 'inactive'` | `varchar(20)` | Enum (간단) |
| `enum Status` | `enum('active','inactive')` | Enum (정식) |

## Entity 예시

### Mock 데이터 (`apps/web/lib/mocks/stores.ts`)

```typescript
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}
```

### Entity 클래스 (`apps/api/src/entities/store.entity.ts`)

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('stores')
export class Store {
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

### Migration 파일 (`apps/api/src/migrations/1699100000000-AddStore.ts`)

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddStore1699100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'stores',
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
          {
            name: 'address',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'employeeCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'active'",
          },
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

    // Index for searching by name
    await queryRunner.createIndex(
      'stores',
      new TableIndex({
        name: 'IDX_STORES_NAME',
        columnNames: ['name'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('stores', 'IDX_STORES_NAME');
    await queryRunner.dropTable('stores');
  }
}
```

## Agent 실행 가이드 (향후 Agent 구축 시 참조)

### Agent 역할
- `database-agent` (general-purpose Agent 사용)

### Agent 작업 순서
1. Mock 데이터 파일 읽기 (`apps/web/lib/mocks/<feature-name>.ts`)
2. TypeScript 타입 분석
3. PostgreSQL 타입 변환
4. 관계 추론
5. TypeORM Entity 클래스 생성
6. Migration 파일 생성
7. `npm run migration:run` 실행
8. (MCP 사용) DB 스키마 검증
9. `docs/tech/db-schema.md` 업데이트
10. 완료 보고서 생성

### Agent 출력 형식
```markdown
## Database Schema 완료 보고

Feature: <feature-name>

### 생성 Entity
- Store (stores 테이블)
  - 컬럼: id, name, address, phone, employeeCount, status, createdAt, updatedAt
  - 관계: OneToMany → Employee

### Migration 실행 결과
- ✅ Migration 성공: 1699100000000-AddStore.ts
- ✅ 테이블 생성 완료: stores
- ✅ 인덱스 생성 완료: IDX_STORES_NAME

### 생성 파일
- apps/api/src/entities/store.entity.ts
- apps/api/src/migrations/1699100000000-AddStore.ts

### DB 검증 (MCP 사용)
- ✅ 테이블 존재 확인: stores
- ✅ 컬럼 타입 확인
- ✅ 인덱스 확인

### 다음 단계
- 사용자 스키마 검토 및 승인 대기
```

## 완료 조건

- [ ] TypeORM Entity 클래스 생성됨
- [ ] Migration 파일 생성됨
- [ ] `npm run migration:run` 실행 성공
- [ ] (MCP 구축 후) DB에 테이블 존재 확인
- [ ] 컬럼, 타입, 제약조건 확인
- [ ] 외래키 관계 확인
- [ ] `docs/tech/db-schema.md` 업데이트
- [ ] **사용자가 스키마를 검토하고 승인함** ← 중요!

## 참조 문서

- `CLAUDE.md` Section 3.3
- `apps/web/lib/mocks/<feature-name>.ts`
- `docs/tech/db-schema.md`
- TypeORM 공식 문서: https://typeorm.io/
- PostgreSQL 공식 문서: https://www.postgresql.org/docs/

## 관계(Relation) 패턴 가이드

### OneToMany / ManyToOne (N:1)

**예**: 한 Store는 여러 Employee를 가진다.

```typescript
// store.entity.ts
@Entity('stores')
export class Store {
  @OneToMany(() => Employee, employee => employee.store)
  employees: Employee[];
}

// employee.entity.ts
@Entity('employees')
export class Employee {
  @ManyToOne(() => Store, store => store.employees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column({ type: 'uuid' })
  storeId: string;
}
```

### ManyToMany (N:M)

**예**: Employee는 여러 Skill을 가지고, Skill은 여러 Employee가 가질 수 있다.

```typescript
// employee.entity.ts
@Entity('employees')
export class Employee {
  @ManyToMany(() => Skill, skill => skill.employees)
  @JoinTable({
    name: 'employee_skills', // 중간 테이블명
    joinColumn: { name: 'employeeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skillId', referencedColumnName: 'id' },
  })
  skills: Skill[];
}

// skill.entity.ts
@Entity('skills')
export class Skill {
  @ManyToMany(() => Employee, employee => employee.skills)
  employees: Employee[];
}
```

## Migration 실행 명령어

```bash
# Migration 생성 (자동)
npm run migration:generate -- -n AddStore

# Migration 실행
npm run migration:run

# Migration 롤백 (마지막 1개)
npm run migration:revert

# Migration 상태 확인
npm run migration:show
```

## 디버깅 팁

### Migration 실행 실패 시
- 에러 메시지 확인
- SQL 문법 확인
- 외래키 제약조건 확인 (참조되는 테이블이 먼저 생성되어야 함)
- 중복 테이블명 확인

### Entity 로딩 실패 시
- `app.module.ts`에서 Entity가 import되었는지 확인
- Entity 파일명이 `*.entity.ts` 패턴인지 확인
- TypeORM 데코레이터 문법 확인
