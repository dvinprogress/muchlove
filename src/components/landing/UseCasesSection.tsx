"use client";

import { Monitor, ShoppingBag, Briefcase, GraduationCap } from "lucide-react";
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

export default function UseCasesSection() {
  const t = useTranslations("landing.useCases");

  const useCases = [
    {
      icon: Monitor,
      bgColor: "bg-blue-50",
      textColor: "text-blue-500",
      title: t("items.0.title"),
      description: t("items.0.description")
    },
    {
      icon: ShoppingBag,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-500",
      title: t("items.1.title"),
      description: t("items.1.description")
    },
    {
      icon: Briefcase,
      bgColor: "bg-purple-50",
      textColor: "text-purple-500",
      title: t("items.2.title"),
      description: t("items.2.description")
    },
    {
      icon: GraduationCap,
      bgColor: "bg-amber-50",
      textColor: "text-amber-500",
      title: t("items.3.title"),
      description: t("items.3.description")
    }
  ];

  return (
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto text-center mt-4">
            {t("subtitle")}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300"
                variants={cardVariants}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${useCase.bgColor}`}>
                  <Icon className={`w-6 h-6 ${useCase.textColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mt-4">
                  {useCase.title}
                </h3>
                <p className="text-slate-600 mt-2">
                  {useCase.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
