'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { withAuth } from '@/lib/hoc/withAuth';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRole } from '@/lib/api/types';

interface Store {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

function StoresPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get('/stores');
        setStores(response.data);
      } catch (err: any) {
        console.error('Failed to fetch stores:', err);
        setError(err.response?.data?.message || '매장 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleStoreClick = (storeId: string) => {
    router.push(`/stores/${storeId}/employees`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold" data-testid="page-title">내 매장</h1>
          {user?.role === UserRole.OWNER && (
            <Button
              onClick={() => router.push('/profile')}
              variant="outline"
              data-testid="profile-button"
            >
              프로필
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription data-testid="error-message">{error}</AlertDescription>
          </Alert>
        )}

        {stores.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground" data-testid="no-stores-message">
                등록된 매장이 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4" data-testid="stores-list">
            {stores.map((store) => (
              <Card
                key={store.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleStoreClick(store.id)}
                data-testid={`store-card-${store.id}`}
              >
                <CardHeader>
                  <CardTitle data-testid={`store-name-${store.id}`}>{store.name}</CardTitle>
                  <CardDescription>
                    생성일: {new Date(store.createdAt).toLocaleDateString('ko-KR')}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(StoresPage, { allowedRoles: [UserRole.OWNER, UserRole.EMPLOYEE] });
