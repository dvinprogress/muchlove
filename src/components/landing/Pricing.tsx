"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

export function Pricing() {
  const t = useTranslations("landing.pricing");

  const plans = [
    {
      planKey: "free",
      price: "0",
      features: ["videos", "link", "storage", "support"],
      highlighted: false,
    },
    {
      planKey: "pro",
      price: "29",
      features: ["videos", "linkedin", "storage", "branding", "integrations", "support"],
      highlighted: true,
    },
    {
      planKey: "enterprise",
      price: "99",
      features: ["videos", "linkedin", "storage", "branding", "integrations", "api", "dedicated", "support"],
      highlighted: false,
    },
  ];

  return (
    <section className="bg-slate-50 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {t("subtitle")}
          </p>
        </div>
        <div className="mt-16 grid gap-10 sm:gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.planKey}
              className={`relative rounded-2xl bg-white p-8 shadow-sm ${
                plan.highlighted
                  ? "border-2 border-rose-500 ring-2 ring-rose-100"
                  : "border border-slate-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex rounded-full bg-rose-500 px-4 py-1 text-sm font-semibold text-white">
                    {t("popular")}
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900">
                  {t(`plans.${plan.planKey}.name` as Parameters<typeof t>[0])}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {t(`plans.${plan.planKey}.description` as Parameters<typeof t>[0])}
                </p>
                <div className="mt-4 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-slate-900">
                    ${plan.price}
                  </span>
                  <span className="text-lg font-semibold text-slate-600">
                    {t("perMonth")}
                  </span>
                </div>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-x-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-rose-500" />
                    <span className="text-slate-600">
                      {t(`plans.${plan.planKey}.features.${feature}` as Parameters<typeof t>[0])}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/login"
                  className={`block w-full rounded-lg px-6 py-3 text-center text-base font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-rose-500 text-white hover:bg-rose-600"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {t(`plans.${plan.planKey}.cta` as Parameters<typeof t>[0])}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
