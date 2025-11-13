'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function NewStorePage() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (user.role !== 'OWNER') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">매장 생성</h1>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-lg mb-4">
            환영합니다, {user.name}님! 매장 정보를 입력해주세요.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            이 페이지는 임시 페이지입니다. F2 (매장 관리) 기능에서 실제 매장 생성 폼이 구현됩니다.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            대시보드로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}
