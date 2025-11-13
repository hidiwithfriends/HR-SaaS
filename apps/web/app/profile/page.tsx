'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { withAuth } from '@/lib/hoc/withAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserRole } from '@/lib/api/types';

function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);

  const getRoleText = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER:
        return '점주';
      case UserRole.EMPLOYEE:
        return '직원';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" data-testid="page-title">
          내 프로필
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-muted-foreground">이름</div>
              <div className="col-span-2 text-sm" data-testid="user-name">
                {user?.name}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-muted-foreground">이메일</div>
              <div className="col-span-2 text-sm" data-testid="user-email">
                {user?.email}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-muted-foreground">역할</div>
              <div className="col-span-2 text-sm" data-testid="user-role">
                {user?.role && getRoleText(user.role)}
              </div>
            </div>

            {user?.phone && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-muted-foreground">전화번호</div>
                <div className="col-span-2 text-sm" data-testid="user-phone">
                  {user.phone}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
