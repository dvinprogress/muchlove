"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Camera, Share2, Code, BarChart3, Globe, Trophy } from "lucide-react";

export default function FeaturesGrid() {
  const t = useTranslations("landing.features");

  const features = [
    {
      icon: Camera,
      titleKey: "items.0.title",
      descriptionKey: "items.0.description",
    },
    {
      icon: Share2,
      titleKey: "items.1.title",
      descriptionKey: "items.1.description",
    },
    {
      icon: Code,
      titleKey: "items.2.title",
      descriptionKey: "items.2.description",
    },
    {
      icon: BarChart3,
      titleKey: "items.3.title",
      descriptionKey: "items.3.description",
    },
    {
      icon: Globe,
      titleKey: "items.4.title",
      descriptionKey: "items.4.description",
    },
    {
      icon: Trophy,
      titleKey: "items.5.title",
      descriptionKey: "items.5.description",
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
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
  };

  return (
    <section id="features" className="bg-white py-20 md:py-28">
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
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg hover:border-rose-200 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mt-4">
                  {t(feature.titleKey as any)}
                </h3>
                <p className="text-slate-600 mt-2">
                  {t(feature.descriptionKey as any)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
