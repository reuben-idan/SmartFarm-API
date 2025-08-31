import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

const UserProfileContext = createContext();

// Default user profile schema
export const defaultProfile = {
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
    lastLogin: null,
  },
};

export function UserProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile from Firestore
  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const profileDoc = await getDoc(doc(db, 'users', userId));
      
      if (profileDoc.exists()) {
        setProfile({
          id: profileDoc.id,
          ...defaultProfile,
          ...profileDoc.data()
        });
      } else {
        // Create default profile if it doesn't exist
        const newProfile = {
          ...defaultProfile,
          metadata: {
            ...defaultProfile.metadata,
            createdAt: new Date().toISOString(),
          },
        };
        
        // Note: You'll need to implement the createUserProfile function in your auth service
        // or handle profile creation during user registration
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [db]);

  // Update user profile in Firestore
  const updateProfile = useCallback(async (userId, updates) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Update the document in Firestore
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setProfile(prev => ({
        ...prev,
        ...updates,
        updatedAt: new Date(),
      }));

      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [db]);

  // Update user preferences
  const updatePreferences = async (updates) => {
    return updateProfile({
      preferences: {
        ...profile.preferences,
        ...updates,
      },
    });
  };

  const value = {
    profile,
    loading,
    error,
    updateProfile,
    updatePreferences,
    refreshProfile: () => loadProfile(profile?.id),
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
