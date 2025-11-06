'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { storesApi } from '@/lib/api';
import { getAccessToken, getUser } from '@/lib/auth';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StoreData {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  ownerId: string;
}

const storeSettingsSchema = z.object({
  name: z.string().min(2, { message: '매장명을 입력하세요' }),
  type: z.enum(['CAFE', 'RESTAURANT', 'RETAIL', 'OTHER']),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;

export default function StoreSettingsPage({ params }: { params: { storeId: string } }) {
  const router = useRouter();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const form = useForm<StoreSettingsFormData>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      name: '',
      type: 'CAFE',
      address: '',
      phone: '',
    },
  });

  useEffect(() => {
    const loadStore = async () => {
      const user = getUser();
      const token = getAccessToken();

      if (!user || !token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await storesApi.getStore(params.storeId, token);
        setStore(response.data);
        form.reset({
          name: response.data.name,
          type: response.data.type as 'CAFE' | 'RESTAURANT' | 'RETAIL' | 'OTHER',
          address: response.data.address || '',
          phone: response.data.phone || '',
        });
      } catch (err: any) {
        setError(err.message || '매장 정보를 불러올 수 없습니다');
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [params.storeId, router, form]);

  const handleSubmit = async (data: StoreSettingsFormData) => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = getAccessToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Omit phone field as backend doesn't support it yet
      const { phone, ...updateData } = data;
      await storesApi.updateStore(params.storeId, updateData, token);
      setSuccess('매장 정보가 업데이트되었습니다');
    } catch (err: any) {
      setError(err.message || '매장 정보 업데이트에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !store) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">로딩 중...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error && !store) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">오류</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="mt-4 text-center">
                <Link href="/stores">
                  <Button variant="outline">매장 목록으로 돌아가기</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute requireRole="OWNER">
      <Layout>
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <Link
                href="/stores"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                매장 목록으로
              </Link>
              <h1 className="text-3xl font-bold text-foreground">매장 설정</h1>
              <p className="mt-2 text-sm text-muted-foreground">매장 정보를 수정할 수 있습니다</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>매장 정보</CardTitle>
                <CardDescription>매장의 기본 정보를 업데이트하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert>
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>매장명 *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              data-testid="name-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>매장 유형 *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            data-testid="type-select"
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="매장 유형을 선택하세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CAFE">카페</SelectItem>
                              <SelectItem value="RESTAURANT">음식점</SelectItem>
                              <SelectItem value="RETAIL">소매점</SelectItem>
                              <SelectItem value="OTHER">기타</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>주소 (선택)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="서울시 마포구..."
                              data-testid="address-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>매장 전화번호 (선택)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="02-1234-5678"
                              data-testid="phone-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={saving}
                        data-testid="save-button"
                      >
                        {saving ? '저장 중...' : '저장'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
