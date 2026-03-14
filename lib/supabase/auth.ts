// lib/supabase/auth.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function getSession() {
  const supabase = await createAdminClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}