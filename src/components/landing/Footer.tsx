"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("landing.footer");

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <div className="text-xl font-bold text-rose-500">{t("logo")}</div>
            <p className="mt-2 text-sm text-slate-600">
              {t("copyright")}
            </p>
          </div>
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-sm text-slate-600 transition-colors hover:text-rose-500"
            >
              {t("terms")}
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-600 transition-colors hover:text-rose-500"
            >
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
