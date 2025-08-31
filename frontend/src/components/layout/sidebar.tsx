import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { 
  X, 
  LayoutDashboard, 
  Users, 
  Sprout, 
  Truck, 
  LineChart as LineChartIcon, 
  Lightbulb, 
  FileBarChart2,
  Calendar,
  Settings,
  User,
  LogOut,
  ChevronDown
} from "lucide-react"
import smartfarmLogo from "@/components/smartfarmlogo.png"
import datahaullogo from "@/assets/datahaullogo.svg"
import { useUserProfile } from "@/contexts/UserProfileContext"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    mobileOnly: false
  },
  {
    title: "Farmers",
    href: "/farmers",
    icon: Users,
    mobileOnly: false
  },
  {
    title: "Crops",
    href: "/crops",
    icon: Sprout,
    mobileOnly: false
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Truck,
    mobileOnly: false
  },
  {
    title: "Market Prices",
    href: "/prices",
    icon: LineChartIcon,
    mobileOnly: false
  },
  {
    title: "Recommendations",
    href: "/recommendations",
    icon: Lightbulb,
    mobileOnly: false
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileBarChart2,
    mobileOnly: false
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
    mobileOnly: true
  }
]

type SidebarProps = {
  className?: string
  isMobileOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ className, isMobileOpen = false, onClose }: SidebarProps) {
  const location = useLocation()
  const pathname = location.pathname
  const isMobile = window.innerWidth < 768
  const { profile } = useUserProfile()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isProfileExpanded, setIsProfileExpanded] = useState(false)
  
  const getInitials = (name?: string, email?: string) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/40 bg-background/95 backdrop-blur-md transition-transform duration-300 ease-in-out",
        className,
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
      style={{
        // @ts-ignore
        '--tw-backdrop-blur': 'blur(12px)',
      }}
    >
      <div className="flex flex-col border-b border-border/40 px-4 py-3">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center space-x-2">
            <img 
              src={smartfarmLogo} 
              alt="SmartFarm Logo" 
              className="h-8 w-auto" 
            />
            <span className="text-lg font-semibold">SmartFarm</span>
          </NavLink>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <div className="mt-2 flex items-center space-x-2 border-t border-border/30 pt-2">
          <span className="text-xs text-muted-foreground">Powered by</span>
          <img 
            src={datahaullogo} 
            alt="DataHaul" 
            className="h-4 w-auto opacity-80 hover:opacity-100 transition-opacity" 
          />
        </div>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-1">
          <nav className="space-y-1">
            {sidebarItems
              .filter((item) => !item.mobileOnly || isMobile)
              .map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors mx-2',
                      isActive || pathname.startsWith(`${item.href}/`)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                      'justify-start'
                    )
                  }
                  onClick={onClose}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
          </nav>
        </div>
      </ScrollArea>

      {/* Profile section */}
      <div className="border-t p-4 space-y-1">
        <div 
          className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 cursor-pointer"
          onClick={() => setIsProfileExpanded(!isProfileExpanded)}
        >
          <div className="flex items-center space-x-3">
            <Avatar 
              className="h-8 w-8"
              src={profile?.photoURL}
              alt={profile?.displayName || 'User'}
              fallback={getInitials(profile?.displayName, profile?.email)}
            />
            <div className="text-sm font-medium">
              <div className="truncate max-w-[150px]">{profile?.displayName || 'User'}</div>
              <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                {profile?.email || 'user@example.com'}
              </div>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isProfileExpanded ? 'rotate-180' : ''}`} />
        </div>

        {isProfileExpanded && (
          <div className="mt-2 space-y-1 pl-4">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                  'justify-start'
                )
              }
              onClick={onClose}
            >
              <User className="mr-3 h-4 w-4" />
              <span>View Profile</span>
            </NavLink>
            <NavLink
              to="/settings/profile"
              className={({ isActive }) =>
                cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                  'justify-start'
                )
              }
              onClick={onClose}
            >
              <Settings className="mr-3 h-4 w-4" />
              <span>Settings</span>
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-colors justify-start"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
