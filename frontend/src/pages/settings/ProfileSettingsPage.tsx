import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form validation schema
const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  photoURL: z.string().url({
    message: 'Please enter a valid URL.',
  }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettingsPage() {
  const { profile, updateProfile, loading: profileLoading } = useUserProfile();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      email: '',
      photoURL: '',
    },
  });

  // Set form values when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName || '',
        email: currentUser?.email || '',
        photoURL: profile.photoURL || '',
      });
      if (profile.photoURL) {
        setAvatarPreview(profile.photoURL);
      }
    }
  }, [profile, currentUser?.email, form]);

  // Handle photo URL changes for preview
  const handlePhotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue('photoURL', url);
    setAvatarPreview(url);
  };

  // Handle form submission
  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      
      // Update user profile
      await updateProfile({
        displayName: data.displayName,
        photoURL: data.photoURL || undefined,
      });
      
      addToast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-muted-foreground">
          Update your profile information and settings
        </p>
      </div>
      
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              This information will be displayed on your profile and shared with other users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="space-y-2 text-center md:text-left">
                <Label htmlFor="photoURL">Profile Picture</Label>
                <div className="relative">
                  <Avatar 
                    className="h-24 w-24" 
                    src={avatarPreview || profile?.photoURL} 
                    alt={profile?.displayName || 'User'}
                    fallback={
                      profile?.displayName
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, GIF or PNG. Max size 2MB
                </p>
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Your name"
                    {...form.register('displayName')}
                    disabled={isSaving}
                  />
                  {form.formState.errors.displayName && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.displayName.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="photoURL">Photo URL</Label>
                  <Input
                    id="photoURL"
                    placeholder="https://example.com/photo.jpg"
                    {...form.register('photoURL')}
                    onChange={handlePhotoUrlChange}
                    disabled={isSaving}
                  />
                  {form.formState.errors.photoURL && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.photoURL.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Update your email address and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                {...form.register('email')}
                disabled={isSaving}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Contact support to change your email address for security reasons.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
