const benefits = [
  {
    value: "3 minutes",
    label: "pour créer votre première campagne",
  },
  {
    value: "30s - 2min",
    label: "la durée idéale d'un témoignage",
  },
  {
    value: "100% authentique",
    label: "des témoignages vidéo réels",
  },
];

export function SocialProof() {
  return (
    <section className="border-y border-slate-100 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Simple, rapide, authentique
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-rose-500 sm:text-5xl">
                {benefit.value}
              </div>
              <div className="mt-2 text-base font-medium text-slate-600 sm:text-lg">
                {benefit.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
