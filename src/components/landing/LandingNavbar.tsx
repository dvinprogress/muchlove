import Link from "next/link";

export function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-rose-500">
            MuchLove
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-rose-500"
            >
              Connexion
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
