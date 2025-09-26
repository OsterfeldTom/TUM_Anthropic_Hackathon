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
      agent_config: {
        Row: {
          created_at: string
          criteria_id: number | null
          id: number
          Prompt: string | null
        }
        Insert: {
          created_at?: string
          criteria_id?: number | null
          id?: number
          Prompt?: string | null
        }
        Update: {
          created_at?: string
          criteria_id?: number | null
          id?: number
          Prompt?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          abstract: string | null
          author: string | null
          contact_email: string | null
          created_at: string
          id: string
          institution: string | null
          pdf_storage_path: string | null
          publication_date: string | null
          research_area: string | null
          research_domain: string | null
          research_title: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          abstract?: string | null
          author?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          institution?: string | null
          pdf_storage_path?: string | null
          publication_date?: string | null
          research_area?: string | null
          research_domain?: string | null
          research_title?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          abstract?: string | null
          author?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          institution?: string | null
          pdf_storage_path?: string | null
          publication_date?: string | null
          research_area?: string | null
          research_domain?: string | null
          research_title?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      assignments: {
        Row: {
          analyst: string | null
          created_at: string | null
          deal_id: string | null
          id: string
          method: string | null
        }
        Insert: {
          analyst?: string | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          method?: string | null
        }
        Update: {
          analyst?: string | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_potential_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "potentials"
            referencedColumns: ["id"]
          },
        ]
      }
      criteria_preferences: {
        Row: {
          created_at: string
          criterion: string
          factor: number
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criterion: string
          factor?: number
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criterion?: string
          factor?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      criteria_scores: {
        Row: {
          confidence: number | null
          criterion_id: string | null
          evidence: string | null
          id: string
          missing_data: string | null
          potential_id: string | null
          rationale: string | null
          raw: Json | null
          score: number | null
        }
        Insert: {
          confidence?: number | null
          criterion_id?: string | null
          evidence?: string | null
          id?: string
          missing_data?: string | null
          potential_id?: string | null
          rationale?: string | null
          raw?: Json | null
          score?: number | null
        }
        Update: {
          confidence?: number | null
          criterion_id?: string | null
          evidence?: string | null
          id?: string
          missing_data?: string | null
          potential_id?: string | null
          rationale?: string | null
          raw?: Json | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "criteria_scores_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "criteria_preferences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "criteria_scores_potential_id_fkey"
            columns: ["potential_id"]
            isOneToOne: false
            referencedRelation: "potentials"
            referencedColumns: ["id"]
          },
        ]
      }
      potentials: {
        Row: {
          application_id: string | null
          avg_score: number | null
          created_at: string | null
          id: string
          notes: string | null
          overall_confindence: string | null
          progress_stage: number | null
          status: string | null
        }
        Insert: {
          application_id?: string | null
          avg_score?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          overall_confindence?: string | null
          progress_stage?: number | null
          status?: string | null
        }
        Update: {
          application_id?: string | null
          avg_score?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          overall_confindence?: string | null
          progress_stage?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "potentials_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
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
