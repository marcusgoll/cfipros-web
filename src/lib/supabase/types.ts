// This file will contain Supabase-specific generated types or custom types related to Supabase interaction.

export type UserRole = 'STUDENT' | 'CFI' | 'SCHOOL_ADMIN';
export type Part61Or141Type = 'PART_61' | 'PART_141';

export interface Profile {
  id: string; // UUID, references auth.users.id
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ, nullable
  full_name?: string | null; // TEXT, nullable
  email: string; // TEXT, should match auth.users email
  role: UserRole;
  part_61_or_141_type?: Part61Or141Type | null; // ENUM, nullable
  preferences?: Record<string, any> | null; // JSONB, nullable
}

export interface School {
  id: string; // UUID
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  deleted_at?: string | null; // TIMESTAMPTZ, nullable
  name: string; // TEXT
  admin_user_id: string; // UUID, references profiles.id
  part_61_or_141_type: Part61Or141Type;
  description?: string | null; // TEXT, nullable
  website_url?: string | null; // TEXT, nullable
  logo_url?: string | null; // TEXT, nullable
  contact_email?: string | null; // TEXT, nullable
  phone_number?: string | null; // TEXT, nullable
  address_line1?: string | null; // TEXT, nullable
  address_line2?: string | null; // TEXT, nullable
  city?: string | null; // TEXT, nullable
  state_province?: string | null; // TEXT, nullable
  postal_code?: string | null; // TEXT, nullable
  country?: string | null; // TEXT, nullable
}

// Example of how you might structure your main DB types if using supabase-js v2 type generation
// This is a placeholder and would typically be auto-generated or more complex.
/*
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile; // The data expected to be returned from a "select"
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> & { id?: string }; // The data expected passed to an "insert"
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>; // The data expected passed to an "update"
      };
      schools: {
        Row: School;
        Insert: Omit<School, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> & { id?: string };
        Update: Partial<Omit<School, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      user_role_enum: UserRole;
      part_61_or_141_type_enum: Part61Or141Type;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
*/

// For now, we export the core interfaces directly.
// The commented out Database interface above is a more complete example for future reference if needed.
