// app/memories/page.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createAdminClient } from '@/lib/supabase/server';

export default async function Memories() {
  const supabase = await createAdminClient();

  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('id, caption, email, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Memories fetch error:', error);
    return <div className="text-center text-destructive">Failed to load memories.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
        Cherished Memories
      </h1>
      <p className="text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
        Stories and moments that live on forever in our hearts.
      </p>

      <div className="max-w-3xl mx-auto">
        {submissions?.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No approved memories yet. Share some!
          </p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {submissions.map((mem) => (
              <AccordionItem key={mem.id} value={mem.id}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {mem.caption.substring(0, 50)}... {/* short preview */}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(mem.created_at).toLocaleDateString()} 
                      {mem.email ? ` • from ${mem.email.split('@')[0]}` : ''}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="leading-relaxed">{mem.caption}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}