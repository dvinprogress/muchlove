import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <div className="text-xl font-bold text-rose-500">MuchLove</div>
            <p className="mt-2 text-sm text-slate-600">
              © 2026 MuchLove. Tous droits réservés.
            </p>
          </div>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-slate-600 transition-colors hover:text-rose-500"
            >
              Conditions
            </Link>
            <Link
              href="#"
              className="text-sm text-slate-600 transition-colors hover:text-rose-500"
            >
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
