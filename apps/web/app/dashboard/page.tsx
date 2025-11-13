'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { withAuth } from '@/lib/hoc/withAuth';

function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">대시보드</h1>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-lg mb-2">환영합니다, {user?.name}님!</p>
          <p className="text-muted-foreground mb-4">
            역할: <span className="font-medium">{user?.role}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            이 페이지는 임시 대시보드입니다. Phase 2에서 실제 기능이 구현됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);
