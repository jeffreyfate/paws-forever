import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('google_oauth_state')?.value;

  if (!state || state !== storedState) {
    return NextResponse.redirect(new URL('/submit?error=invalid_state', request.url));
  }
  console.log('state:', state, 'storedState:', storedState);

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/google-photos-callback`;
  console.log('redirect_uri:', redirectUri);

  // Exchange code for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: code!,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/google-photos-callback`,
      grant_type: 'authorization_code',
    }),
  });

  const { access_token, error: tokenError } = await tokenRes.json();
  console.log('token exchange:', { access_token: !!access_token, tokenError });

  // Create picker session
  const sessionRes = await fetch('https://photospicker.googleapis.com/v1/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/google-photos-picked`,
    }),
  });
  const session = await sessionRes.json();
  console.log('picker session:', JSON.stringify(session));

  if (!session.pickerUri) {
    return NextResponse.redirect(new URL('/submit?error=picker_session_failed', request.url));
  }

  // Store token + session id in cookies for the picker callback
  const response = NextResponse.redirect(session.pickerUri);
  response.cookies.set('google_picker_token', access_token, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: '/',
    sameSite: 'lax',
  });
  response.cookies.set('google_picker_session', session.id, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}