"use client"

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

interface DashboardShellProps {
  user: {
    email: string
  }
  company: {
    name: string
    plan: string
  } | null
  children: React.ReactNode
}

export function DashboardShell({ user, company, children }: DashboardShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex">
      {/* Sidebar desktop */}
      <Sidebar user={user} company={company} currentPath={pathname} />

      {/* Main content */}
      <main className="flex-1 min-h-screen bg-slate-50 pl-0 md:pl-64">
        <div className="max-w-6xl mx-auto p-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile navigation */}
      <MobileNav currentPath={pathname} />
    </div>
  )
}
