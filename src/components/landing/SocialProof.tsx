"use client";

import { useTranslations } from "next-intl";

export function SocialProof() {
  const t = useTranslations("landing.socialProof");

  const benefits = [
    {
      valueKey: "stats.time.value",
      labelKey: "stats.time.label",
    },
    {
      valueKey: "stats.duration.value",
      labelKey: "stats.duration.label",
    },
    {
      valueKey: "stats.authentic.value",
      labelKey: "stats.authentic.label",
    },
  ];

  return (
    <section className="border-y border-slate-100 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            {t("title")}
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-rose-500 sm:text-5xl">
                {t(benefit.valueKey as any)}
              </div>
              <div className="mt-2 text-base font-medium text-slate-600 sm:text-lg">
                {t(benefit.labelKey as any)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
