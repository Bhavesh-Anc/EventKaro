'use client';

import { useState, useTransition } from 'react';
import { toggleVendorFavorite } from '@/actions/vendors';

interface FavoriteButtonProps {
  vendorId: string;
  initialFavorited: boolean;
}

export function FavoriteButton({ vendorId, initialFavorited }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleVendorFavorite(vendorId);
      if (result.favorited !== undefined) {
        setIsFavorited(result.favorited);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        isFavorited
          ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
          : 'hover:bg-muted'
      }`}
    >
      {isFavorited ? '❤️ Saved' : '🤍 Save'}
    </button>
  );
}
