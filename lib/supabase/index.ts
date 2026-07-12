/**
 * Supabase Client and Utilities (Client-Side Only)
 *
 * Export all client-side Supabase helpers from a central location
 *
 * ⚠️ DO NOT import this in Server Components!
 * For Server Components, use: import { createClient } from '@/lib/supabase/server'
 */

// Client-side browser client
export { createClient } from "./client";

// Auth helpers (client-side only)
export { supabaseAuth } from "./auth";

// Database helpers (client-side only)
export { supabaseDB, supabaseRealtime, supabaseStorage } from "./database";

// Types
export type { Database } from "./types";
