import StarRating from './StarRating';

interface ReviewCardProps {
  /** Review data */
  review: {
    id: string;
    userId?: {
      id: string;
      name: string;
    };
    rating: number;
    comment: string;
    isVerified: boolean;
    createdAt: string;
  };
  /** Additional CSS class */
  className?: string;
}

/** Format date to Vietnamese locale */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });
}

export default function ReviewCard({ review, className = '' }: ReviewCardProps) {
  const userName = review.userId?.name || 'Người dùng ẩn danh';
  const isVerified = review.isVerified;

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-xl bg-primary/5 ${className}`}>
      {/* User Info Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-full size-10 flex items-center justify-center">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <p className="font-bold">{userName}</p>
            <p className="text-sm opacity-60">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        {/* Rating */}
        <StarRating rating={review.rating} readonly size="sm" />
      </div>

      {/* Comment */}
      <p className="opacity-80 leading-relaxed">&quot;{review.comment}&quot;</p>

      {/* Verified Badge */}
      {isVerified && (
        <div className="flex items-center gap-1.5 mt-1">
          <span className="material-symbols-outlined text-highlight text-sm">verified</span>
          <span className="text-xs font-medium text-highlight">
            Đã xác nhận đã ở
          </span>
        </div>
      )}
    </div>
  );
}
