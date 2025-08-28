import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Define the user type
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
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
      const token = localStorage.getItem('token');
      if (token) {
        // Set the token in the API client
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Fetch user data
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      }
    } catch (err) {
      // If there's an error, clear the token and user data
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
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
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store the token
      localStorage.setItem('token', token);
      // Set the token in the API client
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Update the user state
      setUser(user);
      
      // Redirect to the dashboard or the previous location
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log in. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear the token
    localStorage.removeItem('token');
    // Remove the token from the API client
    delete axios.defaults.headers.common['Authorization'];
    // Clear the user state
    setUser(null);
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
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

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.withCredentials = true;

// Add a response interceptor to handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // If we get a 401, try to refresh the token
      try {
        const response = await axios.post('/api/auth/refresh-token');
        const { token } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Retry the original request
        return axios(error.config);
      } catch (err) {
        // If refresh token fails, log the user out
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
