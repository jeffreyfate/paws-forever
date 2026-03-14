// app/auth/callback/route.ts
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createAdminClient();

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to admin (or wherever you want after login)
  // You can read a 'redirect' param if passed earlier
  const redirectTo = requestUrl.searchParams.get('redirect') || '/admin';

  return NextResponse.redirect(
    new URL(redirectTo, requestUrl.origin)
  );
}