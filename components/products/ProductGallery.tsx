'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const validImages = images.length > 0 ? images : ['/placeholder.svg'];
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = activeIndex < validImages.length ? activeIndex : 0;
  const activeImage = validImages[safeIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <Image
          src={activeImage}
          alt={`${title} - Image ${safeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
          unoptimized
          priority
        />
      </div>

      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {validImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-slate-50 transition-all',
                i === safeIndex
                  ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-1'
                  : 'border-slate-200 hover:border-slate-400'
              )}
              aria-label={`View image ${i + 1}`}
              aria-selected={i === safeIndex}
              role="tab"
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
