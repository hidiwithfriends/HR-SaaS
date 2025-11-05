# BestPractice HR SaaS - Backend API

NestJS 기반 백엔드 API 서버

## 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 파일 복사
cp .env.development .env
```

### 2. PostgreSQL 시작 (Docker Compose)

```bash
# 프로젝트 루트에서
docker-compose up -d postgres redis
```

### 3. 데이터베이스 마이그레이션

```bash
# 마이그레이션 실행
npm run migration:run

# 새 마이그레이션 생성 (필요 시)
npm run migration:generate -- src/migrations/MigrationName
```

### 4. 개발 서버 실행

```bash
npm run start:dev
```

API는 http://localhost:3000 에서 실행됩니다.

## 주요 명령어

```bash
# 빌드
npm run build

# 테스트
npm run test
npm run test:e2e

# Lint
npm run lint
```

## 기술 스택

- **Framework:** NestJS 10
- **Database:** PostgreSQL 15 + TypeORM 0.3
- **Authentication:** JWT + Passport.js
- **Validation:** class-validator
- **Testing:** Jest + Supertest

## 프로젝트 구조

```
src/
├── config/           # 설정 파일 (TypeORM 등)
├── entities/         # TypeORM 엔티티
├── migrations/       # 데이터베이스 마이그레이션
├── modules/
│   ├── auth/         # 인증 모듈
│   ├── users/        # 유저 관리
│   └── stores/       # 매장 관리
├── app.module.ts
└── main.ts
```

## Phase 1 구현 범위

- [x] F1-Step1: DB 스키마 & 마이그레이션
- [ ] F1-Step2: API E2E 테스트
- [ ] F1-Step3: 백엔드 API 구현
- [ ] F1-Step4: 프론트엔드
- [ ] F1-Step5: UI E2E 테스트
