---
name: api-implementation-guide
description: >
  Step 4 (Backend API & Integration) 실행 가이드.
  API를 구현하고 Frontend를 Real API에 연결한다.
---

# api-implementation-guide

## 목적

이 Skill은 Feature 구현의 **Step 4: Backend API & Integration**을 실행하는 가이드이다.

- API 스펙 기반 Controller/Service 구현
- DTO (Data Transfer Object) 클래스 작성
- API E2E 테스트 작성 및 실행
- Frontend Mock Provider → Real API Provider 전환
- Playwright 통합 테스트 재실행

이 단계의 목표는 **Frontend와 Backend를 완전히 연결하여 End-to-End로 동작하는 Feature**를 완성하는 것이다.

## 입력

### 필수 문서
- `docs/tech/api-spec.md` - API 명세
- `docs/product/prd-main.md` - AC (Acceptance Criteria)

### 필수 파일
- `apps/api/src/entities/<entity>.entity.ts` - Step 3에서 생성한 Entity
- `apps/web/lib/mocks/<feature-name>.ts` - Step 2에서 생성한 Mock 데이터
- `apps/web/lib/api/<feature-name>-client.ts` - Step 2에서 생성한 API Client

## 출력

### 생성 파일

#### 1. Controller
- `apps/api/src/modules/<feature>/<feature>.controller.ts`
  - REST API 엔드포인트 정의
  - 요청/응답 처리
  - DTO 사용

#### 2. Service
- `apps/api/src/modules/<feature>/<feature>.service.ts`
  - 비즈니스 로직 구현
  - Repository 사용
  - 트랜잭션 처리

#### 3. DTO (Data Transfer Object)
- `apps/api/src/modules/<feature>/dto/create-<feature>.dto.ts`
- `apps/api/src/modules/<feature>/dto/update-<feature>.dto.ts`
  - 요청 데이터 검증
  - class-validator 사용

#### 4. Module
- `apps/api/src/modules/<feature>/<feature>.module.ts`
  - Controller, Service 등록
  - TypeORM Repository 주입

#### 5. API E2E 테스트
- `apps/api/test/e2e/<feature-name>.e2e-spec.ts`
  - AC 기반 테스트 케이스
  - 성공/실패 시나리오
  - 실제 DB 사용

#### 6. Real API Client
- `apps/web/lib/api/<feature-name>-api.ts`
  - Real API 호출 함수
  - Mock Provider 패턴의 Real 부분

## 실행 체크리스트

### 1. API 스펙 분석
- [ ] `docs/tech/api-spec.md` 읽기
- [ ] 엔드포인트 목록 확인
- [ ] 요청/응답 스키마 확인
- [ ] 에러 코드 확인

### 2. DTO 작성
- [ ] `dto/create-<feature>.dto.ts` 생성
- [ ] `dto/update-<feature>.dto.ts` 생성
- [ ] class-validator 데코레이터 추가:
  - `@IsString()`, `@IsNumber()`, `@IsBoolean()`
  - `@IsOptional()`, `@IsNotEmpty()`
  - `@MinLength()`, `@MaxLength()`, `@Min()`, `@Max()`
- [ ] Mock 데이터 타입과 일치하는지 확인

### 3. Service 구현
- [ ] `<feature>.service.ts` 생성
- [ ] Repository 주입 (TypeORM)
- [ ] CRUD 메서드 구현:
  - `create()`: 생성
  - `findAll()`: 목록 조회
  - `findOne()`: 단일 조회
  - `update()`: 수정
  - `remove()`: 삭제
- [ ] 비즈니스 로직 구현
- [ ] 에러 처리 (NotFoundException, BadRequestException 등)

### 4. Controller 구현
- [ ] `<feature>.controller.ts` 생성
- [ ] REST API 데코레이터 추가:
  - `@Controller('<feature>s')`
  - `@Get()`, `@Post()`, `@Put()`, `@Delete()`
  - `@Param()`, `@Body()`, `@Query()`
- [ ] Service 메서드 호출
- [ ] 응답 형식 통일

### 5. Module 등록
- [ ] `<feature>.module.ts` 생성
- [ ] `@Module()` 데코레이터 추가
- [ ] `imports`: TypeORM Repository 등록
- [ ] `controllers`: Controller 등록
- [ ] `providers`: Service 등록
- [ ] `app.module.ts`에 Module 추가

### 6. API E2E 테스트 작성
- [ ] `apps/api/test/e2e/<feature-name>.e2e-spec.ts` 생성
- [ ] AC별 테스트 케이스 작성
- [ ] 성공 케이스 테스트
- [ ] 실패 케이스 테스트 (400, 404, 500 등)
- [ ] 테스트 DB 설정 확인

### 7. API E2E 테스트 실행
- [ ] `npm run test:e2e apps/api/test/e2e/<feature-name>.e2e-spec.ts` 실행
- [ ] 모든 테스트 통과 확인
- [ ] 실패 시 원인 파악 및 수정

### 8. Real API Client 작성
- [ ] `apps/web/lib/api/<feature-name>-api.ts` 생성
- [ ] Mock 함수와 동일한 시그니처로 Real API 함수 작성
- [ ] `fetch` 또는 `axios` 사용
- [ ] 에러 처리 (try-catch)

### 9. Frontend Mock → Real 전환
- [ ] `apps/web/lib/api/<feature-name>-client.ts` 업데이트
- [ ] Mock Provider의 Real 부분 연결
- [ ] 환경변수 확인 (`NEXT_PUBLIC_USE_MOCK_API=false`)

### 10. Playwright 통합 테스트 재실행
- [ ] Backend API 서버 실행 (`npm run start:dev`)
- [ ] Frontend 서버 실행 (`npm run dev`)
- [ ] `NEXT_PUBLIC_USE_MOCK_API=false` 설정
- [ ] `npx playwright test apps/web/tests/e2e/<feature-name>.spec.ts` 실행
- [ ] 모든 테스트 통과 확인
- [ ] 실패 시 원인 파악 및 수정

### 11. 수동 테스트
- [ ] 브라우저에서 실제 사용자 플로우 테스트
- [ ] DB에 데이터가 올바르게 저장되는지 확인
- [ ] 에러 처리가 올바르게 동작하는지 확인

## 주의사항

### ❌ 하지 말아야 할 것

- **API 스펙을 문서 없이 임의로 변경하지 않는다.**
  - API 스펙 변경이 필요하면 문서부터 수정한다.

- **Frontend 코드를 대폭 수정하지 않는다.**
  - Mock Provider 패턴이 올바르게 구현되었다면, Real 함수만 추가하면 된다.
  - Frontend 수정이 필요하다면 Step 2의 설계 문제일 가능성이 높다.

- **"나중에 필요할 것 같은" API를 미리 만들지 않는다.**
  - PRD/API Spec에 명시된 것만 구현한다.

### ✅ 해야 할 것

- **API E2E 테스트를 먼저 작성한다.**
  - TDD 원칙: Red → Green → Refactor

- **DTO 검증을 꼼꼼하게 작성한다.**
  - 잘못된 입력을 조기에 차단한다.

- **에러 메시지를 명확하게 작성한다.**
  - 사용자/개발자가 문제를 빠르게 파악할 수 있도록 한다.

- **트랜잭션을 고려한다.**
  - 여러 테이블을 수정하는 경우, 트랜잭션으로 원자성을 보장한다.

## NestJS 구조 예시

### DTO (`dto/create-store.dto.ts`)

```typescript
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(20)
  phone: string;
}
```

### Service (`stores.service.ts`)

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = this.storesRepository.create(createStoreDto);
    return await this.storesRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    return await this.storesRepository.find();
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storesRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    await this.findOne(id); // Check if exists
    await this.storesRepository.update(id, updateStoreDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.storesRepository.delete(id);
  }
}
```

### Controller (`stores.controller.ts`)

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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
```

### Module (`stores.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { Store } from '../../entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService], // 다른 모듈에서 사용할 경우
})
export class StoresModule {}
```

## API E2E 테스트 예시

### `apps/api/test/e2e/stores.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Stores (e2e)', () => {
  let app: INestApplication;
  let createdStoreId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /stores', () => {
    it('AC-F2-01: 점주가 새 매장을 등록할 수 있다', () => {
      return request(app.getHttpServer())
        .post('/stores')
        .send({
          name: '테스트 매장',
          address: '서울시 강남구',
          phone: '02-1234-5678',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('테스트 매장');
          createdStoreId = res.body.id;
        });
    });

    it('검증 실패: 매장명이 너무 짧음', () => {
      return request(app.getHttpServer())
        .post('/stores')
        .send({
          name: 'A', // MinLength(2) 위반
          address: '서울시 강남구',
          phone: '02-1234-5678',
        })
        .expect(400);
    });
  });

  describe('GET /stores', () => {
    it('AC-F2-02: 점주가 매장 목록을 볼 수 있다', () => {
      return request(app.getHttpServer())
        .get('/stores')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /stores/:id', () => {
    it('AC-F2-03: 점주가 매장 상세 정보를 볼 수 있다', () => {
      return request(app.getHttpServer())
        .get(`/stores/${createdStoreId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdStoreId);
          expect(res.body.name).toBe('테스트 매장');
        });
    });

    it('404: 존재하지 않는 매장', () => {
      return request(app.getHttpServer())
        .get('/stores/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PUT /stores/:id', () => {
    it('AC-F2-04: 점주가 매장 정보를 수정할 수 있다', () => {
      return request(app.getHttpServer())
        .put(`/stores/${createdStoreId}`)
        .send({
          name: '수정된 매장명',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('수정된 매장명');
        });
    });
  });

  describe('DELETE /stores/:id', () => {
    it('AC-F2-05: 점주가 매장을 삭제할 수 있다', () => {
      return request(app.getHttpServer())
        .delete(`/stores/${createdStoreId}`)
        .expect(204);
    });
  });
});
```

## Real API Client 예시

### `apps/web/lib/api/stores-api.ts`

```typescript
import { Store } from '@/lib/mocks/stores';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const realGetStores = async (): Promise<Store[]> => {
  const res = await fetch(`${API_BASE_URL}/stores`);
  if (!res.ok) {
    throw new Error('Failed to fetch stores');
  }
  return res.json();
};

export const realGetStore = async (id: string): Promise<Store> => {
  const res = await fetch(`${API_BASE_URL}/stores/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch store ${id}`);
  }
  return res.json();
};

export const realCreateStore = async (data: Omit<Store, 'id' | 'createdAt'>): Promise<Store> => {
  const res = await fetch(`${API_BASE_URL}/stores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to create store');
  }
  return res.json();
};

export const realUpdateStore = async (id: string, data: Partial<Store>): Promise<Store> => {
  const res = await fetch(`${API_BASE_URL}/stores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to update store ${id}`);
  }
  return res.json();
};

export const realDeleteStore = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/stores/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete store ${id}`);
  }
};
```

### 기존 API Client 업데이트 (`apps/web/lib/api/stores-client.ts`)

```typescript
import { mockGetStores, mockGetStore, mockCreateStore, mockUpdateStore, mockDeleteStore } from '@/lib/mocks/stores';
import { realGetStores, realGetStore, realCreateStore, realUpdateStore, realDeleteStore } from './stores-api';

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export const storesApi = {
  getStores: useMock ? mockGetStores : realGetStores,
  getStore: useMock ? mockGetStore : realGetStore,
  createStore: useMock ? mockCreateStore : realCreateStore,
  updateStore: useMock ? mockUpdateStore : realUpdateStore,
  deleteStore: useMock ? mockDeleteStore : realDeleteStore,
};
```

## Agent 실행 가이드 (향후 Agent 구축 시 참조)

### Agent 역할
- `backend-agent` (general-purpose Agent 사용)

### Agent 작업 순서
1. API 스펙 읽기 (`docs/tech/api-spec.md`)
2. DTO 클래스 생성
3. Service 클래스 생성
4. Controller 클래스 생성
5. Module 생성 및 등록
6. API E2E 테스트 작성
7. `npm run test:e2e` 실행
8. Real API Client 생성 (`apps/web/lib/api/<feature-name>-api.ts`)
9. Frontend API Client 업데이트 (Mock → Real 연결)
10. Backend/Frontend 서버 실행
11. Playwright 통합 테스트 재실행
12. 완료 보고서 생성

### Agent 출력 형식
```markdown
## Backend API 완료 보고

Feature: <feature-name>

### 생성 파일
- apps/api/src/modules/<feature>/<feature>.controller.ts
- apps/api/src/modules/<feature>/<feature>.service.ts
- apps/api/src/modules/<feature>/dto/*.dto.ts
- apps/api/src/modules/<feature>/<feature>.module.ts
- apps/api/test/e2e/<feature-name>.e2e-spec.ts
- apps/web/lib/api/<feature-name>-api.ts

### API E2E 테스트 결과
- ✅ X개 테스트 모두 통과

### Playwright 통합 테스트 결과
- ✅ X개 테스트 모두 통과 (Real API 사용)

### 다음 단계
- 사용자 최종 결과 확인 및 승인 대기
```

## 완료 조건

- [ ] Controller, Service, DTO, Module 생성됨
- [ ] API E2E 테스트 작성 및 모두 통과
- [ ] Real API Client 생성됨
- [ ] Frontend Mock → Real 전환 완료
- [ ] Playwright 통합 테스트 모두 통과 (Real API 사용)
- [ ] 브라우저에서 수동 테스트 통과
- [ ] DB에 데이터가 올바르게 저장됨
- [ ] **사용자가 최종 결과를 확인하고 승인함** ← 중요!

## 참조 문서

- `CLAUDE.md` Section 3.4
- `docs/tech/api-spec.md`
- `docs/product/prd-main.md`
- NestJS 공식 문서: https://nestjs.com/
- class-validator 문서: https://github.com/typestack/class-validator

## 디버깅 팁

### API E2E 테스트 실패 시
- 에러 메시지 확인
- 요청/응답 로그 확인
- DTO 검증 규칙 확인
- DB 연결 확인

### Playwright 통합 테스트 실패 시
- Backend/Frontend 서버가 실행 중인지 확인
- 환경변수 확인 (`NEXT_PUBLIC_USE_MOCK_API=false`)
- API 엔드포인트 URL 확인
- 네트워크 요청 로그 확인 (Browser DevTools)

### Frontend가 Real API를 호출하지 않을 때
- Mock Provider 전환 로직 확인
- 환경변수가 올바르게 설정되었는지 확인
- 브라우저 콘솔에서 `process.env.NEXT_PUBLIC_USE_MOCK_API` 확인
