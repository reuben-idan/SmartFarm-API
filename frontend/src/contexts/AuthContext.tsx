import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/lib/api/auth.service';

// Define the user type
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { first_name: string; last_name: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Create the auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in on initial load
  const checkAuth = useCallback(async () => {
    try {
      const token = authService.getAccessToken();
      if (token) {
        authService.setAuthHeader(token);
        const me = await authService.getCurrentUser();
        setUser(me as any);
      }
    } catch (err) {
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { access, refresh, user } = await authService.login({ email, password });
      authService.setTokens(access, refresh);
      authService.setAuthHeader(access);
      setUser(user as any);
      
      // Redirect to the dashboard or the previous location
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Failed to log in. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: { first_name: string; last_name: string; email: string; password: string; role: string }) => {
    setLoading(true);
    setError(null);
    try {
      // Backend expects username and password2
      await authService.register({
        ...data,
        username: data.email,
        password2: data.password,
      } as any);
    } catch (err: any) {
      setError(err?.message || 'Failed to register. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        error,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Axios is configured in '@/lib/api/client'
