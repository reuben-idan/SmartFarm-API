"use client"

import * as React from "react"
import { Bell, Sun, Moon, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/utils"
import { useTheme } from "next-themes"
import { UserNav } from "@/components/user-nav"

interface TopNavProps {
  isMobileMenuOpen?: boolean
  onMenuClick?: () => void
  className?: string
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function TopNav({ 
  isMobileMenuOpen = false, 
  onMenuClick,
  className,
  user
}: TopNavProps) {
  const { theme, setTheme } = useTheme()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)

  // Handle scroll effect for the header
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header 
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center bg-background/80 px-4 backdrop-blur-sm transition-all duration-200 supports-[backdrop-filter]:bg-background/60 md:px-6",
        isScrolled && "shadow-sm",
        className
      )}
    >
      {/* Mobile menu button - hidden on desktop */}
      <button
        onClick={onMenuClick}
        className="mr-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground md:hidden"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center justify-between gap-4 md:gap-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search farmers, crops, suppliers..."
              className="w-full rounded-full bg-muted/50 pl-9 pr-4 transition-all focus:bg-background focus:ring-1 focus:ring-primary/50"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>
          
          <div className="ml-2">
            <UserNav user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
