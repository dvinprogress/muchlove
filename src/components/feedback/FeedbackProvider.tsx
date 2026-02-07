"use client"

import { useState, useEffect } from "react"
import { FeedbackWidget } from "@/lib/feedback/components"
import { feedbackConfig } from "@/lib/feedback/feedback.config"
import { createClient } from "@/lib/supabase/client"

export function FeedbackProvider() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | undefined>()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setUserEmail(user?.email || undefined)
    }
    checkAuth()
  }, [])

  return (
    <FeedbackWidget
      config={feedbackConfig}
      isAuthenticated={isAuthenticated}
      userEmail={userEmail}
    />
  )
}
