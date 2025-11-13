---
name: step4-api-implementation-agent
version: 1.0
purpose: >
  Step 4: Backend API Implementation & Integration - 실제 API를 구현하고 Frontend와 자동으로 통합합니다.
  Agent automation guide for executing the backend API implementation workflow.
target_skill: api-implementation-guide
target_command: /implement-api
---

# Agent Prompt: Step 4 - API Implementation Agent

## 목적 (Purpose)

이 Agent는 `/implement-api` 커맨드 실행 시 Backend API를 구현하고 Frontend와 **자동으로 통합**합니다.

- Entity 기반 DTO 자동 생성
- NestJS Service/Controller/Module 자동 생성
- class-validator 데코레이터 자동 적용
- API E2E 테스트 자동 작성 및 실행
- Real API Client 자동 생성
- Frontend Mock → Real 전환
- UI E2E 테스트 재실행 및 검증

**핵심 원칙**: Mock Provider 패턴 덕분에 Frontend 코드 변경 최소화

## 사전조건 (Prerequisites)

Agent 실행 전 다음 조건이 충족되어야 합니다:

- [ ] Step 3 (Data Layer Design) 완료
- [ ] `apps/api/src/entities/<entity-name>.entity.ts` 파일 존재
- [ ] Migration 실행 완료 (DB 테이블 생성됨)
- [ ] NestJS 프로젝트 설정 완료
- [ ] class-validator, class-transformer 설치됨
- [ ] Jest (API E2E 테스트) 설정 완료

## 입력 파라미터 (Input Parameters)

Agent 실행 시 다음 파라미터가 필요합니다:

- `feature_name`: Feature 이름 (예: "store-management", "attendance-checkin")
- `entity_name`: Entity 이름 (단수형, PascalCase, 예: "Store", "Employee")
- `resource_name`: Resource 이름 (복수형, kebab-case, 예: "stores", "employees")
- `feature_number`: Feature 번호 (예: "F2", "F3")

## Agent 작업 순서 (Task Sequence)

### Phase 1: Entity 및 Mock 데이터 확인 (Verification)

#### 1. Entity 클래스 확인
- `apps/api/src/entities/<entity-name>.entity.ts` 읽기
- Entity 필드 목록 추출
- 관계(Relations) 확인
- 필수/선택적 필드 파악

#### 2. Mock 데이터 확인
- `apps/web/lib/mocks/<feature-name>.ts` 읽기
- Mock 데이터 구조와 Entity 구조 일치 여부 확인
- Create/Update DTO 타입 확인

### Phase 2: DTO 클래스 작성 (DTO Generation)

#### 3. DTO 디렉토리 생성
`apps/api/src/modules/<feature>/dto/` 디렉토리 생성

#### 4. Create DTO 작성
`apps/api/src/modules/<feature>/dto/create-{entity}.dto.ts` 생성:

```typescript
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create{EntityName}Dto {
  @ApiProperty({ example: '스타벅스 강남점', description: '{필드 설명}' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '서울시 강남구 테헤란로 123', description: '{필드 설명}' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '02-1234-5678', description: '{필드 설명}' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 12, description: '{필드 설명}', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  employeeCount?: number;

  @ApiProperty({ enum: ['active', 'inactive'], example: 'active', description: '{필드 설명}', required: false })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';
}
```

**DTO 생성 규칙**:
- Entity의 `id`, `createdAt`, `updatedAt` 필드는 제외
- 필수 필드: `@IsNotEmpty()` 추가
- 선택적 필드: `@IsOptional()` 추가
- 각 타입에 맞는 validator 추가:
  - `string` → `@IsString()`
  - `number` → `@IsInt()` 또는 `@IsNumber()`
  - `boolean` → `@IsBoolean()`
  - `Date` → `@IsDate()` + `@Type(() => Date)`
  - `enum` → `@IsEnum(EnumType)`

#### 5. Update DTO 작성
`apps/api/src/modules/<feature>/dto/update-{entity}.dto.ts` 생성:

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { Create{EntityName}Dto } from './create-{entity}.dto';

export class Update{EntityName}Dto extends PartialType(Create{EntityName}Dto) {}
```

**PartialType**: 모든 필드를 선택적으로 만듦

### Phase 3: Service 레이어 구현 (Service Implementation)

#### 6. Service 파일 생성
`apps/api/src/modules/<feature>/<feature>.service.ts` 생성:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { {EntityName} } from '@/entities/{entity-name}.entity';
import { Create{EntityName}Dto } from './dto/create-{entity}.dto';
import { Update{EntityName}Dto } from './dto/update-{entity}.dto';

@Injectable()
export class {ResourceName}Service {
  constructor(
    @InjectRepository({EntityName})
    private readonly {entity}Repository: Repository<{EntityName}>,
  ) {}

  async findAll(): Promise<{EntityName}[]> {
    return this.{entity}Repository.find();
  }

  async findOne(id: string): Promise<{EntityName}> {
    const {entity} = await this.{entity}Repository.findOne({ where: { id } });
    if (!{entity}) {
      throw new NotFoundException(`{EntityName} with ID "${id}" not found`);
    }
    return {entity};
  }

  async create(create{EntityName}Dto: Create{EntityName}Dto): Promise<{EntityName}> {
    const {entity} = this.{entity}Repository.create(create{EntityName}Dto);
    return this.{entity}Repository.save({entity});
  }

  async update(id: string, update{EntityName}Dto: Update{EntityName}Dto): Promise<{EntityName}> {
    const {entity} = await this.findOne(id);
    Object.assign({entity}, update{EntityName}Dto);
    return this.{entity}Repository.save({entity});
  }

  async remove(id: string): Promise<void> {
    const {entity} = await this.findOne(id);
    await this.{entity}Repository.remove({entity});
  }
}
```

**에러 처리**:
- `findOne()`: 존재하지 않으면 `NotFoundException`
- `update()`: `findOne()`을 호출하여 존재 여부 확인
- `remove()`: `findOne()`을 호출하여 존재 여부 확인

### Phase 4: Controller 레이어 구현 (Controller Implementation)

#### 7. Controller 파일 생성
`apps/api/src/modules/<feature>/<feature>.controller.ts` 생성:

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { {ResourceName}Service } from './{resource-name}.service';
import { Create{EntityName}Dto } from './dto/create-{entity}.dto';
import { Update{EntityName}Dto } from './dto/update-{entity}.dto';

@ApiTags('{resource-name}')
@Controller('{resource-name}')
export class {ResourceName}Controller {
  constructor(private readonly {resource}Service: {ResourceName}Service) {}

  @Get()
  @ApiOperation({ summary: '{EntityName} 목록 조회' })
  @ApiResponse({ status: 200, description: '성공' })
  findAll() {
    return this.{resource}Service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '{EntityName} 단건 조회' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 404, description: '존재하지 않음' })
  findOne(@Param('id') id: string) {
    return this.{resource}Service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '{EntityName} 생성' })
  @ApiResponse({ status: 201, description: '생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  create(@Body() create{EntityName}Dto: Create{EntityName}Dto) {
    return this.{resource}Service.create(create{EntityName}Dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '{EntityName} 수정' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않음' })
  update(
    @Param('id') id: string,
    @Body() update{EntityName}Dto: Update{EntityName}Dto,
  ) {
    return this.{resource}Service.update(id, update{EntityName}Dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '{EntityName} 삭제' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않음' })
  async remove(@Param('id') id: string) {
    await this.{resource}Service.remove(id);
  }
}
```

**HTTP 상태 코드**:
- GET: 200 OK
- POST: 201 Created
- PUT: 200 OK
- DELETE: 204 No Content

### Phase 5: Module 구성 (Module Configuration)

#### 8. Module 파일 생성
`apps/api/src/modules/<feature>/<feature>.module.ts` 생성:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { {ResourceName}Controller } from './{resource-name}.controller';
import { {ResourceName}Service } from './{resource-name}.service';
import { {EntityName} } from '@/entities/{entity-name}.entity';

@Module({
  imports: [TypeOrmModule.forFeature([{EntityName}])],
  controllers: [{ResourceName}Controller],
  providers: [{ResourceName}Service],
  exports: [{ResourceName}Service],
})
export class {ResourceName}Module {}
```

#### 9. app.module.ts에 Module 등록
`apps/api/src/app.module.ts` 수정:

```typescript
import { {ResourceName}Module } from './modules/{resource-name}/{resource-name}.module';

@Module({
  imports: [
    // ... 기존 imports
    {ResourceName}Module,
  ],
  // ...
})
export class AppModule {}
```

### Phase 6: API E2E 테스트 작성 (API E2E Testing)

#### 10. API E2E 테스트 파일 생성
`apps/api/test/e2e/<feature>.e2e-spec.ts` 생성:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('{ResourceName}Controller (e2e)', () => {
  let app: INestApplication;
  let created{Entity}Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /{resource-name}', () => {
    it('AC-F{N}-01: {AC 설명}', () => {
      return request(app.getHttpServer())
        .post('/{resource-name}')
        .send({
          name: '테스트 {EntityName}',
          address: '서울시 강남구',
          phone: '02-1234-5678',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('테스트 {EntityName}');
          created{Entity}Id = res.body.id;
        });
    });

    it('잘못된 데이터로 생성 시 400 에러', () => {
      return request(app.getHttpServer())
        .post('/{resource-name}')
        .send({
          // name 필드 누락
          address: '서울시 강남구',
        })
        .expect(400);
    });
  });

  describe('GET /{resource-name}', () => {
    it('AC-F{N}-02: {AC 설명}', () => {
      return request(app.getHttpServer())
        .get('/{resource-name}')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /{resource-name}/:id', () => {
    it('AC-F{N}-03: {AC 설명}', () => {
      return request(app.getHttpServer())
        .get(`/{resource-name}/${created{Entity}Id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(created{Entity}Id);
          expect(res.body).toHaveProperty('name');
        });
    });

    it('존재하지 않는 ID 조회 시 404 에러', () => {
      return request(app.getHttpServer())
        .get('/{resource-name}/nonexistent-id')
        .expect(404);
    });
  });

  describe('PUT /{resource-name}/:id', () => {
    it('AC-F{N}-04: {AC 설명}', () => {
      return request(app.getHttpServer())
        .put(`/{resource-name}/${created{Entity}Id}`)
        .send({
          name: '수정된 {EntityName}',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('수정된 {EntityName}');
        });
    });
  });

  describe('DELETE /{resource-name}/:id', () => {
    it('AC-F{N}-05: {AC 설명}', () => {
      return request(app.getHttpServer())
        .delete(`/{resource-name}/${created{Entity}Id}`)
        .expect(204);
    });

    it('삭제 후 조회 시 404 에러', () => {
      return request(app.getHttpServer())
        .get(`/{resource-name}/${created{Entity}Id}`)
        .expect(404);
    });
  });
});
```

#### 11. API E2E 테스트 실행
```bash
cd apps/api
npm run test:e2e
```

**검증**:
- 모든 테스트 통과
- AC별 테스트 케이스 성공
- 에러 케이스 테스트 성공

### Phase 7: Frontend Real API Client 생성 (Real API Client)

#### 12. Real API Client 구현
`apps/web/lib/api/<feature-name>-client.ts` 파일 수정:

기존 Mock 함수는 그대로 두고, Real API 함수 구현:

```typescript
// Real API 함수 구현
const realGet{Entities} = async (): Promise<{EntityName}[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/{resource-name}`);
  if (!res.ok) throw new Error('Failed to fetch {entities}');
  return res.json();
};

const realGet{Entity} = async (id: string): Promise<{EntityName} | null> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/{resource-name}/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch {entity}');
  return res.json();
};

const realCreate{Entity} = async (data: Create{EntityName}DTO): Promise<{EntityName}> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/{resource-name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create {entity}');
  return res.json();
};

const realUpdate{Entity} = async (id: string, data: Update{EntityName}DTO): Promise<{EntityName}> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/{resource-name}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update {entity}');
  return res.json();
};

const realDelete{Entity} = async (id: string): Promise<void> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/{resource-name}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete {entity}');
};

// Provider 패턴: 환경변수 하나로 전환
const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export const {resource}Api = {
  get{Entities}: useMock ? mockGet{Entities} : realGet{Entities},
  get{Entity}: useMock ? mockGet{Entity} : realGet{Entity},
  create{Entity}: useMock ? mockCreate{Entity} : realCreate{Entity},
  update{Entity}: useMock ? mockUpdate{Entity} : realUpdate{Entity},
  delete{Entity}: useMock ? mockDelete{Entity} : realDelete{Entity},
};
```

#### 13. 환경변수 전환
`apps/web/.env.local` 파일 수정:

```
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Phase 8: Frontend UI E2E 테스트 재실행 (UI E2E Re-Testing)

#### 14. Backend API 서버 실행
```bash
cd apps/api
npm run start:dev
```

#### 15. Frontend 서버 실행
```bash
cd apps/web
npm run dev
```

#### 16. Playwright 테스트 실행 (Real API)
```bash
npx playwright test apps/web/tests/e2e/<feature-name>.spec.ts
```

**검증**:
- 모든 테스트 통과
- Real API와 연동 확인
- 데이터가 DB에 실제로 저장/조회/수정/삭제되는지 확인

### Phase 9: 통합 검증 (Integration Validation)

#### 17. 브라우저 수동 테스트
- 모든 화면이 Real API와 연동되어 동작하는지 확인
- 데이터가 DB에 실제로 저장/조회/수정/삭제되는지 확인
- 에러 처리 확인 (네트워크 에러, 권한 에러 등)
- 로딩 상태, Empty State, Error State 동작 확인

### Phase 10: 문서 업데이트 (Documentation Update)

#### 18. `docs/tech/api-spec.md` 업데이트
```markdown
## {EntityName} API

### 엔드포인트

#### GET /{resource-name}
- **설명**: {EntityName} 목록 조회
- **응답**: `{EntityName}[]`
- **상태 코드**: 200 OK

#### GET /{resource-name}/:id
- **설명**: {EntityName} 단건 조회
- **파라미터**: `id` (uuid)
- **응답**: `{EntityName}`
- **상태 코드**: 200 OK, 404 Not Found

#### POST /{resource-name}
- **설명**: {EntityName} 생성
- **요청 본문**: `Create{EntityName}Dto`
- **응답**: `{EntityName}`
- **상태 코드**: 201 Created, 400 Bad Request

#### PUT /{resource-name}/:id
- **설명**: {EntityName} 수정
- **파라미터**: `id` (uuid)
- **요청 본문**: `Update{EntityName}Dto`
- **응답**: `{EntityName}`
- **상태 코드**: 200 OK, 404 Not Found

#### DELETE /{resource-name}/:id
- **설명**: {EntityName} 삭제
- **파라미터**: `id` (uuid)
- **상태 코드**: 204 No Content, 404 Not Found
```

#### 19. `docs/qa/test-cases-api.md` 업데이트
```markdown
## {Feature 제목} API 테스트

| AC | 테스트 케이스 | 파일 | 상태 |
|----|-------------|------|------|
| AC-F{N}-01 | {EntityName} 생성 | {feature}.e2e-spec.ts | ✅ Pass |
| AC-F{N}-02 | {EntityName} 목록 조회 | {feature}.e2e-spec.ts | ✅ Pass |
| AC-F{N}-03 | {EntityName} 단건 조회 | {feature}.e2e-spec.ts | ✅ Pass |
| AC-F{N}-04 | {EntityName} 수정 | {feature}.e2e-spec.ts | ✅ Pass |
| AC-F{N}-05 | {EntityName} 삭제 | {feature}.e2e-spec.ts | ✅ Pass |
```

## 출력 형식 (Output Format)

Agent 실행 완료 시 다음 형식으로 보고서 생성:

```markdown
## Step 4 (Backend API Implementation & Integration) 완료 보고

Feature: {feature_name} ({feature_number})
Entity: {EntityName}
Resource: {resource-name}

### 생성된 파일

#### DTO 클래스
- ✅ `apps/api/src/modules/<feature>/dto/create-{entity}.dto.ts`
- ✅ `apps/api/src/modules/<feature>/dto/update-{entity}.dto.ts`
- class-validator 적용: {count}개 필드

#### Service/Controller/Module
- ✅ `apps/api/src/modules/<feature>/<feature>.service.ts`
- ✅ `apps/api/src/modules/<feature>/<feature>.controller.ts`
- ✅ `apps/api/src/modules/<feature>/<feature>.module.ts`
- `app.module.ts`에 Module 등록 완료

#### API E2E 테스트
- ✅ `apps/api/test/e2e/<feature>.e2e-spec.ts`

#### Real API Client
- ✅ `apps/web/lib/api/<feature-name>-client.ts` 업데이트
- Real API 함수 구현: {count}개

### API E2E 테스트 결과
- ✅ 총 {count}개 테스트 모두 통과
- ✅ AC 검증: {passed}/{total}
- ✅ 성공 케이스 테스트 통과
- ✅ 실패 케이스 테스트 통과 (400, 404 등)

### Frontend 통합 결과
- ✅ 환경변수 전환: NEXT_PUBLIC_USE_MOCK_API=false
- ✅ Real API 연동 성공
- ✅ UI E2E 테스트 (Real API) 모두 통과: {count}/{total}

### 브라우저 검증
- ✅ 모든 화면이 Real API와 연동되어 동작
- ✅ 데이터가 DB에 실제로 저장/조회/수정/삭제됨
- ✅ 에러 처리 동작 확인
- ✅ 로딩/Empty/Error State 동작 확인

### 문서 업데이트
- ✅ `docs/tech/api-spec.md` 업데이트
- ✅ `docs/qa/test-cases-api.md` 업데이트

### 다음 단계
- [ ] 사용자가 최종 기능을 브라우저에서 테스트하고 승인
- [ ] 승인 후 다음 Feature 진행 또는 Phase 완료

---

**사용자 액션 필요**: 브라우저에서 http://localhost:3000/{resource}를 열어 Real API 연동을 최종 확인해주세요.
```

## 결정 규칙 (Decision Rules)

### DTO Validator 선택
- **If** 타입 === `string` **Then** `@IsString()`
- **If** 타입 === `number` and 정수 **Then** `@IsInt()`
- **If** 타입 === `number` and 소수 **Then** `@IsNumber()`
- **If** 타입 === `boolean` **Then** `@IsBoolean()`
- **If** 타입 === `Date` **Then** `@IsDate()` + `@Type(() => Date)`
- **If** 타입 === Union (예: `'active' | 'inactive'`) **Then** `@IsEnum(['active', 'inactive'])`
- **If** 필드 선택적 **Then** `@IsOptional()` 추가
- **If** 필드 필수 **Then** `@IsNotEmpty()` 추가

### HTTP 상태 코드
- **If** GET 성공 **Then** 200 OK
- **If** POST 성공 **Then** 201 Created
- **If** PUT 성공 **Then** 200 OK
- **If** DELETE 성공 **Then** 204 No Content
- **If** 잘못된 요청 **Then** 400 Bad Request
- **If** 리소스 없음 **Then** 404 Not Found
- **If** 서버 에러 **Then** 500 Internal Server Error

### NestJS Exception 선택
- **If** 리소스 없음 **Then** `throw new NotFoundException()`
- **If** 잘못된 요청 **Then** `throw new BadRequestException()`
- **If** 권한 없음 **Then** `throw new UnauthorizedException()`
- **If** 접근 금지 **Then** `throw new ForbiddenException()`

## 에러 처리 (Error Handling)

| Error Type | Detection | Recovery |
|-----------|-----------|----------|
| Entity 파일 없음 | File not found | "Step 3 (Data Layer Design)을 먼저 완료해주세요" 출력 후 중단 |
| Migration 미실행 | DB 테이블 없음 | "npm run migration:run을 먼저 실행해주세요" 출력 후 중단 |
| API E2E 테스트 실패 | Test exit code != 0 | 에러 로그 분석, 최대 3회 재시도, 실패 시 사용자에게 보고 |
| UI E2E 테스트 실패 (Real API) | Test exit code != 0 | Backend 로그 확인, Network 탭 확인, 최대 3회 재시도 |
| Backend 서버 실행 실패 | Port already in use | 다른 포트로 재시도 (3001, 3002 등) |
| DB 연결 실패 | Connection error | DB 실행 상태 확인, 연결 정보 검증 |

## 완료 검증 (Completion Validation)

Agent 작업 완료 기준:

- [ ] DTO 클래스 생성 및 validation 적용 완료
- [ ] Service/Controller/Module 구현 완료
- [ ] `app.module.ts`에 Module 등록 완료
- [ ] API E2E 테스트 작성 및 모두 통과
- [ ] Frontend Real API Client 구현 완료
- [ ] 환경변수 전환 (NEXT_PUBLIC_USE_MOCK_API=false)
- [ ] Frontend UI E2E 테스트 (Real API) 모두 통과
- [ ] 브라우저에서 수동 테스트 통과
- [ ] `docs/tech/api-spec.md` 업데이트
- [ ] `docs/qa/test-cases-api.md` 업데이트

**사용자 승인 필요**: 브라우저에서 Real API 연동을 최종 확인하고 승인해야 Feature 완료입니다.

## 주의사항 (Cautions)

### ❌ 하지 말아야 할 것

- **Mock 데이터 구조와 다른 API 응답 형식을 만들지 않습니다.**
  - Frontend는 이미 Mock 데이터 구조에 맞춰져 있습니다.

- **Frontend 코드를 대폭 수정하지 않습니다.**
  - Mock Provider 패턴 덕분에 최소한의 변경만 필요합니다.

- **테스트 없이 "눈으로 확인했으니 됐다"고 넘어가지 않습니다.**
  - API E2E 테스트와 UI E2E 테스트를 모두 통과시켜야 합니다.

### ✅ 해야 할 것

- **DTO validation을 철저히 적용합니다.**
  - 잘못된 요청을 사전에 걸러냅니다.

- **에러 처리를 명확하게 합니다.**
  - NestJS Exception Filter를 활용합니다.
  - 사용자에게 유용한 에러 메시지를 제공합니다.

- **API E2E 테스트와 UI E2E 테스트를 모두 통과시킵니다.**
  - Backend와 Frontend가 완벽히 통합되었음을 보장합니다.

## 참조 (References)

- **Skill 가이드**: `.claude/skills/api-implementation-guide/SKILL.md`
- **Command**: `.claude/commands/implement-api.md`
- **CLAUDE.md**: Section 3.4 (Step 4: Backend API Implementation & Integration)
- **Entity**: `apps/api/src/entities/<entity-name>.entity.ts`
- **Mock 데이터**: `apps/web/lib/mocks/<feature-name>.ts`
- **API 스펙**: `docs/tech/api-spec.md`
- **NestJS 공식 문서**: https://docs.nestjs.com/
- **class-validator**: https://github.com/typestack/class-validator
- **Jest**: https://jestjs.io/
- **Playwright**: https://playwright.dev/

## 버전 히스토리 (Version History)

- v1.0 (2025-11-11): 초기 버전 생성
