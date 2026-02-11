import {
  Text,
  Link,
  Heading,
  Section,
} from '@react-email/components'
import { BaseLayout } from './BaseLayout'

interface CollectorUnusedEmailProps {
  companyName: string
  videoCount: number
  dashboardUrl: string
  unsubscribeUrl: string
}

export function CollectorUnusedEmail({
  companyName,
  videoCount,
  dashboardUrl,
  unsubscribeUrl,
}: CollectorUnusedEmailProps) {
  return (
    <BaseLayout
      preview={`You have ${videoCount} video testimonial${videoCount > 1 ? 's' : ''} waiting 🎁`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading style={styles.heading}>
        You have {videoCount} video testimonial{videoCount > 1 ? 's' : ''} waiting 🎁
      </Heading>

      <Text style={styles.greeting}>Hey {companyName}!</Text>

      <Text style={styles.paragraph}>
        Amazing! You&apos;ve collected {videoCount} video testimonial{videoCount > 1 ? 's' : ''}{' '}
        from happy customers.
      </Text>

      <Text style={styles.paragraph}>
        But here&apos;s the thing: <strong>video testimonials only work if you use them.</strong>
      </Text>

      <Text style={styles.paragraph}>
        Here are 4 ways to get the most out of your testimonials:
      </Text>

      <Section style={styles.list}>
        <Text style={styles.listItem}>
          <strong>1. Embed the widget on your website</strong>
          <br />
          <span style={styles.tip}>
            Place it on your homepage, pricing page, or case studies. Social proof converts visitors
            into customers. (Coming soon: widget builder in your dashboard!)
          </span>
        </Text>

        <Text style={styles.listItem}>
          <strong>2. Add to your email signature</strong>
          <br />
          <span style={styles.tip}>
            Link to your best testimonial in every email you send. It&apos;s a passive way to build
            trust with prospects.
          </span>
        </Text>

        <Text style={styles.listItem}>
          <strong>3. Share on social media</strong>
          <br />
          <span style={styles.tip}>
            Post your testimonials on LinkedIn, Twitter, or Facebook. Customer stories get 10x more
            engagement than product features.
          </span>
        </Text>

        <Text style={styles.listItem}>
          <strong>4. Include in your sales deck</strong>
          <br />
          <span style={styles.tip}>
            Replace boring text testimonials with video. Seeing a real person talk about your
            product is 100x more convincing.
          </span>
        </Text>
      </Section>

      <Text style={styles.stat}>
        💡 Companies that use video testimonials see a 34% increase in conversion rates.
      </Text>

      <Section style={styles.cta}>
        <Link href={`${dashboardUrl}/contacts`} style={styles.button}>
          View your contacts →
        </Link>
      </Section>

      <Text style={styles.signature}>Time to put those testimonials to work!</Text>
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
