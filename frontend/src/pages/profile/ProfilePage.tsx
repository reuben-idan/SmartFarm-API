import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { profile, loading } = useUserProfile();

  if (loading || !profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Get first letter of display name or email for avatar fallback
  const getInitials = (name?: string, email?: string) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center space-x-4">
            <Avatar 
              className="h-20 w-20 text-2xl"
              src={profile.photoURL}
              alt={profile.displayName || 'User'}
              fallback={getInitials(profile.displayName, profile.email)}
            />
            <div>
              <CardTitle className="text-2xl">{profile?.displayName || 'User'}</CardTitle>
              <p className="text-muted-foreground">{profile?.role || 'Farmer'}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{profile.email || 'No email provided'}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.address?.city && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{[profile.address.city, profile.address.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Member since {new Date(profile.createdAt || new Date()).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild>
              <a href="/settings/profile">Edit Profile</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
