import { Card, CardContent } from '@/components/ui/card';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[480px] px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">BestPractice</h1>
          <p className="text-sm text-muted-foreground">
            성공하는 매장의 HR 베스트 프랙티스
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
