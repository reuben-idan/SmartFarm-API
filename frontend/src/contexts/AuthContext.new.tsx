import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAx4cWyRyQc762CWg8nbuEEL7kecOpu38w",
  authDomain: "smartfarm-api-e7b4d.firebaseapp.com",
  projectId: "smartfarm-api-e7b4d",
  storageBucket: "smartfarm-api-e7b4d.firebasestorage.app",
  messagingSenderId: "713358372669",
  appId: "1:713358372669:web:27c0f7b527db9f98615f54"
};

// Initialize Firebase if it's not already initialized
if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

// Get the auth instance
const auth = firebase.auth();

// Create auth context
type AuthContextType = {
  currentUser: firebase.User | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<firebase.auth.UserCredential>;
  logout: () => Promise<void>;
  updateProfile: (updates: {
    displayName?: string;
    photoURL?: string;
    email?: string;
    password?: string;
  }) => Promise<boolean>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Handle email/password login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setError('');
      setLoading(true);
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return userCredential;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to log in';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await auth.signOut();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to log out';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates: {
    displayName?: string;
    photoURL?: string;
    email?: string;
    password?: string;
  }) => {
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }
    
    try {
      setLoading(true);
      
      // Update email if provided
      if (updates.email && updates.email !== currentUser.email) {
        await currentUser.updateEmail(updates.email);
      }
      
      // Update password if provided
      if (updates.password) {
        await currentUser.updatePassword(updates.password);
      }
      
      // Update profile information
      const profileUpdates: { displayName?: string; photoURL?: string } = {};
      if (updates.displayName !== undefined) profileUpdates.displayName = updates.displayName;
      if (updates.photoURL !== undefined) profileUpdates.photoURL = updates.photoURL;
      
      if (Object.keys(profileUpdates).length > 0) {
        await currentUser.updateProfile(profileUpdates);
      }
      
      // Refresh user data
      await currentUser.reload();
      setCurrentUser({ ...auth.currentUser! });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setCurrentUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { auth };

export default AuthContext;
