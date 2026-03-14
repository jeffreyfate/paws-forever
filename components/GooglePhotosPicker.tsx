// components/GooglePhotosPicker.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface GooglePhotosPickerProps {
  onPhotoPicked: (filePath: string) => void;
}

export default function GooglePhotosPicker({ onPhotoPicked }: GooglePhotosPickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePick() {
    setLoading(true);
    setError(null);

    try {
      // Step 1 — OAuth token via Google Identity Services
      const token = await getGoogleToken();

      // Step 2 — Create a picker session
      const sessionRes = await fetch(
        'https://photospicker.googleapis.com/v1/sessions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const session = await sessionRes.json();

      // Step 3 — Open the picker in a popup
      const pickerUrl = session.pickerUri;
      const popup = window.open(pickerUrl, 'Google Photos Picker', 'width=900,height=700');

      // Step 4 — Poll until user finishes picking
      await pollSession(session.id, token, popup);

    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function getGoogleToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly',
        callback: (response: any) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response.access_token);
        },
      });
      client.requestAccessToken();
    });
  }

  async function pollSession(sessionId: string, token: string, popup: Window | null) {
    return new Promise<void>((resolve, reject) => {
        let userDone = false;

        const interval = setInterval(async () => {
        try {
            const res = await fetch(
            `https://photospicker.googleapis.com/v1/sessions/${sessionId}`,
            { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();

            if (data.mediaItemsSet) {
            clearInterval(interval);
            userDone = true;
            popup?.close();

            const itemsRes = await fetch(
                `https://photospicker.googleapis.com/v1/mediaItems?sessionId=${sessionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const itemsData = await itemsRes.json();
            const item = itemsData.mediaItems?.[0];

            if (!item) {
                reject(new Error('No photo selected'));
                return;
            }

            const importRes = await fetch('/api/import-google-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                downloadUrl: `${item.mediaFile.baseUrl}=d`,
                mimeType: item.mediaFile.mimeType,
                }),
            });

            const importData = await importRes.json();
            if (!importRes.ok) throw new Error(importData.error);

            onPhotoPicked(importData.filePath);
            resolve();
            }
        } catch (err) {
            clearInterval(interval);
            reject(err);
        }
        }, 2000);

        // Only reject if popup closes AND user hasn't finished
        const popupCheck = setInterval(() => {
        if (popup?.closed && !userDone) {
            clearInterval(interval);
            clearInterval(popupCheck);
            reject(new Error('Picker closed without selecting a photo'));
        }
        if (userDone) clearInterval(popupCheck);
        }, 500);
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={handlePick}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Opening picker...' : '📷 Pick from Google Photos'}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}