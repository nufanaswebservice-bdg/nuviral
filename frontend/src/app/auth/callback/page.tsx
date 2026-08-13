'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { completeGoogleLogin, handleGoogleRedirectResult } from '@/lib/google-auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const user = await handleGoogleRedirectResult();
        if (!user) {
          router.replace('/login');
          return;
        }
        await completeGoogleLogin(user);
        router.replace('/dashboard/quick-video');
      } catch (err: unknown) {
        setError((err as Error)?.message || 'Login gagal');
        setTimeout(() => router.replace('/login'), 3000);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Menyelesaikan login Google...</p>
        </>
      )}
    </div>
  );
}
