# DB 스키마 (Database Schema)

**버전:** v0.1
**최종 수정일:** 2025-11-05
**제품명:** BestPractice HR SaaS
**DBMS:** PostgreSQL 15

---

## 1. 스키마 개요

### 1.1 주요 엔티티

```
users (점주, 직원, 파트너, 관리자)
  ├─ stores (매장)
  │   ├─ manuals (매뉴얼)
  │   │   └─ manual_checklists (체크리스트)
  │   ├─ schedules (스케줄)
  │   │   └─ shifts (근무 시프트)
  │   ├─ employees (직원)
  │   │   ├─ attendance (출퇴근 기록)
  │   │   ├─ payroll (급여)
  │   │   ├─ user_skills (스킬 배지)
  │   │   └─ manual_completions (매뉴얼 완료)
  │   └─ store_analytics (매장 분석)
  └─ subscriptions (구독)
```

---

## 2. 테이블 정의

### 2.1 users (유저)

**용도:** 모든 유저 (점주, 직원, 파트너, 관리자) 통합 관리

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 유저 ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt 해시 |
| `name` | VARCHAR(100) | NOT NULL | 이름 |
| `phone` | VARCHAR(20) | | 전화번호 |
| `role` | ENUM | NOT NULL | 역할: OWNER, EMPLOYEE, MANAGER, PARTNER, ADMIN |
| `status` | ENUM | NOT NULL | 상태: ACTIVE, INACTIVE, SUSPENDED |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정일 |

**인덱스:**
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

### 2.2 stores (매장)

**용도:** 매장 정보 관리

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 매장 ID |
| `owner_id` | UUID | FK (users.id), NOT NULL | 점주 ID |
| `name` | VARCHAR(200) | NOT NULL | 매장명 |
| `type` | ENUM | NOT NULL | 업종: CAFE, RESTAURANT, RETAIL, etc. |
| `address` | TEXT | | 주소 |
| `latitude` | DECIMAL(10, 8) | | 위도 (GPS 출퇴근용) |
| `longitude` | DECIMAL(11, 8) | | 경도 |
| `gps_radius` | INT | DEFAULT 50 | GPS 출퇴근 허용 반경 (미터) |
| `status` | ENUM | NOT NULL | 상태: ACTIVE, INACTIVE |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정일 |

**인덱스:**
```sql
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_type ON stores(type);
```

---

### 2.3 employees (직원)

**용도:** 매장별 직원 관계 (users와 stores 간 다대다)

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 직원-매장 관계 ID |
| `user_id` | UUID | FK (users.id), NOT NULL | 유저 ID |
| `store_id` | UUID | FK (stores.id), NOT NULL | 매장 ID |
| `role` | VARCHAR(50) | | 직무: BARISTA, CASHIER, COOK, etc. |
| `hourly_wage` | INT | NOT NULL | 시급 (원) |
| `status` | ENUM | NOT NULL | 상태: ACTIVE, INACTIVE, QUIT |
| `hired_at` | DATE | NOT NULL | 입사일 |
| `quit_at` | DATE | | 퇴사일 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정일 |

**인덱스:**
```sql
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_store_id ON employees(store_id);
CREATE UNIQUE INDEX idx_employees_unique ON employees(user_id, store_id, status) 
  WHERE status = 'ACTIVE';
```

---

### 2.4 manuals (매뉴얼)

**용도:** 5분 매뉴얼 관리

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 매뉴얼 ID |
| `store_id` | UUID | FK (stores.id), NOT NULL | 매장 ID |
| `title` | VARCHAR(200) | NOT NULL | 제목 |
| `type` | ENUM | NOT NULL | 타입: EQUIPMENT, PROCESS, SAFETY, CUSTOMER_SERVICE |
| `description` | TEXT | | 설명 |
| `estimated_minutes` | INT | DEFAULT 5 | 예상 학습 시간 (분) |
| `created_by` | UUID | FK (users.id) | 생성자 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정일 |

**인덱스:**
```sql
CREATE INDEX idx_manuals_store_id ON manuals(store_id);
CREATE INDEX idx_manuals_type ON manuals(type);
```

---

### 2.5 manual_checklists (매뉴얼 체크리스트)

**용도:** 매뉴얼 내 체크리스트 항목

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 체크리스트 ID |
| `manual_id` | UUID | FK (manuals.id), NOT NULL | 매뉴얼 ID |
| `order` | INT | NOT NULL | 순서 |
| `content` | TEXT | NOT NULL | 내용 |
| `required` | BOOLEAN | DEFAULT TRUE | 필수 여부 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일 |

**인덱스:**
```sql
CREATE INDEX idx_manual_checklists_manual_id ON manual_checklists(manual_id);
```

---

### 2.6 manual_completions (매뉴얼 완료 기록)

**용도:** 직원별 매뉴얼 학습 완료 추적

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 완료 기록 ID |
| `manual_id` | UUID | FK (manuals.id), NOT NULL | 매뉴얼 ID |
| `employee_id` | UUID | FK (employees.id), NOT NULL | 직원 ID |
| `assigned_at` | TIMESTAMP | DEFAULT NOW() | 할당일 |
| `completed_at` | TIMESTAMP | | 완료일 |
| `due_date` | TIMESTAMP | | 마감일 |
| `status` | ENUM | NOT NULL | 상태: PENDING, COMPLETED |

**인덱스:**
```sql
CREATE INDEX idx_manual_completions_employee_id ON manual_completions(employee_id);
CREATE INDEX idx_manual_completions_manual_id ON manual_completions(manual_id);
CREATE UNIQUE INDEX idx_manual_completions_unique 
  ON manual_completions(manual_id, employee_id);
```

---

### 2.7 skills (스킬 배지 마스터)

**용도:** 스킬 배지 정의 (시스템 공통)

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 스킬 ID |
| `name` | VARCHAR(100) | NOT NULL | 스킬명 (예: 커피 마스터) |
| `icon` | VARCHAR(255) | | 아이콘 URL |
| `description` | TEXT | | 설명 |
| `category` | ENUM | | 카테고리: EQUIPMENT, SERVICE, SAFETY |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일 |

---

### 2.8 user_skills (직원 스킬)

**용도:** 직원별 획득 스킬

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | |
| `employee_id` | UUID | FK (employees.id), NOT NULL | 직원 ID |
| `skill_id` | UUID | FK (skills.id), NOT NULL | 스킬 ID |
| `earned_at` | TIMESTAMP | DEFAULT NOW() | 획득일 |
| `verified_by` | UUID | FK (users.id) | 인증자 (점주) |

**인덱스:**
```sql
CREATE INDEX idx_user_skills_employee_id ON user_skills(employee_id);
CREATE UNIQUE INDEX idx_user_skills_unique ON user_skills(employee_id, skill_id);
```

---

### 2.9 schedules (스케줄)

**용도:** 주간/월간 스케줄 헤더

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 스케줄 ID |
| `store_id` | UUID | FK (stores.id), NOT NULL | 매장 ID |
| `week_start_date` | DATE | NOT NULL | 주 시작일 (월요일) |
| `status` | ENUM | NOT NULL | 상태: DRAFT, PUBLISHED |
| `created_by` | UUID | FK (users.id) | 생성자 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정일 |

**인덱스:**
```sql
CREATE INDEX idx_schedules_store_id ON schedules(store_id);
CREATE INDEX idx_schedules_week_start_date ON schedules(week_start_date);
CREATE UNIQUE INDEX idx_schedules_unique ON schedules(store_id, week_start_date);
```

---

### 2.10 shifts (근무 시프트)

**용도:** 스케줄 내 개별 근무 시프트

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 시프트 ID |
| `schedule_id` | UUID | FK (schedules.id), NOT NULL | 스케줄 ID |
| `employee_id` | UUID | FK (employees.id), NOT NULL | 직원 ID |
| `date` | DATE | NOT NULL | 근무 날짜 |
| `start_time` | TIME | NOT NULL | 시작 시간 |
| `end_time` | TIME | NOT NULL | 종료 시간 |
| `role` | VARCHAR(50) | | 직무 (해당 시프트) |
| `status` | ENUM | DEFAULT 'SCHEDULED' | 상태: SCHEDULED, COMPLETED, CANCELLED |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일 |

**인덱스:**
```sql
CREATE INDEX idx_shifts_schedule_id ON shifts(schedule_id);
CREATE INDEX idx_shifts_employee_id ON shifts(employee_id);
CREATE INDEX idx_shifts_date ON shifts(date);
```

---

### 2.11 attendance (출퇴근 기록)

**용도:** 실제 출퇴근 기록

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 출퇴근 기록 ID |
| `employee_id` | UUID | FK (employees.id), NOT NULL | 직원 ID |
| `shift_id` | UUID | FK (shifts.id) | 해당 시프트 (nullable) |
| `check_in_time` | TIMESTAMP | NOT NULL | 출근 시간 |
| `check_out_time` | TIMESTAMP | | 퇴근 시간 |
| `check_in_method` | ENUM | NOT NULL | 출근 방식: GPS, QR_CODE, MANUAL |
| `check_in_location` | POINT | | 출근 GPS 좌표 (PostGIS) |
| `check_out_location` | POINT | | 퇴근 GPS 좌표 |
| `total_hours` | DECIMAL(5, 2) | | 총 근무 시간 (자동 계산) |
| `overtime_hours` | DECIMAL(5, 2) | | 초과 근무 시간 |
| `status` | ENUM | NOT NULL | 상태: INCOMPLETE, COMPLETE, MODIFIED |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정일 |

**인덱스:**
```sql
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_check_in_time ON attendance(check_in_time);
CREATE INDEX idx_attendance_date ON attendance(DATE(check_in_time));
```

---

### 2.12 payroll (급여)

**용도:** 월별 급여 계산 결과

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 급여 ID |
| `employee_id` | UUID | FK (employees.id), NOT NULL | 직원 ID |
| `store_id` | UUID | FK (stores.id), NOT NULL | 매장 ID |
| `year_month` | VARCHAR(7) | NOT NULL | 년월 (YYYY-MM) |
| `base_pay` | INT | NOT NULL | 기본급 (시급 × 시간) |
| `holiday_pay` | INT | DEFAULT 0 | 주휴수당 |
| `overtime_pay` | INT | DEFAULT 0 | 연장근로수당 |
| `total_pay` | INT | NOT NULL | 총 급여 |
| `work_days` | INT | NOT NULL | 근무 일수 |
| `total_hours` | DECIMAL(6, 2) | NOT NULL | 총 근무 시간 |
| `calculated_at` | TIMESTAMP | DEFAULT NOW() | 계산 시각 |
| `paid_at` | TIMESTAMP | | 지급 시각 |
| `status` | ENUM | NOT NULL | 상태: CALCULATED, PAID |

**인덱스:**
```sql
CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX idx_payroll_year_month ON payroll(year_month);
CREATE UNIQUE INDEX idx_payroll_unique ON payroll(employee_id, year_month);
```

---

### 2.13 subscriptions (구독)

**용도:** 매장별 구독 플랜

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | 구독 ID |
| `store_id` | UUID | FK (stores.id), NOT NULL | 매장 ID |
| `plan` | ENUM | NOT NULL | 플랜: FREE, STANDARD, PREMIUM, BEST_PRACTICE |
| `status` | ENUM | NOT NULL | 상태: ACTIVE, CANCELLED, EXPIRED |
| `started_at` | TIMESTAMP | NOT NULL | 시작일 |
| `expires_at` | TIMESTAMP | | 만료일 |
| `price` | INT | | 월 구독료 (원) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정일 |

**인덱스:**
```sql
CREATE INDEX idx_subscriptions_store_id ON subscriptions(store_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
```

---

### 2.14 store_analytics (매장 분석 데이터)

**용도:** AI 분석용 매출·운영 데이터 (POS 연동)

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | UUID | PK | |
| `store_id` | UUID | FK (stores.id), NOT NULL | 매장 ID |
| `date` | DATE | NOT NULL | 날짜 |
| `hour` | INT | | 시간대 (0-23, nullable = 일 전체) |
| `revenue` | INT | | 매출 (원) |
| `order_count` | INT | | 주문 건수 |
| `visitor_count` | INT | | 방문객 수 (추정) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일 |

**인덱스:**
```sql
CREATE INDEX idx_store_analytics_store_id ON store_analytics(store_id);
CREATE INDEX idx_store_analytics_date ON store_analytics(date);
CREATE UNIQUE INDEX idx_store_analytics_unique 
  ON store_analytics(store_id, date, hour);
```

---

## 3. 관계 다이어그램 (ERD)

```
users 1──N employees N──1 stores
  │                        │
  │                        ├── 1──N manuals
  │                        │         └── 1──N manual_checklists
  │                        │
  │                        ├── 1──N schedules
  │                        │         └── 1──N shifts
  │                        │
  │                        └── 1──N store_analytics
  │
employees 1──N attendance
employees 1──N payroll
employees 1──N user_skills N──1 skills
employees 1──N manual_completions N──1 manuals
```

---

## 4. ENUM 타입 정의

```sql
CREATE TYPE user_role AS ENUM ('OWNER', 'EMPLOYEE', 'MANAGER', 'PARTNER', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE store_type AS ENUM ('CAFE', 'RESTAURANT', 'RETAIL', 'SALON', 'OTHER');
CREATE TYPE store_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE employee_status AS ENUM ('ACTIVE', 'INACTIVE', 'QUIT');
CREATE TYPE manual_type AS ENUM ('EQUIPMENT', 'PROCESS', 'SAFETY', 'CUSTOMER_SERVICE');
CREATE TYPE completion_status AS ENUM ('PENDING', 'COMPLETED');
CREATE TYPE skill_category AS ENUM ('EQUIPMENT', 'SERVICE', 'SAFETY');
CREATE TYPE schedule_status AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE shift_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE attendance_method AS ENUM ('GPS', 'QR_CODE', 'MANUAL');
CREATE TYPE attendance_status AS ENUM ('INCOMPLETE', 'COMPLETE', 'MODIFIED');
CREATE TYPE payroll_status AS ENUM ('CALCULATED', 'PAID');
CREATE TYPE subscription_plan AS ENUM ('FREE', 'STANDARD', 'PREMIUM', 'BEST_PRACTICE');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');
```

---

## 5. 마이그레이션 전략

### 5.1 초기 마이그레이션 (v0.1)

**순서:**
1. ENUM 타입 생성
2. `users` 테이블 생성
3. `stores` 테이블 생성
4. `employees`, `manuals`, `schedules`, `skills` 테이블 생성
5. 하위 테이블 (attendance, payroll, shifts 등) 생성
6. 인덱스 생성
7. 외래 키 제약 추가

**도구:**
- TypeORM Migrations 또는 Prisma Migrate

**샘플 Migration (TypeORM):**

```typescript
// migrations/1699000000000-InitialSchema.ts
export class InitialSchema1699000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ENUM 타입 생성
    await queryRunner.query(`
      CREATE TYPE user_role AS ENUM ('OWNER', 'EMPLOYEE', 'MANAGER', 'PARTNER', 'ADMIN');
    `);
    
    // users 테이블 생성
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role user_role NOT NULL,
        status user_status NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // ... (이하 생략)
  }
  
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`DROP TYPE user_role`);
    // ... (이하 생략)
  }
}
```

### 5.2 Seed Data

**초기 데이터:**
- `skills` 테이블: 기본 스킬 배지 (커피 마스터, 고객 서비스, 안전 관리 등)
- `users` 테이블: Admin 계정 1개

**Seed Script:**

```typescript
// seeds/initial-skills.ts
const skills = [
  { name: '커피 마스터', category: 'EQUIPMENT', icon: 'coffee.png' },
  { name: '고객 서비스', category: 'SERVICE', icon: 'customer.png' },
  { name: '안전 관리', category: 'SAFETY', icon: 'safety.png' },
];
```

---

## 6. 성능 고려사항

### 6.1 주요 쿼리 패턴

**1. 스케줄 조회 (직원):**
```sql
SELECT s.*, st.name AS store_name
FROM shifts s
JOIN schedules sch ON s.schedule_id = sch.id
JOIN stores st ON sch.store_id = st.id
WHERE s.employee_id = :employeeId
  AND s.date BETWEEN :startDate AND :endDate
ORDER BY s.date, s.start_time;
```

**2. 급여 계산 (월별):**
```sql
SELECT 
  e.id AS employee_id,
  SUM(a.total_hours) AS total_hours,
  SUM(a.overtime_hours) AS overtime_hours,
  COUNT(DISTINCT DATE(a.check_in_time)) AS work_days
FROM employees e
JOIN attendance a ON e.id = a.employee_id
WHERE e.store_id = :storeId
  AND DATE_TRUNC('month', a.check_in_time) = :yearMonth
GROUP BY e.id;
```

### 6.2 파티셔닝 (향후)

**attendance 테이블:**
- 월별 파티셔닝 (오래된 데이터 조회 최적화)

```sql
CREATE TABLE attendance_2025_11 PARTITION OF attendance
FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

---

## 7. 백업 & 복구

**자동 백업:**
- AWS RDS 자동 백업 (일 1회, 보관 30일)

**수동 백업:**
```bash
pg_dump -h localhost -U postgres -d bestpractice_hr > backup_$(date +%Y%m%d).sql
```

**복구:**
```bash
psql -h localhost -U postgres -d bestpractice_hr < backup_20251105.sql
```

---

## 8. 참고 문서

- PRD: `docs/product/prd-main.md`
- Tech Spec: `docs/tech/tech-spec.md`
- API Spec: `docs/tech/api-spec.md`
