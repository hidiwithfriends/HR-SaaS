'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { signup, clearError } from '@/lib/store/features/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
const signupSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다').max(50, '이름은 최대 50자까지 입력 가능합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '영문과 숫자를 포함해야 합니다'),
  passwordConfirm: z.string(),
  storeName: z.string().min(2, '매장명은 최소 2자 이상이어야 합니다').max(100, '매장명은 최대 100자까지 입력 가능합니다'),
  phone: z.string().optional(),
  role: z.enum(['OWNER', 'EMPLOYEE']),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: '이용약관에 동의해주세요',
  }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);

  const inviteCode = searchParams.get('inviteCode');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: inviteCode ? 'EMPLOYEE' : 'OWNER',
      agreeTerms: false,
    },
  });

  const role = watch('role');

  useEffect(() => {
    if (user) {
      // Redirect to stores page after successful signup/login
      router.push('/stores');
    }
  }, [user, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: SignupFormValues) => {
    const { passwordConfirm, agreeTerms, role, phone, ...signupData } = data;
    // Only support OWNER signup for now (API only has /auth/signup/owner)
    if (role !== 'OWNER') {
      // TODO: Implement employee signup flow when API is ready
      alert('직원 가입은 아직 지원되지 않습니다. 점주로 가입해주세요.');
      return;
    }

    await dispatch(signup(signupData));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">회원가입</h2>
        <p className="text-sm text-muted-foreground">
          {inviteCode ? '초대를 받으셨군요! 정보를 입력해주세요' : '새로운 계정을 만들어보세요'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection */}
        <div className="space-y-2">
          <Label>역할 선택 *</Label>
          <RadioGroup
            value={role}
            onValueChange={(value) => setValue('role', value as 'OWNER' | 'EMPLOYEE')}
          >
            <RadioGroupItem value="OWNER" disabled={!!inviteCode}>
              점주
            </RadioGroupItem>
            <RadioGroupItem value="EMPLOYEE" disabled={!!inviteCode}>
              직원
            </RadioGroupItem>
          </RadioGroup>
          {inviteCode && (
            <p className="text-xs text-muted-foreground">
              초대 링크로 가입 시 역할이 자동으로 설정됩니다
            </p>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">이름 *</Label>
          <Input
            id="name"
            data-testid="name-input"
            placeholder="홍길동"
            {...register('name')}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">이메일 *</Label>
          <Input
            id="email"
            data-testid="email-input"
            type="email"
            placeholder="example@email.com"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Store Name (for OWNER) */}
        {role === 'OWNER' && (
          <div className="space-y-2">
            <Label htmlFor="storeName">매장명 *</Label>
            <Input
              id="storeName"
              data-testid="store-name-input"
              placeholder="우리 매장"
              {...register('storeName')}
              aria-invalid={!!errors.storeName}
            />
            {errors.storeName && (
              <p className="text-sm text-destructive" role="alert">
                {errors.storeName.message}
              </p>
            )}
          </div>
        )}

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호 *</Label>
          <Input
            id="password"
            data-testid="password-input"
            type="password"
            placeholder="최소 8자, 영문+숫자"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-sm text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Password Confirm */}
        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">비밀번호 확인 *</Label>
          <Input
            id="passwordConfirm"
            data-testid="password-confirm-input"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            {...register('passwordConfirm')}
            aria-invalid={!!errors.passwordConfirm}
          />
          {errors.passwordConfirm && (
            <p className="text-sm text-destructive" role="alert">
              {errors.passwordConfirm.message}
            </p>
          )}
        </div>

        {/* Phone (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="phone">전화번호 (선택)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="010-1234-5678"
            {...register('phone')}
          />
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-2">
          <input
            id="agreeTerms"
            data-testid="agree-terms-checkbox"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300"
            {...register('agreeTerms')}
            aria-invalid={!!errors.agreeTerms}
          />
          <Label htmlFor="agreeTerms" className="font-normal leading-tight">
            이용약관 및 개인정보처리방침에 동의합니다 *
          </Label>
        </div>
        {errors.agreeTerms && (
          <p className="text-sm text-destructive" role="alert">
            {errors.agreeTerms.message}
          </p>
        )}

        {/* Submit Button */}
        <Button type="submit" data-testid="submit-button" className="w-full" disabled={isLoading}>
          {isLoading ? '가입하는 중...' : '가입하기'}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
