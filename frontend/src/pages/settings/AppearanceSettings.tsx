import { useTheme } from '@/components/theme-provider';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { profile, updatePreferences, loading } = useUserProfile();
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with profile preferences
  useEffect(() => {
    if (profile?.preferences?.theme) {
      setSelectedTheme(profile.preferences.theme);
    }
  }, [profile]);

  const handleThemeChange = async (newTheme: string) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    
    try {
      setIsSaving(true);
      await updatePreferences({
        theme: newTheme,
      });
    } catch (error) {
      console.error('Failed to update theme preference:', error);
      // Revert on error
      setSelectedTheme(theme);
      setTheme(theme);
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
        <h2 className="text-2xl font-bold">Appearance</h2>
        <p className="text-muted-foreground">
          Customize the appearance of the application
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Select a theme for the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedTheme} 
            onValueChange={handleThemeChange}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="light" id="light" className="peer sr-only" />
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-[#e0e0e0]" />
                  <span>Light</span>
                </div>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-[#2d2d2d]" />
                  <span>Dark</span>
                </div>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem value="system" id="system" className="peer sr-only" />
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-[#e0e0e0] to-[#2d2d2d]" />
                  <span>System</span>
                </div>
              </Label>
            </div>
          </RadioGroup>
          
          {isSaving && (
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving changes...
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Density</CardTitle>
          <CardDescription>
            Adjust the spacing and size of UI elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="density">UI Density</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust the spacing and size of UI elements
                </p>
              </div>
              <select
                id="density"
                className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
