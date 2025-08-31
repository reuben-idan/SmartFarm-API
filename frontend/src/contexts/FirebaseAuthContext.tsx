import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/config/firebase';

// Types
type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<User | null>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }) => Promise<User | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  error: '',
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  isAuthenticated: false,
});

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setError('');
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to log in';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async ({ email, password, first_name, last_name, role }: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }) => {
    try {
      setError('');
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: `${first_name} ${last_name}`,
      });

      // Here you would typically create a user document in Firestore with additional info
      // For example:
      // await setDoc(doc(db, 'users', userCredential.user.uid), {
      //   firstName: first_name,
      //   lastName: last_name,
      //   email: email,
      //   role: role,
      //   createdAt: serverTimestamp(),
      // });

      return userCredential.user;
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.message || 'Failed to create account';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to log out';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
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
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context and the provider
export const FirebaseAuthProvider = AuthProvider;
export default AuthContext;
