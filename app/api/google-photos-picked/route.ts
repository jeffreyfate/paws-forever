import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('google_picker_token')?.value;
  const sessionId = request.cookies.get('google_picker_session')?.value;

  if (!token || !sessionId) {
    return NextResponse.redirect(new URL('/submit?error=missing_session', request.url));
  }

  // Fetch selected media items
  const itemsRes = await fetch(
    `https://photospicker.googleapis.com/v1/mediaItems?sessionId=${sessionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const itemsData = await itemsRes.json();
  const item = itemsData.mediaItems?.[0];

  if (!item) {
    return NextResponse.redirect(new URL('/submit?error=no_photo', request.url));
  }

  // Download photo
  const photoRes = await fetch(`${item.mediaFile.baseUrl}=d`);
  const photoBuffer = await photoRes.arrayBuffer();

  // Upload to Supabase
  const ext = item.mediaFile.mimeType.split('/')[1] ?? 'jpg';
  const filePath = `submissions/${crypto.randomUUID()}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from('memories')
    .upload(filePath, photoBuffer, {
      contentType: item.mediaFile.mimeType,
      upsert: false,
    });

  if (error) {
    return NextResponse.redirect(new URL('/submit?error=upload_failed', request.url));
  }

  // Clear cookies
  const response = NextResponse.redirect(
    new URL(`/submit?filePath=${encodeURIComponent(filePath)}`, request.url)
  );
  response.cookies.delete('google_picker_token');
  response.cookies.delete('google_picker_session');
  response.cookies.delete('google_oauth_state');

  return response;
}