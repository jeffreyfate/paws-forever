// app/videos/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Video = {
  title: string;
  embedId: string; // YouTube video ID, e.g., "dQw4w9WgXcQ"
  description?: string;
};

const videos: Video[] = [
  {
    title: "Favorite Playtime Moments",
    embedId: "YOUR_VIDEO_ID_HERE", // replace
    description: "Chasing balls and zoomies from summer 2022.",
  },
  {
    title: "Quiet Cuddles",
    embedId: "ANOTHER_ID",
    description: "Evening wind-downs that melted our hearts.",
  },
  // Add more – upload to YouTube first, set unlisted if desired
];

export default function Videos() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
        Videos of Love
      </h1>
      <p className="text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
        Captured moments of joy, mischief, and pure companionship.
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((vid, index) => (
          <Card key={index} className="overflow-hidden border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{vid.title}</CardTitle>
              {vid.description && (
                <CardDescription>{vid.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-0 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${vid.embedId}`}
                title={vid.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder if no videos yet */}
      {videos.length === 0 && (
        <p className="text-center text-muted-foreground mt-12">
          No videos added yet. Upload to YouTube and add embed IDs here!
        </p>
      )}
    </div>
  );
}