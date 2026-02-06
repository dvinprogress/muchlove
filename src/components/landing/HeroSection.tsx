"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Transformez vos clients satisfaits en{" "}
            <span className="text-rose-500">ambassadeurs</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
            Collectez des témoignages vidéo authentiques en quelques clics.
            Boostez votre crédibilité et convertissez plus de prospects.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-rose-600 hover:scale-105"
            >
              Commencer gratuitement
            </Link>
            <button className="inline-flex items-center justify-center rounded-lg border-2 border-slate-300 px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50">
              Voir une démo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
