import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.terms');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function TermsPage() {
  const t = await getTranslations('legal.terms');
  const tFooter = await getTranslations('legal.footer');
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-bold text-rose-500 transition-colors hover:text-rose-600"
          >
            MuchLove
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900">
          {t('title')}
        </h1>
        <p className="mt-4 text-sm text-slate-600">
          {t('lastUpdated')}
        </p>

        <div className="prose prose-slate mt-8 max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              1. Objet
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (ci-après les
              "CGU") régissent l'utilisation du service MuchLove (ci-après le
              "Service"), plateforme en ligne permettant la collecte, la gestion
              et le partage de témoignages vidéo clients.
            </p>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Le Service est édité par MuchLove, société en cours
              d'immatriculation (ci-après "MuchLove", "nous", "notre").
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              2. Inscription et Compte Utilisateur
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              L'accès au Service nécessite la création d'un compte utilisateur.
              Vous vous engagez à fournir des informations exactes et à les
              maintenir à jour.
            </p>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Vous êtes responsable de la confidentialité de vos identifiants de
              connexion et de toute activité réalisée depuis votre compte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              3. Utilisation du Service
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Le Service vous permet de :
            </p>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>Créer et gérer des liens d'invitation pour vos clients</li>
              <li>
                Collecter des témoignages vidéo de vos clients via ces liens
              </li>
              <li>Stocker et organiser les témoignages collectés</li>
              <li>
                Partager les témoignages sur vos canaux de communication
              </li>
            </ul>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Vous vous engagez à utiliser le Service de manière légale et
              conforme aux présentes CGU. Sont notamment interdits :
            </p>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>
                L'utilisation du Service pour collecter des contenus illégaux,
                diffamatoires ou portant atteinte aux droits de tiers
              </li>
              <li>
                La tentative d'accès non autorisé à d'autres comptes ou au
                système
              </li>
              <li>
                L'utilisation abusive visant à perturber le fonctionnement du
                Service
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              4. Propriété Intellectuelle
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Le Service, sa structure, son design et son code source sont la
              propriété exclusive de MuchLove et sont protégés par les lois sur
              la propriété intellectuelle.
            </p>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Les témoignages vidéo collectés via le Service restent la propriété
              de leurs auteurs. En utilisant le Service pour collecter des
              témoignages, vous déclarez disposer des autorisations nécessaires
              pour leur collecte et leur utilisation.
            </p>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Vous accordez à MuchLove une licence limitée pour héberger,
              traiter et afficher les contenus téléchargés sur le Service,
              uniquement dans le cadre de la fourniture du Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              5. Données Personnelles
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Le traitement de vos données personnelles est détaillé dans notre{" "}
              <Link
                href="/privacy"
                className="text-rose-500 underline hover:text-rose-600"
              >
                {t('privacyLink')}
              </Link>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              6. Responsabilités
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              MuchLove s'efforce de maintenir le Service accessible et
              fonctionnel, mais ne garantit pas l'absence d'interruptions ou
              d'erreurs.
            </p>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Vous êtes seul responsable :
            </p>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>
                De la légalité et de la licéité des contenus que vous collectez
              </li>
              <li>
                Du respect des droits des personnes dont vous collectez les
                témoignages
              </li>
              <li>
                De l'obtention des consentements nécessaires pour la collecte et
                l'utilisation des témoignages
              </li>
            </ul>
            <p className="mt-4 text-slate-700 leading-relaxed">
              MuchLove ne saurait être tenu responsable de l'usage que vous
              faites des témoignages collectés via le Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              7. Modifications du Service et des CGU
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              MuchLove se réserve le droit de modifier le Service et les
              présentes CGU à tout moment. Les modifications seront notifiées
              par email et prendront effet 15 jours après notification.
            </p>
            <p className="mt-4 text-slate-700 leading-relaxed">
              La poursuite de l'utilisation du Service après l'entrée en vigueur
              des modifications vaut acceptation des nouvelles CGU.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              8. Résiliation
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Vous pouvez résilier votre compte à tout moment depuis les
              paramètres de votre compte.
            </p>
            <p className="mt-4 text-slate-700 leading-relaxed">
              MuchLove se réserve le droit de suspendre ou résilier votre compte
              en cas de violation des présentes CGU, après notification et sans
              préjudice des recours légaux.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              9. Droit Applicable
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Les présentes CGU sont régies par le droit français. Tout litige
              relatif à leur interprétation ou exécution sera soumis aux
              juridictions compétentes françaises.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              10. Contact
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Pour toute question concernant ces CGU, vous pouvez nous contacter
              à l'adresse :{" "}
              <a
                href={`mailto:${t('contactEmail')}`}
                className="text-rose-500 underline hover:text-rose-600"
              >
                {t('contactEmail')}
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-600">
              {tFooter('copyright')}
            </p>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="text-sm text-slate-600 transition-colors hover:text-rose-500"
              >
                {tFooter('terms')}
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-slate-600 transition-colors hover:text-rose-500"
              >
                {tFooter('privacy')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
