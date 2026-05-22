// src/database.types.ts
// Database schema definitions for PNDS CRM Backend

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;                      // UUID primary key
          email: string;                  // User email (unique)
          role: 'admin' | 'sales' | 'customer';  // User role
          wechat_key: string | null;      // ServerChan key for WeChat notifications
          name: string | null;            // Display name
          performance_total: number;      // Total sales performance amount (CNY)
          created_at: string;             // ISO timestamp
          updated_at: string;             // ISO timestamp
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'admin' | 'sales' | 'customer';
          wechat_key?: string | null;
          name?: string | null;
          performance_total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          role?: 'admin' | 'sales' | 'customer';
          wechat_key?: string | null;
          name?: string | null;
          performance_total?: number;
          updated_at?: string;
        };
      };
      bom_submissions: {
        Row: {
          id: string;                      // UUID primary key
          customer_email: string;          // Customer's email address
          bom_text: string | null;         // BOM text content
          file_url: string | null;         // Supabase Storage file URL
          assigned_sales_id: string | null; // Foreign key to profiles.id
          status: 'pending' | 'quoted' | 'ordered' | 'completed' | 'cancelled';
          region: string | null;           // Customer region (e.g., 'CN', 'DE', 'US')
          created_at: string;             // ISO timestamp
          updated_at: string;             // ISO timestamp
        };
        Insert: {
          id?: string;
          customer_email: string;
          bom_text?: string | null;
          file_url?: string | null;
          assigned_sales_id?: string | null;
          status?: 'pending' | 'quoted' | 'ordered' | 'completed' | 'cancelled';
          region?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          customer_email?: string;
          bom_text?: string | null;
          file_url?: string | null;
          assigned_sales_id?: string | null;
          status?: 'pending' | 'quoted' | 'ordered' | 'completed' | 'cancelled';
          region?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Type aliases for convenience
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type BOMSubmission = Database['public']['Tables']['bom_submissions']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type BOMSubmissionInsert = Database['public']['Tables']['bom_submissions']['Insert'];