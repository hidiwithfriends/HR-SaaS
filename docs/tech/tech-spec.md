# 기술 스펙 (Tech Spec)

**버전:** v0.1
**최종 수정일:** 2025-11-05
**제품명:** BestPractice HR SaaS

---

## 1. 아키텍처 개요 (Architecture Overview)

### 1.1 전체 구조

```
[Client Layer]
  ├─ Web App (React/Next.js)
  ├─ Mobile App (React Native)
  └─ Admin Dashboard (React)
          ↓ HTTPS/REST API
[API Gateway Layer]
  └─ API Gateway (Express.js / NestJS)
          ↓
[Application Layer]
  ├─ Auth Service (JWT, OAuth)
  ├─ User Management Service
  ├─ Manual Service (5분 매뉴얼)
  ├─ Schedule Service (AI 스케줄링)
  ├─ Attendance Service (근태 관리)
  ├─ Payroll Service (급여 계산)
  ├─ Matching Service (인재 매칭)
  ├─ Analytics Service (효율 분석)
  └─ AI/ML Service (베스트 프랙티스 모델)
          ↓
[Data Layer]
  ├─ PostgreSQL (주요 비즈니스 데이터)
  ├─ Redis (세션, 캐시)
  ├─ S3 (파일 저장: 매뉴얼, 리포트)
  └─ ElasticSearch (검색, 로그) [향후]
          ↓
[External Services]
  ├─ POS API (매출 데이터 연동)
  ├─ SMS/Push (알림)
  ├─ Payment Gateway (결제) [향후]
  └─ AI Model API (GPT/Claude) [향후]
```

### 1.2 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|----------|
| **Frontend (Web)** | React 18 + Next.js 14 | SSR/SSG 지원, SEO 최적화 |
| **Frontend (Mobile)** | React Native + Expo | 크로스 플랫폼, 빠른 개발 |
| **Backend** | Node.js + NestJS | TypeScript 지원, 모듈화 구조 |
| **Database** | PostgreSQL 15 | ACID, 복잡한 쿼리 지원 |
| **Cache/Session** | Redis 7 | 고성능 캐싱, 세션 관리 |
| **File Storage** | AWS S3 | 확장성, 저렴한 비용 |
| **Authentication** | JWT + Passport.js | 표준 토큰 기반 인증 |
| **AI/ML** | Python (FastAPI) + scikit-learn | 스케줄링 예측, 모델 학습 |
| **Deployment** | Docker + AWS ECS | 컨테이너화, 자동 스케일링 |
| **CI/CD** | GitHub Actions | 자동 테스트·배포 |
| **Monitoring** | Sentry + CloudWatch | 에러 추적, 성능 모니터링 |

---

## 2. 모듈 및 레이어 구조

### 2.1 백엔드 모듈 구조 (NestJS)

```
apps/
├─ api/                     # Main API Server
│  ├─ src/
│  │  ├─ auth/              # 인증·인가 모듈
│  │  ├─ users/             # 유저 관리 (점주, 직원, 파트너)
│  │  ├─ stores/            # 매장 관리
│  │  ├─ manuals/           # 5분 매뉴얼 CRUD
│  │  ├─ schedules/         # 스케줄 생성·관리
│  │  ├─ attendance/        # 출퇴근 기록
│  │  ├─ payroll/           # 급여 계산
│  │  ├─ skills/            # 스킬 배지
│  │  ├─ matching/          # 인재 매칭
│  │  ├─ analytics/         # 효율 분석·리포트
│  │  ├─ notifications/     # 알림 (SMS/Push)
│  │  └─ ai/                # AI 추천 (스케줄링, 채용)
│  └─ test/
├─ ai-service/              # AI/ML Service (Python FastAPI)
│  ├─ models/               # ML 모델 (스케줄 예측)
│  ├─ training/             # 모델 학습 스크립트
│  └─ api/                  # API 엔드포인트
└─ admin/                   # Admin Dashboard Backend
```

### 2.2 프론트엔드 구조

```
apps/
├─ web/                     # 점주용 웹 (Next.js)
│  ├─ pages/
│  │  ├─ auth/              # 로그인·회원가입
│  │  ├─ dashboard/         # 점주 대시보드
│  │  ├─ manuals/           # 매뉴얼 관리
│  │  ├─ schedules/         # 스케줄 관리
│  │  ├─ employees/         # 직원 관리
│  │  ├─ payroll/           # 급여 관리
│  │  └─ analytics/         # 효율 분석
│  ├─ components/
│  └─ styles/
├─ mobile/                  # 직원용 모바일 (React Native)
│  ├─ src/
│  │  ├─ screens/
│  │  │  ├─ ManualScreen   # 매뉴얼 학습
│  │  │  ├─ AttendanceScreen # 출퇴근 기록
│  │  │  ├─ ScheduleScreen # 내 스케줄
│  │  │  └─ ProfileScreen  # 프로필·스킬 배지
│  │  ├─ components/
│  │  └─ navigation/
└─ admin/                   # 관리자 대시보드 (React)
   └─ src/
```

---

## 3. 데이터 흐름 (Data Flow)

### 3.1 주요 데이터 흐름

**1. 매뉴얼 생성 & 학습 흐름**

```
[점주 Web] → POST /api/manuals
              ↓
        [API: Manual Service]
              ↓ DB Insert
        [PostgreSQL: manuals 테이블]
              ↓
        [직원 Mobile] → GET /api/manuals/assigned
              ↓
        [직원이 체크리스트 완료]
              ↓
        PATCH /api/manuals/:id/complete
              ↓
        [Skills Service] → 스킬 배지 자동 부여
              ↓
        [PostgreSQL: user_skills 테이블]
```

**2. AI 스케줄링 추천 흐름**

```
[점주 Web] → GET /api/schedules/ai-recommend
              ↓
        [API: Schedule Service]
              ↓ HTTP Request
        [AI Service (Python)]
              ↓ 과거 매출·스케줄 데이터 조회
        [PostgreSQL]
              ↓ ML 모델 예측
        [AI Model (scikit-learn)]
              ↓ 최적 스케줄 반환
        [API: Schedule Service]
              ↓ JSON Response
        [점주 Web] → 추천 스케줄 렌더링
```

**3. 출퇴근 기록 흐름**

```
[직원 Mobile] → 출근 버튼 클릭
              ↓ GPS 위치 전송
        POST /api/attendance/check-in
              ↓ GPS 반경 검증 (50m)
        [API: Attendance Service]
              ↓ DB Insert
        [PostgreSQL: attendance 테이블]
              ↓ 푸시 알림 (점주)
        [Notification Service]
```

---

### 3.2 요청/응답 흐름 (Request Flow)

```
[Client]
   ↓ HTTPS Request (Authorization: Bearer <JWT>)
[API Gateway / Auth Middleware]
   ↓ JWT 검증 + 역할 확인 (RBAC)
[Controller]
   ↓ DTO 검증 (class-validator)
[Service Layer]
   ↓ 비즈니스 로직 처리
[Repository Layer]
   ↓ TypeORM/Prisma Query
[PostgreSQL]
   ↓ 결과 반환
[Service Layer]
   ↓ DTO 변환
[Controller]
   ↓ JSON Response
[Client]
```

---

## 4. 인증 & 권한 (Auth & Authorization)

### 4.1 인증 방식

**JWT (JSON Web Token)**
- Access Token: 24시간 유효
- Refresh Token: 30일 유효, HTTP-only 쿠키 저장
- 토큰 payload: `{ userId, role, storeId }`

**OAuth 2.0 (소셜 로그인)**
- 지원: Google, Kakao, Naver
- Passport.js Strategy 사용

### 4.2 역할 기반 접근 제어 (RBAC)

| 역할 | 권한 |
|------|------|
| **ADMIN** | 전체 시스템 관리 |
| **OWNER** | 소유 매장 관리 (직원, 매뉴얼, 스케줄, 급여) |
| **MANAGER** | 다점포 통합 관리 (읽기·쓰기) |
| **EMPLOYEE** | 본인 정보 읽기, 출퇴근 기록, 매뉴얼 학습 |
| **PARTNER** | 연결된 고객 매장 현황 읽기 |

**Guard 구현 예시 (NestJS):**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER', 'MANAGER')
@Get('stores/:storeId/schedules')
async getSchedules(@Param('storeId') storeId: string) {
  // 점주·매니저만 접근 가능
}
```

---

## 5. 외부 서비스 연동 (External Integrations)

### 5.1 POS 연동

**목적:** 매출·방문객 데이터 수집 → AI 스케줄링 정확도 향상

**연동 방식:**
- POS API (REST/Webhook)
- 주요 POS: 오케이포스, 포스피드, 토스페이먼츠 등

**데이터:**
- 일별 매출
- 시간대별 주문 건수
- 방문객 수 (추정)

### 5.2 알림 서비스

| 서비스 | 용도 | 비고 |
|--------|------|------|
| **SMS** | 중요 알림 (스케줄 변경, 급여) | Twilio / SENS (Naver) |
| **Push** | 일반 알림 (출퇴근, 매뉴얼) | FCM (Firebase Cloud Messaging) |
| **Email** | 급여 명세서, 주간 리포트 | SendGrid / AWS SES |

### 5.3 결제 연동 (향후)

**목적:** 구독 결제 자동화

**서비스:** 토스페이먼츠, 이니시스, Stripe

---

## 6. AI/ML 모델 (AI/ML Models)

### 6.1 AI 스케줄링 모델

**목적:** 과거 데이터 기반 최적 인력 배치 추천

**입력:**
- 과거 4주 매출 데이터 (시간대별)
- 과거 스케줄 데이터
- 요일, 공휴일 여부
- 날씨 (향후)

**출력:**
- 시간대별 필요 인력 수
- 인건비 절감 예상치

**모델:**
- 초기: 선형 회귀 (scikit-learn LinearRegression)
- 향후: LSTM / XGBoost

**학습 주기:**
- 주 1회 재학습 (새로운 데이터 반영)

### 6.2 채용 적합도 모델 (향후)

**목적:** 지원자와 직무 적합도 자동 평가

**입력:**
- 지원자 이력서 (텍스트)
- 과거 성공적인 채용 데이터

**출력:**
- 적합도 점수 (0-100)

**모델:**
- NLP 기반 텍스트 분류

---

## 7. 데이터베이스 전략

### 7.1 주요 데이터

**PostgreSQL:**
- 비즈니스 핵심 데이터 (users, stores, schedules, attendance, payroll)
- 트랜잭션 보장 필요

**Redis:**
- 세션 (JWT Refresh Token)
- API 응답 캐싱 (자주 조회되는 매뉴얼, 스케줄)
- Rate Limiting

**S3:**
- 매뉴얼 첨부 파일 (이미지, PDF)
- 급여 명세서 PDF
- 경력 리포트 PDF

### 7.2 백업 & 복구

**자동 백업:**
- PostgreSQL: 일 1회 전체 백업 (AWS RDS 자동 백업)
- 보관 기간: 30일

**복구 전략:**
- RTO (Recovery Time Objective): 4시간
- RPO (Recovery Point Objective): 1시간

---

## 8. 성능 최적화

### 8.1 캐싱 전략

**Redis 캐싱:**
- 매뉴얼 목록 (TTL: 1시간)
- 스케줄 조회 (TTL: 10분)
- 직원 목록 (TTL: 30분)

**CDN:**
- 정적 파일 (이미지, CSS, JS) → CloudFront

### 8.2 쿼리 최적화

**N+1 문제 방지:**
- Eager Loading (TypeORM `relations` / Prisma `include`)

**인덱스:**
- `users.email` (UNIQUE)
- `attendance.user_id, check_in_time` (복합 인덱스)
- `schedules.store_id, start_date` (복합 인덱스)

### 8.3 페이지네이션

**기본 전략:**
- Offset-based (초기)
- Cursor-based (대용량 데이터 시)

---

## 9. 보안 (Security)

### 9.1 데이터 보호

**암호화:**
- 비밀번호: bcrypt (cost factor 12)
- 민감 정보 (주민번호, 계좌): AES-256 암호화

**HTTPS:**
- 모든 API 통신 HTTPS 필수
- TLS 1.2 이상

### 9.2 API 보안

**Rate Limiting:**
- IP당 1분에 100 요청 제한 (Redis)

**CORS:**
- 허용 도메인: `bestpractice-hr.com`, `app.bestpractice-hr.com`

**CSRF:**
- CSRF Token (쿠키 기반 인증 시)

### 9.3 개인정보 보호

**GDPR/PIPA 준수:**
- 사용자 데이터 삭제 요청 처리 (30일 이내)
- 데이터 익명화 옵션

---

## 10. 배포 & 인프라 (Deployment & Infrastructure)

### 10.1 배포 환경

| 환경 | 용도 | 인프라 |
|------|------|--------|
| **Development** | 로컬 개발 | Docker Compose |
| **Staging** | QA 테스트 | AWS ECS (Fargate) |
| **Production** | 실서비스 | AWS ECS (Fargate) + RDS + S3 |

### 10.2 CI/CD 파이프라인

**GitHub Actions:**

```yaml
1. Push to main
   ↓
2. Run Tests (Jest, Playwright)
   ↓
3. Build Docker Image
   ↓
4. Push to ECR
   ↓
5. Deploy to ECS (Rolling Update)
   ↓
6. Smoke Test
   ↓
7. Notify Slack
```

### 10.3 모니터링 & 알림

**도구:**
- **Sentry:** 에러 추적
- **CloudWatch:** 로그, 메트릭
- **Datadog / New Relic:** APM (향후)

**알림:**
- Slack 채널에 배포 성공/실패, 에러 알림

---

## 11. 확장성 계획 (Scalability Plan)

### 11.1 수평 확장

**API 서버:**
- ECS Auto Scaling (CPU 70% 이상 시 스케일 아웃)

**DB:**
- Read Replica 추가 (읽기 부하 분산)
- 향후 샤딩 검토 (매장별 DB 분리)

### 11.2 성능 목표

| 지표 | 초기 (0-1년) | 중기 (1-3년) |
|------|-------------|-------------|
| 동시 접속자 | 1,000명 | 10,000명 |
| API 응답 시간 (p95) | < 500ms | < 300ms |
| DB 쿼리 시간 (p95) | < 100ms | < 50ms |

---

## 12. 기술 부채 관리 (Tech Debt)

### 12.1 알려진 부채

**1. TypeORM → Prisma 마이그레이션 검토**
- 이유: Prisma의 더 나은 타입 안정성

**2. AI 모델 정확도 향상**
- 초기: 단순 선형 회귀
- 향후: LSTM, XGBoost

**3. ElasticSearch 도입 (검색 성능)**
- 초기: PostgreSQL LIKE 쿼리
- 향후: ElasticSearch 전문 검색

### 12.2 리팩터링 계획

**분기별 기술 부채 리뷰:**
- 코드 복잡도 분석 (SonarQube)
- 성능 병목 지점 개선

---

## 13. 참고 문서 (References)

- PRD: `docs/product/prd-main.md`
- API 스펙: `docs/tech/api-spec.md`
- DB 스키마: `docs/tech/db-schema.md`
- 보안 정책: `docs/tech/security-rbac.md`
