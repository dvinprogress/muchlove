"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const tableVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function ComparisonTable() {
  const t = useTranslations("landing.comparison");

  const rows = [
    {
      feature: t("rows.0.feature"),
      written: t("rows.0.written"),
      none: t("rows.0.none"),
      muchLove: t("rows.0.muchLove")
    },
    {
      feature: t("rows.1.feature"),
      written: t("rows.1.written"),
      none: t("rows.1.none"),
      muchLove: t("rows.1.muchLove")
    },
    {
      feature: t("rows.2.feature"),
      written: t("rows.2.written"),
      none: t("rows.2.none"),
      muchLove: t("rows.2.muchLove")
    },
    {
      feature: t("rows.3.feature"),
      written: t("rows.3.written"),
      none: t("rows.3.none"),
      muchLove: t("rows.3.muchLove")
    },
    {
      feature: t("rows.4.feature"),
      written: t("rows.4.written"),
      none: t("rows.4.none"),
      muchLove: t("rows.4.muchLove")
    },
    {
      feature: t("rows.5.feature"),
      written: t("rows.5.written"),
      none: t("rows.5.none"),
      muchLove: t("rows.5.muchLove")
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
          className="overflow-x-auto"
          variants={tableVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <table className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  {t("feature")}
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                  {t("writtenReviews")}
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                  {t("noTestimonials")}
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 bg-rose-50">
                  {t("muchLove")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-slate-200">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-center">
                    {row.written}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-center">
                    {row.none}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 text-center bg-rose-50">
                    {row.muchLove}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
