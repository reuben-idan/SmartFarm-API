import * as React from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-white/10 bg-slate-900/50 backdrop-blur md:block">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-xl font-bold text-white">SmartFarm</h1>
        </div>
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
