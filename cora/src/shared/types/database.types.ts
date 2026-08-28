export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          cited_content_ids: string[]
          content: string
          conversation_id: string
          created_at: string
          flagged_red_flag: boolean
          id: string
          role: string
          token_input: number | null
          token_output: number | null
        }
        Insert: {
          cited_content_ids?: string[]
          content: string
          conversation_id: string
          created_at?: string
          flagged_red_flag?: boolean
          id?: string
          role: string
          token_input?: number | null
          token_output?: number | null
        }
        Update: {
          cited_content_ids?: string[]
          content?: string
          conversation_id?: string
          created_at?: string
          flagged_red_flag?: boolean
          id?: string
          role?: string
          token_input?: number | null
          token_output?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          id: string
          location: string | null
          notes: string | null
          notification_identifier: string | null
          scheduled_at: string
          specialist_name: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          notification_identifier?: string | null
          scheduled_at: string
          specialist_name?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          notification_identifier?: string | null
          scheduled_at?: string
          specialist_name?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      avatars: {
        Row: {
          code: string
          conservation_status: string | null
          fun_fact_es: string | null
          habitat_es: string | null
          id: string
          image_path: string | null
          is_active: boolean
          name_es: string
          name_mis: string | null
          name_myn: string | null
          sort_order: number
          species_scientific: string | null
        }
        Insert: {
          code: string
          conservation_status?: string | null
          fun_fact_es?: string | null
          habitat_es?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          name_es: string
          name_mis?: string | null
          name_myn?: string | null
          sort_order?: number
          species_scientific?: string | null
        }
        Update: {
          code?: string
          conservation_status?: string | null
          fun_fact_es?: string | null
          habitat_es?: string | null
          id?: string
          image_path?: string | null
          is_active?: boolean
          name_es?: string
          name_mis?: string | null
          name_myn?: string | null
          sort_order?: number
          species_scientific?: string | null
        }
        Relationships: []
      }
      consents: {
        Row: {
          accepted_at: string
          consent_type: string
          id: string
          revoked_at: string | null
          user_id: string
          version: string
        }
        Insert: {
          accepted_at?: string
          consent_type: string
          id?: string
          revoked_at?: string | null
          user_id: string
          version: string
        }
        Update: {
          accepted_at?: string
          consent_type?: string
          id?: string
          revoked_at?: string | null
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_categories: {
        Row: {
          color: string | null
          description_es: string | null
          icon: string | null
          id: string
          name_es: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          description_es?: string | null
          icon?: string | null
          id?: string
          name_es: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          description_es?: string | null
          icon?: string | null
          id?: string
          name_es?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      content_sources: {
        Row: {
          content_id: string
          id: string
          label: string
          organization: string
          published_year: number | null
          sort_order: number
          url: string
        }
        Insert: {
          content_id: string
          id?: string
          label: string
          organization: string
          published_year?: number | null
          sort_order?: number
          url: string
        }
        Update: {
          content_id?: string
          id?: string
          label?: string
          organization?: string
          published_year?: number | null
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_sources_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "educational_content"
            referencedColumns: ["id"]
          },
        ]
      }
      cycles: {
        Row: {
          created_at: string
          cycle_length: number | null
          end_date: string | null
          id: string
          is_predicted: boolean
          period_length: number | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_length?: number | null
          end_date?: string | null
          id?: string
          is_predicted?: boolean
          period_length?: number | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_length?: number | null
          end_date?: string | null
          id?: string
          is_predicted?: boolean
          period_length?: number | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_log_symptoms: {
        Row: {
          daily_log_id: string
          intensity: number
          symptom_id: string
        }
        Insert: {
          daily_log_id: string
          intensity: number
          symptom_id: string
        }
        Update: {
          daily_log_id?: string
          intensity?: number
          symptom_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_log_symptoms_daily_log_id_fkey"
            columns: ["daily_log_id"]
            isOneToOne: false
            referencedRelation: "daily_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_log_symptoms_symptom_id_fkey"
            columns: ["symptom_id"]
            isOneToOne: false
            referencedRelation: "symptom_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          created_at: string
          energy_level: number | null
          flow_level: Database["public"]["Enums"]["flow_level"] | null
          id: string
          log_date: string
          mood: Database["public"]["Enums"]["mood"] | null
          notes: string | null
          sleep_hours: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          flow_level?: Database["public"]["Enums"]["flow_level"] | null
          id?: string
          log_date: string
          mood?: Database["public"]["Enums"]["mood"] | null
          notes?: string | null
          sleep_hours?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          flow_level?: Database["public"]["Enums"]["flow_level"] | null
          id?: string
          log_date?: string
          mood?: Database["public"]["Enums"]["mood"] | null
          notes?: string | null
          sleep_hours?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_push_tokens: {
        Row: {
          created_at: string
          device_info: string | null
          expo_push_token: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          expo_push_token: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          expo_push_token?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      educational_content: {
        Row: {
          audio_path: string | null
          author_name: string | null
          body_md: string
          category_id: string
          cover_emoji: string
          deleted_at: string | null
          embedding: string | null
          id: string
          importance: number
          life_stages: Database["public"]["Enums"]["life_stage"][]
          locale: string
          min_age: number
          published_at: string | null
          reading_minutes: number
          reviewed_at: string | null
          reviewed_by_credentials: string | null
          reviewed_by_name: string | null
          search_vector: unknown
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          audio_path?: string | null
          author_name?: string | null
          body_md: string
          category_id: string
          cover_emoji?: string
          deleted_at?: string | null
          embedding?: string | null
          id?: string
          importance?: number
          life_stages: Database["public"]["Enums"]["life_stage"][]
          locale?: string
          min_age?: number
          published_at?: string | null
          reading_minutes?: number
          reviewed_at?: string | null
          reviewed_by_credentials?: string | null
          reviewed_by_name?: string | null
          search_vector?: unknown
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          audio_path?: string | null
          author_name?: string | null
          body_md?: string
          category_id?: string
          cover_emoji?: string
          deleted_at?: string | null
          embedding?: string | null
          id?: string
          importance?: number
          life_stages?: Database["public"]["Enums"]["life_stage"][]
          locale?: string
          min_age?: number
          published_at?: string | null
          reading_minutes?: number
          reviewed_at?: string | null
          reviewed_by_credentials?: string | null
          reviewed_by_name?: string | null
          search_vector?: unknown
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "educational_content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      family_circle_members: {
        Row: {
          accepted_at: string | null
          id: string
          invite_email: string
          invited_at: string
          member_user_id: string | null
          owner_display_name: string
          owner_id: string
          relationship: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invite_email: string
          invited_at?: string
          member_user_id?: string | null
          owner_display_name: string
          owner_id: string
          relationship?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invite_email?: string
          invited_at?: string
          member_user_id?: string | null
          owner_display_name?: string
          owner_id?: string
          relationship?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_circle_members_member_user_id_fkey"
            columns: ["member_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_circle_members_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_share_grants: {
        Row: {
          granted_at: string
          id: string
          membership_id: string
          revoked_at: string | null
          scope: Database["public"]["Enums"]["share_scope"]
        }
        Insert: {
          granted_at?: string
          id?: string
          membership_id: string
          revoked_at?: string | null
          scope: Database["public"]["Enums"]["share_scope"]
        }
        Update: {
          granted_at?: string
          id?: string
          membership_id?: string
          revoked_at?: string | null
          scope?: Database["public"]["Enums"]["share_scope"]
        }
        Relationships: [
          {
            foreignKeyName: "family_share_grants_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "family_circle_members"
            referencedColumns: ["id"]
          },
        ]
      }
      health_centers: {
        Row: {
          address: string | null
          department: string
          id: string
          is_verified: boolean
          latitude: number | null
          longitude: number | null
          municipality: string
          name: string
          phone: string | null
          services: string[]
          type: Database["public"]["Enums"]["health_center_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          department: string
          id?: string
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          municipality: string
          name: string
          phone?: string | null
          services?: string[]
          type: Database["public"]["Enums"]["health_center_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          department?: string
          id?: string
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          municipality?: string
          name?: string
          phone?: string | null
          services?: string[]
          type?: Database["public"]["Enums"]["health_center_type"]
          updated_at?: string
        }
        Relationships: []
      }
      life_stage_history: {
        Row: {
          created_at: string
          ended_on: string | null
          id: string
          stage: Database["public"]["Enums"]["life_stage"]
          started_on: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_on?: string | null
          id?: string
          stage: Database["public"]["Enums"]["life_stage"]
          started_on?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_on?: string | null
          id?: string
          stage?: Database["public"]["Enums"]["life_stage"]
          started_on?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_stage_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mascot_events: {
        Row: {
          action_type: string
          created_at: string
          dedupe_key: string
          id: string
          points: number
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          dedupe_key: string
          id?: string
          points: number
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          dedupe_key?: string
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mascot_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mascot_state: {
        Row: {
          last_evolved_at: string | null
          level: number
          points: number
          stage_variant: Database["public"]["Enums"]["life_stage"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          last_evolved_at?: string | null
          level?: number
          points?: number
          stage_variant?: Database["public"]["Enums"]["life_stage"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          last_evolved_at?: string | null
          level?: number
          points?: number
          stage_variant?: Database["public"]["Enums"]["life_stage"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mascot_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_summaries: {
        Row: {
          generated_at: string
          id: string
          payload: Json
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          payload: Json
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          payload?: Json
          period_end?: string
          period_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancies: {
        Row: {
          created_at: string
          due_date: string
          ended_at: string | null
          id: string
          lmp_date: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date: string
          ended_at?: string | null
          id?: string
          lmp_date: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string
          ended_at?: string | null
          id?: string
          lmp_date?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pregnancies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_id: string | null
          birth_year: number | null
          created_at: string
          deleted_at: string | null
          display_name: string | null
          id: string
          life_stage: Database["public"]["Enums"]["life_stage"] | null
          locale: string
          onboarding_completed_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_id?: string | null
          birth_year?: number | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          id: string
          life_stage?: Database["public"]["Enums"]["life_stage"] | null
          locale?: string
          onboarding_completed_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_id?: string | null
          birth_year?: number | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          id?: string
          life_stage?: Database["public"]["Enums"]["life_stage"] | null
          locale?: string
          onboarding_completed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          hour: number
          id: string
          is_active: boolean
          minute: number
          notification_identifier: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hour: number
          id?: string
          is_active?: boolean
          minute: number
          notification_identifier?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hour?: number
          id?: string
          is_active?: boolean
          minute?: number
          notification_identifier?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialists: {
        Row: {
          consent_to_publish: boolean
          email: string | null
          full_name: string
          health_center_id: string | null
          id: string
          is_verified: boolean
          phone: string | null
          specialty: string
          updated_at: string
        }
        Insert: {
          consent_to_publish?: boolean
          email?: string | null
          full_name: string
          health_center_id?: string | null
          id?: string
          is_verified?: boolean
          phone?: string | null
          specialty: string
          updated_at?: string
        }
        Update: {
          consent_to_publish?: boolean
          email?: string | null
          full_name?: string
          health_center_id?: string | null
          id?: string
          is_verified?: boolean
          phone?: string | null
          specialty?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialists_health_center_id_fkey"
            columns: ["health_center_id"]
            isOneToOne: false
            referencedRelation: "health_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_catalog: {
        Row: {
          applicable_stages: Database["public"]["Enums"]["life_stage"][]
          category: Database["public"]["Enums"]["symptom_category"]
          code: string
          icon: string | null
          id: string
          is_active: boolean
          label_es: string
          label_mis: string | null
          label_myn: string | null
          sort_order: number
        }
        Insert: {
          applicable_stages: Database["public"]["Enums"]["life_stage"][]
          category: Database["public"]["Enums"]["symptom_category"]
          code: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label_es: string
          label_mis?: string | null
          label_myn?: string | null
          sort_order?: number
        }
        Update: {
          applicable_stages?: Database["public"]["Enums"]["life_stage"][]
          category?: Database["public"]["Enums"]["symptom_category"]
          code?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label_es?: string
          label_mis?: string | null
          label_myn?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          ai_share_health_context: boolean
          notifications_enabled: boolean
          reminder_time: string | null
          updated_at: string
          user_id: string
          week_starts_on: number
        }
        Insert: {
          ai_share_health_context?: boolean
          notifications_enabled?: boolean
          reminder_time?: string | null
          updated_at?: string
          user_id: string
          week_starts_on?: number
        }
        Update: {
          ai_share_health_context?: boolean
          notifications_enabled?: boolean
          reminder_time?: string | null
          updated_at?: string
          user_id?: string
          week_starts_on?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_family_invite: {
        Args: { p_membership_id: string }
        Returns: {
          accepted_at: string | null
          id: string
          invite_email: string
          invited_at: string
          member_user_id: string | null
          owner_display_name: string
          owner_id: string
          relationship: string | null
          status: string
        }
      }
      award_mascot_points: {
        Args: { p_action: string; p_dedupe_key: string; p_points: number }
        Returns: {
          last_evolved_at: string | null
          level: number
          points: number
          stage_variant: Database["public"]["Enums"]["life_stage"] | null
          updated_at: string
          user_id: string
        }
      }
      complete_onboarding: {
        Args: {
          p_ai_share_health_context: boolean
          p_consent_version: string
          p_notifications_enabled: boolean
        }
        Returns: undefined
      }
      get_family_mood_summary: {
        Args: { p_days?: number; p_owner_id: string }
        Returns: {
          day_count: number
          mood: Database["public"]["Enums"]["mood"]
        }[]
      }
      has_active_grant: {
        Args: {
          p_owner_id: string
          p_scope: Database["public"]["Enums"]["share_scope"]
          p_viewer_id: string
        }
        Returns: boolean
      }
      leave_family_circle: {
        Args: { p_membership_id: string }
        Returns: undefined
      }
      level_for_points: { Args: { p_points: number }; Returns: number }
      mark_article_read: { Args: { p_article_id: string }; Returns: undefined }
      match_articles_by_embedding: {
        Args: {
          p_age: number
          p_match_count?: number
          p_query_embedding: string
          p_stage: Database["public"]["Enums"]["life_stage"]
        }
        Returns: {
          id: string
          similarity: number
          summary: string
          title: string
        }[]
      }
      set_life_stage: {
        Args: { new_stage: Database["public"]["Enums"]["life_stage"] }
        Returns: undefined
      }
      upsert_daily_log: {
        Args: {
          p_energy_level: number | null
          p_flow_level: Database["public"]["Enums"]["flow_level"] | null
          p_log_date: string
          p_mood: Database["public"]["Enums"]["mood"] | null
          p_notes: string | null
          p_sleep_hours: number | null
          p_symptoms?: Json
        }
        Returns: string
      }
    }
    Enums: {
      content_status: "draft" | "published" | "archived"
      flow_level: "none" | "spotting" | "light" | "medium" | "heavy"
      health_center_type:
        | "hospital"
        | "centro_salud"
        | "clinica"
        | "casa_materna"
      life_stage:
        | "adolescencia"
        | "adultez"
        | "embarazo"
        | "perimenopausia"
        | "mayor"
      mood: "great" | "good" | "neutral" | "low" | "difficult"
      share_scope: "cycle_dates" | "appointments" | "reminders" | "mood_summary"
      symptom_category:
        | "physical"
        | "emotional"
        | "digestive"
        | "skin"
        | "sleep"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_status: ["draft", "published", "archived"],
      flow_level: ["none", "spotting", "light", "medium", "heavy"],
      health_center_type: [
        "hospital",
        "centro_salud",
        "clinica",
        "casa_materna",
      ],
      life_stage: [
        "adolescencia",
        "adultez",
        "embarazo",
        "perimenopausia",
        "mayor",
      ],
      mood: ["great", "good", "neutral", "low", "difficult"],
      share_scope: ["cycle_dates", "appointments", "reminders", "mood_summary"],
      symptom_category: [
        "physical",
        "emotional",
        "digestive",
        "skin",
        "sleep",
        "other",
      ],
    },
  },
} as const
