import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Pour commencer",
    features: [
      "5 vidéos par mois",
      "Lien de partage unique",
      "Stockage 30 jours",
      "Support email",
    ],
    cta: "Commencer",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "29",
    description: "Pour les entreprises",
    features: [
      "100 vidéos par mois",
      "Partage automatique LinkedIn",
      "Stockage illimité",
      "Branding personnalisé",
      "Intégrations Google & Trustpilot",
      "Support prioritaire",
    ],
    cta: "Essai gratuit",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section className="bg-slate-50 py-20 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Des tarifs simples et transparents
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Choisissez le plan qui correspond à vos besoins
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl bg-white p-8 shadow-sm ${
                plan.highlighted
                  ? "border-2 border-rose-500 ring-2 ring-rose-100"
                  : "border border-slate-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex rounded-full bg-rose-500 px-4 py-1 text-sm font-semibold text-white">
                    Populaire
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {plan.description}
                </p>
                <div className="mt-4 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-lg font-semibold text-slate-600">
                    EUR/mois
                  </span>
                </div>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-x-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-rose-500" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/login"
                  className={`block w-full rounded-lg px-6 py-3 text-center text-base font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-rose-500 text-white hover:bg-rose-600"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
