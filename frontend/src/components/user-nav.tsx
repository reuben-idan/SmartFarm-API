import * as React from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LogOut, Settings, ChevronDown, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

// Type for the combined user object that handles both User and optional fields
type CombinedUser = {
  id?: number
  name?: string | null
  email?: string | null
  image?: string | null
  first_name?: string | null
  last_name?: string | null
  role?: string
  token?: string
}

interface UserNavProps {
  className?: string
  user?: CombinedUser
}

export function UserNav({ className, user: userProp }: UserNavProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { user: authUser, logout } = useAuth()
  
  // Combine auth user and prop user, with auth user taking precedence
  const user = React.useMemo<CombinedUser>(() => {
    const authUserName = authUser?.first_name && authUser?.last_name 
      ? `${authUser.first_name} ${authUser.last_name}`.trim()
      : authUser?.first_name || authUser?.email?.split('@')[0] || null

    return {
      ...userProp,
      ...authUser,
      name: authUserName || userProp?.name || null
    }
  }, [authUser, userProp])
  
  const userInitials = React.useMemo(() => {
    if (user?.image) return null; // Return null if there's an image - it will be used as background
    
    // Get display name from the combined user object
    const displayName = user?.name || 
      (user?.first_name || user?.last_name 
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
        : user?.email?.split('@')[0] || '');
    
    if (!displayName) return '?';
    
    // Get initials from display name (first letter of first two words)
    return displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }, [user])
  
  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "group flex h-10 items-center gap-2 rounded-full px-2 transition-colors hover:bg-muted/50",
            className
          )}
        >
          <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 p-0.5">
            {user?.image ? (
              <img 
                src={user.image as string} 
                alt={user.name as string || 'User'} 
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                <span className="text-sm font-medium text-primary">{userInitials}</span>
              </div>
            )}
          </div>
          <span className="hidden text-sm font-medium text-foreground md:inline-flex">
            {user?.name || (
              user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.first_name || user?.email?.split('@')[0] || 'User'
            )}
          </span>
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen ? "rotate-180" : ""
            )} 
          />
        </Button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-56 rounded-lg border border-border/30 bg-background/95 p-2 shadow-lg backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={8}
          align="end"
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">
                {user?.name || 
                 (user?.first_name && user?.last_name 
                   ? `${user.first_name} ${user.last_name}` 
                   : user?.first_name || 
                     user?.email?.split('@')[0] || 
                     'User')}
              </p>
              {user?.email && (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              )}
            </div>
          </DropdownMenu.Label>
          
          <DropdownMenu.Separator className="my-2 h-px bg-border/50" />
          
          <DropdownMenu.Group>
            <DropdownMenu.Item className="flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none hover:bg-muted/50 focus:bg-muted/50">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none hover:bg-muted/50 focus:bg-muted/50">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          
          <DropdownMenu.Separator className="my-2 h-px bg-border/50" />
          
          <DropdownMenu.Item 
            className="flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm text-destructive outline-none hover:bg-destructive/10 focus:bg-destructive/10"
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
