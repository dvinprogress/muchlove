"use client";

import { Check, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

const leftVariants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 }
};

const rightVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 }
};

export default function WidgetShowcase() {
  const t = useTranslations("landing.showcase");

  const features = [
    t("feature0"),
    t("feature1"),
    t("feature2")
  ];

  return (
    <section id="widget" className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto text-center mt-4">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={leftVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              {t("featureTitle")}
            </h3>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-xl p-6 mb-6">
              <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`<script src="https://muchlove.app/widget/muchlove-widget.js"
  data-api-key="wgt_your_api_key"></script>`}</code>
              </pre>
            </div>

            <Link
              href="/login"
              className="inline-block text-rose-500 underline hover:text-rose-600 transition"
            >
              {t("cta")}
            </Link>
          </motion.div>

          <motion.div
            variants={rightVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-slate-900">Customer Testimonials</h4>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-amber-500/20" />
                        <Play className="w-6 h-6 text-slate-600 relative z-10" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">Sarah K.</p>
                        <p className="text-slate-500 text-xs truncate">"Best decision we made for our..."</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
