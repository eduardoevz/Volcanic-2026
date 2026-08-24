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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
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
      [_ in never]: never
    }
    Enums: {
      content_status: "draft" | "published" | "archived"
      flow_level: "none" | "spotting" | "light" | "medium" | "heavy"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      content_status: ["draft", "published", "archived"],
      flow_level: ["none", "spotting", "light", "medium", "heavy"],
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
