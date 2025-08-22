'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { setupPrintStyles } from '@/lib/utils/print';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize the app
    const initializeApp = async () => {
      // Setup print styles
      setupPrintStyles();
      
      // Seed mock data on first load
      const hasSeeded = localStorage.getItem('pos-demo-seeded');
      if (!hasSeeded) {
        const { seedMockData } = await import('@/lib/mock-seed');
        await seedMockData();
        localStorage.setItem('pos-demo-seeded', 'true');
      }
      
      // Redirect based on auth status
      if (isAuthenticated) {
        router.push('/pos');
      } else {
        router.push('/login');
      }
    };

    initializeApp();
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing Dubai Store POS...</p>
      </div>
    </div>
  );
}