import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/google-photos-callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly',
    access_type: 'online',
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );

  // Store state in cookie to verify on callback
  response.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  return response;
}