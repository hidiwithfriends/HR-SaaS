# API 스펙 (API Specification)

**버전:** v0.1
**최종 수정일:** 2025-11-05
**제품명:** BestPractice HR SaaS
**Base URL:** `https://api.bestpractice-hr.com/v1`

---

## 1. API 개요

### 1.1 인증 방식

**JWT Bearer Token:**
```http
Authorization: Bearer <access_token>
```

**토큰 구조:**
```json
{
  "userId": "uuid",
  "role": "OWNER | EMPLOYEE | MANAGER | PARTNER | ADMIN",
  "storeId": "uuid",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### 1.2 공통 응답 형식

**성공 응답:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-11-05T12:34:56Z"
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "timestamp": "2025-11-05T12:34:56Z"
}
```

### 1.3 공통 에러 코드

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| `UNAUTHORIZED` | 401 | 인증 실패 (토큰 없음/만료) |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 입력 검증 실패 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |
| `RATE_LIMIT_EXCEEDED` | 429 | 요청 제한 초과 |

---

## 2. 인증 API (Auth)

### 2.1 회원가입 (점주)

**POST** `/auth/signup/owner`

**Request:**
```json
{
  "email": "owner@example.com",
  "password": "SecurePass123!",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "storeName": "홍대 카페",
  "storeType": "CAFE"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "owner@example.com",
    "role": "OWNER",
    "storeId": "uuid"
  }
}
```

**Errors:**
- `EMAIL_ALREADY_EXISTS` (409): 이미 등록된 이메일

---

### 2.2 로그인

**POST** `/auth/login`

**Request:**
```json
{
  "email": "owner@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "userId": "uuid",
      "email": "owner@example.com",
      "role": "OWNER",
      "name": "홍길동"
    }
  }
}
```

**Errors:**
- `INVALID_CREDENTIALS` (401): 잘못된 이메일/비밀번호

---

### 2.3 토큰 갱신

**POST** `/auth/refresh`

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token"
  }
}
```

---

## 3. 매뉴얼 API (Manuals)

### 3.1 매뉴얼 생성

**POST** `/stores/:storeId/manuals`

**Request:**
```json
{
  "title": "커피 머신 사용법",
  "type": "EQUIPMENT",
  "description": "에스프레소 머신 사용 매뉴얼",
  "checklist": [
    {
      "order": 1,
      "content": "머신 전원 켜기",
      "required": true
    },
    {
      "order": 2,
      "content": "포터필터 예열하기",
      "required": true
    }
  ],
  "estimatedMinutes": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "manualId": "uuid",
    "title": "커피 머신 사용법",
    "storeId": "uuid",
    "createdAt": "2025-11-05T12:34:56Z"
  }
}
```

**Auth:** OWNER, MANAGER
**Errors:**
- `STORE_NOT_FOUND` (404)
- `VALIDATION_ERROR` (400): 필수 항목 누락

---

### 3.2 매뉴얼 목록 조회

**GET** `/stores/:storeId/manuals?type=EQUIPMENT&page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "manuals": [
      {
        "manualId": "uuid",
        "title": "커피 머신 사용법",
        "type": "EQUIPMENT",
        "estimatedMinutes": 5,
        "createdAt": "2025-11-05T12:34:56Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15
    }
  }
}
```

---

### 3.3 직원에게 매뉴얼 할당

**POST** `/manuals/:manualId/assign`

**Request:**
```json
{
  "employeeIds": ["uuid1", "uuid2"],
  "dueDate": "2025-11-10T23:59:59Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "assigned": 2
  }
}
```

---

### 3.4 매뉴얼 완료 처리 (직원)

**PATCH** `/manuals/:manualId/complete`

**Request:**
```json
{
  "completedChecklistIds": [1, 2, 3]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "manualId": "uuid",
    "completedAt": "2025-11-05T14:00:00Z",
    "earnedBadge": {
      "badgeId": "uuid",
      "name": "커피 마스터",
      "icon": "coffee_icon.png"
    }
  }
}
```

**Auth:** EMPLOYEE

---

## 4. 스케줄 API (Schedules)

### 4.1 스케줄 생성

**POST** `/stores/:storeId/schedules`

**Request:**
```json
{
  "weekStartDate": "2025-11-10",
  "shifts": [
    {
      "employeeId": "uuid",
      "date": "2025-11-10",
      "startTime": "09:00",
      "endTime": "18:00",
      "role": "BARISTA"
    },
    {
      "employeeId": "uuid2",
      "date": "2025-11-10",
      "startTime": "14:00",
      "endTime": "22:00",
      "role": "CASHIER"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "scheduleId": "uuid",
    "weekStartDate": "2025-11-10",
    "totalShifts": 14,
    "warnings": [
      {
        "employeeId": "uuid",
        "message": "주 40시간 초과 (45시간)"
      }
    ]
  }
}
```

**Auth:** OWNER, MANAGER
**Errors:**
- `EMPLOYEE_NOT_FOUND` (404)
- `OVERTIME_VIOLATION` (400): 법정 근로시간 초과

---

### 4.2 AI 스케줄 추천

**GET** `/stores/:storeId/schedules/ai-recommend?weekStartDate=2025-11-10`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "recommendedShifts": [
      {
        "date": "2025-11-10",
        "timeSlot": "09:00-12:00",
        "recommendedStaff": 2,
        "reason": "과거 4주 평균 방문객 수 기반"
      },
      {
        "date": "2025-11-10",
        "timeSlot": "12:00-15:00",
        "recommendedStaff": 3,
        "reason": "점심 시간대 피크"
      }
    ],
    "estimatedSavings": {
      "currentCost": 1200000,
      "recommendedCost": 1050000,
      "savings": 150000,
      "savingsPercent": 12.5
    }
  }
}
```

**Auth:** OWNER (Premium Plan)
**Errors:**
- `FEATURE_NOT_AVAILABLE` (403): Premium 플랜 필요
- `INSUFFICIENT_DATA` (400): 과거 데이터 부족 (4주 미만)

---

### 4.3 스케줄 조회 (직원)

**GET** `/schedules/my?startDate=2025-11-10&endDate=2025-11-16`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "shifts": [
      {
        "shiftId": "uuid",
        "date": "2025-11-10",
        "startTime": "09:00",
        "endTime": "18:00",
        "role": "BARISTA",
        "storeName": "홍대 카페"
      }
    ]
  }
}
```

**Auth:** EMPLOYEE

---

## 5. 출퇴근 API (Attendance)

### 5.1 출근 기록

**POST** `/attendance/check-in`

**Request:**
```json
{
  "storeId": "uuid",
  "location": {
    "latitude": 37.5665,
    "longitude": 126.9780
  },
  "method": "GPS"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attendanceId": "uuid",
    "checkInTime": "2025-11-05T09:02:30Z",
    "status": "ON_TIME"
  }
}
```

**Auth:** EMPLOYEE
**Errors:**
- `LOCATION_OUT_OF_RANGE` (400): GPS 반경 50m 초과
- `ALREADY_CHECKED_IN` (409): 이미 출근 기록 존재

---

### 5.2 퇴근 기록

**POST** `/attendance/check-out`

**Request:**
```json
{
  "attendanceId": "uuid",
  "location": {
    "latitude": 37.5665,
    "longitude": 126.9780
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attendanceId": "uuid",
    "checkInTime": "2025-11-05T09:02:30Z",
    "checkOutTime": "2025-11-05T18:05:00Z",
    "totalHours": 9.04,
    "overtimeHours": 1.04
  }
}
```

---

### 5.3 출퇴근 기록 조회

**GET** `/attendance?startDate=2025-11-01&endDate=2025-11-30&employeeId=uuid`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "attendanceId": "uuid",
        "date": "2025-11-05",
        "checkInTime": "09:02:30",
        "checkOutTime": "18:05:00",
        "totalHours": 9.04,
        "status": "COMPLETE"
      }
    ],
    "summary": {
      "totalDays": 20,
      "totalHours": 168.5,
      "overtimeHours": 8.5
    }
  }
}
```

**Auth:** OWNER (전체), EMPLOYEE (본인만)

---

## 6. 급여 API (Payroll)

### 6.1 급여 계산

**POST** `/stores/:storeId/payroll/calculate`

**Request:**
```json
{
  "month": "2025-11",
  "employeeIds": ["uuid1", "uuid2"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payrolls": [
      {
        "employeeId": "uuid1",
        "employeeName": "김철수",
        "basePay": 1800000,
        "holidayPay": 150000,
        "overtimePay": 80000,
        "totalPay": 2030000,
        "workDays": 22,
        "totalHours": 176
      }
    ],
    "totalPayroll": 4500000
  }
}
```

**Auth:** OWNER, MANAGER

---

### 6.2 급여 명세서 다운로드

**GET** `/payroll/:payrollId/payslip`

**Response (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="payslip_202511_김철수.pdf"

[PDF Binary Data]
```

**Auth:** OWNER, EMPLOYEE (본인만)

---

## 7. 직원 관리 API (Employees)

### 7.1 직원 초대

**POST** `/stores/:storeId/employees/invite`

**Request:**
```json
{
  "email": "employee@example.com",
  "name": "김철수",
  "phone": "010-9876-5432",
  "role": "BARISTA",
  "hourlyWage": 10000
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "inviteId": "uuid",
    "inviteLink": "https://app.bestpractice-hr.com/invite/abc123",
    "expiresAt": "2025-11-12T23:59:59Z"
  }
}
```

---

### 7.2 직원 목록 조회

**GET** `/stores/:storeId/employees?status=ACTIVE&page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "employeeId": "uuid",
        "name": "김철수",
        "email": "employee@example.com",
        "role": "BARISTA",
        "status": "ACTIVE",
        "hiredAt": "2025-10-01",
        "skills": [
          {
            "badgeId": "uuid",
            "name": "커피 마스터",
            "earnedAt": "2025-10-05"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12
    }
  }
}
```

---

### 7.3 직원 프로필 조회 (본인)

**GET** `/employees/me`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "employeeId": "uuid",
    "name": "김철수",
    "email": "employee@example.com",
    "phone": "010-9876-5432",
    "role": "BARISTA",
    "hiredAt": "2025-10-01",
    "skills": [
      {
        "badgeId": "uuid",
        "name": "커피 마스터",
        "icon": "coffee_icon.png",
        "earnedAt": "2025-10-05"
      }
    ],
    "careerReport": {
      "totalWorkDays": 35,
      "totalWorkHours": 280,
      "completedManuals": 8,
      "rating": 4.5
    }
  }
}
```

**Auth:** EMPLOYEE

---

## 8. 분석 API (Analytics)

### 8.1 인건비 효율 대시보드

**GET** `/stores/:storeId/analytics/labor-cost?startDate=2025-10-01&endDate=2025-10-31`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 15000000,
    "totalLaborCost": 4500000,
    "laborCostPercent": 30.0,
    "industryAverage": 35.0,
    "recommendation": "업종 평균 대비 5% 효율적입니다.",
    "dailyBreakdown": [
      {
        "date": "2025-10-01",
        "revenue": 500000,
        "laborCost": 150000,
        "percent": 30.0
      }
    ]
  }
}
```

**Auth:** OWNER (Premium Plan)

---

### 8.2 매장 벤치마크

**GET** `/stores/:storeId/analytics/benchmark`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "storeType": "CAFE",
    "yourMetrics": {
      "laborCostPercent": 30.0,
      "employeeTurnoverRate": 15.0,
      "avgTrainingHours": 3.5
    },
    "industryBenchmark": {
      "laborCostPercent": 35.0,
      "employeeTurnoverRate": 25.0,
      "avgTrainingHours": 8.0
    },
    "ranking": {
      "laborEfficiency": "상위 20%",
      "retention": "상위 30%",
      "training": "상위 10%"
    }
  }
}
```

**Auth:** OWNER (Best Practice Plan)

---

## 9. 인재 매칭 API (Matching) [향후]

### 9.1 인재 추천

**GET** `/stores/:storeId/matching/recommend?role=BARISTA&limit=10`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "candidateId": "uuid",
        "name": "이영희",
        "skills": ["커피 마스터", "고객 서비스"],
        "rating": 4.8,
        "previousStores": 3,
        "matchScore": 92,
        "availability": "IMMEDIATE"
      }
    ]
  }
}
```

---

## 10. Rate Limiting

**기본 제한:**
- 인증 API: 10 req/min (IP 기준)
- 일반 API: 100 req/min (사용자 기준)
- Premium API: 200 req/min

**초과 시:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 30 seconds.",
    "retryAfter": 30
  }
}
```

---

## 11. Webhook (향후)

**스케줄 변경 알림:**

```http
POST https://customer-webhook-url.com/schedule-updated
Content-Type: application/json
X-Signature: sha256_signature

{
  "event": "schedule.updated",
  "storeId": "uuid",
  "scheduleId": "uuid",
  "updatedAt": "2025-11-05T15:30:00Z"
}
```

---

## 12. 참고 문서

- PRD: `docs/product/prd-main.md`
- Tech Spec: `docs/tech/tech-spec.md`
- DB Schema: `docs/tech/db-schema.md`
