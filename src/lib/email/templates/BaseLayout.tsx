import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Preview,
} from '@react-email/components'

interface BaseLayoutProps {
  preview: string
  children: React.ReactNode
  unsubscribeUrl?: string
}

export function BaseLayout({ preview, children, unsubscribeUrl }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>MuchLove 💛</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>{children}</Section>

          {/* Footer */}
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerSignature}>Much love 💛</Text>
            {unsubscribeUrl && (
              <Text style={styles.footerText}>
                <Link href={unsubscribeUrl} style={styles.link}>
                  Unsubscribe from these emails
                </Link>
              </Text>
            )}
            <Text style={styles.footerCopyright}>
              © 2026 MuchLove. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#ffffff',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: '0',
    padding: '0',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center' as const,
    paddingTop: '30px',
    paddingBottom: '20px',
  },
  logo: {
    fontSize: '28px',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    margin: '0',
  },
  content: {
    backgroundColor: '#ffffff',
    padding: '30px 20px',
  },
  hr: {
    borderColor: '#e5e7eb',
    margin: '30px 0',
  },
  footer: {
    textAlign: 'center' as const,
    paddingTop: '20px',
    paddingBottom: '30px',
  },
  footerSignature: {
    fontSize: '16px',
    color: '#1a1a2e',
    marginBottom: '10px',
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '10px',
    marginBottom: '10px',
  },
  footerCopyright: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '10px',
  },
  link: {
    color: '#FFBF00',
    textDecoration: 'none',
  },
}
