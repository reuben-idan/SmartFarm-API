import * as React from "react"
import { Search, Bell, User, ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TopNav() {
  return (
    <header className="glass sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-white/5 px-6 backdrop-blur">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-white">SmartFarm Dashboard</h1>
      </div>
      
      <div className="flex flex-1 items-center justify-between px-4 md:justify-end md:space-x-4">
        <div className="w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-full border-0 bg-white/10 pl-10 text-white placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5 text-slate-300" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 rounded-full border border-white/10 px-3 hover:bg-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden text-sm font-medium text-white md:inline-flex">
                  Admin User
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" sideOffset={10}>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="cursor-pointer text-red-500 hover:!bg-red-500/10 hover:!text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
