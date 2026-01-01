'use client';

import { useState, useTransition } from 'react';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, User, Calendar, X, Send } from 'lucide-react';
import { format } from 'date-fns';

export interface VendorReview {
  id: string;
  vendorId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  helpfulCount: number;
  categories: {
    quality: number;
    communication: number;
    punctuality: number;
    value: number;
  };
}

interface Props {
  vendorId: string;
  vendorName: string;
  reviews: VendorReview[];
  averageRating: number;
  totalReviews: number;
  onSubmitReview?: (review: {
    rating: number;
    title: string;
    comment: string;
    categories: { quality: number; communication: number; punctuality: number; value: number };
  }) => Promise<{ success: boolean; error?: string }>;
  canReview?: boolean;
}

function StarRating({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, rating, count, total }: { label: string; rating: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-8 text-right text-gray-600">{rating}</span>
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
      <span className="w-8 text-gray-500">{count}</span>
    </div>
  );
}

export function VendorRating({
  vendorId,
  vendorName,
  reviews,
  averageRating,
  totalReviews,
  onSubmitReview,
  canReview = true,
}: Props) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Review form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [categoryRatings, setCategoryRatings] = useState({
    quality: 0,
    communication: 0,
    punctuality: 0,
    value: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev) => Math.round(rev.rating) === r).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select an overall rating');
      return;
    }

    if (!title.trim()) {
      setError('Please add a title to your review');
      return;
    }

    if (!comment.trim()) {
      setError('Please add a comment');
      return;
    }

    startTransition(async () => {
      if (onSubmitReview) {
        const result = await onSubmitReview({
          rating,
          title: title.trim(),
          comment: comment.trim(),
          categories: categoryRatings,
        });

        if (result.error) {
          setError(result.error);
        } else {
          // Reset form
          setShowReviewForm(false);
          setRating(0);
          setTitle('');
          setComment('');
          setCategoryRatings({ quality: 0, communication: 0, punctuality: 0, value: 0 });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h3>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div>
                <span className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                <span className="text-2xl text-gray-500">/5</span>
              </div>
              <div>
                <StarRating rating={averageRating} readonly size="lg" />
                <p className="text-sm text-gray-500 mt-1">{totalReviews} reviews</p>
              </div>
            </div>

            {canReview && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="mt-4 px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800 font-medium transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map((item) => (
              <RatingBar
                key={item.rating}
                label={`${item.rating} stars`}
                rating={item.rating}
                count={item.count}
                total={totalReviews}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900">Write Your Review</h4>
            <button
              onClick={() => setShowReviewForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <StarRating rating={rating} onRatingChange={setRating} size="lg" />
            </div>

            {/* Category Ratings */}
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(categoryRatings).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {key}
                  </label>
                  <StarRating
                    rating={value}
                    onRatingChange={(r) => setCategoryRatings({ ...categoryRatings, [key]: r })}
                    size="sm"
                  />
                </div>
              ))}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your experience with this vendor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-rose-700 text-white rounded-lg font-medium hover:bg-rose-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h4 className="font-bold text-gray-900">All Reviews ({reviews.length})</h4>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reviews yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to review this vendor</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.userName}</p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} readonly size="sm" />
                      <span className="text-sm text-gray-500">
                        {format(review.createdAt, 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
              <p className="text-gray-600 text-sm">{review.comment}</p>

              {/* Category Ratings */}
              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
                {Object.entries(review.categories).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="capitalize">{key}:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${s <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Helpful */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Was this helpful?</span>
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  Yes ({review.helpfulCount})
                </button>
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600">
                  <ThumbsDown className="h-4 w-4" />
                  No
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
