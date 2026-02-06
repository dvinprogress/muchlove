import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — MuchLove",
  description: "Politique de confidentialité et protection des données personnelles de MuchLove.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
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
          Politique de Confidentialité
        </h1>
        <p className="mt-4 text-sm text-slate-600">
          Dernière mise à jour : 6 février 2026
        </p>

        <div className="prose prose-slate mt-8 max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              1. Responsable du Traitement
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              MuchLove, société en cours d'immatriculation, est responsable du
              traitement de vos données personnelles.
            </p>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Contact du Délégué à la Protection des Données :{" "}
              <a
                href="mailto:dpo@muchlove.fr"
                className="text-rose-500 underline hover:text-rose-600"
              >
                dpo@muchlove.fr
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              2. Données Collectées
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Nous collectons les données suivantes :
            </p>

            <h3 className="mt-6 text-xl font-semibold text-slate-900">
              2.1 Données de compte
            </h3>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Nom de votre entreprise</li>
              <li>Identifiant de connexion (Google, LinkedIn)</li>
            </ul>

            <h3 className="mt-6 text-xl font-semibold text-slate-900">
              2.2 Données des témoignages
            </h3>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>Vidéos téléchargées par vos clients</li>
              <li>Nom et prénom de la personne témoignant</li>
              <li>Email de la personne témoignant</li>
              <li>Transcriptions des vidéos</li>
              <li>Métadonnées techniques (date, durée, format)</li>
            </ul>

            <h3 className="mt-6 text-xl font-semibold text-slate-900">
              2.3 Données d'utilisation
            </h3>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>
                Données de navigation (pages visitées, durée, interactions)
              </li>
              <li>Adresse IP et données de connexion</li>
              <li>Type de navigateur et appareil</li>
              <li>Données analytiques (via cookies)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              3. Finalités du Traitement
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Vos données sont traitées pour les finalités suivantes :
            </p>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>
                <strong>Fourniture du service</strong> : gestion de votre compte,
                hébergement des témoignages, génération de liens de partage
              </li>
              <li>
                <strong>Amélioration du service</strong> : analyse d'usage,
                optimisation de l'expérience utilisateur
              </li>
              <li>
                <strong>Support client</strong> : réponse à vos demandes
                d'assistance
              </li>
              <li>
                <strong>Communication</strong> : envoi d'emails transactionnels
                (confirmations, notifications)
              </li>
              <li>
                <strong>Sécurité</strong> : détection et prévention des fraudes,
                sécurisation des accès
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              4. Base Légale du Traitement
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Le traitement de vos données repose sur :
            </p>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>
                <strong>Exécution du contrat</strong> : pour la fourniture du
                service (article 6.1.b du RGPD)
              </li>
              <li>
                <strong>Intérêt légitime</strong> : pour l'amélioration du
                service et la sécurité (article 6.1.f du RGPD)
              </li>
              <li>
                <strong>Consentement</strong> : pour les cookies non essentiels
                (article 6.1.a du RGPD)
              </li>
              <li>
                <strong>Obligation légale</strong> : pour la conservation des
                données de facturation (article 6.1.c du RGPD)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              5. Durée de Conservation
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Nous conservons vos données pour les durées suivantes :
            </p>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>
                <strong>Données de compte</strong> : pendant toute la durée
                d'utilisation du service + 1 an après résiliation
              </li>
              <li>
                <strong>Témoignages vidéo</strong> : jusqu'à suppression par vos
                soins ou résiliation du compte
              </li>
              <li>
                <strong>Données de facturation</strong> : 10 ans (obligation
                légale comptable)
              </li>
              <li>
                <strong>Logs techniques</strong> : 12 mois maximum
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              6. Vos Droits
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>
                <strong>Droit d'accès</strong> : obtenir une copie de vos données
              </li>
              <li>
                <strong>Droit de rectification</strong> : corriger vos données
                inexactes
              </li>
              <li>
                <strong>Droit d'effacement</strong> : supprimer vos données
              </li>
              <li>
                <strong>Droit d'opposition</strong> : vous opposer au traitement
                de vos données
              </li>
              <li>
                <strong>Droit à la limitation</strong> : limiter le traitement de
                vos données
              </li>
              <li>
                <strong>Droit à la portabilité</strong> : recevoir vos données
                dans un format structuré
              </li>
              <li>
                <strong>Droit de retirer votre consentement</strong> : pour les
                traitements basés sur le consentement
              </li>
            </ul>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Pour exercer ces droits, contactez-nous à l'adresse{" "}
              <a
                href="mailto:dpo@muchlove.fr"
                className="text-rose-500 underline hover:text-rose-600"
              >
                dpo@muchlove.fr
              </a>
              . Nous répondrons dans un délai d'un mois.
            </p>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Vous avez également le droit d'introduire une réclamation auprès de
              la CNIL (
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-500 underline hover:text-rose-600"
              >
                www.cnil.fr
              </a>
              ).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              7. Cookies
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Nous utilisons les cookies suivants :
            </p>

            <h3 className="mt-6 text-xl font-semibold text-slate-900">
              7.1 Cookies essentiels
            </h3>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Ces cookies sont nécessaires au fonctionnement du service
              (authentification, sécurité). Ils ne nécessitent pas votre
              consentement.
            </p>

            <h3 className="mt-6 text-xl font-semibold text-slate-900">
              7.2 Cookies analytiques
            </h3>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Ces cookies nous permettent d'analyser l'utilisation du service
              pour l'améliorer. Ils nécessitent votre consentement.
            </p>

            <p className="mt-4 text-slate-700 leading-relaxed">
              Vous pouvez gérer vos préférences de cookies à tout moment depuis
              les paramètres de votre navigateur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              8. Sous-Traitants
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Pour la fourniture du service, nous faisons appel aux sous-traitants
              suivants :
            </p>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>
                <strong>Supabase</strong> (États-Unis) : hébergement de la base
                de données et stockage des vidéos
              </li>
              <li>
                <strong>Vercel</strong> (États-Unis) : hébergement de
                l'application web
              </li>
            </ul>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Ces sous-traitants sont conformes au RGPD et ont signé des clauses
              contractuelles types pour les transferts hors Union Européenne.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              9. Transferts Hors Union Européenne
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Certaines données peuvent être transférées vers les États-Unis
              (Supabase, Vercel). Ces transferts sont encadrés par :
            </p>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>
                Des clauses contractuelles types approuvées par la Commission
                Européenne
              </li>
              <li>
                Des certifications de conformité (EU-US Data Privacy Framework
                pour les prestataires éligibles)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              10. Sécurité des Données
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles
              pour protéger vos données :
            </p>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Chiffrement des données au repos (base de données, stockage)</li>
              <li>Authentification sécurisée (OAuth, magic links)</li>
              <li>
                Contrôles d'accès stricts (Row Level Security sur Supabase)
              </li>
              <li>Sauvegardes régulières</li>
              <li>Surveillance et détection des incidents</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              11. Modifications
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Nous pouvons modifier cette politique de confidentialité à tout
              moment. Les modifications seront notifiées par email et prendront
              effet 15 jours après notification.
            </p>
            <p className="mt-4 text-slate-700 leading-relaxed">
              La version à jour est toujours disponible sur cette page, avec la
              date de dernière mise à jour en en-tête.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              12. Contact
            </h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Pour toute question concernant cette politique ou vos données
              personnelles, contactez-nous :
            </p>
            <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
              <li>
                Email général :{" "}
                <a
                  href="mailto:contact@muchlove.fr"
                  className="text-rose-500 underline hover:text-rose-600"
                >
                  contact@muchlove.fr
                </a>
              </li>
              <li>
                Délégué à la Protection des Données :{" "}
                <a
                  href="mailto:dpo@muchlove.fr"
                  className="text-rose-500 underline hover:text-rose-600"
                >
                  dpo@muchlove.fr
                </a>
              </li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-600">
              © 2026 MuchLove. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="text-sm text-slate-600 transition-colors hover:text-rose-500"
              >
                Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-slate-600 transition-colors hover:text-rose-500"
              >
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
