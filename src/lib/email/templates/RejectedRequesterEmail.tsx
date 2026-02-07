import {
  Text,
  Link,
  Heading,
  Section,
} from '@react-email/components'
import { BaseLayout } from './BaseLayout'

interface RejectedRequesterEmailProps {
  companyName: string
  contactCount: number
  dashboardUrl: string
  unsubscribeUrl: string
}

export function RejectedRequesterEmail({
  companyName,
  contactCount,
  dashboardUrl,
  unsubscribeUrl,
}: RejectedRequesterEmailProps) {
  return (
    <BaseLayout
      preview="3 ways to get more customers to respond"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading style={styles.heading}>3 ways to get more customers to respond</Heading>

      <Text style={styles.greeting}>Hey {companyName}!</Text>

      <Text style={styles.paragraph}>
        I see you&apos;ve sent out {contactCount} invitation{contactCount > 1 ? 's' : ''}, but
        haven&apos;t received any video testimonials yet.
      </Text>

      <Text style={styles.paragraph}>
        Don&apos;t worry — this is normal! Here are 3 proven ways to boost your response rate:
      </Text>

      <Section style={styles.list}>
        <Text style={styles.listItem}>
          <strong>1. Personalize your invitation message</strong>
          <br />
          <span style={styles.tip}>
            Instead of &quot;Can you record a testimonial?&quot;, try &quot;Hey Sarah! I loved
            working with you on the TechCorp project. Would you mind sharing your experience in a
            quick 60-second video?&quot;
          </span>
        </Text>

        <Text style={styles.listItem}>
          <strong>2. Offer a small incentive</strong>
          <br />
          <span style={styles.tip}>
            A $25 Amazon gift card, a coffee on you, or even a LinkedIn recommendation can work
            wonders. Most people say yes just because you asked, but a little thank-you goes a long
            way.
          </span>
        </Text>

        <Text style={styles.listItem}>
          <strong>3. Follow up after 3 days</strong>
          <br />
          <span style={styles.tip}>
            People are busy. A friendly reminder (not pushy!) can increase response rates from 15%
            to 45%. We&apos;ll add automated follow-ups soon, but for now, a quick email works
            great.
          </span>
        </Text>
      </Section>

      <Text style={styles.stat}>
        💡 Pro tip: Response rates go from 15% to 45% with personalization + follow-up.
      </Text>

      <Section style={styles.cta}>
        <Link href={`${dashboardUrl}/contacts`} style={styles.button}>
          Update your invitation message →
        </Link>
      </Section>

      <Text style={styles.signature}>You got this!</Text>
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
    marginTop: '20px',
    marginBottom: '24px',
  },
  listItem: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '1.8',
    marginBottom: '20px',
    paddingLeft: '20px',
  },
  tip: {
    fontSize: '15px',
    color: '#6b7280',
    lineHeight: '1.6',
    display: 'block',
    marginTop: '8px',
  },
  stat: {
    fontSize: '16px',
    color: '#FFBF00',
    backgroundColor: '#fffbeb',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '24px',
    marginBottom: '24px',
    textAlign: 'center' as const,
    fontWeight: '500' as const,
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
