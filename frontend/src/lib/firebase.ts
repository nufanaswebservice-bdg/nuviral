import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDaec5EiBWKtbS6V0EBQaJbU2Fk3dr9BmE',
  authDomain: 'getlumora-ad1c9.firebaseapp.com',
  projectId: 'getlumora-ad1c9',
  storageBucket: 'getlumora-ad1c9.firebasestorage.app',
  messagingSenderId: '570716793895',
  appId: '1:570716793895:web:fe38745ec6082fd17e7202',
  measurementId: 'G-9NBNQFL0KE',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });
