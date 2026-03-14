// app/api/submit-memory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();
  const contentType = request.headers.get('content-type') ?? '';

  try {
    let email: string | null = null;
    let caption: string;
    let filePath: string;
    let type: string;

    if (contentType.includes('application/json')) {
      // Google Photos path — file already uploaded to Supabase
      const body = await request.json();
      email = body.email || null;
      caption = body.caption;
      filePath = body.filePath;
      type = body.type ?? 'photo';

      if (!filePath || !caption) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
    } else {
      // Regular file upload path
      const formData = await request.formData();
      email = formData.get('email') as string | null;
      caption = formData.get('caption') as string;
      const file = formData.get('file') as File | null;

      if (!file || !caption) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      filePath = `submissions/${fileName}`;
      type = file.type.startsWith('video') ? 'video' : 'photo';

      // Upload to Storage (bucket: memories, private)
      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
      }
    }

    // Insert to DB with approved: false
    const { error: insertError } = await supabase
      .from('submissions')
      .insert({
        email: email || null,
        type,
        file_path: filePath,
        caption,
        approved: false,
      });

    if (insertError) {
      // Delete uploaded file if DB insert fails
      await supabase.storage.from('memories').remove([filePath]);
      console.error(insertError);
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}