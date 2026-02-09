import {
  Text,
  Link,
  Heading,
  Section,
} from '@react-email/components'
import { BaseLayout } from './BaseLayout'

interface FreeMaximizerEmailProps {
  companyName: string
  videosUsed: number
  pendingContacts: number
  dashboardUrl: string
  unsubscribeUrl: string
}

export function FreeMaximizerEmail({
  companyName,
  videosUsed,
  pendingContacts,
  dashboardUrl,
  unsubscribeUrl,
}: FreeMaximizerEmailProps) {
  return (
    <BaseLayout
      preview="🎉 You hit your free plan limit!"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading style={styles.heading}>🎉 You hit your free plan limit!</Heading>

      <Text style={styles.greeting}>Hey {companyName}!</Text>

      <Text style={styles.paragraph}>
        This is actually great news — you&apos;ve used all {videosUsed} video credits on your free
        plan. That means people are responding and you&apos;re building social proof.
      </Text>

      <Section style={styles.statsBox}>
        <Text style={styles.statItem}>
          ✓ {videosUsed} video testimonials collected
        </Text>
        {pendingContacts > 0 && (
          <Text style={styles.statItem}>
            ⏳ {pendingContacts} contact{pendingContacts > 1 ? 's' : ''} waiting to submit videos
          </Text>
        )}
      </Section>

      <Text style={styles.paragraph}>
        <strong>The problem?</strong> You can&apos;t collect more testimonials until you upgrade.
      </Text>

      {pendingContacts > 0 && (
        <Text style={styles.paragraph}>
          And you have <strong>{pendingContacts} people</strong> who are ready to record but
          can&apos;t because you&apos;re at capacity. Don&apos;t lose that momentum!
        </Text>
      )}

      <Text style={styles.paragraph}>Here&apos;s what you get with the Pro plan:</Text>

      <Section style={styles.list}>
        <Text style={styles.listItem}>✓ 100 video testimonials/month (vs 20 on free)</Text>
        <Text style={styles.listItem}>✓ Custom branding (remove &quot;Powered by MuchLove&quot;)</Text>
        <Text style={styles.listItem}>✓ Embeddable widget for your website</Text>
        <Text style={styles.listItem}>✓ Priority support</Text>
      </Section>

      <Section style={styles.promoBox}>
        <Text style={styles.promoText}>
          <strong>Special offer: Use code MOMENTUM for 20% off your first 3 months</strong>
        </Text>
      </Section>

      <Section style={styles.cta}>
        <Link href={`${dashboardUrl}/settings#billing`} style={styles.button}>
          Upgrade now — 20% off with code MOMENTUM →
        </Link>
      </Section>

      <Text style={styles.signature}>
        Let&apos;s keep that momentum going!
      </Text>

      <Text style={styles.footnote}>
        P.S. Not ready to upgrade? No worries. Your existing testimonials are safe and you can still
        access them anytime.
      </Text>
    </BaseLayout>
  )
}

const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    marginBottom: '20px',
    lineHeight: '1.3',
  },
  greeting: {
    fontSize: '16px',
    color: '#1a1a2e',
    marginBottom: '16px',
  },
  paragraph: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  statsBox: {
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px',
    marginBottom: '20px',
  },
  statItem: {
    fontSize: '16px',
    color: '#1a1a2e',
    lineHeight: '1.8',
    marginBottom: '8px',
    fontWeight: '500' as const,
  },
  list: {
    marginTop: '16px',
    marginBottom: '24px',
  },
  listItem: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '1.8',
    marginBottom: '8px',
    paddingLeft: '20px',
  },
  promoBox: {
    backgroundColor: '#fffbeb',
    border: '2px solid #FFBF00',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '24px',
    marginBottom: '24px',
    textAlign: 'center' as const,
  },
  promoText: {
    fontSize: '18px',
    color: '#1a1a2e',
    margin: '0',
    lineHeight: '1.5',
  },
  cta: {
    textAlign: 'center' as const,
    marginTop: '30px',
    marginBottom: '30px',
  },
  button: {
    backgroundColor: '#FFBF00',
    color: '#1a1a2e',
    padding: '14px 28px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold' as const,
    fontSize: '16px',
    display: 'inline-block',
  },
  signature: {
    fontSize: '16px',
    color: '#6b7280',
    marginTop: '20px',
  },
  footnote: {
    fontSize: '14px',
    color: '#9ca3af',
    marginTop: '24px',
    lineStyle: 'italic' as const,
  },
}
