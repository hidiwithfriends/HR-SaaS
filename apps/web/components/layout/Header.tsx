'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout } from '@/lib/store/features/authSlice';
import { Button } from '@/components/ui/button';

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
  };

  // Don't show header on auth pages or if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div className="text-xl font-bold">BestPractice</div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground" data-testid="user-name">
          {user.name}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          data-testid="logout-button"
        >
          로그아웃
        </Button>
      </div>
    </header>
  );
}
