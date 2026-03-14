// app/gallery/page.tsx
import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { createClient } from '@/lib/supabase/server';

export default async function Gallery() {
  const supabase = await createClient();

  // Fetch approved photos
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('id, file_path, caption, type, created_at')
    .eq('approved', true)
    .eq('type', 'photo')  // only photos for gallery
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gallery fetch error:', error);
    // fallback or error UI
    return <div className="text-center text-destructive">Failed to load gallery. Please try again later.</div>;
  }

  // Generate signed URLs for private bucket (expires in 1 hour, adjust as needed)
  const imagesWithUrls = await Promise.all(
    (submissions || []).map(async (item) => {
      const { data: signedUrlData } = await supabase.storage
        .from('memories')
        .createSignedUrl(item.file_path, 3600); // 1 hour

      return {
        id: item.id,
        src: signedUrlData?.signedUrl || '/placeholder.jpg', // fallback
        alt: item.caption || 'Submitted memory',
        aspect: 4 / 3, // default; can store aspect ratio in DB later if needed
      };
    })
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
        Gallery of Joy
      </h1>
      <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        Moments that made our hearts full. Click any photo to see it larger.
      </p>

      {imagesWithUrls.length === 0 ? (
        <div className="text-center text-muted-foreground py-32 flex flex-col items-center gap-4">
          <p className="text-xl font-medium">No approved photos yet</p>
          <p>Share some memories using the form!</p>
          <Button asChild variant="outline">
            <Link href="/submit">Submit a Memory</Link>
          </Button>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
          {imagesWithUrls.map((img) => (
            <Dialog key={img.id}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer break-inside-avoid">
                  <CardContent className="p-0">
                    <AspectRatio ratio={img.aspect}>
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      />
                    </AspectRatio>
                  </CardContent>
                </Card>
              </DialogTrigger>

              <DialogContent 
                className="max-w-[95vw] w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-6xl p-1 sm:p-4 bg-background border-none rounded-md"
              >
                <div className="relative w-full h-[80vh] md:h-[85vh] overflow-hidden rounded-md">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-contain"
                    sizes="90vw"
                    quality={92}
                    priority
                  />
                </div>
                <p className="text-center text-muted-foreground mt-4 px-2">{img.alt}</p>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}