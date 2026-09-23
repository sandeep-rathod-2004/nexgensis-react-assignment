'use client';

import type { Review } from '@/types';
import { formatDate } from '@/lib/utils/formatting';
import { StarRating } from '@/components/products/StarRating';
import { MessageSquare, UserCircle } from 'lucide-react';

interface ProductReviewsProps {
  reviews: Review[];
}

export default function ProductReviews({ reviews }: ProductReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
        <MessageSquare className="h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-medium text-slate-600">No reviews available</p>
        <p className="mt-1 text-xs text-slate-400">Be the first to review this product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <UserCircle className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{review.reviewerName}</p>
                {review.date && (
                  <p className="text-xs text-slate-400">{formatDate(review.date)}</p>
                )}
              </div>
            </div>
            <StarRating rating={review.rating} size="sm" showValue />
          </div>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
