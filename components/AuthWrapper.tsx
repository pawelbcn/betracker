'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip authentication check for public pages
    const publicPages = ['/landing', '/login', '/register', '/migrate-receipt'];
    if (publicPages.includes(pathname)) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // Check if user is authenticated (only on client side)
    const authenticated = typeof window !== 'undefined' ? sessionStorage.getItem('authenticated') : null;
    const username = typeof window !== 'undefined' ? sessionStorage.getItem('username') : null;
    
    if (authenticated === 'true' && username === 'pawel') {
      setIsAuthenticated(true);
    } else {
      // Redirect to landing page for unauthenticated users
      router.push('/landing');
    }
    
    setIsLoading(false);
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
