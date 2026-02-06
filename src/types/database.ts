export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          email: string
          name: string
          logo_url: string | null
          default_scripts: Json
          music_choice: string
          google_place_id: string | null
          trustpilot_url: string | null
          stripe_customer_id: string | null
          plan: Database['public']['Enums']['plan_type']
          videos_used: number
          videos_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          logo_url?: string | null
          default_scripts?: Json
          music_choice?: string
          google_place_id?: string | null
          trustpilot_url?: string | null
          stripe_customer_id?: string | null
          plan?: Database['public']['Enums']['plan_type']
          videos_used?: number
          videos_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          logo_url?: string | null
          default_scripts?: Json
          music_choice?: string
          google_place_id?: string | null
          trustpilot_url?: string | null
          stripe_customer_id?: string | null
          plan?: Database['public']['Enums']['plan_type']
          videos_used?: number
          videos_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          company_id: string
          first_name: string
          company_name: string
          email: string
          unique_link: string
          status: Database['public']['Enums']['contact_status']
          created_at: string
          updated_at: string
          link_opened_at: string | null
          video_started_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          first_name: string
          company_name: string
          email: string
          unique_link: string
          status?: Database['public']['Enums']['contact_status']
          created_at?: string
          updated_at?: string
          link_opened_at?: string | null
          video_started_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          first_name?: string
          company_name?: string
          email?: string
          unique_link?: string
          status?: Database['public']['Enums']['contact_status']
          created_at?: string
          updated_at?: string
          link_opened_at?: string | null
          video_started_at?: string | null
        }
      }
      testimonials: {
        Row: {
          id: string
          company_id: string
          contact_id: string
          raw_video_url: string | null
          processed_video_url: string | null
          youtube_url: string | null
          youtube_video_id: string | null
          thumbnail_url: string | null
          transcription: string | null
          transcription_edited: string | null
          whisper_words: Json | null
          duration_seconds: number | null
          attempt_number: number
          processing_status: Database['public']['Enums']['processing_status']
          shared_trustpilot: boolean
          shared_google: boolean
          shared_linkedin: boolean
          linkedin_post_text: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          contact_id: string
          raw_video_url?: string | null
          processed_video_url?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
          thumbnail_url?: string | null
          transcription?: string | null
          transcription_edited?: string | null
          whisper_words?: Json | null
          duration_seconds?: number | null
          attempt_number?: number
          processing_status?: Database['public']['Enums']['processing_status']
          shared_trustpilot?: boolean
          shared_google?: boolean
          shared_linkedin?: boolean
          linkedin_post_text?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          contact_id?: string
          raw_video_url?: string | null
          processed_video_url?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
          thumbnail_url?: string | null
          transcription?: string | null
          transcription_edited?: string | null
          whisper_words?: Json | null
          duration_seconds?: number | null
          attempt_number?: number
          processing_status?: Database['public']['Enums']['processing_status']
          shared_trustpilot?: boolean
          shared_google?: boolean
          shared_linkedin?: boolean
          linkedin_post_text?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          company_id: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          status: Database['public']['Enums']['subscription_status']
          plan: Database['public']['Enums']['plan_type']
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: Database['public']['Enums']['subscription_status']
          plan?: Database['public']['Enums']['plan_type']
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: Database['public']['Enums']['subscription_status']
          plan?: Database['public']['Enums']['plan_type']
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          company_id: string
          amount: number
          balance_after: number
          type: Database['public']['Enums']['credit_transaction_type']
          description: string | null
          stripe_payment_intent_id: string | null
          stripe_invoice_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          amount: number
          balance_after: number
          type: Database['public']['Enums']['credit_transaction_type']
          description?: string | null
          stripe_payment_intent_id?: string | null
          stripe_invoice_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          amount?: number
          balance_after?: number
          type?: Database['public']['Enums']['credit_transaction_type']
          description?: string | null
          stripe_payment_intent_id?: string | null
          stripe_invoice_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      stripe_webhook_events: {
        Row: {
          id: string
          type: string
          processed_at: string
          data: Json
        }
        Insert: {
          id: string
          type: string
          processed_at?: string
          data?: Json
        }
        Update: {
          id?: string
          type?: string
          processed_at?: string
          data?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits: {
        Args: {
          p_company_id: string
          p_amount: number
          p_description?: string
        }
        Returns: number
      }
      grant_credits: {
        Args: {
          p_company_id: string
          p_amount: number
          p_type: Database['public']['Enums']['credit_transaction_type']
          p_description?: string
          p_stripe_invoice_id?: string | null
        }
        Returns: number
      }
      cleanup_old_webhook_events: {
        Args: Record<string, never>
        Returns: number
      }
    }
    Enums: {
      plan_type: 'free' | 'starter' | 'growth' | 'pro' | 'enterprise'
      contact_status:
        | 'created'
        | 'invited'
        | 'link_opened'
        | 'video_started'
        | 'video_completed'
        | 'shared_1'
        | 'shared_2'
        | 'shared_3'
      processing_status: 'pending' | 'processing' | 'completed' | 'failed'
      subscription_status:
        | 'active'
        | 'canceled'
        | 'incomplete'
        | 'incomplete_expired'
        | 'past_due'
        | 'trialing'
        | 'unpaid'
        | 'paused'
      credit_transaction_type:
        | 'subscription_grant'
        | 'subscription_renewal'
        | 'one_time_purchase'
        | 'usage_deduction'
        | 'admin_adjustment'
        | 'refund'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']

export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert']
export type TestimonialUpdate = Database['public']['Tables']['testimonials']['Update']

export type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row']
export type UserSubscriptionInsert = Database['public']['Tables']['user_subscriptions']['Insert']
export type UserSubscriptionUpdate = Database['public']['Tables']['user_subscriptions']['Update']

export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row']
export type CreditTransactionInsert = Database['public']['Tables']['credit_transactions']['Insert']

export type PlanType = Database['public']['Enums']['plan_type']
export type ContactStatus = Database['public']['Enums']['contact_status']
export type ProcessingStatus = Database['public']['Enums']['processing_status']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status']
export type CreditTransactionType = Database['public']['Enums']['credit_transaction_type']
