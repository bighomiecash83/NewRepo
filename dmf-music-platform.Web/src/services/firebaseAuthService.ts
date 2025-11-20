import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User,
  AuthError
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export class FirebaseAuthService {
  /**
   * Sign in user with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.mapUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Create new user account
   */
  static async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return this.mapUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser(): AuthUser | null {
    if (!auth.currentUser) return null;
    return this.mapUser(auth.currentUser);
  }

  /**
   * Subscribe to auth state changes
   */
  static onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return auth.onAuthStateChanged((user: User | null) => {
      callback(user ? this.mapUser(user) : null);
    });
  }

  /**
   * Get ID token for API calls
   */
  static async getIdToken(): Promise<string> {
    if (!auth.currentUser) throw new Error('No user signed in');
    return auth.currentUser.getIdToken();
  }

  private static mapUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }

  private static handleAuthError(error: AuthError): Error {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'Email already in use',
      'auth/weak-password': 'Password is too weak',
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'User account has been disabled'
    };

    return new Error(errorMessages[error.code] || error.message);
  }
}
