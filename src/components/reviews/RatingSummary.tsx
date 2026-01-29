import StarRating from './StarRating';

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

interface RatingSummaryProps {
  /** Average rating (0-5) */
  averageRating: number;
  /** Total number of reviews */
  totalReviews: number;
  /** Distribution of ratings */
  distribution?: RatingDistribution;
  /** Additional CSS class */
  className?: string;
}

/** Format number to Vietnamese locale */
function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN');
}

export default function RatingSummary({
  averageRating,
  totalReviews,
  distribution,
  className = '',
}: RatingSummaryProps) {
  // Default distribution if not provided
  const dist = distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const maxCount = Math.max(...Object.values(dist), 1); // Avoid division by zero

  // Calculate percentage for each rating bar
  const getPercentage = (count: number): number => {
    return Math.round((count / maxCount) * 100);
  };

  return (
    <div className={`${className}`}>
      {/* Header: Average Rating */}
      <div className="flex items-center gap-4 mb-4">
        <span className="material-symbols-outlined text-4xl text-highlight fill-current">
          star
        </span>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
            <span className="opacity-60">/ 5</span>
          </div>
          <p className="text-sm opacity-60">
            {formatNumber(totalReviews)} đánh giá
          </p>
        </div>
      </div>

      {/* Rating Bars */}
      {totalReviews > 0 && distribution && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              {/* Star count label */}
              <span className="text-sm w-3 opacity-80">{star}</span>
              <span className="material-symbols-outlined text-sm text-highlight">
                star
              </span>

              {/* Progress bar */}
              <div className="flex-1 h-2 rounded-full bg-primary/10 overflow-hidden">
                <div
                  className="h-full bg-highlight transition-all duration-300"
                  style={{ width: `${getPercentage(dist[star as keyof RatingDistribution])}%` }}
                />
              </div>

              {/* Count */}
              <span className="text-sm w-8 text-right opacity-60">
                {formatNumber(dist[star as keyof RatingDistribution])}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* No reviews message */}
      {totalReviews === 0 && (
        <p className="text-sm opacity-60 mt-2">
          Chưa có đánh giá nào
        </p>
      )}
    </div>
  );
}
