import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      router.push('/auth/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            환영합니다!
          </h2>
          <p className="text-gray-600 mb-4">
            로그인에 성공했습니다. 점주 대시보드에 오신 것을 환영합니다.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">오늘의 근무 현황</h3>
              <p className="text-2xl font-bold text-blue-600">0명</p>
              <p className="text-sm text-blue-700 mt-1">아직 직원이 없습니다</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-green-900 mb-2">이번 주 인건비</h3>
              <p className="text-2xl font-bold text-green-600">₩0</p>
              <p className="text-sm text-green-700 mt-1">근무 기록이 없습니다</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-purple-900 mb-2">다음 할 일</h3>
              <p className="text-sm text-purple-700">직원 초대 완료하기</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 bg-primary-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              첫 번째 단계: 직원 초대하기
            </h3>
            <p className="text-gray-600 mb-4">
              직원을 초대하고 자동으로 교육 매뉴얼을 배정하세요
            </p>
            <button className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
              직원 초대하기 (준비 중)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
