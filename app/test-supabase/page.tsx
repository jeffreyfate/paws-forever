// app/test-supabase/page.tsx (delete later)
import { createClient } from '@/lib/supabase/server';

export default async function TestSupabase() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('submissions').select('*').limit(1);

  if (error) return <pre>Error: {JSON.stringify(error, null, 2)}</pre>;

  return (
    <div>
      <h1>Supabase Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}