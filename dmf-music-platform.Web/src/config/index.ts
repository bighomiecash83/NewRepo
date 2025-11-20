// Firebase configuration for DMF Music Platform
// Generated from Firebase Console

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCBUr3GfB1-1VKH5TAmUc-pGbTmmMw4_Z8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studio-5828448336-5a604.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studio-5828448336-5a604",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studio-5828448336-5a604.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "706134522109",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:706134522109:web:3877779360d155c4f6e694"
};

// API configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:5001/api",
  timeout: 30000,
  withCredentials: true
};

// Feature flags
export const FEATURES = {
  enableFirebaseAuth: true,
  enableBotActions: true,
  enableChangeLog: true,
  enableMonitoring: true
};

// Logging
export const LOG_LEVEL = import.meta.env.DEV ? "debug" : "warn";
