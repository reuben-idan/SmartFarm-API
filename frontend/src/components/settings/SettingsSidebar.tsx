import { NavLink, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Globe, 
  ChevronRight
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

export function SettingsSidebar() {
  const location = useLocation();
  
  return (
    <nav className="space-y-1">
      <h2 className="mb-4 text-lg font-semibold">Settings</h2>
      {settingsNav.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'flex items-center justify-between rounded-lg p-3 transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50',
            )
          }
        >
          <div className="flex items-center space-x-3">
            <item.icon className="h-5 w-5" />
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-xs">{item.description}</div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </NavLink>
      ))}
    </nav>
  );
}
