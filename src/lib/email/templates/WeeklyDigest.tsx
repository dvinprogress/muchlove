import {
  Text,
  Section,
  Button,
  Row,
  Column,
  Link,
} from '@react-email/components'
import { BaseLayout } from './BaseLayout'

interface WeeklyDigestProps {
  companyName: string
  stats: {
    newContacts: number
    newVideos: number
    newShares: number
    newAmbassadors: number
  }
  recommendation: {
    type: string
    title: string
    description: string
    ctaText: string
    ctaUrl: string
  }
  dashboardUrl: string
  unsubscribeUrl: string
}

export function WeeklyDigest({
  companyName,
  stats,
  recommendation,
  dashboardUrl,
  unsubscribeUrl,
}: WeeklyDigestProps) {
  return (
    <BaseLayout preview="Your weekly MuchLove recap" unsubscribeUrl={unsubscribeUrl}>
      {/* Header */}
      <Text style={styles.greeting}>Hi {companyName}!</Text>
      <Text style={styles.h1}>Your weekly MuchLove recap 💛</Text>
      <Text style={styles.intro}>Here's what happened this week.</Text>

      {/* Stats Grid */}
      <Section style={styles.statsSection}>
        <Row>
          <Column style={styles.statCard}>
            <Text style={styles.statEmoji}>👥</Text>
            <Text style={styles.statValue}>{stats.newContacts}</Text>
            <Text style={styles.statLabel}>New contacts</Text>
          </Column>
          <Column style={styles.statCard}>
            <Text style={styles.statEmoji}>🎥</Text>
            <Text style={styles.statValue}>{stats.newVideos}</Text>
            <Text style={styles.statLabel}>Videos received</Text>
          </Column>
        </Row>
        <Row>
          <Column style={styles.statCard}>
            <Text style={styles.statEmoji}>🚀</Text>
            <Text style={styles.statValue}>{stats.newShares}</Text>
            <Text style={styles.statLabel}>Shares</Text>
          </Column>
          <Column style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{stats.newAmbassadors}</Text>
            <Text style={styles.statLabel}>Ambassadors</Text>
          </Column>
        </Row>
      </Section>

      {/* Recommendation */}
      <Section style={styles.recommendation}>
        <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
        <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
        <Button href={recommendation.ctaUrl} style={styles.ctaButton}>
          {recommendation.ctaText}
        </Button>
      </Section>

      {/* Quick Actions */}
      <Section style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick actions</Text>
        <Text style={styles.quickActionsList}>
          <Link href={`${dashboardUrl}/contacts/new`} style={styles.quickActionLink}>
            Add contacts →
          </Link>
          <br />
          <Link href={`${dashboardUrl}/testimonials`} style={styles.quickActionLink}>
            View testimonials →
          </Link>
          <br />
          <Link href={`${dashboardUrl}/widget`} style={styles.quickActionLink}>
            Manage widget →
          </Link>
        </Text>
      </Section>

      {/* Footer message */}
      <Text style={styles.footerMessage}>Keep spreading the love 💛</Text>
    </BaseLayout>
  )
}

const styles = {
  greeting: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  h1: {
    fontSize: '28px',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    marginTop: '0',
    marginBottom: '8px',
    lineHeight: '1.3',
  },
  intro: {
    fontSize: '16px',
    color: '#6b7280',
    marginTop: '0',
    marginBottom: '30px',
  },
  statsSection: {
    marginBottom: '30px',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF9E6',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center' as const,
    marginBottom: '16px',
  },
  statEmoji: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    marginTop: '0',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '0',
  },
  recommendation: {
    backgroundColor: '#FFF9E6',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '30px',
    borderLeft: '4px solid #FFBF00',
  },
  recommendationTitle: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    marginTop: '0',
    marginBottom: '8px',
  },
  recommendationDescription: {
    fontSize: '16px',
    color: '#6b7280',
    marginTop: '0',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  ctaButton: {
    backgroundColor: '#FFBF00',
    color: '#1a1a2e',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  quickActions: {
    marginBottom: '30px',
  },
  quickActionsTitle: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    marginBottom: '12px',
  },
  quickActionsList: {
    fontSize: '14px',
    lineHeight: '2',
  },
  quickActionLink: {
    color: '#FFBF00',
    textDecoration: 'none',
  },
  footerMessage: {
    fontSize: '18px',
    color: '#1a1a2e',
    textAlign: 'center' as const,
    marginTop: '20px',
  },
}
