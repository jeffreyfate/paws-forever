// app/api/google-photos-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('google_oauth_state')?.value;

  console.log('state:', state, 'storedState:', storedState);

  if (!state || state !== storedState) {
    return NextResponse.redirect(new URL('/submit?error=invalid_state', request.url));
  }

  // Exchange code for access token
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/google-photos-callback`;
  console.log('redirect_uri:', redirectUri);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: code!,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  const { access_token, error: tokenError } = tokenData;
  console.log('token exchange:', { access_token: !!access_token, tokenError });

  if (!access_token) {
    return NextResponse.redirect(new URL('/submit?error=token_failed', request.url));
  }

  // Create picker session (no body needed)
  const sessionRes = await fetch('https://photospicker.googleapis.com/v1/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
  });

  const session = await sessionRes.json();
  console.log('picker session:', JSON.stringify(session));

  if (!session.pickerUri) {
    return NextResponse.redirect(new URL('/submit?error=picker_session_failed', request.url));
  }

  // Store token + session id in cookies, then redirect to picker with /autoclose
  // After picker closes, user lands on our /submit/picking waiting page
  const pickerUrl = `${session.pickerUri}/autoclose`;

  const response = NextResponse.redirect(pickerUrl);
  response.cookies.set('google_picker_token', access_token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });
  response.cookies.set('google_picker_session', session.id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60,
    path: '/',
  });

  return response;
}