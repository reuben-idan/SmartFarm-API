import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { firebase } from '@/config/firebase';
import { useFirebaseAuth } from './FirebaseAuthContext';

const db = firebase.firestore();

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

// Default user profile schema
export const defaultProfile: Omit<UserProfile, 'id'> = {
  displayName: '',
  email: '',
  photoURL: '',
  role: 'user',
  preferences: {
    theme: 'system',
    notifications: true,
    language: 'en',
  },
  metadata: {
    createdAt: null,
  },
};

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'metadata'>>) => Promise<boolean>;
  updatePreferences: (updates: Partial<UserProfile['preferences']>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useFirebaseAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile from Firestore
  const loadProfile = useCallback(async (userId: string) => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const profileData = userDoc.data() as Partial<UserProfile>;
        setProfile({
          id: userDoc.id,
          ...defaultProfile,
          ...profileData,
          preferences: {
            ...defaultProfile.preferences,
            ...(profileData.preferences || {})
          },
          metadata: {
            ...defaultProfile.metadata,
            ...(profileData.metadata || {})
          }
        });
      } else {
        // Create default profile if it doesn't exist
        const newProfile: UserProfile = {
          id: userId,
          ...defaultProfile,
          email: currentUser?.email || '',
          displayName: currentUser?.displayName || '',
          photoURL: currentUser?.photoURL || '',
          metadata: {
            ...defaultProfile.metadata,
            createdAt: new Date().toISOString(),
          },
        };
        
        await db.collection('users').doc(userId).set(newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error loading profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Update user profile in Firestore
  const updateProfile = useCallback(async (updates: Partial<Omit<UserProfile, 'id' | 'metadata'>>) => {
    if (!profile?.id) return false;
    
    try {
      setLoading(true);
      const updatedMetadata = {
        ...profile.metadata,
        updatedAt: new Date().toISOString(),
      };
      
      const updatesData = {
        ...updates,
        metadata: updatedMetadata,
      };
      
      await db.collection('users').doc(profile.id).update(updatesData);
      
      setProfile(prev => ({
        ...prev!,
        ...updates,
        metadata: updatedMetadata,
      }));
      
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error updating profile:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Update user preferences
  const updatePreferences = useCallback(async (updates: Partial<UserProfile['preferences']>) => {
    if (!profile?.id) return false;
    
    const newPreferences = {
      ...profile.preferences,
      ...updates,
    };
    
    return updateProfile({ preferences: newPreferences });
  }, [profile, updateProfile]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (currentUser?.uid) {
      await loadProfile(currentUser.uid);
    }
  }, [currentUser, loadProfile]);

  // Load profile when user changes
  useEffect(() => {
    if (currentUser) {
      loadProfile(currentUser.uid);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [currentUser, loadProfile]);

  const value = {
    profile,
    loading,
    error,
    updateProfile,
    updatePreferences,
    refreshProfile,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}

export default UserProfileContext;
