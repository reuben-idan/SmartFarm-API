import { useUserProfile } from '@/contexts/UserProfileContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function NotificationsSettings() {
  const { profile, updatePreferences, loading } = useUserProfile();
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    marketing: false,
    security: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with profile preferences
  useEffect(() => {
    if (profile?.preferences) {
      setNotificationSettings(prev => ({
        ...prev,
        ...profile.preferences.notifications,
      }));
    }
  }, [profile]);

  const handleToggle = async (key: keyof typeof notificationSettings, value: boolean) => {
    const newSettings = {
      ...notificationSettings,
      [key]: value,
    };
    
    setNotificationSettings(newSettings);
    
    try {
      setIsSaving(true);
      await updatePreferences({
        notifications: newSettings,
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      // Revert on error
      setNotificationSettings(prev => ({
        ...prev,
        [key]: !value,
      }));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-muted-foreground">
          Configure how you receive notifications
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Manage what email notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications about your account
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={notificationSettings.email}
              onCheckedChange={(checked) => handleToggle('email', checked)}
              disabled={isSaving}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and updates
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={notificationSettings.marketing}
              onCheckedChange={(checked) => handleToggle('marketing', checked)}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Security Notifications</CardTitle>
          <CardDescription>
            Important security notifications about your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="security-notifications">Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive important security notifications
              </p>
            </div>
            <Switch
              id="security-notifications"
              checked={notificationSettings.security}
              onCheckedChange={(checked) => handleToggle('security', checked)}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Control push notifications on your devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on your devices
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={notificationSettings.push}
              onCheckedChange={(checked) => handleToggle('push', checked)}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
