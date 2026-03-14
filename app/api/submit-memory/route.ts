// app/api/submit-memory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createAdminClient();
  const contentType = request.headers.get('content-type') ?? '';

  try {
    let email: string | null = null;
    let caption: string;
    let filePath: string | null = null;
    let youtubeUrl: string | null = null;
    let type: string;

    if (contentType.includes('application/json')) {
      // YouTube path
      const body = await request.json();
      email = body.email || null;
      caption = body.caption;
      youtubeUrl = body.youtubeUrl;
      type = 'video';

      if (!youtubeUrl || !caption) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
    } else {
      // File upload path
      const formData = await request.formData();
      email = formData.get('email') as string | null;
      caption = formData.get('caption') as string;
      const file = formData.get('file') as File | null;

      if (!file || !caption) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      filePath = `submissions/${fileName}`;
      type = file.type.startsWith('video') ? 'video' : 'photo';

      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(filePath, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.error(uploadError);
        return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
      }
    }

    const { error: insertError } = await supabase
      .from('submissions')
      .insert({
        email: email || null,
        type,
        file_path: filePath,
        youtube_url: youtubeUrl,
        caption,
        approved: false,
      });

    if (insertError) {
      if (filePath) await supabase.storage.from('memories').remove([filePath]);
      console.error(insertError);
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}