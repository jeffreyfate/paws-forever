'use client';

// app/submit/picking/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PickingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'waiting' | 'importing' | 'error'>('waiting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes at 2s intervals

    const poll = async () => {
      try {
        const res = await fetch('/api/check-picker-session');
        const data = await res.json();

        if (data.error) {
          setStatus('error');
          setErrorMsg(data.error);
          return;
        }

        if (data.ready && data.filePath) {
          setStatus('importing');
          router.push(`/submit?filePath=${encodeURIComponent(data.filePath)}`);
          return;
        }

        // Not ready yet — keep polling
        attempts++;
        if (attempts >= maxAttempts) {
          setStatus('error');
          setErrorMsg('Timed out waiting for photo selection. Please try again.');
          return;
        }

        setTimeout(poll, 2000);
      } catch (err) {
        setStatus('error');
        setErrorMsg('Something went wrong. Please try again.');
      }
    };

    poll();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-32 max-w-md text-center">
      {status === 'waiting' && (
        <>
          <div className="flex justify-center mb-6">
            <svg className="animate-spin h-10 w-10 text-muted-foreground" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Waiting for your selection...</h1>
          <p className="text-muted-foreground">
            Finish picking your photo in Google Photos. This page will update automatically.
          </p>
        </>
      )}

      {status === 'importing' && (
        <>
          <div className="flex justify-center mb-6">
            <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Importing photo...</h1>
          <p className="text-muted-foreground">Just a moment while we import your photo.</p>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{errorMsg}</p>
          <a href="/submit" className="text-primary underline">
            Back to submit
          </a>
        </>
      )}
    </div>
  );
}