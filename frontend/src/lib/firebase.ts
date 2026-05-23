import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC2mNyDg4H8AOVp34rxll2NSxe1GQvZGhc",
  authDomain: "viralai-e115c.firebaseapp.com",
  projectId: "viralai-e115c",
  storageBucket: "viralai-e115c.firebasestorage.app",
  messagingSenderId: "595956379298",
  appId: "1:595956379298:web:5f639268ac5125650571fb",
  measurementId: "G-NR35YNDDQM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
