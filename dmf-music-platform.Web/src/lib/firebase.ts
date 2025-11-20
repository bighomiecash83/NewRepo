import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBUr3GfB1-1VKH5TAmUc-pGbTmmMw4_Z8",
  authDomain: "studio-5828448336-5a604.firebaseapp.com",
  projectId: "studio-5828448336-5a604",
  storageBucket: "studio-5828448336-5a604.firebasestorage.app",
  messagingSenderId: "706134522109",
  appId: "1:706134522109:web:3877779360d155c4f6e694"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Connect to emulators in development
if (import.meta.env.DEV && window.location.hostname === 'localhost') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 4000);
    console.log('✅ Firebase emulators connected');
  } catch (error) {
    console.warn('Firebase emulators not available (production mode)', error);
  }
}

export default firebaseApp;
