"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default function LandingNavbar() {
  const t = useTranslations("landing.navbar");
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: t("features"), href: "#features" },
    { label: t("howItWorks"), href: "#how-it-works" },
    { label: t("pricing"), href: "#pricing" },
    { label: t("faq"), href: "#faq" },
  ];

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-rose-500">
            {t("logo")}
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href.slice(1))}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-rose-500"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher variant="compact" />
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-rose-500"
            >
              {t("login")}
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
            >
              {t("getStarted")}
            </Link>
          </div>

          {/* Mobile - Right Section */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-700 hover:text-rose-500 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href.slice(1))}
                  className="text-base font-medium text-slate-700 hover:text-rose-500 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/login"
                className="text-base font-medium text-slate-700 hover:text-rose-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {t("login")}
              </Link>
              <Link
                href="/login"
                className="mt-2 rounded-xl bg-rose-500 px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-rose-600"
                onClick={() => setIsOpen(false)}
              >
                {t("getStarted")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
