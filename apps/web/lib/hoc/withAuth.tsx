'use client';

import { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { useAuth } from '@/lib/providers/AuthProvider';
import { UserRole } from '@/lib/api/types';

interface WithAuthOptions {
  // Optional: restrict access to specific roles
  allowedRoles?: UserRole[];
  // Optional: redirect path if not authenticated (default: /auth/login)
  redirectTo?: string;
}

/**
 * Higher-Order Component to protect client-side pages
 *
 * Usage:
 * export default withAuth(MyPage);
 * export default withAuth(MyPage, { allowedRoles: [UserRole.OWNER] });
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { allowedRoles, redirectTo = '/auth/login' } = options;

  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const { isAuthInitialized } = useAuth();
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
      if (!isAuthInitialized) {
        // Still initializing, wait
        return;
      }

      if (!user) {
        // Not authenticated, redirect to login
        console.log('[withAuth] User not authenticated, redirecting to', redirectTo);
        router.push(redirectTo);
        return;
      }

      // Check role-based access if specified
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          console.log('[withAuth] User role not allowed:', user.role);
          router.push('/unauthorized');
          return;
        }
      }

      console.log('[withAuth] User authenticated:', user.email);
    }, [isAuthInitialized, user, router]);

    // Show loading spinner while initializing
    if (!isAuthInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      );
    }

    // Don't render protected content if user is not authenticated
    // (will redirect in useEffect)
    if (!user) {
      return null;
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        return null;
      }
    }

    // User is authenticated and authorized, render the component
    return <Component {...props} />;
  };
}
