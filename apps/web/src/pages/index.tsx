import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          BestPractice HR SaaS
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          성공하는 사장님의 비법을, 그대로 시스템으로
        </p>
        <p className="text-lg text-gray-600 mb-12">
          5분 안에 매장을 등록하고, 성공 매장의 운영 공식을 복제하세요
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
