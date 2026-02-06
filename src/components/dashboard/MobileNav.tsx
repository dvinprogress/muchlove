"use client"

import Link from 'next/link'
import { LayoutDashboard, Users, Video, Settings } from 'lucide-react'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useTranslations } from 'next-intl'

interface MobileNavProps {
  currentPath: string
}

const navItemKeys = [
  { key: 'dashboard' as const, href: '/dashboard', icon: LayoutDashboard },
  { key: 'contacts' as const, href: '/dashboard/contacts', icon: Users },
  { key: 'testimonials' as const, href: '/dashboard/testimonials', icon: Video },
  { key: 'settings' as const, href: '/dashboard/settings', icon: Settings },
]

export function MobileNav({ currentPath }: MobileNavProps) {
  const t = useTranslations('dashboard.sidebar')

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 z-50">
      <div className="flex items-center justify-around py-3">
        {navItemKeys.map((item) => {
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
              <span className="text-xs font-medium">{t(item.key)}</span>
            </Link>
          )
        })}
        <div className="flex flex-col items-center gap-1 px-2 py-1">
          <LanguageSwitcher variant="compact" />
        </div>
      </div>
    </nav>
  )
}
