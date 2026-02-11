"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MessageSquareOff, VideoOff, Shuffle } from "lucide-react";

export default function ProblemSection() {
  const t = useTranslations("landing.problem");

  const problems = [
    {
      icon: MessageSquareOff,
      titleKey: "items.0.title",
      descriptionKey: "items.0.description",
    },
    {
      icon: VideoOff,
      titleKey: "items.1.title",
      descriptionKey: "items.1.description",
    },
    {
      icon: Shuffle,
      titleKey: "items.2.title",
      descriptionKey: "items.2.description",
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
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
  };

  return (
    <section id="problem" className="py-20 md:py-28">
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
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {t(problem.titleKey as any)}
                </h3>
                <p className="text-slate-600">
                  {t(problem.descriptionKey as any)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
