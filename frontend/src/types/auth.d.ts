import { User } from 'firebase/auth';

declare global {
  interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    error: string;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
  }

  function useAuth(): AuthContextType;
}
