import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Service Role Admin Supabase Client
 * Used strictly for trusted backend serverless functions, cron jobs, and batch AIO trackers.
 * Bypasses RLS - queries must explicitly filter by tenant_id when writing multi-tenant logic.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://wmbufomqafcxnsglrrvz.supabase.co';
  
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const serviceRoleKey = (rawKey && !rawKey.includes('[SENSITIVE]')) 
    ? rawKey 
    : (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase URL or API Key environment variables.');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

