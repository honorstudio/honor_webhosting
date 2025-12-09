export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      onul_chat_messages: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          message: string | null
          message_type: string | null
          minor_project_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          message?: string | null
          message_type?: string | null
          minor_project_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          message?: string | null
          message_type?: string | null
          minor_project_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onul_chat_messages_minor_project_id_fkey"
            columns: ["minor_project_id"]
            isOneToOne: false
            referencedRelation: "onul_minor_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onul_chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "onul_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onul_major_projects: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          manager_id: string | null
          scheduled_date: string | null
          started_at: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          manager_id?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          manager_id?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onul_major_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "onul_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onul_major_projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "onul_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onul_minor_projects: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          major_project_id: string
          notes: string | null
          required_masters: number | null
          started_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          work_scope: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          major_project_id: string
          notes?: string | null
          required_masters?: number | null
          started_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          work_scope?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          major_project_id?: string
          notes?: string | null
          required_masters?: number | null
          started_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          work_scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onul_minor_projects_major_project_id_fkey"
            columns: ["major_project_id"]
            isOneToOne: false
            referencedRelation: "onul_major_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      onul_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          role: string
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          role?: string
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          role?: string
          skills?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      onul_project_participants: {
        Row: {
          applied_at: string | null
          approved_at: string | null
          created_at: string | null
          id: string
          master_id: string
          minor_project_id: string
          notes: string | null
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          approved_at?: string | null
          created_at?: string | null
          id?: string
          master_id: string
          minor_project_id: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          approved_at?: string | null
          created_at?: string | null
          id?: string
          master_id?: string
          minor_project_id?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onul_project_participants_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "onul_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onul_project_participants_minor_project_id_fkey"
            columns: ["minor_project_id"]
            isOneToOne: false
            referencedRelation: "onul_minor_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      onul_project_photos: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          minor_project_id: string
          photo_type: string
          photo_url: string
          uploader_id: string
          work_area: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          minor_project_id: string
          photo_type: string
          photo_url: string
          uploader_id: string
          work_area?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          minor_project_id?: string
          photo_type?: string
          photo_url?: string
          uploader_id?: string
          work_area?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onul_project_photos_minor_project_id_fkey"
            columns: ["minor_project_id"]
            isOneToOne: false
            referencedRelation: "onul_minor_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onul_project_photos_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "onul_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onul_store_visits: {
        Row: {
          after_photos: string[] | null
          before_photos: string[] | null
          created_at: string | null
          id: string
          master_id: string
          notes: string | null
          status: string | null
          store_id: string
          updated_at: string | null
          visit_date: string
        }
        Insert: {
          after_photos?: string[] | null
          before_photos?: string[] | null
          created_at?: string | null
          id?: string
          master_id: string
          notes?: string | null
          status?: string | null
          store_id: string
          updated_at?: string | null
          visit_date: string
        }
        Update: {
          after_photos?: string[] | null
          before_photos?: string[] | null
          created_at?: string | null
          id?: string
          master_id?: string
          notes?: string | null
          status?: string | null
          store_id?: string
          updated_at?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "onul_store_visits_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "onul_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onul_store_visits_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "onul_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      onul_stores: {
        Row: {
          address: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_type: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          updated_at: string | null
          visit_cycle: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_type?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          updated_at?: string | null
          visit_cycle?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_type?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          updated_at?: string | null
          visit_cycle?: string | null
        }
        Relationships: []
      }
      onul_chat_read_status: {
        Row: {
          id: string
          minor_project_id: string
          user_id: string
          last_read_at: string | null
          last_read_message_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          minor_project_id: string
          user_id: string
          last_read_at?: string | null
          last_read_message_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          minor_project_id?: string
          user_id?: string
          last_read_at?: string | null
          last_read_message_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onul_chat_read_status_minor_project_id_fkey"
            columns: ["minor_project_id"]
            isOneToOne: false
            referencedRelation: "onul_minor_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onul_chat_read_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "onul_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onul_chat_read_status_last_read_message_id_fkey"
            columns: ["last_read_message_id"]
            isOneToOne: false
            referencedRelation: "onul_chat_messages"
            referencedColumns: ["id"]
          }
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
  }
}

// 편의를 위한 타입 별칭
export type OnulProfile = Database['public']['Tables']['onul_profiles']['Row']
export type OnulMajorProject = Database['public']['Tables']['onul_major_projects']['Row']
export type OnulMinorProject = Database['public']['Tables']['onul_minor_projects']['Row']
export type OnulProjectParticipant = Database['public']['Tables']['onul_project_participants']['Row']
export type OnulProjectPhoto = Database['public']['Tables']['onul_project_photos']['Row']
export type OnulChatMessage = Database['public']['Tables']['onul_chat_messages']['Row']
export type OnulStore = Database['public']['Tables']['onul_stores']['Row']
export type OnulStoreVisit = Database['public']['Tables']['onul_store_visits']['Row']
export type OnulChatReadStatus = Database['public']['Tables']['onul_chat_read_status']['Row']

// 역할 타입
export type UserRole = 'super_admin' | 'project_manager' | 'master' | 'client'
