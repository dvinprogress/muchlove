const stats = [
  {
    value: "500+",
    label: "entreprises",
  },
  {
    value: "10 000+",
    label: "témoignages",
  },
  {
    value: "4.8/5",
    label: "satisfaction",
  },
];

export function SocialProof() {
  return (
    <section className="border-y border-slate-100 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-rose-500 sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-base font-medium text-slate-600 sm:text-lg">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
