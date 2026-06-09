export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'professional' | 'company' | 'admin'
export type ProfessionalPlan = 'free' | 'premium'
export type CompanyPlan = 'basic' | 'pro' | 'premium'
export type OfferType = 'standard' | 'urgent' | 'substitute'
export type OfferStatus = 'active' | 'covered' | 'cancelled' | 'expired'
export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing'
export type AvailabilityType = 'full_time' | 'part_time' | 'mornings' | 'afternoons' | 'weekends' | 'on_call'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          city: string | null
          province: string | null
          postal_code: string | null
          location: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      professional_profiles: {
        Row: {
          id: string
          user_id: string
          plan: ProfessionalPlan
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: SubscriptionStatus | null
          bio: string | null
          cv_url: string | null
          years_experience: number
          is_available: boolean
          available_immediately: boolean
          availabilities: AvailabilityType[]
          specializations: string[]
          languages: string[]
          profile_embedding: number[] | null
          featured_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['professional_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['professional_profiles']['Insert']>
      }
      company_profiles: {
        Row: {
          id: string
          user_id: string
          plan: CompanyPlan
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: SubscriptionStatus | null
          company_name: string
          company_type: string | null
          cif: string | null
          website: string | null
          description: string | null
          logo_url: string | null
          verified: boolean
          parent_company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['company_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['company_profiles']['Insert']>
      }
      job_offers: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          offer_type: OfferType
          status: OfferStatus
          city: string | null
          province: string | null
          postal_code: string | null
          location: unknown | null
          required_specializations: string[]
          required_experience_years: number
          required_education: string | null
          availability_needed: AvailabilityType[] | null
          contract_type: string | null
          salary_min: number | null
          salary_max: number | null
          schedule: string | null
          is_urgent: boolean
          start_date: string | null
          end_date: string | null
          offer_embedding: number[] | null
          views_count: number
          applications_count: number
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['job_offers']['Row'], 'id' | 'created_at' | 'updated_at' | 'views_count' | 'applications_count'>
        Update: Partial<Database['public']['Tables']['job_offers']['Insert']>
      }
      applications: {
        Row: {
          id: string
          offer_id: string
          professional_id: string
          status: ApplicationStatus
          cover_letter: string | null
          match_score: number | null
          viewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      company_favorites: {
        Row: {
          id: string
          company_id: string
          professional_id: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['company_favorites']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['company_favorites']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          company_id: string
          professional_id: string
          offer_id: string | null
          last_message_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Functions: {
      match_professionals_for_offer: {
        Args: { offer_id: string; match_count?: number }
        Returns: { professional_id: string; match_score: number }[]
      }
    }
  }
}
