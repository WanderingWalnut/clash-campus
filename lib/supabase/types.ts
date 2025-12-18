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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clash_accounts: {
        Row: {
          created_at: string
          id: string
          name: string | null
          player_tag: string
          profile_id: string
          updated_at: string
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          player_tag: string
          profile_id: string
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          player_tag?: string
          profile_id?: string
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clash_accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_rankings: {
        Row: {
          best_trophies: number
          clash_account_id: string
          created_at: string
          current_trophies: number
          id: string
          last_synced_at: string | null
          losses: number
          ranking_score: number
          three_crown_wins: number
          university_id: string
          updated_at: string
          wins: number
        }
        Insert: {
          best_trophies?: number
          clash_account_id: string
          created_at?: string
          current_trophies?: number
          id?: string
          last_synced_at?: string | null
          losses?: number
          ranking_score?: number
          three_crown_wins?: number
          university_id: string
          updated_at?: string
          wins?: number
        }
        Update: {
          best_trophies?: number
          clash_account_id?: string
          created_at?: string
          current_trophies?: number
          id?: string
          last_synced_at?: string | null
          losses?: number
          ranking_score?: number
          three_crown_wins?: number
          university_id?: string
          updated_at?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_rankings_clash_account_id_fkey"
            columns: ["clash_account_id"]
            isOneToOne: false
            referencedRelation: "clash_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_rankings_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          university_id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          university_id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          university_id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          created_at: string
          email_domain: string
          id: string
          name: string
          short_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_domain: string
          id?: string
          name: string
          short_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_domain?: string
          id?: string
          name?: string
          short_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      university_rankings: {
        Row: {
          average_ranking_score: number
          created_at: string
          id: string
          last_calculated: string | null
          player_count: number
          rank: number | null
          total_ranking_score: number
          university_id: string
          updated_at: string
        }
        Insert: {
          average_ranking_score?: number
          created_at?: string
          id?: string
          last_calculated?: string | null
          player_count?: number
          rank?: number | null
          total_ranking_score?: number
          university_id: string
          updated_at?: string
        }
        Update: {
          average_ranking_score?: number
          created_at?: string
          id?: string
          last_calculated?: string | null
          player_count?: number
          rank?: number | null
          total_ranking_score?: number
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_rankings_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_sessions: {
        Row: {
          clash_account_id: string
          created_at: string
          expires_at: string | null
          failure_reason: string | null
          id: string
          last_checked_at: string | null
          required_deck: Json | null
          started_at: string
          status: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          clash_account_id: string
          created_at?: string
          expires_at?: string | null
          failure_reason?: string | null
          id?: string
          last_checked_at?: string | null
          required_deck?: Json | null
          started_at?: string
          status: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          clash_account_id?: string
          created_at?: string
          expires_at?: string | null
          failure_reason?: string | null
          id?: string
          last_checked_at?: string | null
          required_deck?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_sessions_clash_account_id_fkey"
            columns: ["clash_account_id"]
            isOneToOne: false
            referencedRelation: "clash_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      wrapped_cards: {
        Row: {
          best_trophies: number
          card_type: string
          clash_account_id: string
          created_at: string
          id: string
          image_url: string | null
          losses: number
          ranking_score: number
          three_crown_wins: number
          trophies: number
          university_id: string
          wins: number
          year: number
        }
        Insert: {
          best_trophies?: number
          card_type: string
          clash_account_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          losses?: number
          ranking_score?: number
          three_crown_wins?: number
          trophies?: number
          university_id: string
          wins?: number
          year: number
        }
        Update: {
          best_trophies?: number
          card_type?: string
          clash_account_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          losses?: number
          ranking_score?: number
          three_crown_wins?: number
          trophies?: number
          university_id?: string
          wins?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "wrapped_cards_clash_account_id_fkey"
            columns: ["clash_account_id"]
            isOneToOne: false
            referencedRelation: "clash_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wrapped_cards_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
