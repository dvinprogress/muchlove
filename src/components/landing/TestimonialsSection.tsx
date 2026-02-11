"use client";

import { Quote, Star } from "lucide-react";
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

export default function TestimonialsSection() {
  const t = useTranslations("landing.testimonials");

  const testimonials = [
    {
      quote: t("items.0.quote"),
      name: t("items.0.name"),
      role: t("items.0.role"),
      company: t("items.0.company")
    },
    {
      quote: t("items.1.quote"),
      name: t("items.1.name"),
      role: t("items.1.role"),
      company: t("items.1.company")
    },
    {
      quote: t("items.2.quote"),
      name: t("items.2.name"),
      role: t("items.2.role"),
      company: t("items.2.company")
    }
  ];

  return (
    <section className="bg-white py-20 md:py-28">
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
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition"
              variants={cardVariants}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <Quote className="w-10 h-10 text-rose-300 mb-4" />

              <p className="text-slate-700 italic text-lg mb-6">
                {testimonial.quote}
              </p>

              <div className="border-t border-slate-100 pt-4">
                <p className="font-semibold text-slate-900">
                  {testimonial.name}
                </p>
                <p className="text-slate-500 text-sm">
                  {testimonial.role}
                </p>
                <p className="text-slate-500 text-sm">
                  {testimonial.company}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
