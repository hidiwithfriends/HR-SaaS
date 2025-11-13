'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { withAuth } from '@/lib/hoc/withAuth';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRole } from '@/lib/api/types';

const settingsSchema = z.object({
  name: z.string().min(1, '매장 이름을 입력해주세요'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface Store {
  id: number;
  name: string;
  ownerId: number;
  createdAt: string;
}

function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [store, setStore] = useState<Store | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/stores/${storeId}`);
        const storeData = response.data;
        setStore(storeData);
        reset({ name: storeData.name });
      } catch (err: any) {
        console.error('Failed to fetch store:', err);
        setError(err.response?.data?.message || '매장 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      await apiClient.patch(`/stores/${storeId}`, data);
      setSuccess(true);

      // Update local store data
      if (store) {
        setStore({ ...store, name: data.name });
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update store:', err);
      setError(err.response?.data?.message || '매장 정보 업데이트에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/stores/${storeId}/employees`)}
            data-testid="back-button"
          >
            ← 직원 목록
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6" data-testid="page-title">
          매장 설정
        </h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription data-testid="error-message">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription data-testid="success-message">
              매장 정보가 업데이트되었습니다.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>매장 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">매장 이름 *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="매장 이름을 입력하세요"
                  data-testid="name-input"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {store && (
                <div>
                  <Label>매장 ID</Label>
                  <Input
                    value={store.id}
                    readOnly
                    disabled
                    className="bg-muted"
                    data-testid="store-id"
                  />
                </div>
              )}

              {store && (
                <div>
                  <Label>생성일</Label>
                  <Input
                    value={new Date(store.createdAt).toLocaleString('ko-KR')}
                    readOnly
                    disabled
                    className="bg-muted"
                    data-testid="created-at"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  data-testid="submit-button"
                >
                  {submitting ? '저장 중...' : '저장'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/stores/${storeId}/employees`)}
                  data-testid="cancel-button"
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(SettingsPage, { allowedRoles: [UserRole.OWNER] });
