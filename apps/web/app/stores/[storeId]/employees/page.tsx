'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { withAuth } from '@/lib/hoc/withAuth';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserRole } from '@/lib/api/types';

interface Employee {
  id: string;
  userId: string;
  storeId: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  hireDate: string;
  createdAt: string;
}

function EmployeesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const storeId = params.storeId as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/stores/${storeId}/employees`);
        setEmployees(response.data);
      } catch (err: any) {
        console.error('Failed to fetch employees:', err);
        setError(err.response?.data?.message || '직원 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/stores')}
              data-testid="back-button"
            >
              ← 매장 목록
            </Button>
            <h1 className="text-3xl font-bold" data-testid="page-title">
              직원 관리
            </h1>
          </div>
          <div className="flex gap-2">
            {user?.role === UserRole.OWNER && (
              <>
                <Button
                  onClick={() => router.push(`/stores/${storeId}/invites/new`)}
                  data-testid="invite-button"
                >
                  직원 초대
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/stores/${storeId}/settings`)}
                  data-testid="settings-button"
                >
                  매장 설정
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription data-testid="error-message">{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>직원 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="no-employees-message">
                등록된 직원이 없습니다.
              </p>
            ) : (
              <Table data-testid="employees-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>전화번호</TableHead>
                    <TableHead>직급</TableHead>
                    <TableHead>입사일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} data-testid={`employee-row-${employee.id}`}>
                      <TableCell data-testid={`employee-name-${employee.id}`}>
                        {employee.name}
                      </TableCell>
                      <TableCell data-testid={`employee-email-${employee.id}`}>
                        {employee.email}
                      </TableCell>
                      <TableCell data-testid={`employee-phone-${employee.id}`}>
                        {employee.phone || '-'}
                      </TableCell>
                      <TableCell data-testid={`employee-position-${employee.id}`}>
                        {employee.position || '-'}
                      </TableCell>
                      <TableCell data-testid={`employee-hiredate-${employee.id}`}>
                        {new Date(employee.hireDate).toLocaleDateString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(EmployeesPage, { allowedRoles: [UserRole.OWNER, UserRole.EMPLOYEE] });
