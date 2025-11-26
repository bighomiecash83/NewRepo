// web/src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBS92OnLQd6HN8b4MyJGFDAxT7Qk2v2psA",
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dmf-music-platform"}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dmf-music-platform",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dmf-music-platform.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "639297393393",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:639297393393:web:abc123def456ghi789"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();
export const googleProvider = new GoogleAuthProvider();

export function useAuthListener(onChange: (user: any) => void) {
  if (typeof window === "undefined") return;
  
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    onChange(user);
  });
  
  return unsubscribe;
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login failed:", error);
    throw error;
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
}

export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Failed to get ID token:", error);
    return null;
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}
