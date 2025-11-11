---
description: Backend API Implementation (Step 4) - 실제 API를 구현하고 Frontend와 통합한다.
---

# Backend API Implementation & Integration

## 실행 방식

이 커맨드는 **`api-implementation-guide` 스킬**을 실행합니다.

### 수동 실행 (Manual Mode)
- Claude가 스킬의 체크리스트를 따라 단계별로 진행
- 각 단계 완료 후 사용자 확인 요청
- 현재 이 방식으로 작동

### 자동 실행 (Agent Mode - 향후)
- Claude가 Agent Prompt를 참조하여 완전 자동 실행
- Agent Prompt 위치: `.claude/agents/step4-api-implementation-agent.md`
- 최종 결과만 사용자에게 보고

### 사용 예시
```
/implement-api attendance-checkin F4
```
- `attendance-checkin`: Feature 이름
- `F4`: Feature 번호

---

## 작업 내용

`api-implementation-guide` 스킬을 참조하여 다음 작업을 수행해주세요:

## 1. DB Schema 및 Entity 재확인
- `apps/api/src/entities/<entity-name>.entity.ts` 존재 확인
- Entity 클래스 필드와 관계 검토
- Migration 적용 상태 확인 (`npm run migration:show`)

## 2. DTO 클래스 작성
- `apps/api/src/modules/<feature>/dto/` 디렉토리 생성
- Create DTO 작성 (예: `create-store.dto.ts`)
- Update DTO 작성 (예: `update-store.dto.ts`)
- class-validator 데코레이터 적용:
  - `@IsString()`, `@IsNotEmpty()`, `@IsOptional()` 등
- `@ApiProperty()` 추가 (Swagger 문서화)

## 3. Service 레이어 구현
- `apps/api/src/modules/<feature>/<feature>.service.ts` 생성
- TypeORM Repository 주입
- CRUD 메서드 구현:
  - `findAll()` - 목록 조회
  - `findOne(id)` - 단건 조회
  - `create(dto)` - 생성
  - `update(id, dto)` - 수정
  - `remove(id)` - 삭제
- 비즈니스 로직 구현
- 에러 처리 (NotFoundException, BadRequestException 등)

## 4. Controller 레이어 구현
- `apps/api/src/modules/<feature>/<feature>.controller.ts` 생성
- Service 주입
- REST API 엔드포인트 작성:
  - `@Get()` - 목록
  - `@Get(':id')` - 상세
  - `@Post()` - 생성
  - `@Put(':id')` 또는 `@Patch(':id')` - 수정
  - `@Delete(':id')` - 삭제
- HTTP 상태 코드 설정 (`@HttpCode()`)
- Swagger 문서화 (`@ApiTags()`, `@ApiOperation()`)

## 5. Module 구성
- `apps/api/src/modules/<feature>/<feature>.module.ts` 생성
- TypeORM Entity 등록 (`TypeOrmModule.forFeature([Entity])`)
- Controller, Service를 providers/controllers에 등록
- 다른 모듈 의존성 처리 (imports)
- `app.module.ts`에 Feature Module 등록

## 6. API E2E 테스트 작성
- `apps/api/test/e2e/<feature>.e2e-spec.ts` 생성
- PRD의 AC(Acceptance Criteria)와 매핑
- 각 AC에 대한 테스트 케이스 작성:
  - 성공 케이스
  - 실패 케이스 (권한 없음, 잘못된 입력, 대상 없음 등)
- `npm run test:e2e` 실행 및 통과 확인

## 7. Frontend API Client 교체
- `apps/web/lib/api/<feature-name>-client.ts` 열기
- Real API 함수 구현:
  - `fetch()` 또는 HTTP 클라이언트 사용
  - 요청/응답 형식을 Mock과 동일하게 유지
- 환경변수 `NEXT_PUBLIC_USE_MOCK_API=false`로 전환
- Mock Provider 패턴이 제대로 동작하는지 확인

## 8. Frontend UI E2E 테스트 (Real API)
- 환경변수를 Real API로 전환 (`NEXT_PUBLIC_USE_MOCK_API=false`)
- `npx playwright test apps/web/tests/e2e/<feature-name>.spec.ts` 실행
- 모든 테스트 통과 확인
- 실패 시 API 응답 확인 및 디버깅

## 9. 통합 검증
- 브라우저에서 수동 테스트:
  - 모든 화면이 Real API와 연동되어 동작하는지 확인
  - 데이터가 DB에 실제로 저장/조회/수정/삭제되는지 확인
- 에러 처리 확인 (네트워크 에러, 권한 에러 등)
- 로딩 상태, Empty State, Error State 동작 확인

## 10. 문서 업데이트
- `docs/tech/api-spec.md` 업데이트:
  - 엔드포인트 목록
  - 요청/응답 스키마
  - 에러 코드
- `docs/qa/test-cases-api.md` 업데이트:
  - AC ↔ API E2E 테스트 매핑

## 완료 조건
- [ ] DTO 클래스 생성 및 validation 적용
- [ ] Service/Controller/Module 구현 완료
- [ ] API E2E 테스트 모두 통과
- [ ] Frontend Real API Client 구현 완료
- [ ] Frontend UI E2E 테스트 (Real API) 모두 통과
- [ ] 브라우저에서 수동 테스트 통과
- [ ] `docs/tech/api-spec.md` 업데이트
- [ ] 사용자가 최종 기능을 검토하고 승인함

## 주의사항
- ❌ Mock 데이터 구조와 다른 API 응답 형식을 만들지 않는다
- ❌ Frontend 코드를 대폭 수정하지 않는다 (Mock Provider 패턴의 장점)
- ❌ 테스트 없이 "눈으로 확인했으니 됐다"고 넘어가지 않는다
- ✅ DTO validation을 철저히 적용한다
- ✅ 에러 처리를 명확하게 한다 (NestJS Exception Filter 활용)
- ✅ API E2E 테스트와 UI E2E 테스트를 모두 통과시킨다

**참고**: `.claude/skills/api-implementation-guide/SKILL.md`의 NestJS 패턴, DTO 예시, E2E 테스트 코드를 참조하세요.
