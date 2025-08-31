import { User } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

declare const AuthContext: React.Context<AuthContextType | undefined>;

declare function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element;
declare function useAuth(): AuthContextType;

export { AuthContext, AuthProvider, useAuth };
export type { AuthContextType };
