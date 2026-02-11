"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

const fadeInVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function CTASection() {
  const t = useTranslations("landing.cta");

  return (
    <section className="bg-gradient-to-r from-rose-500 to-rose-600 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          variants={fadeInVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {t("title")}
          </h2>
          <p className="text-xl text-rose-100 mt-4 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>

          <Link
            href="/login"
            className="inline-block bg-white text-rose-600 hover:bg-rose-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition mt-8"
          >
            {t("button")}
          </Link>

          <p className="text-rose-200 text-sm mt-4">
            {t("noCard")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
