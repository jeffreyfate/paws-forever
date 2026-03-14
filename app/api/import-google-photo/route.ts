// app/api/import-google-photo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { downloadUrl, mimeType } = await request.json();

    if (!downloadUrl || !mimeType) {
      return NextResponse.json({ error: 'Missing downloadUrl or mimeType' }, { status: 400 });
    }

    // Download the photo from Google
    const photoRes = await fetch(downloadUrl);
    if (!photoRes.ok) throw new Error('Failed to download photo from Google');
    const photoBuffer = await photoRes.arrayBuffer();

    // Generate a unique path
    const ext = mimeType.split('/')[1] ?? 'jpg';
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `submissions/${fileName}`;

    // Upload to Supabase storage
    const supabase = await createAdminClient();
    const { error: uploadError } = await supabase.storage
      .from('memories')
      .upload(filePath, photoBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    return NextResponse.json({ filePath });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 });
  }
}