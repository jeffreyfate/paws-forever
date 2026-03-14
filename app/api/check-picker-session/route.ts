// app/api/check-picker-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('google_picker_token')?.value;
  const sessionId = request.cookies.get('google_picker_session')?.value;

  if (!token || !sessionId) {
    return NextResponse.json({ error: 'missing_session' }, { status: 400 });
  }

  // Check if user has finished picking
  const sessionRes = await fetch(
    `https://photospicker.googleapis.com/v1/sessions/${sessionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const session = await sessionRes.json();

  if (!session.mediaItemsSet) {
    // Not done yet — return status so client can keep polling
    return NextResponse.json({ ready: false });
  }

  // Fetch selected media items
  const itemsRes = await fetch(
    `https://photospicker.googleapis.com/v1/mediaItems?sessionId=${sessionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const itemsData = await itemsRes.json();
  const item = itemsData.mediaItems?.[0];

  if (!item) {
    return NextResponse.json({ error: 'no_photo' }, { status: 400 });
  }

  // Download photo from Google — baseUrl requires Authorization header
  const photoRes = await fetch(`${item.mediaFile.baseUrl}=d`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!photoRes.ok) {
    console.error('Photo download failed:', photoRes.status);
    return NextResponse.json({ error: 'download_failed' }, { status: 500 });
  }

  const photoBuffer = await photoRes.arrayBuffer();

  // Upload to Supabase
  const ext = item.mediaFile.mimeType.split('/')[1] ?? 'jpg';
  const filePath = `submissions/${crypto.randomUUID()}.${ext}`;

  const supabase = await createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from('memories')
    .upload(filePath, photoBuffer, {
      contentType: item.mediaFile.mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 });
  }

  // Clear cookies in response
  const response = NextResponse.json({ ready: true, filePath });
  response.cookies.delete('google_picker_token');
  response.cookies.delete('google_picker_session');
  response.cookies.delete('google_oauth_state');

  return response;
}