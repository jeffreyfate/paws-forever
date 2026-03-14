// app/api/submit-memory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const formData = await request.formData();
    const email = formData.get('email') as string | null;
    const caption = formData.get('caption') as string;
    const file = formData.get('file') as File | null;

    if (!file || !caption) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `submissions/${fileName}`;

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

    // Insert to DB with approved: false
    const { error: insertError } = await supabase
      .from('submissions')
      .insert({
        email: email || null,
        type: file.type.startsWith('video') ? 'video' : 'photo',
        file_path: filePath,
        caption,
        approved: false,
      });

    if (insertError) {
      // Optional: delete uploaded file if DB insert fails
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