import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getlumora.cloud/api/v1';

export function getGoogleAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  if (code === 'auth/unauthorized-domain') {
    return 'Domain getlumora.cloud belum terdaftar di Firebase. Silakan hubungi admin atau gunakan login email.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Login dibatalkan.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Popup diblokir browser. Coba lagi atau gunakan login email.';
  }
  return (error as Error)?.message || 'Login Google gagal. Coba lagi.';
}

export async function completeGoogleLogin(user: User) {
  const idToken = await user.getIdToken();
  const userData = {
    email: user.email,
    name: user.displayName,
    avatar: user.photoURL,
    role: 'USER',
  };

  localStorage.setItem('accessToken', idToken);
  localStorage.setItem('user', JSON.stringify(userData));

  try {
    await fetch(`${API_URL}/auth/track-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL,
        provider: 'google',
      }),
    });
  } catch {}

  return userData;
}

export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code || '';
    if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

export async function handleGoogleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch {
    return null;
  }
}
