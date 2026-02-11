"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Heart, Star } from "lucide-react";

export default function HeroSection() {
  const t = useTranslations("landing.hero");

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/50 via-white to-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex">
              <div className="rounded-full bg-rose-100 px-4 py-1.5 text-xs font-medium text-rose-800">
                {t("badge")}
              </div>
            </motion.div>

            {/* H1 - THE ONLY H1 */}
            <motion.h1
              variants={itemVariants}
              className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              <span className="block text-slate-900">{t("titleLine1")}</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-600">
                {t("titleLine2")}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0"
            >
              {t("subtitle")}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-rose-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-rose-600 hover:scale-105"
              >
                {t("ctaPrimary")}
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border-2 border-slate-300 px-8 py-4 text-base font-semibold text-slate-700 transition-colors hover:border-rose-500 hover:text-rose-500"
              >
                {t("ctaDemo")}
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex items-center justify-center lg:justify-start gap-3"
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-rose-400 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-300 to-purple-400 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-blue-400 border-2 border-white" />
              </div>
              <p className="text-sm text-slate-600">{t("trusted")}</p>
            </motion.div>
          </div>

          {/* Right: Mockup */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            {/* Video interface mockup */}
            <div className="relative rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 rotate-2 hover:rotate-0 transition-transform duration-300">
              {/* Top bar - fake controls */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>

              {/* Video area */}
              <div className="relative aspect-video rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-200 via-amber-200 to-purple-200 opacity-50" />
                <div className="relative w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 w-3/4 rounded-full" />
              </div>

              {/* Record button */}
              <div className="mt-4 flex justify-center">
                <div className="w-12 h-12 rounded-full bg-red-500 shadow-lg" />
              </div>
            </div>

            {/* Floating decorations */}
            <motion.div
              className="absolute -top-4 -right-4 text-rose-400"
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Heart className="w-8 h-8 fill-rose-200" />
            </motion.div>
            <motion.div
              className="absolute -bottom-3 -left-3 text-amber-400"
              animate={{ y: [5, -5, 5] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <Star className="w-6 h-6 fill-amber-200" />
            </motion.div>
            <motion.div
              className="absolute top-1/2 -left-6 text-purple-400"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            >
              <Star className="w-5 h-5 fill-purple-200" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
