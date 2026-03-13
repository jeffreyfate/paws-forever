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
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Placeholder images — replace with your real paths in /public/images/
// For now, assume you have dog1.jpg, dog2.jpg, etc. in public/images/gallery/
const galleryImages = [
  { src: "/images/gallery/kenji001.jpg", alt: "Kenji", aspect: 3/4 },
  { src: "/images/gallery/kenji002.jpg", alt: "Kenji hungry", aspect: 4/3 },
  { src: "/images/gallery/kenji003.jpg", alt: "Kenji playmate", aspect: 4/3 },
  { src: "/images/gallery/kenji004.jpg", alt: "Kenji sleeping", aspect: 4/3 },
  { src: "/images/gallery/kenji005.jpg", alt: "Kenji pillow", aspect: 4/3 },
  // Add more as you upload — keep filenames simple
];

export default function Gallery() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
        Gallery of Joy
      </h1>
      <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        Moments that made our hearts full. Click any photo to see it larger.
      </p>

      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
        {galleryImages.map((img, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer break-inside-avoid">
                <CardContent className="p-0">
                  <AspectRatio ratio={img.aspect as any}>
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

            <DialogContent className="max-w-5xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] p-1 sm:p-4 bg-background border-none">
              <div className="relative w-full h-[80vh] overflow-hidden rounded-md">  {/* ← increased height, w-full */}
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-contain"
                  sizes="90vw"
                  quality={90}
                  priority
                />
              </div>
              <p className="text-center text-muted-foreground mt-4">{img.alt}</p>
            </DialogContent>
          </Dialog>
        ))}

        {/* Optional: Skeleton placeholders while loading real images */}
        {/* Remove once you have photos */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={`skeleton-${i}`} className="overflow-hidden border-none shadow-sm break-inside-avoid">
            <CardContent className="p-0">
              <AspectRatio ratio={4 / 3}>
                <Skeleton className="w-full h-full" />
              </AspectRatio>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}