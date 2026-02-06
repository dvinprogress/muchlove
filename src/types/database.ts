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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      plan_type: 'free' | 'starter' | 'growth' | 'pro'
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

export type PlanType = Database['public']['Enums']['plan_type']
export type ContactStatus = Database['public']['Enums']['contact_status']
export type ProcessingStatus = Database['public']['Enums']['processing_status']
