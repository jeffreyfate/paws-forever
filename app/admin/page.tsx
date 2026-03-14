// app/admin/page.tsx
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cookies } from 'next/headers';
import { clearAdminSession, isAdminAuthenticated, setAdminSession } from '@/lib/auth/simple';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const authenticated = isAdminAuthenticated();

  // If not logged in, show password form
  if (!authenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter the admin password to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            {searchParams.error && (
              <p className="text-destructive mb-4">Incorrect password. Try again.</p>
            )}
            <form action={async (formData: FormData) => {
              'use server';

              const password = formData.get('password') as string;

              if (password === process.env.ADMIN_PASSWORD) {
                setAdminSession();
                redirect('/admin');
              } else {
                redirect('/admin?error=invalid');
              }
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in → show admin dashboard
  const supabase = await createClient();

  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('id, email, caption, file_path, type, approved, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-center text-destructive py-20">Error: {error.message}</div>;
  }

  // Server Action for approve/reject
  async function handleApprove(formData: FormData) {
    'use server';

    const id = formData.get('id') as string;
    const action = formData.get('action') as 'approve' | 'reject';

    const supabaseAction = await createClient();

    if (action === 'approve') {
      await supabaseAction.from('submissions').update({ approved: true }).eq('id', id);
    } else if (action === 'reject') {
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
        <form action={async () => {
          'use server';
          await clearAdminSession();
          redirect('/admin');
        }}>
          <Button type="submit" variant="outline" size="sm">
            Sign Out
          </Button>
        </form>
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
                {sub.type === 'photo' ? (
                    <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                        <img
                            src={`/api/signed-url?path=${encodeURIComponent(sub.file_path)}`}
                            alt={sub.caption}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            // Optional: add width/height for better layout shift prevention
                            width={640}
                            height={360}
                        />
                    </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    Video (preview not implemented)
                  </div>
                )}

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {sub.caption}
                </p>

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
                    <Button type="submit" variant="destructive" className="flex-1">
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