import {
  Text,
  Link,
  Heading,
  Section,
} from '@react-email/components'
import { BaseLayout } from './BaseLayout'

interface InvitationEmailProps {
  contactName: string
  companyName: string
  recordingUrl: string
  unsubscribeUrl: string
}

export function InvitationEmail({
  contactName,
  companyName,
  recordingUrl,
  unsubscribeUrl,
}: InvitationEmailProps) {
  return (
    <BaseLayout
      preview={`${companyName} would love to hear your story`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading style={styles.heading}>
        {companyName} wants to hear from you 💛
      </Heading>

      <Text style={styles.greeting}>Hi {contactName}!</Text>

      <Text style={styles.paragraph}>
        {companyName} would love to capture your experience on video.
      </Text>

      <Text style={styles.paragraph}>
        It's simple and quick — <strong>less than 2 minutes</strong> to record your story.
        Just share what made your experience special.
      </Text>

      <Section style={styles.cta}>
        <Link href={recordingUrl} style={styles.button}>
          Record my video 🎥
        </Link>
      </Section>

      <Text style={styles.paragraph}>
        Your story helps {companyName} inspire trust and connect with future customers.
        Your voice matters!
      </Text>

      <Text style={styles.signature}>
        Much love 💛
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
  cta: {
    textAlign: 'center' as const,
    marginTop: '30px',
    marginBottom: '30px',
  },
  button: {
    backgroundColor: '#f43f5e',
    color: '#ffffff',
    padding: '12px 24px',
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
