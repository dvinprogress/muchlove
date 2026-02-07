import {
  Text,
  Link,
  Heading,
  Section,
} from '@react-email/components'
import { BaseLayout } from './BaseLayout'

interface FrozenStarterEmailProps {
  step: 1 | 2
  companyName: string
  dashboardUrl: string
  unsubscribeUrl: string
}

export function FrozenStarterEmail({
  step,
  companyName,
  dashboardUrl,
  unsubscribeUrl,
}: FrozenStarterEmailProps) {
  if (step === 1) {
    return (
      <BaseLayout
        preview="Your first request takes 30 seconds ⚡"
        unsubscribeUrl={unsubscribeUrl}
      >
        <Heading style={styles.heading}>Your first request takes 30 seconds ⚡</Heading>

        <Text style={styles.greeting}>Hey {companyName}!</Text>

        <Text style={styles.paragraph}>
          I noticed you signed up for MuchLove but haven&apos;t created your first contact yet.
        </Text>

        <Text style={styles.paragraph}>
          The good news? <strong>It takes less than 30 seconds.</strong>
        </Text>

        <Text style={styles.paragraph}>You just need 4 fields:</Text>

        <Section style={styles.list}>
          <Text style={styles.listItem}>✓ First name</Text>
          <Text style={styles.listItem}>✓ Company name</Text>
          <Text style={styles.listItem}>✓ Email</Text>
          <Text style={styles.listItem}>✓ A custom message (optional)</Text>
        </Section>

        <Text style={styles.paragraph}>
          Then we&apos;ll generate a unique link you can send them to record their video testimonial.
        </Text>

        <Section style={styles.cta}>
          <Link href={`${dashboardUrl}/contacts/new`} style={styles.button}>
            Add your first contact →
          </Link>
        </Section>

        <Text style={styles.signature}>
          Let me know if you need any help!
        </Text>
      </BaseLayout>
    )
  }

  // Step 2
  return (
    <BaseLayout
      preview="How TechCorp got 47 testimonials in 30 days"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading style={styles.heading}>How TechCorp got 47 testimonials in 30 days</Heading>

      <Text style={styles.greeting}>Hey {companyName}!</Text>

      <Text style={styles.paragraph}>
        I wanted to share a quick success story with you.
      </Text>

      <Text style={styles.paragraph}>
        <strong>TechCorp</strong> (a B2B SaaS company) signed up for MuchLove last month.
        Within 30 days, they collected <strong>47 video testimonials</strong> from happy customers.
      </Text>

      <Text style={styles.paragraph}>Their secret?</Text>

      <Section style={styles.list}>
        <Text style={styles.listItem}>
          <strong>1. CSV import:</strong> They uploaded their customer list in one go (instead of
          adding contacts one by one)
        </Text>
        <Text style={styles.listItem}>
          <strong>2. Personal touch:</strong> Each invitation was personalized with the
          customer&apos;s name
        </Text>
        <Text style={styles.listItem}>
          <strong>3. Timing:</strong> They sent invitations right after successful onboarding calls
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        You can do the same. Start with your happiest customers — they&apos;re the ones most likely
        to say yes.
      </Text>

      <Section style={styles.cta}>
        <Link href={`${dashboardUrl}/contacts`} style={styles.button}>
          Import your contacts →
        </Link>
      </Section>

      <Text style={styles.signature}>Rooting for your success!</Text>
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
  list: {
    marginTop: '12px',
    marginBottom: '20px',
  },
  listItem: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '1.8',
    marginBottom: '8px',
    paddingLeft: '20px',
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
}
