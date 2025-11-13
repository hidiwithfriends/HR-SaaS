'use client';

import { useState } from 'react';
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

const inviteSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  name: z.string().min(1, '이름을 입력해주세요'),
  phone: z.string().optional(),
  position: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

function NewInvitePage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await apiClient.post(`/stores/${storeId}/invites`, data);
      const { token } = response.data;

      // Generate invite link
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/auth/signup?inviteToken=${token}`;

      setInviteLink(link);
      setSuccess(true);
      reset();
    } catch (err: any) {
      console.error('Failed to create invite:', err);
      setError(err.response?.data?.message || '초대 링크 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('초대 링크가 클립보드에 복사되었습니다.');
    }
  };

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
          직원 초대
        </h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription data-testid="error-message">{error}</AlertDescription>
          </Alert>
        )}

        {success && inviteLink && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription>
              <p className="font-medium mb-2" data-testid="success-message">
                초대 링크가 생성되었습니다!
              </p>
              <div className="flex gap-2 mt-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="font-mono text-sm"
                  data-testid="invite-link"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  data-testid="copy-button"
                >
                  복사
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>초대할 직원 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="홍길동"
                  data-testid="name-input"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="employee@example.com"
                  data-testid="email-input"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="010-1234-5678"
                  data-testid="phone-input"
                />
              </div>

              <div>
                <Label htmlFor="position">직급</Label>
                <Input
                  id="position"
                  {...register('position')}
                  placeholder="예: 매니저, 직원"
                  data-testid="position-input"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  data-testid="submit-button"
                >
                  {loading ? '생성 중...' : '초대 링크 생성'}
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

export default withAuth(NewInvitePage, { allowedRoles: [UserRole.OWNER] });
