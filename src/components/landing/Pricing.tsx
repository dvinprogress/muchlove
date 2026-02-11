"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function Pricing() {
  const t = useTranslations("landing.pricing");
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: t("plans.free.name"),
      price: "0€",
      description: t("plans.free.description"),
      features: [
        t("plans.free.features.0"),
        t("plans.free.features.1"),
        t("plans.free.features.2"),
        t("plans.free.features.3"),
        t("plans.free.features.4"),
        t("plans.free.features.5")
      ],
      cta: t("plans.free.cta"),
      highlighted: false,
      variant: "border"
    },
    {
      name: t("plans.pro.name"),
      price: isYearly ? "23€" : "29€",
      description: t("plans.pro.description"),
      features: [
        t("plans.pro.features.0"),
        t("plans.pro.features.1"),
        t("plans.pro.features.2"),
        t("plans.pro.features.3"),
        t("plans.pro.features.4"),
        t("plans.pro.features.5"),
        t("plans.pro.features.6"),
        t("plans.pro.features.7")
      ],
      cta: t("plans.pro.cta"),
      highlighted: true,
      variant: "primary"
    },
    {
      name: t("plans.enterprise.name"),
      price: t("plans.enterprise.price"),
      description: t("plans.enterprise.description"),
      features: [
        t("plans.enterprise.features.0"),
        t("plans.enterprise.features.1"),
        t("plans.enterprise.features.2"),
        t("plans.enterprise.features.3"),
        t("plans.enterprise.features.4"),
        t("plans.enterprise.features.5")
      ],
      cta: t("plans.enterprise.cta"),
      highlighted: false,
      variant: "dark"
    }
  ];

  return (
    <section id="pricing" className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto text-center mt-4">
            {t("subtitle")}
          </p>

          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                !isYearly
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isYearly
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t("yearly")}
              <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                {t("yearlyDiscount")}
              </span>
            </button>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`rounded-2xl p-8 relative ${
                plan.variant === "primary"
                  ? "bg-white border-2 border-rose-500 shadow-xl"
                  : plan.variant === "dark"
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200"
              }`}
              variants={cardVariants}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-rose-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Populaire
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold ${plan.variant === "dark" ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className={`text-4xl font-bold ${plan.variant === "dark" ? "text-white" : "text-slate-900"}`}>
                    {plan.price}
                  </span>
                  {plan.price.includes("€") && (
                    <span className={`text-sm ${plan.variant === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                      {t("perMonth")}
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-2 ${plan.variant === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.variant === "dark" ? "text-emerald-400" : "text-emerald-500"}`} />
                    <span className={`text-sm ${plan.variant === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.variant === "dark" ? "mailto:contact@muchlove.app" : "/login"}
                className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition ${
                  plan.variant === "primary"
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : plan.variant === "dark"
                    ? "border-2 border-white text-white hover:bg-white hover:text-slate-900"
                    : "border-2 border-rose-500 text-rose-500 hover:bg-rose-50"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
