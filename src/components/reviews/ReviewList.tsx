'use client';

import { useState, useEffect, useCallback } from 'react';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';

interface ReviewListProps {
  /** Room ID to fetch reviews for */
  roomId: string;
  /** Initial page to show */
  initialPage?: number;
  /** Number of reviews per page */
  limit?: number;
  /** Additional CSS class */
  className?: string;
}

interface Review {
  id: string;
  userId?: {
    id: string;
    name: string;
  };
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ReviewList({
  roomId,
  initialPage = 1,
  limit = 10,
  className = '',
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        roomId,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/reviews?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data: ReviewListResponse = await response.json();

      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [roomId, page, limit]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Skeleton loading */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex flex-col gap-3 p-4 rounded-xl bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-full size-10" />
              <div className="space-y-2">
                <div className="h-4 bg-primary/20 rounded w-24" />
                <div className="h-3 bg-primary/20 rounded w-16" />
              </div>
            </div>
            <div className="h-4 bg-primary/20 rounded w-full" />
            <div className="h-4 bg-primary/20 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-xl bg-red-50 text-red-600 ${className}`}>
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`p-8 text-center opacity-60 ${className}`}>
        <span className="material-symbols-outlined text-4xl mb-2">rate_review</span>
        <p>Chưa có đánh giá nào cho phòng này.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <span className="text-sm opacity-80">
            Trang {page} / {totalPages} ({total} đánh giá)
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
