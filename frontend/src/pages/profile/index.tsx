import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, HardDrive, Activity, Calendar, MapPin, Phone, Mail, Edit, Save, X, Crop, Camera } from 'lucide-react';
import { format } from 'date-fns';

type ProfileData = {
  displayName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  avatarUrl?: string;
};

type FarmData = {
  name: string;
  size: string;
  location: string;
  established: string;
  crops: string[];
  livestock: string[];
};

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    avatarUrl: '',
  });
  
  const [farmData, setFarmData] = useState<FarmData>({
    name: 'Green Valley Farm',
    size: '25 acres',
    location: 'Nakuru, Kenya',
    established: '2018-01-15',
    crops: ['Maize', 'Beans', 'Wheat', 'Potatoes'],
    livestock: ['Dairy Cows', 'Chickens'],
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Initialize profile data
  useEffect(() => {
    if (profile) {
      setProfileData({
        displayName: profile.displayName || '',
        email: currentUser?.email || '',
        phone: profile.phone || '',
        bio: profile.bio || 'Farm owner and agricultural enthusiast',
        location: profile.location || '',
        website: profile.website || '',
        avatarUrl: profile.photoURL || '',
      });
    }
  }, [profile, currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const updates = {
        displayName: profileData.displayName,
        phone: profileData.phone,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
      };
      
      await updateProfile(updates);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, you would upload the file to a storage service
    // and then update the user's profile with the new avatar URL
    const reader = new FileReader();
    
    reader.onloadend = () => {
      // This would be the URL from your storage service in a real app
      const newAvatarUrl = reader.result as string;
      setProfileData(prev => ({
        ...prev,
        avatarUrl: newAvatarUrl,
      }));
      
      // In a real app, you would save this URL to the user's profile
      // updateProfile({ photoURL: newAvatarUrl });
    };
    
    reader.readAsDataURL(file);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white dark:border-gray-800">
              <AvatarImage src={profileData.avatarUrl} alt={profileData.displayName} />
              <AvatarFallback className="text-2xl">
                {profileData.displayName ? 
                  profileData.displayName.split(' ').map(n => n[0]).join('') : 
                  'U'
                }
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <label 
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                title="Change photo"
              >
                <Camera className="h-4 w-4" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {profileData.displayName || 'User'}
            </h1>
            <p className="text-muted-foreground">
              {profileData.bio || 'Farm owner'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs 
        defaultValue="overview" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="overview">
            <User className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="farm">
            <HardDrive className="mr-2 h-4 w-4" />
            My Farm
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 border rounded-md bg-muted/50">
                      {profileData.displayName || 'Not provided'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm py-2 px-3 border rounded-md bg-muted/50">
                    {profileData.email || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      placeholder="+254 700 000000"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 border rounded-md bg-muted/50">
                      {profileData.phone || 'Not provided'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      placeholder="Enter your location"
                      disabled={isSaving}
                      icon={MapPin}
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 border rounded-md bg-muted/50 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {profileData.location || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    disabled={isSaving}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 border rounded-md bg-muted/50 min-h-[80px]">
                    {profileData.bio || 'No bio provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How others can get in touch with you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-muted">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{profileData.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-muted">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{profileData.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-muted">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{profileData.location || 'Not provided'}</p>
                </div>
              </div>
              
              {profileData.website && (
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a 
                      href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profileData.website}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farm">
          <Card>
            <CardHeader>
              <CardTitle>Farm Information</CardTitle>
              <CardDescription>
                Details about your farming operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Farm Name</p>
                  <p className="font-medium">{farmData.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Farm Size</p>
                  <p className="font-medium">{farmData.size}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    {farmData.location}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Established</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {format(new Date(farmData.established), 'MMMM yyyy')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Crops</h4>
                  <div className="flex flex-wrap gap-2">
                    {farmData.crops.map((crop, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Livestock</h4>
                  <div className="flex flex-wrap gap-2">
                    {farmData.livestock.map((animal, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {animal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Edit Farm Details</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent actions and system events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-start space-x-4 pb-4 border-b">
                    <div className="p-2 rounded-lg bg-muted">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {item === 1 && 'You updated your profile information'}
                        {item === 2 && 'New crop data was recorded'}
                        {item === 3 && 'You completed the farm inspection'}
                        {item === 4 && 'New recommendation available for your crops'}
                        {item === 5 && 'You logged in from a new device'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(Date.now() - (item * 3600000)), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
