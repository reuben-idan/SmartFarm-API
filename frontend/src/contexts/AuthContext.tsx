import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/lib/api/auth.service";
import { toast } from "sonner";

// Define the user type
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  token?: string;
  image?: string;
}

// Define the response type from the auth service
interface AuthServiceResponse {
  user: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
    image?: string;
  };
  token: string;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  loginWithGoogle: async () => {},
  loginWithGithub: async () => {},
  register: async () => {},
  updateProfile: async () => false,
  refreshUser: async () => {},
  logout: () => {},
  loading: false,
  error: null,
  isAuthenticated: false,
});

// Create the auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user from localStorage on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

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
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.login({ email, password });
        
        // Update user state with the response data
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          first_name: response.user.first_name || '',
          last_name: response.user.last_name || '',
          role: response.user.role || 'user',
          image: response.user.image,
          token: response.token
        };
        
        setUser(userData);
        localStorage.setItem('token', response.token);
        
        toast.success('Successfully logged in');
        
        // Redirect to dashboard or previous page
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Invalid email or password";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate, location.state?.from?.pathname]
  );

  // Google OAuth login
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // This URL should point to your backend OAuth endpoint
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to login with Google";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // GitHub OAuth login
  const loginWithGithub = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // This URL should point to your backend OAuth endpoint
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to login with GitHub";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: string;
  }) => {
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
      setError(err?.message || "Failed to register. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    try {
      // Clear any stored tokens or user data
      localStorage.removeItem('token');
      
      // Clear the current user state
      setUser(null);
      
      // Clear any auth headers if they exist
      if (authService.clearAuthHeader) {
        authService.clearAuthHeader();
      }
      
      // Call the auth service logout if it exists
      if (authService.logout) {
        authService.logout();
      }
      
      // Show success message
      toast.success('Successfully logged out');
      
      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('An error occurred during logout');
      // Still ensure we redirect even if there's an error
      navigate('/login', { replace: true });
    }
  }, [navigate]); // Add navigate to the dependency array
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        loginWithGithub,
        register,
        updateProfile,
        refreshUser,
        logout,
        loading,
        error,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Axios is configured in '@/lib/api/client'
