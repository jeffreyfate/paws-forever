// app/videos/page.tsx
import { createAdminClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/);
  return match ? match[1] : null;
}

export default async function Videos() {
  const supabase = await createAdminClient();

  const { data: videos, error } = await supabase
    .from('submissions')
    .select('id, caption, youtube_url, created_at')
    .eq('type', 'video')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-center text-destructive py-20">Error loading videos.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
        Videos of Love
      </h1>
      <p className="text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
        Captured moments of joy, mischief, and pure companionship.
      </p>

      {videos.length === 0 ? (
        <p className="text-center text-muted-foreground mt-12">
          No videos yet. Be the first to share one!
        </p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((vid) => {
            const youtubeId = vid.youtube_url ? extractYouTubeId(vid.youtube_url) : null;
            if (!youtubeId) return null;

            return (
              <Card key={vid.id} className="overflow-hidden border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{vid.caption.substring(0, 60)}{vid.caption.length > 60 ? '...' : ''}</CardTitle>
                  <CardDescription>{new Date(vid.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="p-0 aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={vid.caption}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}