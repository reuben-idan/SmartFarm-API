import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { authService } from '@/lib/api/auth.service';

import type { User } from './AuthContext';

// Extend the User type from AuthContext to include additional profile fields
interface ExtendedUser extends Omit<User, 'id' | 'email' | 'role'> {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  date_joined?: string;
  last_login?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  email_verified?: boolean;
  two_factor_enabled?: boolean;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

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
    createdAt: string;
    updatedAt?: string;
    lastLogin?: string;
  };
  // Profile fields
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  bio?: string;
  website?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
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
    createdAt: new Date().toISOString(),
  },
  firstName: '',
  lastName: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  },
  bio: '',
  website: '',
  emailVerified: false,
  twoFactorEnabled: false,
  socialLinks: {},
};

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'metadata'>>) => Promise<boolean>;
  updatePreferences: (updates: Partial<UserProfile['preferences']>) => Promise<boolean>;
  updateProfilePicture: (file: File) => Promise<boolean>;
  verifyEmail: () => Promise<boolean>;
  enableTwoFactorAuth: (enable: boolean) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  isUpdating: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user: currentUser, updateProfile: updateAuthProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>({
    ...defaultProfile,
    id: currentUser?.id.toString() || '',
    displayName: `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'User',
    email: currentUser?.email || '',
    photoURL: '',
    role: currentUser?.role || 'user',
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user profile from the backend API
  const loadProfile = useCallback(async (userId: string) => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // TODO: Fetch user profile from your API
      // const userProfile = await authService.getUserProfile(userId);
      // setProfile(userProfile);
      
      // For now, create a basic profile from auth user
      if (currentUser) {
        setProfile({
          ...defaultProfile,
          id: currentUser.id.toString(),
          displayName: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'User',
          email: currentUser.email,
          photoURL: '',
          role: currentUser.role,
          metadata: {
            ...defaultProfile.metadata,
            createdAt: new Date().toISOString(),
          }
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }

    try {
      setLoading(true);
      
      // Fetch user profile from the backend
      const userData = await authService.getCurrentUser() as ExtendedUser;
      
      if (userData) {
        // Transform the API response to match our UserProfile type
        const profileData: UserProfile = {
          id: userData.id.toString(),
          displayName: `${userData.first_name} ${userData.last_name}`.trim() || userData.email,
          email: userData.email,
          photoURL: (userData as any).profile_picture || '',
          role: userData.role || 'user',
          firstName: userData.first_name,
          lastName: userData.last_name,
          phone: (userData as any).phone || '',
          location: (userData as any).location || '',
          bio: (userData as any).bio || '',
          website: (userData as any).website || '',
          emailVerified: (userData as any).email_verified || false,
          twoFactorEnabled: (userData as any).two_factor_enabled || false,
          preferences: {
            theme: 'system' as const,
            notifications: true,
            language: 'en',
          },
          metadata: {
            createdAt: (userData as any).date_joined || new Date().toISOString(),
            updatedAt: (userData as any).last_login || null,
            lastLogin: (userData as any).last_login || null,
          },
        };
        
        setProfile(profileData);
      } else {
        // Create default profile if it doesn't exist
        const newProfile: UserProfile = {
          id: userId,
          ...defaultProfile,
          email: currentUser?.email || '',
          displayName: currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : 'User',
          photoURL: '',
          metadata: {
            ...defaultProfile.metadata,
            createdAt: new Date().toISOString(),
          },
        };
        
        // In a real implementation, you would create the profile on the backend
        // For now, we'll just set it locally
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

  // Update user profile using the backend API
  const updateProfile = useCallback(async (updates: Partial<Omit<UserProfile, 'id' | 'metadata'>>) => {
    if (!profile) return false;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      // Create a new object with only the allowed fields
      const validUpdates: Partial<Omit<UserProfile, 'id' | 'metadata'>> = {};
      
      // Only include fields that are defined in the updates
      if (updates.displayName !== undefined) validUpdates.displayName = updates.displayName;
      if (updates.email !== undefined) validUpdates.email = updates.email;
      if (updates.photoURL !== undefined) validUpdates.photoURL = updates.photoURL;
      if (updates.role !== undefined) validUpdates.role = updates.role;
      if (updates.preferences !== undefined) validUpdates.preferences = updates.preferences;
      if (updates.firstName !== undefined) validUpdates.firstName = updates.firstName;
      if (updates.lastName !== undefined) validUpdates.lastName = updates.lastName;
      if (updates.phone !== undefined) validUpdates.phone = updates.phone;
      if (updates.address !== undefined) validUpdates.address = updates.address;
      if (updates.bio !== undefined) validUpdates.bio = updates.bio;
      if (updates.website !== undefined) validUpdates.website = updates.website;
      if (updates.emailVerified !== undefined) validUpdates.emailVerified = updates.emailVerified;
      if (updates.twoFactorEnabled !== undefined) validUpdates.twoFactorEnabled = updates.twoFactorEnabled;
      if (updates.socialLinks !== undefined) validUpdates.socialLinks = updates.socialLinks;
      
      // Update local state optimistically
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...validUpdates,
          metadata: {
            ...prev.metadata,
            updatedAt: new Date().toISOString()
          }
        };
      });
      
      // TODO: Call your API to update the profile
      // await authService.updateProfile(profile.id, validUpdates);
      
      // Also update the auth user if email or name fields changed
      if (validUpdates.email || validUpdates.firstName !== undefined || validUpdates.lastName !== undefined) {
        const authUpdates: Partial<User> = {};
        
        if (validUpdates.email) {
          authUpdates.email = validUpdates.email;
        }
        
        // Only include name fields if they exist in the updates
        if (validUpdates.firstName !== undefined || validUpdates.lastName !== undefined) {
          authUpdates.first_name = validUpdates.firstName ?? profile.firstName ?? '';
          authUpdates.last_name = validUpdates.lastName ?? profile.lastName ?? '';
        }
        
        if (Object.keys(authUpdates).length > 0) {
          await updateAuthProfile(authUpdates);
        }
      }
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile');
      toast.error('Failed to update profile');
      
      // Revert optimistic update on error
      if (profile) {
        setProfile(profile);
      }
      
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [profile, updateAuthProfile]);
  
  // Update profile picture
  const updateProfilePicture = useCallback(async (file: File) => {
    if (!profile?.id) return false;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      // In a real implementation, you would upload the file to your backend
      // and get the URL to update the user's profile
      // For now, we'll just create a local object URL for demo purposes
      const photoURL = URL.createObjectURL(file);
      
      // Update the user's profile with the new photo URL
      // We'll store the photo URL in a custom field since the User type doesn't have photoURL
      await updateAuthProfile({ profile_picture: photoURL } as any);
      
      // Update local state
      setProfile(prev => ({
        ...prev!,
        photoURL,
        metadata: {
          ...prev!.metadata,
          updatedAt: new Date().toISOString(),
        },
      }));
      
      toast.success('Profile picture updated successfully');
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error updating profile picture:', error);
      setError(error.message);
      toast.error('Failed to update profile picture');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [profile, updateProfile]);
  
  // Verify user's email
  const verifyEmail = useCallback(async () => {
    try {
      // In a real implementation, you would call your backend API
      // to send a verification email
      toast.success('Verification email sent. Please check your inbox.');
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email');
      return false;
    }
  }, [currentUser]);
  
  // Enable/disable two-factor authentication
  const enableTwoFactorAuth = useCallback(async (enable: boolean) => {
    if (!profile?.id) return false;
    
    try {
      setIsUpdating(true);
      
      // In a real implementation, you would call your backend API
      // to enable/disable 2FA and handle the setup flow
      
      // Update local state
      setProfile(prev => ({
        ...prev!,
        twoFactorEnabled: enable,
        metadata: {
          ...prev!.metadata,
          updatedAt: new Date().toISOString(),
        },
      }));
      
      toast.success(`Two-factor authentication ${enable ? 'enabled' : 'disabled'}`);
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error updating two-factor authentication:', error);
      toast.error(`Failed to ${enable ? 'enable' : 'disable'} two-factor authentication`);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [profile, updateProfile]);

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
    if (currentUser?.id) {
      await loadProfile(currentUser.id.toString());
    }
  }, [currentUser?.id, loadProfile]);

  // Load profile when user changes
  useEffect(() => {
    if (currentUser?.id) {
      loadProfile(currentUser.id.toString());
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [currentUser?.id, loadProfile]);

  const value: UserProfileContextType = {
    profile,
    loading,
    error,
    isUpdating,
    updateProfile,
    updatePreferences,
    updateProfilePicture,
    verifyEmail,
    enableTwoFactorAuth,
    refreshProfile,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile(): UserProfileContextType {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}

export default UserProfileContext;
