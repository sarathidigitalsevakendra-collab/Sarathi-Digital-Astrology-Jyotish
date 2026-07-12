/**
 * Supabase Database Types
 *
 * This file can be auto-generated using:
 * npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      [_ in string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: {
      [_ in string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [_ in string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [_ in string]: string;
    };
  };
}
