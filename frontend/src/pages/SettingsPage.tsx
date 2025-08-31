import React from 'react';
import { useLocation, Outlet, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Globe, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

const settingsNav = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
    description: 'Update your profile information',
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Lock,
    description: 'Change password and security settings',
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Manage your notification preferences',
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: Palette,
    description: 'Customize the look and feel',
  },
  {
    title: 'Language & Region',
    href: '/settings/language',
    icon: Globe,
    description: 'Set your preferred language and region',
  },
];

export default function SettingsPage() {
  const location = useLocation();
  const isNestedRoute = location.pathname !== '/settings';

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-0">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "w-64 border-r bg-background/95 p-4 transition-all duration-300 ease-in-out",
          isNestedRoute ? "hidden md:block" : "w-full md:w-64"
        )}>
          <ScrollArea className="h-full">
            <nav className="space-y-1">
              {settingsNav.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    'w-full justify-between h-auto py-3',
                    location.pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50',
                  )}
                >
                  <Link to={item.href}>
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </Button>
              ))}
            </nav>
          </ScrollArea>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {isNestedRoute ? (
            <div className="space-y-6">
              <Button 
                variant="ghost" 
                asChild 
                className="md:hidden -ml-2 mb-4"
              >
                <Link to="/settings">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to settings
                </Link>
              </Button>
              <Outlet />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="max-w-md space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-muted-foreground">
                  Select a setting from the sidebar to get started
                </p>
                <p className="text-sm text-muted-foreground">
                  On mobile, tap the menu button in the top-left corner to navigate between settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
