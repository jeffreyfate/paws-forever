// app/page.tsx
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

export const revalidate = 0;

async function getRandomHeroUrl(): Promise<string | null> {
  try {
    const supabase = await createAdminClient();

    const { data: submissions } = await supabase
      .from('submissions')
      .select('file_path')
      .eq('type', 'photo')
      .eq('approved', true);

    if (!submissions || submissions.length === 0) return null;

    const random = submissions[Math.floor(Math.random() * submissions.length)];

    const { data } = await supabase.storage
      .from('memories')
      .createSignedUrl(random.file_path, 60 * 60);

    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const heroUrl = await getRandomHeroUrl();

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      {/* Hero */}
      <section className="text-center mb-16">
        <div className="mx-auto mb-8 max-w-md">
          <Image
            src={heroUrl ?? '/images/hero.jpg'}
            alt="Beloved dog"
            width={600}
            height={600}
            className="rounded-full object-cover border-8 border-white shadow-2xl mx-auto"
            priority
            unoptimized
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          For the hydrant inspectors and mailman chasers
        </h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Photos and memories of the dogs who made every day better. They may be gone, but the love and chaos they left behind is forever.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/gallery">View Gallery</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/memories">Read Memories</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}