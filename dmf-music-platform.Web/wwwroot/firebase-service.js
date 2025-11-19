// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDNdO2bNfxj_ej0qieN943ouqDqxWlfJY",
  authDomain: "studio-3072539584-8871a.firebaseapp.com",
  projectId: "studio-3072539584-8871a",
  storageBucket: "studio-3072539584-8871a.firebasestorage.app",
  messagingSenderId: "328060654829",
  appId: "1:328060654829:web:50e0e95b4bea1fd80ee8e4",
  measurementId: "G-0T64VY6Y81"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Export additional Firebase services as needed
export async function getFirebaseAuth() {
  const { getAuth } = await import("firebase/auth");
  return getAuth();
}

export async function getFirebaseDB() {
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore();
}

export async function getFirebaseStorage() {
  const { getStorage } = await import("firebase/storage");
  return getStorage();
}
