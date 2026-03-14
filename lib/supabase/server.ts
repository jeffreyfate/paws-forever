// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';

export async function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}