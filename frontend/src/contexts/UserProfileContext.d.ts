import { Dispatch, SetStateAction } from 'react';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
  metadata: {
    createdAt: string | null;
    updatedAt?: string | null;
    lastLogin?: string | null;
  };
}

export interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'metadata'>>) => Promise<boolean>;
  updatePreferences: (updates: Partial<UserProfile['preferences']>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

declare module '@/contexts/UserProfileContext' {
  export const UserProfileContext: React.Context<UserProfileContextType>;
  export const UserProfileProvider: React.FC<{ children: React.ReactNode }>;
  export const useUserProfile: () => UserProfileContextType;
  export const defaultProfile: Omit<UserProfile, 'id'>;
}
