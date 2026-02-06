"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useState, useTransition, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe } from "lucide-react";

type Locale = "en" | "fr" | "es";

type LanguageSwitcherProps = {
  variant?: "default" | "compact";
  className?: string;
};

const languages: Record<
  Locale,
  { code: string; label: string; flag: string }
> = {
  en: { code: "EN", label: "English", flag: "🇬🇧" },
  fr: { code: "FR", label: "Français", flag: "🇫🇷" },
  es: { code: "ES", label: "Español", flag: "🇪🇸" },
};

export function LanguageSwitcher({
  variant = "default",
  className = "",
}: LanguageSwitcherProps) {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLocaleChange = (locale: Locale) => {
    setIsOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };

  const currentLanguage = languages[currentLocale];
  const isCompact = variant === "compact";

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          transition-colors
          ${
            isPending
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-slate-100 active:bg-slate-200"
          }
          ${isCompact ? "text-sm" : "text-sm"}
        `}
        aria-label="Change language"
      >
        {isCompact ? (
          <>
            <Globe className="w-4 h-4 text-slate-600" />
            <span className="text-slate-700 font-medium">
              {currentLanguage.code}
            </span>
          </>
        ) : (
          <>
            <span className="text-lg">{currentLanguage.flag}</span>
            <span className="text-slate-700 font-medium">
              {currentLanguage.code}
            </span>
          </>
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`
              absolute top-full mt-2 right-0 z-50
              bg-white border border-slate-200 rounded-lg shadow-lg
              overflow-hidden
              ${isCompact ? "min-w-[120px]" : "min-w-[150px]"}
            `}
          >
            {(Object.keys(languages) as Locale[]).map((locale) => {
              const lang = languages[locale];
              const isActive = locale === currentLocale;

              return (
                <button
                  key={locale}
                  onClick={() => handleLocaleChange(locale)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3
                    text-left transition-colors
                    ${
                      isActive
                        ? "bg-rose-50 text-rose-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  {!isCompact && <span className="text-lg">{lang.flag}</span>}
                  <div className="flex-1">
                    <span className="text-sm">{lang.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="w-2 h-2 rounded-full bg-rose-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
