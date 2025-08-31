import { useState, useEffect, ReactNode } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav-new"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Handle scroll effect for the header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transform border-r bg-background transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isScrolled ? 'pt-0' : 'pt-0'
        )}
      >
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top navigation */}
        <TopNav 
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            "sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            isScrolled ? 'shadow-sm' : ''
          )}
        />
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 max-w-7xl">
            {children || <Outlet />}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/30 bg-background/80 py-4 backdrop-blur-md">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} SmartFarm. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </a>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
