"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, Video, Settings, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { signOut } from '@/app/auth/actions'
import { useTranslations } from 'next-intl'

interface SidebarProps {
  user: {
    email: string
  }
  company: {
    name: string
    plan: string
  } | null
  currentPath: string
}

const navItemKeys = [
  { key: 'dashboard' as const, href: '/dashboard', icon: LayoutDashboard },
  { key: 'contacts' as const, href: '/dashboard/contacts', icon: Users },
  { key: 'testimonials' as const, href: '/dashboard/testimonials', icon: Video },
  { key: 'settings' as const, href: '/dashboard/settings', icon: Settings },
]

export function Sidebar({ user, company, currentPath }: SidebarProps) {
  const router = useRouter()
  const t = useTranslations('dashboard.sidebar')

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  // Suppression warning: handleSignOut sera utilisé plus tard
  void handleSignOut

  return (
    <aside className="hidden md:flex md:flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-rose-500">MuchLove</h1>
          {company && (
            <Badge variant="default" className="text-xs">
              {company.plan}
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItemKeys.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative block"
            >
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-r"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5" />
                <span className="font-medium">{t(item.key)}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User info & logout */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <div className="px-2">
          <p className="text-sm font-medium text-slate-900 truncate">
            {company?.name || t('myCompany')}
          </p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <LanguageSwitcher variant="compact" className="mx-auto" />
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('signOut')}</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
