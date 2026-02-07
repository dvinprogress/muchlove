import {
  Text,
  Link,
  Heading,
  Section,
} from '@react-email/components'
import { BaseLayout } from './BaseLayout'

interface ReminderEmailProps {
  contactName: string
  companyName: string
  recordingUrl: string
  unsubscribeUrl: string
  daysSinceInvite: number
}

export function ReminderEmail({
  contactName,
  companyName,
  recordingUrl,
  unsubscribeUrl,
  daysSinceInvite,
}: ReminderEmailProps) {
  return (
    <BaseLayout
      preview={`${companyName} is still waiting to hear from you`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading style={styles.heading}>
        {companyName} would still love to hear from you 💛
      </Heading>

      <Text style={styles.greeting}>Hi {contactName}!</Text>

      <Text style={styles.paragraph}>
        {daysSinceInvite} {daysSinceInvite === 1 ? 'day' : 'days'} ago, {companyName} invited you to share your experience on video.
      </Text>

      <Text style={styles.paragraph}>
        We know you're busy — but <strong>it only takes 2 minutes</strong> and makes a real difference.
        Your story helps {companyName} grow and inspires others!
      </Text>

      <Section style={styles.cta}>
        <Link href={recordingUrl} style={styles.button}>
          Record my video 🎥
        </Link>
      </Section>

      <Text style={styles.paragraph}>
        No pressure at all — but your voice would mean the world to {companyName}.
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
