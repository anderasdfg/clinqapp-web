import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Singleton client instance
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

/**
 * Returns the singleton Supabase client.
 * Maintained for backward compatibility with existing code calling createClient().
 */
export function createClient() {
  return supabase;
}
