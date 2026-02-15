'use client'

import { useState } from 'react'
import { Check, Copy, Globe, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import { togglePublicLink, updatePublicSlug } from '@/app/[locale]/dashboard/settings/public-link-actions'

interface PublicLinkSectionProps {
  publicSlug: string | null
  publicLinkEnabled: boolean
}

export function PublicLinkSection({ publicSlug, publicLinkEnabled }: PublicLinkSectionProps) {
  const [enabled, setEnabled] = useState(publicLinkEnabled)
  const [slug, setSlug] = useState(publicSlug ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [editSlug, setEditSlug] = useState(slug)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const publicUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${slug}` : ''

  const handleToggle = async () => {
    setLoading(true)
    setError(null)
    const result = await togglePublicLink(!enabled)
    if (result.success) {
      setEnabled(!enabled)
      // If just enabled and no slug, the action auto-generated one
      if (!enabled && !slug) {
        // Reload to get new slug
        window.location.reload()
      }
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleCopy = async () => {
    if (!publicUrl) return
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveSlug = async () => {
    setLoading(true)
    setError(null)
    const result = await updatePublicSlug(editSlug)
    if (result.success) {
      setSlug(editSlug)
      setIsEditing(false)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Public Recording Link</h3>
            <p className="text-sm text-slate-500">
              Share a single link for anyone to record a testimonial
            </p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-rose-500' : 'bg-slate-200'
          } ${loading ? 'opacity-50' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enabled && slug && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          {/* URL Display */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-sm text-slate-700 truncate">
              {publicUrl}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-600">Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Edit slug */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">/r/</span>
              <input
                type="text"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                maxLength={50}
              />
              <button
                onClick={handleSaveSlug}
                disabled={loading || !editSlug}
                className="px-3 py-1 bg-rose-500 text-white rounded text-sm hover:bg-rose-600 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditSlug(slug) }}
                className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <Pencil className="w-3 h-3" />
              Edit slug
            </button>
          )}
        </motion.div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
    </div>
  )
}
