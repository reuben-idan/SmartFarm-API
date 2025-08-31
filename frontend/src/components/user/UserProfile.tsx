import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Mail, User, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function UserProfile() {
  const { currentUser, logout } = useAuth();
  const { profile, loading } = useUserProfile();

  if (loading || !profile) {
    return <ProfileSkeleton />;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Profile Card */}
        <div className="w-full md:w-1/3">
          <Card className="sticky top-4">
            <CardHeader className="items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile.photoURL || undefined} />
                <AvatarFallback>
                  {profile.displayName ? getInitials(profile.displayName) : 'US'}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-center">
                {profile.displayName || 'User'}
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                {profile.role}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.email}</span>
              </div>
              
              {profile.metadata?.createdAt && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Member since {format(new Date(profile.metadata.createdAt), 'MMM yyyy')}
                  </span>
                </div>
              )}
              
              <div className="pt-4 space-y-2">
                <Link to="/settings/profile" className="w-full">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full text-destructive hover:text-destructive"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Profile Details */}
        <div className="w-full md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Display Name</h3>
                  <p>{profile.displayName || 'Not set'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p>{profile.email || 'Not set'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {profile.role}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Theme</h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.preferences.theme === 'system' 
                        ? 'System' 
                        : profile.preferences.theme === 'dark' 
                          ? 'Dark' 
                          : 'Light'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.preferences.notifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Language</h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.preferences.language === 'en' 
                        ? 'English' 
                        : profile.preferences.language === 'es' 
                          ? 'Español' 
                          : profile.preferences.language}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for the profile
function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Profile Card Skeleton */}
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader className="items-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="pt-4 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Profile Details Skeleton */}
        <div className="w-full md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
