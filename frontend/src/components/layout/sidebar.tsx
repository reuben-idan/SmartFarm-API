import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Menu, LayoutDashboard, Users, Sprout, Truck, LineChart as LineChartIcon, Lightbulb, BarChart2, HelpCircle, FileText, Settings } from "lucide-react"

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
    title: "Yield Forecast",
    href: "/yield-forecast",
    icon: BarChart2,
    mobileOnly: true
  },
  {
    title: "Help Desk",
    href: "/help-desk",
    icon: HelpCircle,
    mobileOnly: true
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
    mobileOnly: false
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    mobileOnly: false
  },
]

type SidebarProps = {
  className?: string
  isMobileOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ className, isMobileOpen = false, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const location = useLocation()
  const isMobile = window.innerWidth < 768

  // Filter sidebar items based on device
  const filteredItems = isMobile 
    ? sidebarItems 
    : sidebarItems.filter(item => !item.mobileOnly)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose?.()
    }
  }

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Mobile header */}
      {isMobile && (
        <div className="flex h-16 items-center justify-between border-b border-border/30 px-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SmartFarm
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
      )}

      {/* Desktop header */}
      {!isMobile && (
        <div className="flex h-16 items-center justify-between px-6">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            SmartFarm
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href))
            
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
                onClick={(e) => {
                  if (isMobile) {
                    e.preventDefault()
                    onClose?.()
                    // Small delay to allow the menu to close before navigation
                    setTimeout(() => {
                      window.location.href = item.href
                    }, 200)
                  }
                }}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="ml-3">{item.title}</span>
              </NavLink>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User profile */}
      <div className="border-t border-border/30 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
              <span className="text-sm font-medium text-primary">JD</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Admin</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              // Handle sign out
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
