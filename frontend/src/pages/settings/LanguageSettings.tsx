import { useUserProfile } from '@/contexts/UserProfileContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
];

const regions = [
  { code: 'US', name: 'United States', emoji: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'CA', name: 'Canada', emoji: '🇨🇦' },
  { code: 'AU', name: 'Australia', emoji: '🇦🇺' },
  { code: 'DE', name: 'Germany', emoji: '🇩🇪' },
  { code: 'FR', name: 'France', emoji: '🇫🇷' },
  { code: 'JP', name: 'Japan', emoji: '🇯🇵' },
  { code: 'KR', name: 'South Korea', emoji: '🇰🇷' },
  { code: 'CN', name: 'China', emoji: '🇨🇳' },
  { code: 'IN', name: 'India', emoji: '🇮🇳' },
  { code: 'BR', name: 'Brazil', emoji: '🇧🇷' },
  { code: 'RU', name: 'Russia', emoji: '🇷🇺' },
];

export default function LanguageSettings() {
  const { profile, updatePreferences, loading } = useUserProfile();
  const [language, setLanguage] = useState('en');
  const [region, setRegion] = useState('US');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with profile preferences
  useEffect(() => {
    if (profile?.preferences) {
      if (profile.preferences.language) {
        setLanguage(profile.preferences.language);
      }
      if (profile.preferences.region) {
        setRegion(profile.preferences.region);
      }
    }
  }, [profile]);

  const handleLanguageChange = async (value: string) => {
    const previousLanguage = language;
    setLanguage(value);
    
    try {
      setIsSaving(true);
      await updatePreferences({
        language: value,
      });
    } catch (error) {
      console.error('Failed to update language preference:', error);
      // Revert on error
      setLanguage(previousLanguage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegionChange = async (value: string) => {
    const previousRegion = region;
    setRegion(value);
    
    try {
      setIsSaving(true);
      await updatePreferences({
        region: value,
      });
    } catch (error) {
      console.error('Failed to update region preference:', error);
      // Revert on error
      setRegion(previousRegion);
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
        <h2 className="text-2xl font-bold">Language & Region</h2>
        <p className="text-muted-foreground">
          Customize your language and regional settings
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>
            Select your preferred language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language">Display Language</Label>
            <Select 
              value={language} 
              onValueChange={handleLanguageChange}
              disabled={isSaving}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSaving && (
              <p className="text-sm text-muted-foreground flex items-center">
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Saving changes...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Region</CardTitle>
          <CardDescription>
            Set your region for localized content and formatting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="region">Country/Region</Label>
            <Select 
              value={region} 
              onValueChange={handleRegionChange}
              disabled={isSaving}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((reg) => (
                  <SelectItem key={reg.code} value={reg.code}>
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">{reg.emoji}</span>
                      <span>{reg.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This affects date, time, and number formatting
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Date & Time</CardTitle>
          <CardDescription>
            Customize how dates and times are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Date Format</Label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                className="rounded-md border p-3 text-left hover:bg-accent"
              >
                <div className="font-medium">MM/DD/YYYY</div>
                <div className="text-sm text-muted-foreground">12/31/2024</div>
              </button>
              <button
                type="button"
                className="rounded-md border p-3 text-left hover:bg-accent"
              >
                <div className="font-medium">DD/MM/YYYY</div>
                <div className="text-sm text-muted-foreground">31/12/2024</div>
              </button>
              <button
                type="button"
                className="rounded-md border p-3 text-left hover:bg-accent"
              >
                <div className="font-medium">YYYY-MM-DD</div>
                <div className="text-sm text-muted-foreground">2024-12-31</div>
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Time Format</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="rounded-md border p-3 text-left hover:bg-accent"
              >
                <div className="font-medium">12-hour</div>
                <div className="text-sm text-muted-foreground">2:30 PM</div>
              </button>
              <button
                type="button"
                className="rounded-md border p-3 text-left hover:bg-accent"
              >
                <div className="font-medium">24-hour</div>
                <div className="text-sm text-muted-foreground">14:30</div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
