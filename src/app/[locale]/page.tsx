import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import LogoCloud from '@/components/landing/LogoCloud';
import ProblemSection from '@/components/landing/ProblemSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import HowItWorks from '@/components/landing/HowItWorks';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import UseCasesSection from '@/components/landing/UseCasesSection';
import WidgetShowcase from '@/components/landing/WidgetShowcase';
import ComparisonTable from '@/components/landing/ComparisonTable';
import Pricing from '@/components/landing/Pricing';
import FAQSection from '@/components/landing/FAQSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  // Schema.org JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://muchlove.app/#organization',
        name: 'MuchLove',
        url: 'https://muchlove.app',
        logo: 'https://muchlove.app/icon.png',
        description: 'Video testimonial platform for businesses',
        sameAs: []
      },
      {
        '@type': 'SoftwareApplication',
        name: 'MuchLove',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: 'https://muchlove.app',
        description: 'Collect authentic video testimonials from happy customers. Share on social media and embed on your website.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          description: 'Free plan with 20 video testimonials'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '127',
          bestRating: '5'
        }
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How does MuchLove work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'MuchLove makes collecting video testimonials simple. You invite your happy customers via email, they click a link and record a short video directly in their browser.'
            }
          },
          {
            '@type': 'Question',
            name: 'What video formats are supported?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'MuchLove supports all major video formats including MP4 and WebM. Videos are recorded directly in the browser using standard web technologies.'
            }
          },
          {
            '@type': 'Question',
            name: 'Is MuchLove really free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Our Free plan includes up to 20 video testimonials, a basic embeddable widget, email invitations, and social sharing. No credit card required.'
            }
          },
          {
            '@type': 'Question',
            name: 'How do I embed the widget on my website?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Simply copy one line of JavaScript code from your dashboard and paste it into your website HTML. The widget automatically loads and displays your video testimonials.'
            }
          },
          {
            '@type': 'Question',
            name: 'Is my data secure? Are you GDPR compliant?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Absolutely. MuchLove is fully GDPR compliant. All data is encrypted, stored on European servers, and we never share your data with third parties.'
            }
          },
          {
            '@type': 'Question',
            name: 'In how many languages is MuchLove available?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'MuchLove currently supports English, French, and Spanish. The entire experience is fully translated in all three languages.'
            }
          },
          {
            '@type': 'Question',
            name: 'Can I customize the widget?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Pro users can customize the widget colors, layout, number of testimonials displayed, and even remove the MuchLove branding.'
            }
          },
          {
            '@type': 'Question',
            name: 'How do my customers record their testimonial?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Your customers receive an email with a unique link. They click it, land on a branded page, and record a 30-second to 2-minute video directly in their browser.'
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNavbar />
      <main>
        <HeroSection />
        <LogoCloud />
        <ProblemSection />
        <FeaturesGrid />
        <HowItWorks />
        <StatsSection />
        <TestimonialsSection />
        <UseCasesSection />
        <WidgetShowcase />
        <ComparisonTable />
        <Pricing />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
