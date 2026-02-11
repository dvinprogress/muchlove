"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { UserPlus, Video, Share2, LayoutGrid } from "lucide-react";

export default function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  const steps = [
    {
      icon: UserPlus,
      titleKey: "steps.0.title",
      descriptionKey: "steps.0.description",
    },
    {
      icon: Video,
      titleKey: "steps.1.title",
      descriptionKey: "steps.1.description",
    },
    {
      icon: Share2,
      titleKey: "steps.2.title",
      descriptionKey: "steps.2.description",
    },
    {
      icon: LayoutGrid,
      titleKey: "steps.3.title",
      descriptionKey: "steps.3.description",
    },
  ];

  const containerVariants = {
    initial: { opacity: 0 },
    whileInView: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, x: -30 },
    whileInView: { opacity: 1, x: 0 },
  };

  return (
    <section id="how-it-works" className="bg-slate-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto text-center mt-4">
            {t("subtitle")}
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16"
        >
          {/* Desktop: horizontal layout */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <div className="relative">
                    {/* Connecting line */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-6 left-1/2 w-full h-0.5 border-t-2 border-dashed border-slate-300 z-0" />
                    )}

                    {/* Step content */}
                    <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">
                        {t(step.titleKey as any)}
                      </h3>
                      <p className="text-sm text-slate-600 text-center">
                        {t(step.descriptionKey as any)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile: vertical layout */}
          <div className="md:hidden space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {t(step.titleKey as any)}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600">
                          {t(step.descriptionKey as any)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Connecting line for mobile */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-full w-0.5 h-6 border-l-2 border-dashed border-slate-300" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
