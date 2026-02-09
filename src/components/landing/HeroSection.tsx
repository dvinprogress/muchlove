"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Play, Heart, Star } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {t("titlePart1")}{" "}
              <span className="text-rose-500">{t("titlePart2")}</span>
            </h1>
            <p className="mx-auto lg:mx-0 mt-6 max-w-2xl text-xl text-slate-600">
              {t("subtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center lg:items-start justify-center lg:justify-start gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg font-semibold text-white shadow-lg transition-all hover:bg-rose-600 hover:scale-105"
              >
                {t("ctaPrimary")}
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg font-semibold text-white shadow-lg transition-all hover:bg-amber-600 hover:scale-105"
              >
                {t("ctaDemo")}
              </Link>
              <button
                onClick={() => {
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center rounded-lg border-2 border-slate-300 px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                {t("ctaSecondary")}
              </button>
            </div>
          </motion.div>

          {/* Right: Illustration mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Video testimonial card mockup */}
            <div className="relative rounded-2xl bg-white shadow-2xl p-4 border border-slate-100">
              {/* Video area with gradient background */}
              <div className="relative aspect-video rounded-xl bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center overflow-hidden">
                {/* Play button overlay */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-sm"
                >
                  <Play className="w-8 h-8 text-rose-500 ml-1 fill-rose-500" />
                </motion.div>
              </div>

              {/* Quote area */}
              <div className="mt-4 px-2">
                <p className="text-slate-600 italic text-sm">
                  &quot;Amazing product! Helped us increase conversions by 40%&quot;
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-purple-300" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Sarah Chen</p>
                    <p className="text-xs text-slate-500">CEO, TechStart</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating decorative elements */}
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
        </div>
      </div>
    </section>
  );
}
