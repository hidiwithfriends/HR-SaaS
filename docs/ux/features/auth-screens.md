# F1: 인증 & 유저 관리 - 화면 구조 (Screen Layout)

**Feature ID**: F1
**버전**: v1.0
**작성일**: 2025-11-12
**상위 문서**: `docs/project/features/f1-auth.md`

---

## 개요

이 문서는 F1 (인증 & 유저 관리) 기능의 모든 화면 구조, UI 컴포넌트, 레이아웃을 정의한다.
각 화면은 `docs/ux/ui-theme.md`의 디자인 토큰과 `shadcn/ui` 컴포넌트를 기반으로 구현된다.

---

## 1. 화면 인벤토리 (Screen Inventory)

| 화면 경로 | 화면명 | 역할 | 우선순위 |
|----------|--------|------|---------|
| `/auth/signup` | 회원가입 | 공통 (점주/직원) | P0 (필수) |
| `/auth/login` | 로그인 | 공통 | P0 (필수) |
| `/profile` | 프로필 조회/수정 | 공통 | P1 (중요) |
| `/stores/new` | 매장 생성 (온보딩) | 점주 전용 | P1 (F2와 연계) |
| `/onboarding` | 온보딩 가이드 | 공통 | P2 (Phase 2) |

---

## 2. `/auth/signup` - 회원가입 화면

### 2.1 화면 정보

- **Route Path**: `/auth/signup`
- **Query Params**: `?inviteCode=ABC123` (직원 초대 시)
- **Layout**: Center-aligned single column (max-width: 480px)
- **Background**: `ui-theme.md` 기준 `--color-background` (흰색 또는 연한 회색)
- **Header**: BestPractice 로고 + "회원가입" 제목

### 2.2 컴포넌트 트리

```
<SignupPage>
  ├─ <Header>
  │   ├─ <Logo />
  │   └─ <h1>회원가입</h1>
  │
  ├─ <SignupForm>
  │   ├─ {inviteCode && <InviteInfoCard />}  // 초대 시에만 표시
  │   │
  │   ├─ <RoleSelector>  // 라디오 버튼 그룹
  │   │   ├─ <RadioGroupItem value="OWNER">점주</RadioGroupItem>
  │   │   └─ <RadioGroupItem value="EMPLOYEE">직원</RadioGroupItem>
  │   │
  │   ├─ <FormField name="name">
  │   │   ├─ <Label>이름 *</Label>
  │   │   ├─ <Input placeholder="홍길동" />
  │   │   └─ <FormMessage />  // 에러 메시지
  │   │
  │   ├─ <FormField name="email">
  │   │   ├─ <Label>이메일 *</Label>
  │   │   ├─ <Input type="email" placeholder="example@email.com" />
  │   │   └─ <FormMessage />
  │   │
  │   ├─ <FormField name="password">
  │   │   ├─ <Label>비밀번호 *</Label>
  │   │   ├─ <Input type="password" />
  │   │   ├─ <PasswordStrengthIndicator />  // 약함/보통/강함
  │   │   └─ <FormMessage />
  │   │
  │   ├─ <FormField name="passwordConfirm">
  │   │   ├─ <Label>비밀번호 확인 *</Label>
  │   │   ├─ <Input type="password" />
  │   │   └─ <FormMessage />
  │   │
  │   ├─ <FormField name="phone">
  │   │   ├─ <Label>전화번호 (선택)</Label>
  │   │   └─ <Input type="tel" placeholder="010-1234-5678" />
  │   │
  │   ├─ <Checkbox name="agreeTerms">
  │   │   <Label>이용약관 및 개인정보처리방침에 동의합니다 *</Label>
  │   │
  │   ├─ <Button type="submit" variant="default" fullWidth>
  │   │   {isLoading ? <Spinner /> : "가입하기"}
  │   │
  │   └─ <FormFooter>
  │       <p>이미 계정이 있으신가요? <Link href="/auth/login">로그인</Link></p>
  │
  └─ {error && <Alert variant="destructive">{error.message}</Alert>}
```

### 2.3 Validation 규칙

| 필드 | 규칙 | 에러 메시지 |
|------|------|-----------|
| `name` | 필수, 2~50자 | "이름을 입력해주세요" / "2~50자로 입력해주세요" |
| `email` | 필수, 이메일 형식 | "이메일을 입력해주세요" / "올바른 이메일 형식이 아닙니다" |
| `password` | 필수, 최소 8자, 영문+숫자 | "비밀번호는 최소 8자 이상이어야 합니다" / "영문과 숫자를 포함해야 합니다" |
| `passwordConfirm` | 필수, password와 일치 | "비밀번호가 일치하지 않습니다" |
| `phone` | 선택, 숫자 10~11자 | "올바른 전화번호 형식이 아닙니다" |
| `agreeTerms` | 필수 (체크됨) | "이용약관에 동의해주세요" |

### 2.4 상태별 UI

**초기 상태 (Initial)**:
- 모든 필드 비활성화 상태 (focus 전)
- 역할 선택: 점주(OWNER) 기본 선택
- 초대 코드 있을 시: 직원(EMPLOYEE) 선택 + 비활성화

**입력 중 (Typing)**:
- focus된 필드: `border-primary` 강조
- 실시간 validation 피드백 (focus out 시)
- 비밀번호 강도 인디케이터 실시간 업데이트

**제출 중 (Submitting)**:
- 버튼: 로딩 스피너 + "가입하는 중..." 텍스트
- 모든 입력 필드 비활성화
- 폼 전체에 반투명 오버레이 (선택)

**에러 상태 (Error)**:
- **필드별 에러**: 해당 필드 하단에 빨간색 메시지
- **서버 에러**: 폼 상단에 Alert 컴포넌트 표시
  - 예: "이미 가입된 이메일입니다" (EMAIL_ALREADY_EXISTS)
  - 예: "초대 링크가 만료되었습니다" (INVITE_EXPIRED)

**성공 상태 (Success)**:
- 환영 Toast 알림: "환영합니다!" (우상단)
- 자동 리다이렉트: 점주 → `/stores/new`, 직원 → `/dashboard`

### 2.5 shadcn/ui 컴포넌트 사용

- `<Form>` (react-hook-form 통합)
- `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`
- `<Input>` (text, email, password, tel)
- `<Button>` (variant: default, disabled 상태)
- `<RadioGroup>`, `<RadioGroupItem>`
- `<Checkbox>`
- `<Alert>`, `<AlertDescription>` (에러 표시)
- `<Card>`, `<CardHeader>`, `<CardContent>` (초대 정보 표시)
- `<Spinner>` (로딩 인디케이터, 커스텀)

### 2.6 AC 매핑

| AC ID | 검증 항목 | UI 요소 |
|-------|---------|---------|
| AC-F1-01 | 회원가입 성공 → DB 저장 | 전체 폼 제출 플로우 |
| AC-F1-02 | 이메일 중복 에러 | 이메일 필드 에러 메시지 |

---

## 3. `/auth/login` - 로그인 화면

### 3.1 화면 정보

- **Route Path**: `/auth/login`
- **Layout**: Center-aligned single column (max-width: 420px)
- **Background**: `--color-background`
- **Header**: 로고 + "로그인" 제목

### 3.2 컴포넌트 트리

```
<LoginPage>
  ├─ <Header>
  │   ├─ <Logo />
  │   └─ <h1>로그인</h1>
  │
  ├─ {error && <Alert variant="destructive">{error.message}</Alert>}
  │
  ├─ <LoginForm>
  │   ├─ <FormField name="email">
  │   │   ├─ <Label>이메일</Label>
  │   │   ├─ <Input type="email" autoFocus />
  │   │   └─ <FormMessage />
  │   │
  │   ├─ <FormField name="password">
  │   │   ├─ <Label>비밀번호</Label>
  │   │   ├─ <Input type="password" />
  │   │   └─ <FormMessage />
  │   │
  │   ├─ <FormFooter>
  │   │   <Link href="/auth/forgot-password" variant="link">
  │   │     비밀번호 찾기 (Phase 2)
  │   │   </Link>
  │   │
  │   ├─ <Button type="submit" fullWidth>
  │   │   {isLoading ? <Spinner /> : "로그인"}
  │   │
  │   └─ <Divider text="또는" />
  │
  ├─ <SocialLoginButtons>  // Phase 2
  │   ├─ <Button variant="outline"><GoogleIcon /> Google로 로그인</Button>
  │   └─ <Button variant="outline"><KakaoIcon /> Kakao로 로그인</Button>
  │
  └─ <SignupPrompt>
      <p>계정이 없으신가요? <Link href="/auth/signup">가입하기</Link></p>
```

### 3.3 Validation 규칙

| 필드 | 규칙 | 에러 메시지 |
|------|------|-----------|
| `email` | 필수, 이메일 형식 | "이메일을 입력해주세요" |
| `password` | 필수 | "비밀번호를 입력해주세요" |

### 3.4 상태별 UI

**초기 상태**:
- 이메일 필드에 자동 포커스
- 모든 버튼 활성화

**제출 중 (Submitting)**:
- 버튼: 로딩 스피너 + "로그인 중..."
- 입력 필드 비활성화

**에러 상태**:
- **INVALID_CREDENTIALS**: 폼 상단 Alert
  - "이메일 또는 비밀번호가 잘못되었습니다"
  - 비밀번호 필드만 클리어 후 포커스
- **NETWORK_ERROR**: Toast 알림
  - "네트워크 연결을 확인해주세요"

**성공 상태**:
- 사용자 정보 조회 (`GET /auth/me`)
- 역할별 리다이렉트:
  - OWNER → `/dashboard` 또는 `/stores/[id]`
  - EMPLOYEE → `/my-manuals` 또는 `/attendance/check-in`

### 3.5 AC 매핑

| AC ID | 검증 항목 | UI 요소 |
|-------|---------|---------|
| AC-F1-03 | JWT 토큰 발급 | 로그인 성공 시 토큰 저장 |
| AC-F1-04 | 잘못된 비밀번호 에러 | Alert 컴포넌트 에러 메시지 |
| AC-F1-05 | 역할별 리다이렉트 | RBAC 기반 화면 이동 |

---

## 4. `/profile` - 프로필 조회/수정 화면

### 4.1 화면 정보

- **Route Path**: `/profile`
- **Layout**: Dashboard layout 내 중앙 컨텐츠 영역
- **Width**: max-width: 640px
- **Header**: "내 프로필" 제목 + "수정" 버튼

### 4.2 컴포넌트 트리

```
<ProfilePage>
  ├─ <PageHeader>
  │   ├─ <h1>내 프로필</h1>
  │   └─ <Button onClick={toggleEditMode}>
  │       {isEditMode ? "취소" : "수정하기"}
  │
  ├─ <ProfileCard>
  │   ├─ <Avatar size="lg" src={user.avatar} fallback={user.name[0]} />
  │   │
  │   ├─ {isEditMode ? <ProfileEditForm /> : <ProfileView />}
  │
  └─ {updateSuccess && <Toast>프로필이 업데이트되었습니다</Toast>}
```

### 4.3 ProfileView (읽기 모드)

```
<ProfileView>
  ├─ <InfoRow>
  │   ├─ <Label>이름</Label>
  │   └─ <Text>{user.name}</Text>
  │
  ├─ <InfoRow>
  │   ├─ <Label>이메일</Label>
  │   └─ <Text>{user.email}</Text>
  │
  ├─ <InfoRow>
  │   ├─ <Label>전화번호</Label>
  │   └─ <Text>{user.phone || "미입력"}</Text>
  │
  ├─ <InfoRow>
  │   ├─ <Label>역할</Label>
  │   └─ <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
  │
  └─ <InfoRow>
      ├─ <Label>가입일</Label>
      └─ <Text>{formatDate(user.createdAt)}</Text>
```

### 4.4 ProfileEditForm (수정 모드)

```
<ProfileEditForm>
  ├─ <FormField name="name">
  │   ├─ <Label>이름 *</Label>
  │   ├─ <Input defaultValue={user.name} />
  │   └─ <FormMessage />
  │
  ├─ <FormField name="phone">
  │   ├─ <Label>전화번호</Label>
  │   ├─ <Input defaultValue={user.phone} />
  │   └─ <FormMessage />
  │
  ├─ <Divider text="비밀번호 변경 (선택)" />
  │
  ├─ <FormField name="currentPassword">
  │   ├─ <Label>현재 비밀번호</Label>
  │   └─ <Input type="password" />
  │
  ├─ <FormField name="newPassword">
  │   ├─ <Label>새 비밀번호</Label>
  │   ├─ <Input type="password" />
  │   └─ <PasswordStrengthIndicator />
  │
  ├─ <FormField name="newPasswordConfirm">
  │   ├─ <Label>새 비밀번호 확인</Label>
  │   └─ <Input type="password" />
  │
  └─ <ButtonGroup>
      ├─ <Button type="submit" variant="default">저장</Button>
      └─ <Button variant="outline" onClick={cancel}>취소</Button>
```

### 4.5 Validation 규칙

| 필드 | 규칙 | 에러 메시지 |
|------|------|-----------|
| `name` | 필수, 2~50자 | "이름을 입력해주세요" |
| `phone` | 선택, 숫자 10~11자 | "올바른 전화번호 형식이 아닙니다" |
| `currentPassword` | 비밀번호 변경 시 필수 | "현재 비밀번호를 입력해주세요" |
| `newPassword` | 최소 8자, 영문+숫자 | "8자 이상, 영문+숫자를 포함해야 합니다" |
| `newPasswordConfirm` | newPassword와 일치 | "비밀번호가 일치하지 않습니다" |

### 4.6 상태별 UI

**읽기 모드 (Default)**:
- 모든 필드 읽기 전용 텍스트
- "수정하기" 버튼만 활성화

**수정 모드 (Edit)**:
- 편집 가능한 필드만 Input으로 변경
- 이메일, 역할, 가입일은 읽기 전용 유지
- "저장" / "취소" 버튼 표시

**저장 중 (Saving)**:
- "저장" 버튼: 로딩 스피너 + "저장 중..."
- 모든 입력 필드 비활성화

**저장 성공 (Success)**:
- Toast 알림: "프로필이 업데이트되었습니다"
- 읽기 모드로 자동 전환
- 최신 데이터로 화면 갱신

**에러 상태 (Error)**:
- **INVALID_CURRENT_PASSWORD**: "현재 비밀번호가 일치하지 않습니다"
- **NETWORK_ERROR**: "저장에 실패했습니다. 다시 시도해주세요"

### 4.7 AC 매핑

| AC ID | 검증 항목 | UI 요소 |
|-------|---------|---------|
| AC-F1-07 | 비밀번호 해시 제외 | ProfileView에 비밀번호 표시 안 함 |

---

## 5. 공통 UI 컴포넌트 스펙

### 5.1 `<SignupForm>` 컴포넌트

**Props**:
```typescript
interface SignupFormProps {
  inviteCode?: string;  // URL query param에서 전달
  onSuccess: (user: User) => void;
  onError: (error: ApiError) => void;
}
```

**상태 관리**:
- `react-hook-form` + `zod` 스키마 validation
- Redux Toolkit: `authSlice.signup()` thunk 호출

**동작**:
1. 폼 제출 시 validation 실행
2. `POST /auth/signup` API 호출 (inviteCode 포함)
3. 성공: 토큰 저장 + onSuccess 콜백
4. 실패: 에러 표시 + onError 콜백

---

### 5.2 `<LoginForm>` 컴포넌트

**Props**:
```typescript
interface LoginFormProps {
  redirectTo?: string;  // 로그인 후 이동할 경로 (선택)
  onSuccess: (user: User) => void;
}
```

**상태 관리**:
- Redux Toolkit: `authSlice.login()` thunk

**동작**:
1. 이메일/비밀번호 validation
2. `POST /auth/login` API 호출
3. 성공: 토큰 저장 + `GET /auth/me` 호출 + 역할별 리다이렉트
4. 실패: INVALID_CREDENTIALS 에러 표시

---

### 5.3 `<ProfileCard>` 컴포넌트

**Props**:
```typescript
interface ProfileCardProps {
  user: User;
  onUpdate: (data: UpdateUserDto) => Promise<void>;
  editable?: boolean;  // 수정 가능 여부 (기본: true)
}
```

**상태**:
- `isEditMode`: boolean (읽기/수정 모드 토글)
- `isSaving`: boolean (저장 중 상태)

**동작**:
1. "수정하기" 클릭 → isEditMode = true
2. "저장" 클릭 → `PATCH /users/me` API 호출
3. 성공: Toast 알림 + isEditMode = false
4. "취소" 클릭 → 폼 리셋 + isEditMode = false

---

### 5.4 `<PasswordStrengthIndicator>` 컴포넌트

**Props**:
```typescript
interface PasswordStrengthIndicatorProps {
  password: string;
}
```

**표시**:
- 프로그레스 바 (0~100%)
- 색상:
  - 약함 (0~40%): 빨강 (`--color-destructive`)
  - 보통 (41~70%): 노랑 (`--color-warning`)
  - 강함 (71~100%): 초록 (`--color-success`)
- 텍스트: "약함" / "보통" / "강함"

**강도 계산 로직**:
- 길이 8자 이상: +30%
- 영문 포함: +20%
- 숫자 포함: +20%
- 특수문자 포함: +20%
- 대소문자 혼용: +10%

---

## 6. 레이아웃 & 스타일링

### 6.1 인증 페이지 공통 레이아웃

```tsx
<AuthLayout>
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-full max-w-[480px] px-4">
      <div className="mb-8 text-center">
        <Logo className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>
    </div>
  </div>
</AuthLayout>
```

### 6.2 프로필 페이지 레이아웃

```tsx
<DashboardLayout>
  <div className="max-w-2xl mx-auto py-8 px-4">
    <PageHeader title="내 프로필" action={<EditButton />} />

    <Card className="mt-6">
      <CardHeader>
        <Avatar />
      </CardHeader>
      <CardContent>
        {isEditMode ? <ProfileEditForm /> : <ProfileView />}
      </CardContent>
    </Card>
  </div>
</DashboardLayout>
```

### 6.3 디자인 토큰 (from `ui-theme.md`)

**색상**:
- `--color-primary`: #3B82F6 (버튼, 링크)
- `--color-destructive`: #EF4444 (에러)
- `--color-success`: #10B981 (성공)
- `--color-warning`: #F59E0B (경고)
- `--color-muted`: #6B7280 (보조 텍스트)

**타이포그래피**:
- 제목 (h1): 24px, font-bold
- 라벨 (Label): 14px, font-medium
- 본문 (Text): 16px, font-normal
- 에러 메시지: 14px, font-normal, color-destructive

**여백**:
- 필드 간격: 16px (space-y-4)
- 버튼 높이: 40px (h-10)
- 카드 패딩: 24px (p-6)

---

## 7. 접근성 (Accessibility)

### 7.1 키보드 네비게이션

- Tab: 다음 필드로 이동
- Shift+Tab: 이전 필드로 이동
- Enter: 폼 제출 (버튼에 포커스 시)
- Escape: 모달/다이얼로그 닫기

### 7.2 ARIA 속성

```tsx
<FormField>
  <Label htmlFor="email" aria-required="true">
    이메일
  </Label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  <FormMessage id="email-error" role="alert">
    {errors.email?.message}
  </FormMessage>
</FormField>
```

### 7.3 스크린 리더 지원

- 모든 폼 필드에 `<label>` 연결
- 에러 메시지: `role="alert"` 속성
- 로딩 상태: `aria-busy="true"` 속성
- 비활성화 필드: `aria-disabled="true"`

---

## 8. 반응형 디자인

### 8.1 Breakpoints

- Mobile: < 640px (기본)
- Tablet: 640px ~ 1024px
- Desktop: > 1024px

### 8.2 화면별 반응형 처리

**회원가입/로그인 페이지**:
- Mobile: 전체 너비 (padding: 16px)
- Tablet/Desktop: max-width 480px, 중앙 정렬

**프로필 페이지**:
- Mobile: 전체 너비
- Tablet/Desktop: max-width 640px

**버튼**:
- Mobile: 전체 너비 (w-full)
- Desktop: 자동 너비 (w-auto)

---

## 9. AC → Screen 매핑표

| AC ID | 설명 | 화면 | UI 요소 | 검증 방법 |
|-------|------|------|---------|----------|
| AC-F1-01 | 회원가입 시 DB 저장 | `/auth/signup` | SignupForm 제출 | API E2E 테스트 |
| AC-F1-02 | 이메일 중복 에러 | `/auth/signup` | 이메일 필드 에러 메시지 | UI E2E 테스트 |
| AC-F1-03 | JWT 토큰 발급 | `/auth/login`, `/auth/signup` | 로그인/회원가입 성공 시 | API E2E 테스트 |
| AC-F1-04 | 잘못된 비밀번호 에러 | `/auth/login` | Alert 컴포넌트 | UI E2E 테스트 |
| AC-F1-05 | RBAC 역할별 접근 | 전체 | 역할별 리다이렉트 | Navigation 테스트 |
| AC-F1-06 | Refresh Token 갱신 | 전체 | Axios Interceptor | API E2E 테스트 |
| AC-F1-07 | 비밀번호 해시 제외 | `/profile` | ProfileView (비밀번호 미표시) | API E2E 테스트 |

---

## 10. Mock 데이터 스펙

### 10.1 Mock User 데이터

```typescript
// apps/web/lib/mocks/users.ts
export const mockOwnerUser: User = {
  id: 'user-owner-001',
  email: 'owner@test.com',
  name: '김점주',
  role: 'OWNER',
  phone: '010-1234-5678',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

export const mockEmployeeUser: User = {
  id: 'user-employee-001',
  email: 'employee@test.com',
  name: '이직원',
  role: 'EMPLOYEE',
  phone: '010-8765-4321',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};
```

### 10.2 Mock Auth API

```typescript
// apps/web/lib/mocks/auth-api.ts
export const mockSignup = async (dto: SignupDto): Promise<AuthResponse> => {
  await delay(1000);  // 네트워크 지연 시뮬레이션

  // Edge case: 이메일 중복
  if (dto.email === 'duplicate@test.com') {
    throw new ApiError('EMAIL_ALREADY_EXISTS', '이미 가입된 이메일입니다');
  }

  // Edge case: 초대 코드 만료
  if (dto.inviteCode === 'EXPIRED') {
    throw new ApiError('INVITE_EXPIRED', '초대 링크가 만료되었습니다');
  }

  return {
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    user: mockOwnerUser,
  };
};

export const mockLogin = async (dto: LoginDto): Promise<AuthResponse> => {
  await delay(800);

  // Edge case: 잘못된 비밀번호
  if (dto.password !== 'password123') {
    throw new ApiError('INVALID_CREDENTIALS', '이메일 또는 비밀번호가 잘못되었습니다');
  }

  const user = dto.email === 'owner@test.com' ? mockOwnerUser : mockEmployeeUser;

  return {
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    user,
  };
};
```

### 10.3 Edge Case Mock 데이터

| 시나리오 | Mock 트리거 | 응답 |
|---------|------------|------|
| 이메일 중복 | `email: "duplicate@test.com"` | `EMAIL_ALREADY_EXISTS` 에러 |
| 초대 코드 만료 | `inviteCode: "EXPIRED"` | `INVITE_EXPIRED` 에러 |
| 잘못된 비밀번호 | `password !== "password123"` | `INVALID_CREDENTIALS` 에러 |
| 네트워크 실패 | `email: "network-fail@test.com"` | Network Error throw |
| 토큰 만료 | localStorage에 만료된 토큰 | `TOKEN_EXPIRED` 에러 |

---

## 11. UI E2E 테스트 시나리오

### 11.1 회원가입 테스트

```typescript
// apps/web/tests/e2e/f1-auth-signup.spec.ts
test('TC-F1-01: 점주 회원가입 성공', async ({ page }) => {
  await page.goto('/auth/signup');

  // 역할 선택: 점주
  await page.getByRole('radio', { name: '점주' }).check();

  // 폼 입력
  await page.getByLabel('이름').fill('김점주');
  await page.getByLabel('이메일').fill('owner@test.com');
  await page.getByLabel('비밀번호').fill('password123');
  await page.getByLabel('비밀번호 확인').fill('password123');
  await page.getByLabel('이용약관').check();

  // 제출
  await page.getByRole('button', { name: '가입하기' }).click();

  // 검증: 매장 생성 페이지로 리다이렉트
  await expect(page).toHaveURL('/stores/new');
  await expect(page.getByText('매장 정보를 입력해주세요')).toBeVisible();
});

test('TC-F1-02: 이메일 중복 에러', async ({ page }) => {
  await page.goto('/auth/signup');

  await page.getByLabel('이메일').fill('duplicate@test.com');
  await page.getByLabel('비밀번호').fill('password123');
  await page.getByLabel('이용약관').check();
  await page.getByRole('button', { name: '가입하기' }).click();

  // 검증: 에러 메시지 표시
  await expect(page.getByText('이미 가입된 이메일입니다')).toBeVisible();
  await expect(page).toHaveURL('/auth/signup');  // 페이지 유지
});
```

### 11.2 로그인 테스트

```typescript
test('TC-F1-03: 로그인 성공 → 역할별 리다이렉트', async ({ page }) => {
  await page.goto('/auth/login');

  await page.getByLabel('이메일').fill('owner@test.com');
  await page.getByLabel('비밀번호').fill('password123');
  await page.getByRole('button', { name: '로그인' }).click();

  // 검증: 점주 대시보드로 리다이렉트
  await expect(page).toHaveURL(/\/dashboard|\/stores\/\w+/);
});

test('TC-F1-04: 잘못된 비밀번호 에러', async ({ page }) => {
  await page.goto('/auth/login');

  await page.getByLabel('이메일').fill('owner@test.com');
  await page.getByLabel('비밀번호').fill('wrong-password');
  await page.getByRole('button', { name: '로그인' }).click();

  // 검증: 에러 Alert 표시
  await expect(page.getByRole('alert')).toContainText('이메일 또는 비밀번호가 잘못되었습니다');
});
```

---

## 12. 다음 단계

F1 Step 2에서 이 스펙을 기반으로:
1. Next.js 14 App Router 구조 생성
2. shadcn/ui 초기화 및 컴포넌트 설치
3. Mock API 작성 (edge case 포함)
4. Redux Toolkit 설정
5. UI 컴포넌트 구현
6. UI E2E 테스트 (Mock 기반) 작성 및 실행

---

**Last Updated**: 2025-11-12
**Status**: F1 Step 1 완료
**Next**: F1 Step 2 - Frontend Prototype with Mock 시작
