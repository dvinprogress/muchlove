"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function LandingNavbar() {
  const t = useTranslations("landing.navbar");

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-rose-500">
            {t("logo")}
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher variant="compact" className="sm:hidden" />
            <LanguageSwitcher className="hidden sm:block" />
            <Link
              href="/login"
              className="hidden sm:inline text-sm font-medium text-slate-700 transition-colors hover:text-rose-500"
            >
              {t("login")}
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-rose-500 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-rose-600"
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
