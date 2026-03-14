'use client';

import { Button } from '@/components/ui/button';

interface GooglePhotosPickerProps {
  onPhotoPicked: (filePath: string) => void;
}

export default function GooglePhotosPicker({ onPhotoPicked }: GooglePhotosPickerProps) {
  return (
    <a href="/api/google-photos-auth">
      <Button type="button" variant="outline" className="w-full">
        📷 Pick from Google Photos
      </Button>
    </a>
  );
}