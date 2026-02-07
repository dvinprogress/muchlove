"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Power } from 'lucide-react'
import { toast } from 'sonner'
import type { WidgetConfig } from '@/types/database'
import { WidgetConfigurator } from '@/components/widget/WidgetConfigurator'
import { WidgetSnippet } from '@/components/widget/WidgetSnippet'
import { enableWidget, disableWidget, updateWidgetConfig } from './actions'

interface WidgetDashboardProps {
  company: {
    id: string
    name: string
    plan: string
  }
  initialConfig: WidgetConfig | null
}

export function WidgetDashboard({ company, initialConfig }: WidgetDashboardProps) {
  const t = useTranslations('widget')
  const [config, setConfig] = useState<WidgetConfig | null>(initialConfig)
  const [enabling, setEnabling] = useState(false)
  const [toggling, setToggling] = useState(false)

  const handleEnable = async () => {
    setEnabling(true)
    try {
      const newConfig = await enableWidget()
      setConfig(newConfig)
      toast.success(t('enabled'))
    } catch (error) {
      console.error('Failed to enable widget:', error)
      toast.error('Failed to enable widget')
    } finally {
      setEnabling(false)
    }
  }

  const handleToggle = async () => {
    if (!config) return

    setToggling(true)
    try {
      if (config.enabled) {
        const updatedConfig = await disableWidget()
        setConfig(updatedConfig)
        toast.success(t('disabled'))
      } else {
        const updatedConfig = await enableWidget()
        setConfig(updatedConfig)
        toast.success(t('enabled'))
      }
    } catch (error) {
      console.error('Failed to toggle widget:', error)
      toast.error('Failed to update widget status')
    } finally {
      setToggling(false)
    }
  }

  const handleUpdate = async (updates: Partial<WidgetConfig>) => {
    if (!config) return

    const updatedConfig = await updateWidgetConfig(updates)
    setConfig(updatedConfig)
  }

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-600 mt-2">{t('description')}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-lg text-slate-700 mb-6">
            Your widget is not set up yet. Enable it to start displaying your testimonials on your website.
          </p>
          <motion.button
            onClick={handleEnable}
            disabled={enabling}
            className="px-6 py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50"
            whileHover={{ scale: enabling ? 1 : 1.05 }}
            whileTap={{ scale: enabling ? 1 : 0.95 }}
          >
            {enabling ? 'Enabling...' : t('enable')}
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-600 mt-2">{t('description')}</p>
        </div>
        <motion.button
          onClick={handleToggle}
          disabled={toggling}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            config.enabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          whileHover={{ scale: toggling ? 1 : 1.05 }}
          whileTap={{ scale: toggling ? 1 : 0.95 }}
        >
          <Power className="w-4 h-4" />
          {config.enabled ? t('enabled') : t('disabled')}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Configuration */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <WidgetConfigurator
            config={config}
            plan={company.plan}
            onUpdate={handleUpdate}
          />
        </div>

        {/* Right Column: Snippet & Preview */}
        <div className="space-y-6">
          {/* Installation Code */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <WidgetSnippet apiKey={config.api_key} />
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {t('preview.title')}
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
              <p className="text-slate-500 text-sm">
                Live preview will appear here once you embed the widget on your site
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
