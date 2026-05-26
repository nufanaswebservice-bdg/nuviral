'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /dashboard to /dashboard/quick-video (AI Studio is default)
export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/quick-video');
  }, [router]);
  return null;
}
