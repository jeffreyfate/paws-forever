// app/admin/page.tsx
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/auth'; // your helper from earlier
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminPage() {
  const user = await getUser();

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect('/signin?redirect=/admin');
  }

  const supabase = await createClient();

  // Fetch all submissions
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('id, email, caption, file_path, type, approved, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-destructive">
        Error loading submissions: {error.message}
      </div>
    );
  }

  // Server Action: Approve or Reject
  async function handleApprove(formData: FormData) {
    'use server';

    const id = formData.get('id') as string;
    const action = formData.get('action') as 'approve' | 'reject';

    const supabaseAction = await createClient();

    if (action === 'approve') {
      await supabaseAction
        .from('submissions')
        .update({ approved: true })
        .eq('id', id);
    } else if (action === 'reject') {
      // Optional: delete the file from storage
      const { data } = await supabaseAction
        .from('submissions')
        .select('file_path')
        .eq('id', id)
        .single();

      if (data?.file_path) {
        await supabaseAction.storage.from('memories').remove([data.file_path]);
      }

      await supabaseAction.from('submissions').delete().eq('id', id);
    }

    // Refresh the pages
    revalidatePath('/admin');
    revalidatePath('/gallery');
    revalidatePath('/memories');
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Admin – Review Submissions
        </h1>
        <p className="text-sm text-muted-foreground">
          Logged in as {user.email}
        </p>
      </div>

      {submissions?.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          No submissions to review yet.
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {submissions.map((sub) => (
            <Card key={sub.id} className="overflow-hidden border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {sub.caption.substring(0, 60)}...
                </CardTitle>
                <CardDescription>
                  {new Date(sub.created_at).toLocaleString()} • {sub.type.toUpperCase()}
                  {sub.email && ` • from ${sub.email.split('@')[0]}`}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Preview */}
                {sub.type === 'photo' ? (
                  <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                    <Image
                      src={`/api/signed-url?path=${encodeURIComponent(sub.file_path)}`}
                      alt={sub.caption}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    Video preview not available
                  </div>
                )}

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {sub.caption}
                </p>

                {/* Approve / Reject buttons */}
                <div className="flex gap-4">
                  <form action={handleApprove}>
                    <input type="hidden" name="id" value={sub.id} />
                    <input type="hidden" name="action" value="approve" />
                    <Button
                      type="submit"
                      variant="default"
                      className="flex-1"
                      disabled={sub.approved}
                    >
                      {sub.approved ? 'Approved' : 'Approve'}
                    </Button>
                  </form>

                  <form action={handleApprove}>
                    <input type="hidden" name="id" value={sub.id} />
                    <input type="hidden" name="action" value="reject" />
                    <Button
                      type="submit"
                      variant="destructive"
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </form>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Status: {sub.approved ? 'Approved' : 'Pending'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}