// app/page.tsx
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      {/* Hero */}
      <section className="text-center mb-16">
        <div className="mx-auto mb-8 max-w-md">
          <Image
            src="/images/hero.jpg" // ← replace with your main photo
            alt="Beloved dog"
            width={600}
            height={600}
            className="rounded-full object-cover border-8 border-white shadow-2xl mx-auto"
            priority
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Forever Wagging Tails
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