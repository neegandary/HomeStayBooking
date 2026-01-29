'use client';

import { useState, useCallback } from 'react';

interface StarRatingProps {
  /** Current rating value (1-5) */
  rating: number;
  /** Whether the rating is interactive (for input) */
  readonly?: boolean;
  /** Callback when rating changes (only for interactive mode) */
  onChange?: (rating: number) => void;
  /** Size of stars */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS class */
  className?: string;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export default function StarRating({
  rating,
  readonly = false,
  onChange,
  size = 'md',
  className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = useCallback(
    (value: number) => {
      if (!readonly && onChange) {
        onChange(value);
      }
    },
    [readonly, onChange]
  );

  const displayRating = isHovering ? (hoverRating ?? rating) : rating;

  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      onMouseLeave={() => {
        setIsHovering(false);
        setHoverRating(null);
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => {
            if (!readonly) {
              setIsHovering(true);
              setHoverRating(star);
            }
          }}
          className={`
            ${sizeClasses[size]}
            transition-colors duration-150
            ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
            ${star <= displayRating ? 'text-highlight' : 'text-gray-300 dark:text-gray-600'}
          `}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <span className="material-symbols-outlined fill-current">
            {star <= displayRating ? 'star' : 'star_border'}
          </span>
        </button>
      ))}
    </div>
  );
}
