"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default function Footer() {
  const t = useTranslations("landing.footer");

  const columns = [
    {
      title: t("productTitle"),
      links: [
        { label: "Fonctionnalités", href: "#features" },
        { label: "Tarifs", href: "#pricing" },
        { label: "Demo", href: "/demo" },
        { label: "Widget", href: "#widget" }
      ]
    },
    {
      title: t("companyTitle"),
      links: [
        { label: "À propos", href: "#" },
        { label: "Blog", href: "#", disabled: true },
        { label: "Carrières", href: "#" }
      ]
    },
    {
      title: t("resourcesTitle"),
      links: [
        { label: "Documentation", href: "#" },
        { label: "Centre d'aide", href: "#" },
        { label: "API", href: "#" }
      ]
    },
    {
      title: t("legalTitle"),
      links: [
        { label: "Conditions", href: "/terms" },
        { label: "Confidentialité", href: "/privacy" },
        { label: "RGPD", href: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16">
          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="font-semibold text-white mb-4">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.disabled ? (
                      <span className="text-slate-500 text-sm cursor-default">
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white transition text-sm block"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="text-xl font-bold text-rose-500 mb-1">MuchLove</div>
            <p className="text-slate-400 text-sm">
              {t("copyright")}
            </p>
          </div>

          <p className="text-slate-500 text-sm italic">
            {t("tagline")}
          </p>

          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
