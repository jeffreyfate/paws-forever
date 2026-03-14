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

// Zod schema (same)
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  caption: z.string().min(10, { message: 'Caption must be at least 10 characters' }).max(500),
  file: z.instanceof(File, { message: 'Please select a file' })
    .refine((file) => file.size <= 10 * 1024 * 1024, { message: 'File must be under 10MB' })
    .refine((file) => ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].includes(file.type), {
      message: 'Only JPG, PNG, WebP images or MP4 videos allowed',
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      caption: '',
      file: undefined as any,
    },
  });

  const { register, handleSubmit, formState: { errors }, control, setValue, reset } = form;

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('email', values.email || '');
    formData.append('caption', values.caption);
    formData.append('file', values.file);

    try {
      const response = await fetch('/api/submit-memory', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      toast.success('Memory submitted!', {
        description: 'Thank you! It will be reviewed and added soon.',
        duration: 6000,
      });

      reset();
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

            {/* File */}
            <div className="space-y-2">
              <Label htmlFor="file">Photo or Video</Label>
              <Controller
                control={control}
                name="file"
                render={({ field: { onChange, ...field } }) => (
                  <Input
                    id="file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                    }}
                    {...field}
                    value={undefined} // avoid warning
                  />
                )}
              />
              {errors.file && <p className="text-sm text-destructive">{errors.file.message}</p>}
              <p className="text-sm text-muted-foreground">Max 10MB. JPG/PNG/WebP or MP4.</p>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full"
            >
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