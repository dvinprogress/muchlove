"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { WidgetConfig } from '@/types/database'
import type { WidgetTheme } from '@/types/widget'

interface WidgetConfiguratorProps {
  config: WidgetConfig
  plan: string
  onUpdate: (updates: Partial<WidgetConfig>) => Promise<void>
}

export function WidgetConfigurator({ config, plan, onUpdate }: WidgetConfiguratorProps) {
  const t = useTranslations('widget.config')
  const [saving, setSaving] = useState(false)

  const theme = config.theme as unknown as WidgetTheme
  const isPro = ['pro', 'enterprise'].includes(plan)

  const [formData, setFormData] = useState({
    primaryColor: theme.primaryColor,
    backgroundColor: theme.backgroundColor,
    borderRadius: theme.borderRadius,
    layout: theme.layout,
    maxItems: theme.maxItems,
    showNames: theme.showNames,
    showTranscription: theme.showTranscription,
    poweredByVisible: theme.poweredByVisible,
    allowedDomains: (config.allowed_domains || []).join('\n'),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updatedTheme: WidgetTheme = {
        primaryColor: formData.primaryColor,
        backgroundColor: formData.backgroundColor,
        borderRadius: formData.borderRadius as any,
        layout: formData.layout as 'carousel' | 'grid',
        maxItems: formData.maxItems,
        showNames: formData.showNames,
        showTranscription: formData.showTranscription,
        poweredByVisible: formData.poweredByVisible,
      }

      const domains = formData.allowedDomains
        .split('\n')
        .map(d => d.trim())
        .filter(d => d.length > 0)

      await onUpdate({
        theme: updatedTheme as any,
        allowed_domains: domains,
      })

      toast.success(t('saved'))
    } catch (error) {
      console.error('Failed to save widget config:', error)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('title')}</h3>

        <div className="space-y-4">
          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('primaryColor')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-16 h-10 rounded border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('backgroundColor')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                className="w-16 h-10 rounded border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('borderRadius')}
            </label>
            <select
              value={formData.borderRadius}
              onChange={(e) => setFormData({ ...formData, borderRadius: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="0px">0px (Square)</option>
              <option value="8px">8px (Soft)</option>
              <option value="12px">12px (Rounded)</option>
              <option value="16px">16px (Very Rounded)</option>
            </select>
          </div>

          {/* Layout */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('layout')}
            </label>
            <select
              value={formData.layout}
              onChange={(e) => setFormData({ ...formData, layout: e.target.value as 'carousel' | 'grid' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="carousel">{t('carousel')}</option>
              <option value="grid">{t('grid')}</option>
            </select>
          </div>

          {/* Max Items */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('maxItems')}
            </label>
            <select
              value={formData.maxItems}
              onChange={(e) => setFormData({ ...formData, maxItems: parseInt(e.target.value, 10) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </div>

          {/* Show Names */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showNames"
              checked={formData.showNames}
              onChange={(e) => setFormData({ ...formData, showNames: e.target.checked })}
              className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500"
            />
            <label htmlFor="showNames" className="text-sm font-medium text-slate-700">
              {t('showNames')}
            </label>
          </div>

          {/* Show Transcription */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showTranscription"
              checked={formData.showTranscription}
              onChange={(e) => setFormData({ ...formData, showTranscription: e.target.checked })}
              className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500"
            />
            <label htmlFor="showTranscription" className="text-sm font-medium text-slate-700">
              {t('showTranscription')}
            </label>
          </div>

          {/* Powered By Visible */}
          <div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="poweredByVisible"
                checked={formData.poweredByVisible}
                onChange={(e) => setFormData({ ...formData, poweredByVisible: e.target.checked })}
                disabled={!isPro}
                className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500 disabled:opacity-50"
              />
              <label htmlFor="poweredByVisible" className="text-sm font-medium text-slate-700">
                {t('poweredBy')}
              </label>
            </div>
            {!isPro && (
              <p className="text-xs text-slate-500 mt-1 ml-7">{t('poweredByProOnly')}</p>
            )}
          </div>

          {/* Allowed Domains */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('domains')}
            </label>
            <textarea
              value={formData.allowedDomains}
              onChange={(e) => setFormData({ ...formData, allowedDomains: e.target.value })}
              rows={4}
              placeholder="example.com&#10;subdomain.example.com&#10;*.example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">{t('domainsHelp')}</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: saving ? 1 : 1.02 }}
        whileTap={{ scale: saving ? 1 : 0.98 }}
      >
        {saving ? t('saving') : t('save')}
      </motion.button>
    </form>
  )
}
