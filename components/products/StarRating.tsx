'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function StarRating({ rating, size = 'md', showValue = false }: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(5, rating));
  const filled = Math.floor(clampedRating);
  const hasHalf = clampedRating - filled >= 0.25 && clampedRating - filled < 0.75;
  const fullFilled = clampedRating - filled >= 0.75 ? filled + 1 : filled;
  const starSize = sizeMap[size];

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${clampedRating.toFixed(1)} out of 5`}>
      <div className="flex items-center" role="img">
        {Array.from({ length: 5 }).map((_, i) => {
          const isFilled = i < fullFilled;
          const isHalf = hasHalf && i === filled;
          return (
            <span key={i} className="relative">
              <Star
                className={cn(starSize, 'text-slate-300')}
                fill="currentColor"
                strokeWidth={0}
              />
              {(isFilled || isHalf) && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: isHalf ? '50%' : '100%' }}>
                  <Star
                    className={cn(starSize, 'text-amber-400')}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-medium text-slate-700">{clampedRating.toFixed(1)}</span>
      )}
    </div>
  );
}
