"use client";

import { UserPlus, Video, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  const steps = [
    {
      icon: UserPlus,
      titleKey: "steps.invite.title",
      descriptionKey: "steps.invite.description",
    },
    {
      icon: Video,
      titleKey: "steps.record.title",
      descriptionKey: "steps.record.description",
    },
    {
      icon: Share2,
      titleKey: "steps.share.title",
      descriptionKey: "steps.share.description",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {t("subtitle")}
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
                  <Icon className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  {t(step.titleKey as any)}
                </h3>
                <p className="mt-2 text-slate-600">{t(step.descriptionKey as any)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
