// app/submit/page.tsx
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/);
  return match ? match[1] : null;
}

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  caption: z.string().min(10, { message: 'Caption must be at least 10 characters' }).max(500),
  file: z.instanceof(File, { message: 'Please select a file' })
    .refine((file) => file.size <= 10 * 1024 * 1024, { message: 'File must be under 10MB' })
    .refine((file) => ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].includes(file.type), {
      message: 'Only JPG, PNG, WebP images or MP4 videos allowed',
    })
    .optional(),
  youtubeUrl: z.string()
    .refine((url) => !url || extractYouTubeId(url) !== null, {
      message: 'Please enter a valid YouTube URL',
    })
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;
type MediaMode = 'file' | 'youtube';

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaMode, setMediaMode] = useState<MediaMode>('file');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', caption: '', file: undefined, youtubeUrl: '' },
  });

  const { register, handleSubmit, formState: { errors }, control, reset, watch } = form;

  const youtubeUrl = watch('youtubeUrl') ?? '';
  const youtubeId = extractYouTubeId(youtubeUrl);

  async function onSubmit(values: FormValues) {
    if (mediaMode === 'file' && !values.file) {
      toast.error('Please select a photo to upload');
      return;
    }
    if (mediaMode === 'youtube' && !values.youtubeUrl) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mediaMode === 'youtube') {
        const response = await fetch('/api/submit-memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: values.email || '',
            caption: values.caption,
            youtubeUrl: values.youtubeUrl,
            type: 'video',
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Submission failed');
      } else {
        const formData = new FormData();
        formData.append('email', values.email || '');
        formData.append('caption', values.caption);
        formData.append('file', values.file!);

        const response = await fetch('/api/submit-memory', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Submission failed');
      }

      toast.success('Memory submitted!', {
        description: 'Thank you! It will be reviewed and added soon.',
        duration: 6000,
      });

      reset();
      setMediaMode('file');
    } catch (err: any) {
      toast.error('Submission failed', {
        description: err.message || 'Something went wrong. Please try again.',
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl">Share a Memory</CardTitle>
          <CardDescription>
            Upload a photo or share a YouTube video. All submissions are reviewed before appearing publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" placeholder="your@email.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              <p className="text-sm text-muted-foreground">So we can contact you if needed.</p>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption">Caption / Story</Label>
              <Textarea id="caption" placeholder="Tell us about this moment..." rows={5} {...register('caption')} />
              {errors.caption && <p className="text-sm text-destructive">{errors.caption.message}</p>}
            </div>

            {/* Media — two options */}
            <div className="space-y-3">
              <Label>Photo or Video</Label>

              <div className="flex rounded-md border overflow-hidden text-sm">
                {(['file', 'youtube'] as MediaMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setMediaMode(mode)}
                    className={`flex-1 py-2 px-3 transition-colors ${
                      mediaMode === mode
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {mode === 'file' && '📁 Upload Photo'}
                    {mode === 'youtube' && '▶️ YouTube Video'}
                  </button>
                ))}
              </div>

              {mediaMode === 'file' && (
                <Controller
                  control={control}
                  name="file"
                  render={({ field: { onChange, ...field } }) => (
                    <Input
                      id="file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,video/mp4"
                      onChange={(e) => onChange(e.target.files?.[0])}
                      {...field}
                      value={undefined}
                    />
                  )}
                />
              )}

              {mediaMode === 'youtube' && (
                <div className="space-y-3">
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register('youtubeUrl')}
                  />
                  {errors.youtubeUrl && (
                    <p className="text-sm text-destructive">{errors.youtubeUrl.message}</p>
                  )}
                  {youtubeId && (
                    <div className="aspect-video rounded-md overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title="YouTube preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>
              )}

              {errors.file && <p className="text-sm text-destructive">{errors.file.message}</p>}
              <p className="text-sm text-muted-foreground">
                {mediaMode === 'file' && 'Max 10MB. JPG/PNG/WebP or MP4.'}
                {mediaMode === 'youtube' && 'Paste a YouTube video URL to share a video memory.'}
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Memory'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}