'use client';

// components/GooglePhotosPicker.tsx
import { Button } from '@/components/ui/button';

interface GooglePhotosPickerProps {
  onPhotoPicked: (filePath: string) => void;
}

export default function GooglePhotosPicker({ onPhotoPicked }: GooglePhotosPickerProps) {
  // The picker flow:
  // 1. User clicks button → goes to /api/google-photos-auth
  // 2. Auth route → Google OAuth
  // 3. Google → /api/google-photos-callback (exchanges code, creates session)
  // 4. Callback → Google Photos picker (with /autoclose)
  // 5. After picking → tab closes, user is on /submit/picking
  // 6. Picking page polls /api/check-picker-session until photo is imported
  // 7. Redirects to /submit?filePath=... which triggers GooglePhotosHandler

  return (
    <a href="/api/google-photos-auth">
      <Button type="button" variant="outline" className="w-full">
        📷 Pick from Google Photos
      </Button>
    </a>
  );
}