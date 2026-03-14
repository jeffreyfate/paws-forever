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
import GooglePhotosPicker from '@/components/GooglePhotosPicker';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  caption: z.string().min(10, { message: 'Caption must be at least 10 characters' }).max(500),
  file: z.instanceof(File, { message: 'Please select a file' })
    .refine((file) => file.size <= 10 * 1024 * 1024, { message: 'File must be under 10MB' })
    .refine((file) => ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].includes(file.type), {
      message: 'Only JPG, PNG, WebP images or MP4 videos allowed',
    })
    .optional(), // ← now optional since Google Photos bypasses this
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleFilePath, setGoogleFilePath] = useState<string | null>(null); // ← holds path from Google Photos

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', caption: '', file: undefined },
  });

  const { register, handleSubmit, formState: { errors }, control, reset } = form;

  function handlePhotoPicked(filePath: string) {
    setGoogleFilePath(filePath);
    toast.success('Photo imported!', { description: 'Now add a caption and submit.' });
  }

  async function onSubmit(values: FormValues) {
    // Must have either a file upload or a Google Photos import
    if (!values.file && !googleFilePath) {
      toast.error('Please select a photo or pick from Google Photos');
      return;
    }

    setIsSubmitting(true);

    try {
      if (googleFilePath) {
        // Google Photos path — file is already in Supabase, just insert the record
        const response = await fetch('/api/submit-memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: values.email || '',
            caption: values.caption,
            filePath: googleFilePath,
            type: 'photo',
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Submission failed');
      } else {
        // Regular file upload path
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
      setGoogleFilePath(null);
    } catch (err: any) {
      toast.error('Submission failed', {
        description: err.message || 'Something went wrong. Please try again.',
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const searchParams = useSearchParams();

  useEffect(() => {
    const filePath = searchParams.get('filePath');
    const error = searchParams.get('error');

    if (filePath) {
      setGoogleFilePath(filePath);
      toast.success('Photo imported from Google Photos!');
    }
    if (error) {
      toast.error('Google Photos error', { description: error });
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl">Share a Memory</CardTitle>
          <CardDescription>
            Upload a photo or short video and add a caption. All submissions are reviewed before appearing publicly.
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

            {/* File — two options */}
            <div className="space-y-3">
              <Label>Photo or Video</Label>

              {googleFilePath ? (
                // Show confirmation when Google photo is picked
                <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="text-muted-foreground">✓ Photo imported from Google Photos</span>
                  <button
                    type="button"
                    className="text-destructive text-xs"
                    onClick={() => setGoogleFilePath(null)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
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
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <GooglePhotosPicker onPhotoPicked={handlePhotoPicked} />
                </>
              )}

              {errors.file && <p className="text-sm text-destructive">{errors.file.message}</p>}
              <p className="text-sm text-muted-foreground">Max 10MB. JPG/PNG/WebP or MP4.</p>
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