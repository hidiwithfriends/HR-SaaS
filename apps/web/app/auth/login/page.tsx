'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { login, clearError } from '@/lib/store/features/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      // Redirect to stores page after successful login
      router.push('/stores');
    }
  }, [user, router]);

  useEffect(() => {
    // Clear password field on error
    if (error) {
      resetField('password');
    }
  }, [error, resetField]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: LoginFormValues) => {
    await dispatch(login(data));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">로그인</h2>
        <p className="text-sm text-muted-foreground">
          계정에 로그인하여 시작하세요
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            data-testid="email-input"
            type="email"
            placeholder="example@email.com"
            autoFocus
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            data-testid="password-input"
            type="password"
            placeholder="비밀번호를 입력하세요"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-sm text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot Password Link (Phase 2) */}
        <div className="text-right">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            비밀번호 찾기 (Phase 2)
          </Link>
        </div>

        {/* Submit Button */}
        <Button type="submit" data-testid="submit-button" className="w-full" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">또는</span>
        </div>
      </div>

      {/* Social Login (Phase 2) */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled
        >
          Google로 로그인 (Phase 2)
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled
        >
          Kakao로 로그인 (Phase 2)
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          계정이 없으신가요?{' '}
          <Link href="/auth/signup" className="text-primary hover:underline">
            가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}
