import * as React from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Farmers", href: "/farmers", icon: "Users" },
  { name: "Crops", href: "/crops", icon: "Sprout" },
  { name: "Suppliers", href: "/suppliers", icon: "Truck" },
  { name: "Market Prices", href: "/market-prices", icon: "LineChart" },
  { name: "Recommendations", href: "/recommendations", icon: "Lightbulb" },
  { name: "Yield Forecast", href: "/yield-forecast", icon: "BarChart3" },
  { name: "Help Desk", href: "/help-desk", icon: "HelpCircle" },
  { name: "Reports", href: "/reports", icon: "FileText" },
  { name: "Settings", href: "/settings", icon: "Settings" },
]

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = React.useState(false)
  
  return (
    <>
      <div className={cn("hidden md:block", className)}>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = require(`lucide-react`)[item.icon] || null
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white",
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-slate-300 hover:text-white"
                      )
                    }
                  >
                    {Icon && <Icon className="mr-3 h-5 w-5" />}
                    {item.name}
                  </NavLink>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-slate-900/95 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white">SmartFarm</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-65px)] p-3">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = require(`lucide-react`)[item.icon] || null
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white",
                          isActive
                            ? "bg-white/20 text-white"
                            : "text-slate-300 hover:text-white"
                        )
                      }
                    >
                      {Icon && <Icon className="mr-3 h-5 w-5" />}
                      {item.name}
                    </NavLink>
                  )
                })}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
