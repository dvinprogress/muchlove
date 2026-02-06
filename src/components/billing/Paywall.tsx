'use client'

import { useState, type ReactNode } from 'react'
import { useCredits } from '@/hooks/useCredits'
import { UpgradeModal } from './UpgradeModal'

interface PaywallProps {
  /** Number of credits needed for this action */
  requiredCredits?: number
  /** Called when credits are available and deducted */
  onProceed: () => void | Promise<void>
  /** Description for the credit transaction log */
  actionDescription?: string
  /** Child element (usually a button) */
  children: ReactNode
}

/**
 * Paywall wrapper that checks credits before allowing an action.
 * If credits are insufficient, shows an upgrade modal.
 *
 * Usage:
 * <Paywall onProceed={handleGenerate} actionDescription="AI generation">
 *   <Button>Generate</Button>
 * </Paywall>
 */
export function Paywall({
  requiredCredits = 1,
  onProceed,
  actionDescription = 'Video recording',
  children,
}: PaywallProps) {
  const { checkAvailability, deductCredit, isChecking, isDeducting } =
    useCredits()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleClick = async () => {
    // Check credits
    const availability = await checkAvailability(requiredCredits)

    if (!availability || !availability.hasEnough) {
      setShowUpgradeModal(true)
      return
    }

    // Deduct credit
    const result = await deductCredit(actionDescription)

    if (result.success) {
      await onProceed()
    } else if (result.error === 'insufficient_credits') {
      setShowUpgradeModal(true)
    }
  }

  return (
    <>
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick()
          }
        }}
        className={isChecking || isDeducting ? 'opacity-50 pointer-events-none' : ''}
      >
        {children}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  )
}
