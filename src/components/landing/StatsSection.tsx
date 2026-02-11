"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function StatsSection() {
  const t = useTranslations("landing.stats");

  const stats = [
    {
      valueKey: "items.0.value",
      labelKey: "items.0.label",
    },
    {
      valueKey: "items.1.value",
      labelKey: "items.1.label",
    },
    {
      valueKey: "items.2.value",
      labelKey: "items.2.label",
    },
    {
      valueKey: "items.3.value",
      labelKey: "items.3.label",
    },
  ];

  const containerVariants = {
    initial: { opacity: 0 },
    whileInView: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
  };

  return (
    <section className="bg-rose-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
            {t("title")}
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-rose-600">
                {t(stat.valueKey as any)}
              </div>
              <div className="text-sm md:text-base text-slate-600 mt-2">
                {t(stat.labelKey as any)}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
