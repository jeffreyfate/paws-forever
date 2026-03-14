// app/api/signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // Get the file path from query params
  const path = request.nextUrl.searchParams.get('path');

  if (!path) {
    return NextResponse.json(
      { error: 'Missing required parameter: path' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // Generate a signed URL (valid for 1 hour = 3600 seconds)
    const { data, error } = await supabase.storage
      .from('memories')  // ← change bucket name if different
      .createSignedUrl(path, 3600);

    if (error) {
      console.error('Signed URL error:', error);
      return NextResponse.json(
        { error: 'Failed to generate signed URL', details: error.message },
        { status: 500 }
      );
    }

    if (!data?.signedUrl) {
      return NextResponse.json(
        { error: 'No signed URL returned' },
        { status: 500 }
      );
    }

    // Option A: Redirect to the signed URL (simplest for <Image src=...>)
    return NextResponse.redirect(data.signedUrl);

    // Option B: Return the URL as JSON (if you prefer client-side fetching)
    // return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err) {
    console.error('Signed URL route error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}