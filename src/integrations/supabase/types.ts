export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_code_reviews: {
        Row: {
          ai_model: string | null
          code_quality_issues: Json | null
          created_at: string
          id: string
          overall_score: number | null
          performance_issues: Json | null
          processing_time_ms: number | null
          pull_request_id: string
          review_data: Json | null
          security_issues: Json | null
          status: string
          suggestions: Json | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          ai_model?: string | null
          code_quality_issues?: Json | null
          created_at?: string
          id?: string
          overall_score?: number | null
          performance_issues?: Json | null
          processing_time_ms?: number | null
          pull_request_id: string
          review_data?: Json | null
          security_issues?: Json | null
          status?: string
          suggestions?: Json | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          ai_model?: string | null
          code_quality_issues?: Json | null
          created_at?: string
          id?: string
          overall_score?: number | null
          performance_issues?: Json | null
          processing_time_ms?: number | null
          pull_request_id?: string
          review_data?: Json | null
          security_issues?: Json | null
          status?: string
          suggestions?: Json | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_code_reviews_pull_request_id_fkey"
            columns: ["pull_request_id"]
            isOneToOne: false
            referencedRelation: "pull_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_task_suggestions: {
        Row: {
          applied: boolean | null
          confidence_score: number | null
          created_at: string
          id: string
          suggestion_data: Json
          suggestion_type: string
          task_id: string
          user_id: string
        }
        Insert: {
          applied?: boolean | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          suggestion_data: Json
          suggestion_type: string
          task_id: string
          user_id: string
        }
        Update: {
          applied?: boolean | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          suggestion_data?: Json
          suggestion_type?: string
          task_id?: string
          user_id?: string
        }
        Relationships: []
      }
      analyses: {
        Row: {
          asset_name: string
          confidence_score: number | null
          created_at: string
          explanation: string | null
          id: string
          image_url: string | null
          price_data: Json | null
          recommendation: string | null
          risk_warning: string | null
          technical_indicators: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_name: string
          confidence_score?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          price_data?: Json | null
          recommendation?: string | null
          risk_warning?: string | null
          technical_indicators?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_name?: string
          confidence_score?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          price_data?: Json | null
          recommendation?: string | null
          risk_warning?: string | null
          technical_indicators?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      code_review_comments: {
        Row: {
          ai_review_id: string
          code_snippet: string | null
          comment_type: string
          created_at: string
          description: string
          file_path: string
          id: string
          line_number: number | null
          severity: string
          suggested_fix: string | null
          title: string
        }
        Insert: {
          ai_review_id: string
          code_snippet?: string | null
          comment_type: string
          created_at?: string
          description: string
          file_path: string
          id?: string
          line_number?: number | null
          severity?: string
          suggested_fix?: string | null
          title: string
        }
        Update: {
          ai_review_id?: string
          code_snippet?: string | null
          comment_type?: string
          created_at?: string
          description?: string
          file_path?: string
          id?: string
          line_number?: number | null
          severity?: string
          suggested_fix?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_review_comments_ai_review_id_fkey"
            columns: ["ai_review_id"]
            isOneToOne: false
            referencedRelation: "ai_code_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      code_snippets: {
        Row: {
          code_text: string
          commit_sha: string | null
          created_at: string
          file_path: string
          id: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          code_text: string
          commit_sha?: string | null
          created_at?: string
          file_path: string
          id?: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          code_text?: string
          commit_sha?: string | null
          created_at?: string
          file_path?: string
          id?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      github_repositories: {
        Row: {
          clone_url: string | null
          created_at: string
          default_branch: string | null
          full_name: string
          github_id: number
          html_url: string
          id: string
          is_private: boolean | null
          last_sync_at: string | null
          name: string
          owner: string
          ssh_url: string | null
          updated_at: string
          user_id: string
          webhook_id: number | null
          webhook_secret: string | null
        }
        Insert: {
          clone_url?: string | null
          created_at?: string
          default_branch?: string | null
          full_name: string
          github_id: number
          html_url: string
          id?: string
          is_private?: boolean | null
          last_sync_at?: string | null
          name: string
          owner: string
          ssh_url?: string | null
          updated_at?: string
          user_id: string
          webhook_id?: number | null
          webhook_secret?: string | null
        }
        Update: {
          clone_url?: string | null
          created_at?: string
          default_branch?: string | null
          full_name?: string
          github_id?: number
          html_url?: string
          id?: string
          is_private?: boolean | null
          last_sync_at?: string | null
          name?: string
          owner?: string
          ssh_url?: string | null
          updated_at?: string
          user_id?: string
          webhook_id?: number | null
          webhook_secret?: string | null
        }
        Relationships: []
      }
      productivity_insights: {
        Row: {
          confidence_score: number | null
          expires_at: string | null
          generated_at: string
          id: string
          insight_data: Json
          insight_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          expires_at?: string | null
          generated_at?: string
          id?: string
          insight_data: Json
          insight_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          expires_at?: string | null
          generated_at?: string
          id?: string
          insight_data?: Json
          insight_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          preferred_language: string | null
          risk_profile: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          preferred_language?: string | null
          risk_profile?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          preferred_language?: string | null
          risk_profile?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          repo_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          repo_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          repo_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_text: string
          updated_at: string
          usage_count: number | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_text: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_text?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      prompts: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          model_used: string | null
          prompt_text: string
          response_text: string | null
          task_id: string | null
          template_id: string | null
          title: string
          tokens_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          model_used?: string | null
          prompt_text: string
          response_text?: string | null
          task_id?: string | null
          template_id?: string | null
          title: string
          tokens_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          model_used?: string | null
          prompt_text?: string
          response_text?: string | null
          task_id?: string | null
          template_id?: string | null
          title?: string
          tokens_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pull_requests: {
        Row: {
          additions: number | null
          author: string
          author_avatar_url: string | null
          base_branch: string
          body: string | null
          changed_files: number | null
          closed_at: string | null
          created_at: string
          deletions: number | null
          diff_url: string | null
          github_id: number
          head_branch: string
          html_url: string
          id: string
          mergeable: boolean | null
          merged_at: string | null
          number: number
          patch_url: string | null
          repository_id: string
          state: string
          title: string
          updated_at: string
        }
        Insert: {
          additions?: number | null
          author: string
          author_avatar_url?: string | null
          base_branch: string
          body?: string | null
          changed_files?: number | null
          closed_at?: string | null
          created_at?: string
          deletions?: number | null
          diff_url?: string | null
          github_id: number
          head_branch: string
          html_url: string
          id?: string
          mergeable?: boolean | null
          merged_at?: string | null
          number: number
          patch_url?: string | null
          repository_id: string
          state: string
          title: string
          updated_at?: string
        }
        Update: {
          additions?: number | null
          author?: string
          author_avatar_url?: string | null
          base_branch?: string
          body?: string | null
          changed_files?: number | null
          closed_at?: string | null
          created_at?: string
          deletions?: number | null
          diff_url?: string | null
          github_id?: number
          head_branch?: string
          html_url?: string
          id?: string
          mergeable?: boolean | null
          merged_at?: string | null
          number?: number
          patch_url?: string | null
          repository_id?: string
          state?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pull_requests_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "github_repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      task_analytics: {
        Row: {
          actual_hours: number | null
          completion_date: string | null
          complexity_score: number | null
          created_at: string
          efficiency_score: number | null
          estimated_hours: number | null
          focus_time_minutes: number | null
          id: string
          interruptions_count: number | null
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_hours?: number | null
          completion_date?: string | null
          complexity_score?: number | null
          created_at?: string
          efficiency_score?: number | null
          estimated_hours?: number | null
          focus_time_minutes?: number | null
          id?: string
          interruptions_count?: number | null
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_hours?: number | null
          completion_date?: string | null
          complexity_score?: number | null
          created_at?: string
          efficiency_score?: number | null
          estimated_hours?: number | null
          focus_time_minutes?: number | null
          id?: string
          interruptions_count?: number | null
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_task_analytics_task"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          priority: string | null
          project_id: string | null
          status: string | null
          tags: string[] | null
          title: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_hours?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_hours?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string
          current_value: number | null
          goal_type: string
          id: string
          period_end: string
          period_start: string
          status: string | null
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          goal_type: string
          id?: string
          period_end: string
          period_start: string
          status?: string | null
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          goal_type?: string
          id?: string
          period_end?: string
          period_start?: string
          status?: string | null
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          asset_name: string
          created_at: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          asset_name: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          asset_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_template_usage: {
        Args: { template_id: string }
        Returns: undefined
      }
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
