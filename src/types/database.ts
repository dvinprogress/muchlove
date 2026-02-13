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
          email_preferences: Json
          last_active_at: string
          created_at: string
          updated_at: string
          onboarding_completed_at: string | null
          industry: string | null
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
          email_preferences?: Json
          last_active_at?: string
          created_at?: string
          updated_at?: string
          onboarding_completed_at?: string | null
          industry?: string | null
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
          email_preferences?: Json
          last_active_at?: string
          created_at?: string
          updated_at?: string
          onboarding_completed_at?: string | null
          industry?: string | null
        }
        Relationships: []
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
          linkedin_consent: boolean
          linkedin_consent_at: string | null
          phone: string | null
          reward: string | null
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
          linkedin_consent?: boolean
          linkedin_consent_at?: string | null
          phone?: string | null
          reward?: string | null
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
          linkedin_consent?: boolean
          linkedin_consent_at?: string | null
          phone?: string | null
          reward?: string | null
          created_at?: string
          updated_at?: string
          link_opened_at?: string | null
          video_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contacts_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: 'testimonials_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'testimonials_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: 'user_subscriptions_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: 'credit_transactions_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          }
        ]
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
        Relationships: []
      }
      demo_sessions: {
        Row: {
          id: string
          session_id: string
          email: string | null
          video_url: string | null
          transcription: string | null
          duration_seconds: number | null
          ip_hash: string | null
          user_agent: string | null
          locale: string
          shared_on: Json
          converted_to_signup: boolean
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          session_id: string
          email?: string | null
          video_url?: string | null
          transcription?: string | null
          duration_seconds?: number | null
          ip_hash?: string | null
          user_agent?: string | null
          locale?: string
          shared_on?: Json
          converted_to_signup?: boolean
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          email?: string | null
          video_url?: string | null
          transcription?: string | null
          duration_seconds?: number | null
          ip_hash?: string | null
          user_agent?: string | null
          locale?: string
          shared_on?: Json
          converted_to_signup?: boolean
          created_at?: string
          expires_at?: string
        }
        Relationships: []
      }
      email_sequences: {
        Row: {
          id: string
          company_id: string
          segment: Database['public']['Enums']['email_segment']
          step: number
          status: Database['public']['Enums']['email_sequence_status']
          started_at: string
          last_sent_at: string | null
          next_send_at: string | null
          cancelled_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          segment: Database['public']['Enums']['email_segment']
          step?: number
          status?: Database['public']['Enums']['email_sequence_status']
          started_at?: string
          last_sent_at?: string | null
          next_send_at?: string | null
          cancelled_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          segment?: Database['public']['Enums']['email_segment']
          step?: number
          status?: Database['public']['Enums']['email_sequence_status']
          started_at?: string
          last_sent_at?: string | null
          next_send_at?: string | null
          cancelled_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'email_sequences_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          }
        ]
      }
      email_events: {
        Row: {
          id: string
          sequence_id: string | null
          company_id: string | null
          email_type: string
          resend_id: string | null
          recipient_email: string
          status: Database['public']['Enums']['email_event_status']
          metadata: Json
          sent_at: string
        }
        Insert: {
          id?: string
          sequence_id?: string | null
          company_id?: string | null
          email_type: string
          resend_id?: string | null
          recipient_email: string
          status?: Database['public']['Enums']['email_event_status']
          metadata?: Json
          sent_at?: string
        }
        Update: {
          id?: string
          sequence_id?: string | null
          company_id?: string | null
          email_type?: string
          resend_id?: string | null
          recipient_email?: string
          status?: Database['public']['Enums']['email_event_status']
          metadata?: Json
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'email_events_sequence_id_fkey'
            columns: ['sequence_id']
            isOneToOne: false
            referencedRelation: 'email_sequences'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'email_events_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          }
        ]
      }
      widget_configs: {
        Row: {
          id: string
          company_id: string
          enabled: boolean
          theme: Json
          allowed_domains: string[]
          api_key: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          enabled?: boolean
          theme?: Json
          allowed_domains?: string[]
          api_key: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          enabled?: boolean
          theme?: Json
          allowed_domains?: string[]
          api_key?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'widget_configs_company_id_fkey'
            columns: ['company_id']
            isOneToOne: true
            referencedRelation: 'companies'
            referencedColumns: ['id']
          }
        ]
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
      cleanup_expired_demo_sessions: {
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
      email_segment:
        | 'frozen_starter'
        | 'rejected_requester'
        | 'collector_unused'
        | 'free_maximizer'
      email_sequence_status: 'active' | 'paused' | 'completed' | 'cancelled'
      email_event_status:
        | 'sent'
        | 'delivered'
        | 'opened'
        | 'clicked'
        | 'bounced'
        | 'complained'
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

export type DemoSession = Database['public']['Tables']['demo_sessions']['Row']
export type DemoSessionInsert = Database['public']['Tables']['demo_sessions']['Insert']
export type DemoSessionUpdate = Database['public']['Tables']['demo_sessions']['Update']

export type EmailSequence = Database['public']['Tables']['email_sequences']['Row']
export type EmailSequenceInsert = Database['public']['Tables']['email_sequences']['Insert']
export type EmailSequenceUpdate = Database['public']['Tables']['email_sequences']['Update']

export type EmailEvent = Database['public']['Tables']['email_events']['Row']
export type EmailEventInsert = Database['public']['Tables']['email_events']['Insert']
export type EmailEventUpdate = Database['public']['Tables']['email_events']['Update']

export type WidgetConfig = Database['public']['Tables']['widget_configs']['Row']
export type WidgetConfigInsert = Database['public']['Tables']['widget_configs']['Insert']
export type WidgetConfigUpdate = Database['public']['Tables']['widget_configs']['Update']

export type PlanType = Database['public']['Enums']['plan_type']
export type ContactStatus = Database['public']['Enums']['contact_status']
export type ProcessingStatus = Database['public']['Enums']['processing_status']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status']
export type CreditTransactionType = Database['public']['Enums']['credit_transaction_type']
export type EmailSegment = Database['public']['Enums']['email_segment']
export type EmailSequenceStatus = Database['public']['Enums']['email_sequence_status']
export type EmailEventStatus = Database['public']['Enums']['email_event_status']

