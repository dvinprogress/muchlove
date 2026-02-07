import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DemoFlow } from './DemoFlow'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('demo.meta')

  return {
    title: t('title'),
    description: t('description'),
    robots: {
      index: false,
      follow: false
    }
  }
}

export default function DemoPage() {
  return <DemoFlow />
}
