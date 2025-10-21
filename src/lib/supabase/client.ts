import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/config/env.config';

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
