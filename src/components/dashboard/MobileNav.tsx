"use client"

import Link from 'next/link'
import { LayoutDashboard, Users, Video, Settings } from 'lucide-react'

interface MobileNavProps {
  currentPath: string
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Témoignages', href: '/dashboard/testimonials', icon: Video },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
]

export function MobileNav({ currentPath }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 z-50">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 px-4 py-1 transition-colors
                ${isActive ? 'text-rose-500' : 'text-slate-400'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
