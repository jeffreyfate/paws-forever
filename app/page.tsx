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
        
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          In Loving Memory
        </h1>
        <p className="text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
          To all the paws that walked beside us, brought endless joy, and left pawprints on our hearts forever.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
            <Link href="/gallery">View Gallery</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/memories">Read Memories</Link>
          </Button>
        </div>
      </section>

      {/* Quick intro or quote */}
      <section className="max-w-3xl mx-auto text-center">
        <blockquote className="text-lg italic text-slate-700 border-l-4 border-amber-500 pl-6 py-2">
          "The risk of love is loss, and the price of loss is grief – but the pain of grief is only a shadow when compared with the pain of never risking love." – Hilary Stanton Zunin
        </blockquote>
      </section>
    </div>
  );
}